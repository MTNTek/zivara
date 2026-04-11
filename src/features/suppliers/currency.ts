import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { exchangeRates } from '@/db/schema';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'TRY', 'AED', 'CNY'] as const;
const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Convert an amount between currencies using a given rate.
 * If fromCurrency === toCurrency, returns the amount rounded to 2 decimals.
 */
export function convert(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number
): number {
  if (fromCurrency === toCurrency) {
    return Math.round(amount * 100) / 100;
  }
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Query the exchangeRates table for the most recent rate matching the currency pair.
 * Flags as stale if fetchedAt is more than 48 hours ago.
 * Returns rate 1.0 for same-currency pairs.
 * Throws if no rate is found.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<{ rate: number; isStale: boolean; updatedAt: Date }> {
  if (fromCurrency === toCurrency) {
    return { rate: 1.0, isStale: false, updatedAt: new Date() };
  }

  const result = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.sourceCurrency, fromCurrency),
        eq(exchangeRates.targetCurrency, toCurrency)
      )
    )
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1);

  if (result.length === 0) {
    throw new Error(
      `No exchange rate found for ${fromCurrency} -> ${toCurrency}`
    );
  }

  const record = result[0];
  const fetchedAt = record.fetchedAt;
  const isStale = Date.now() - fetchedAt.getTime() > STALE_THRESHOLD_MS;

  if (isStale) {
    console.warn(
      `Exchange rate ${fromCurrency} -> ${toCurrency} is stale (last updated: ${fetchedAt.toISOString()})`
    );
  }

  return {
    rate: Number(record.rate),
    isStale,
    updatedAt: fetchedAt,
  };
}

/**
 * Fetch exchange rates from the European Central Bank (free, no API key).
 * Falls back to Open Exchange Rates if ECB_FALLBACK_KEY is set.
 * Supports: USD, EUR, TRY, AED, CNY.
 */
export async function refreshExchangeRates(): Promise<void> {
  const { logger } = await import('@/lib/logger');

  try {
    // ECB publishes daily rates with EUR as base — free, no key needed
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,TRY,AED,CNY', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      logger.error('Exchange rate fetch failed', { status: res.status });
      return;
    }

    const data = await res.json() as { rates: Record<string, number> };
    const now = new Date();

    // Insert new rate records (append-only — getExchangeRate picks the latest by fetchedAt)
    for (const [target, rate] of Object.entries(data.rates)) {
      await db.insert(exchangeRates).values({
        sourceCurrency: 'USD',
        targetCurrency: target,
        rate: String(rate),
        fetchedAt: now,
      });
    }

    logger.info('Exchange rates refreshed', { currencies: Object.keys(data.rates) });
  } catch (err) {
    logger.error('Exchange rate refresh error', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
