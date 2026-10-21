import { notFound } from "next/navigation";
import AdminApp, { type AdminSection } from "@/components/admin/AdminApp";
import "../admin.css";
import { isStaff, verifiedSession } from "@/lib/firebase/server";
import { redirect } from "next/navigation";

const sections = ["products", "inventory", "orders", "categories", "content", "media", "settings"];

export const metadata = {
  title: "Admin Studio — HELLO! Clothing",
  robots: { index: false, follow: false },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  if (!isStaff(await verifiedSession())) redirect("/");
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <AdminApp initialSection={section as AdminSection} />;
}
