import { notFound } from "next/navigation";
import AdminApp, { type AdminSection } from "@/components/admin/AdminApp";
import "../admin.css";

const sections = ["products", "inventory", "orders", "categories", "content", "media", "settings", "team"];

export const metadata = {
  title: "Admin Studio — HELLO! Clothing",
  robots: { index: false, follow: false },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <AdminApp initialSection={section as AdminSection} />;
}
