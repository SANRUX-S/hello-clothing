import AdminApp from "@/components/admin/AdminApp";
import "./admin.css";
import { redirect } from "next/navigation";
import { isStaff, verifiedSession } from "@/lib/firebase/server";

export const metadata = {
  title: "Admin Studio — HELLO! Clothing",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isStaff(await verifiedSession())) redirect("/");
  return <AdminApp initialSection="overview" />;
}
