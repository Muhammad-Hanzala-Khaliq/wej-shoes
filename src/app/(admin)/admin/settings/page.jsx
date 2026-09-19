import { getStoreSettings } from "@/features/cms/cms.service";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  const serialized = JSON.parse(JSON.stringify(settings));

  return <SettingsClient initialSettings={serialized} />;
}
