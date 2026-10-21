import AdminApp, { AdminDisabled } from "@/components/admin/AdminApp";
import "./admin.css";

export const metadata = { title: "Workspace — HELLO! Clothing", robots: { index: false, follow: false } };

export default function AdminPage() {
  const live = [process.env.NEXT_PUBLIC_APP_MODE, process.env.STORE_MODE, process.env.APP_MODE, process.env.COMMERCE_MODE].some(value => value?.toLowerCase() === "live");
  return live ? <AdminDisabled /> : <AdminApp />;
}
