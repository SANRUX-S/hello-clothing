import { notFound } from "next/navigation";
import AdminApp, { AdminDisabled, type AdminSection } from "@/components/admin/AdminApp";
import "../admin.css";

const sections = ["products", "inventory", "orders", "categories", "content", "media", "settings"];
export const metadata = { title: "Workspace — HELLO! Clothing", robots: { index: false, follow: false } };

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const live = [process.env.NEXT_PUBLIC_APP_MODE, process.env.STORE_MODE, process.env.APP_MODE, process.env.COMMERCE_MODE].some(value => value?.toLowerCase() === "live");
  return live ? <AdminDisabled /> : <AdminApp initialSection={section as AdminSection} />;
}
