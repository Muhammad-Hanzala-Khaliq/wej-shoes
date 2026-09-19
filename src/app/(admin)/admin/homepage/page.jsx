import { getAllHomepageContent } from "@/features/cms/cms.service";
import HomepageAdminClient from "./HomepageAdminClient";

export default async function AdminHomepagePage() {
  const blocks = await getAllHomepageContent();
  const serialized = JSON.parse(JSON.stringify(blocks));

  return <HomepageAdminClient initialBlocks={serialized} />;
}
