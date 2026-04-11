import { getStoreSettings } from '@/features/admin/settings-actions';
import { SettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  return <SettingsClient initialSettings={settings} />;
}
