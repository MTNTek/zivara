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
 * Placeholder for fetching exchange rates from an external API.
 * Supports: USD, EUR, TRY, AED, CNY.
 */
export async function refreshExchangeRates(): Promise<void> {
  console.log(
    `Would refresh exchange rates for supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
  );
  // TODO: Integrate with an external exchange rate API (e.g., Open Exchange Rates, ECB)
  // For each currency pair, fetch the latest rate and upsert into the exchangeRates table.
}
