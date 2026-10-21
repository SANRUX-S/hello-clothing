import AdminApp from "@/components/admin/AdminApp";
import "./admin.css";

export const metadata = {
  title: "Admin Studio — HELLO! Clothing",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp initialSection="overview" />;
}
