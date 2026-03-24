'use server';

import { db } from '@/db';
import { storeSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface StoreSettingsData {
  storeName: string;
  storeEmail: string;
  currency: string;
  fromEmail: string;
  testMode: boolean;
  twoFactor: boolean;
  sessionTimeout: string;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  reviewNotifications: boolean;
  taxRate: string;
  freeShippingThreshold: string;
}

const DEFAULTS: StoreSettingsData = {
  storeName: 'Zivara',
  storeEmail: 'admin@zivara.com',
  currency: 'USD',
  fromEmail: 'noreply@zivara.com',
  testMode: true,
  twoFactor: false,
  sessionTimeout: '24',
  maintenanceMode: false,
  orderNotifications: true,
  lowStockAlerts: true,
  reviewNotifications: true,
  taxRate: '8.25',
  freeShippingThreshold: '50',
};

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const rows = await db.select().from(storeSettings);
    const map = new Map(rows.map(r => [r.key, r.value]));

    return {
      storeName: map.get('storeName') ?? DEFAULTS.storeName,
      storeEmail: map.get('storeEmail') ?? DEFAULTS.storeEmail,
      currency: map.get('currency') ?? DEFAULTS.currency,
      fromEmail: map.get('fromEmail') ?? DEFAULTS.fromEmail,
      testMode: map.get('testMode') === 'true' || (map.get('testMode') === undefined && DEFAULTS.testMode),
      twoFactor: map.get('twoFactor') === 'true',
      sessionTimeout: map.get('sessionTimeout') ?? DEFAULTS.sessionTimeout,
      maintenanceMode: map.get('maintenanceMode') === 'true',
      orderNotifications: map.get('orderNotifications') !== 'false',
      lowStockAlerts: map.get('lowStockAlerts') !== 'false',
      reviewNotifications: map.get('reviewNotifications') !== 'false',
      taxRate: map.get('taxRate') ?? DEFAULTS.taxRate,
      freeShippingThreshold: map.get('freeShippingThreshold') ?? DEFAULTS.freeShippingThreshold,
    };
  } catch (error) {
    logger.error('Failed to load store settings', { error: error instanceof Error ? error.message : String(error) });
    return DEFAULTS;
  }
}

export async function saveStoreSettings(data: StoreSettingsData) {
  try {
    await requireAdmin();

    const entries = Object.entries(data).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    for (const entry of entries) {
      const existing = await db.select().from(storeSettings).where(eq(storeSettings.key, entry.key)).limit(1);
      if (existing.length > 0) {
        await db.update(storeSettings)
          .set({ value: entry.value, updatedAt: new Date() })
          .where(eq(storeSettings.key, entry.key));
      } else {
        await db.insert(storeSettings).values(entry);
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to save store settings', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to save settings' };
  }
}
