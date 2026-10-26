import { NextResponse } from "next/server";
import {
  getAdminUserByEmail,
  getAllAdminUsers,
  saveAdminUser,
  deleteAdminUser,
  updateAdminLastLogin,
  verifyAdminCredentials
} from "@/lib/server/db";
import { privateHeaders, requireSameOrigin } from "@/lib/server/http";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ authorized: false, error: "Email is required" }, { status: 400, headers: privateHeaders });
    }

    const admin = await getAdminUserByEmail(email);

    if (!admin || admin.status !== 'active') {
      return NextResponse.json({
        authorized: false,
        error: "Access Denied: This account does not have active administrator permissions for HELLO! Clothing."
      }, { status: 403, headers: privateHeaders });
    }

    // Role permissions mapping
    const permissions = {
      canManageAdmins: admin.role === 'super_admin',
      canManageSettings: admin.role === 'super_admin',
      canDeleteOrders: admin.role === 'super_admin',
      canManageProducts: admin.role === 'super_admin' || admin.role === 'co_admin',
      canManageContent: admin.role === 'super_admin' || admin.role === 'co_admin',
      canManageCategories: admin.role === 'super_admin' || admin.role === 'co_admin',
      canManageOrders: true,
      canUpdateFulfillment: true,
      canViewInventory: true,
      canUpdateStock: admin.role === 'super_admin' || admin.role === 'co_admin',
    };

    return NextResponse.json({
      authorized: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
      },
      permissions,
    }, { headers: privateHeaders });
  } catch (err: any) {
    console.error("Admin Auth GET error:", err);
    return NextResponse.json({ authorized: false, error: err.message }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await request.json();
    const action = body?.action;

    if (action === 'login') {
      const email = body?.email;
      const password = body?.password;
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400, headers: privateHeaders });
      }

      const admin = await verifyAdminCredentials(email, password);
      if (!admin) {
        return NextResponse.json({
          authorized: false,
          error: "Invalid email or password. Please check your credentials."
        }, { status: 401, headers: privateHeaders });
      }

      await updateAdminLastLogin(email);

      return NextResponse.json({
        authorized: true,
        user: admin,
      }, { headers: privateHeaders });
    }

    if (action === 'verify') {
      const email = body?.email;
      if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400, headers: privateHeaders });
      }

      const admin = await getAdminUserByEmail(email);
      if (!admin || admin.status !== 'active') {
        return NextResponse.json({
          authorized: false,
          error: "Access Denied: You do not have administrator permissions."
        }, { status: 403, headers: privateHeaders });
      }

      await updateAdminLastLogin(email);

      return NextResponse.json({
        authorized: true,
        user: admin,
      }, { headers: privateHeaders });
    }

    // Admin Team Management Actions
    if (action === 'list') {
      const requesterEmail = body?.requesterEmail;
      const requester = requesterEmail ? await getAdminUserByEmail(requesterEmail) : null;
      if (!requester || requester.role !== 'super_admin') {
        return NextResponse.json({ error: "Only Super Admins can view the full team roster." }, { status: 403, headers: privateHeaders });
      }

      const team = await getAllAdminUsers();
      return NextResponse.json({ team }, { headers: privateHeaders });
    }

    if (action === 'save_admin') {
      const requesterEmail = body?.requesterEmail;
      const requester = requesterEmail ? await getAdminUserByEmail(requesterEmail) : null;
      if (!requester || requester.role !== 'super_admin') {
        return NextResponse.json({ error: "Only Super Admins can manage staff members." }, { status: 403, headers: privateHeaders });
      }

      const { email, name, role, status, password } = body;
      if (!email || !name || !role) {
        return NextResponse.json({ error: "Email, name, and role are required." }, { status: 400, headers: privateHeaders });
      }

      await saveAdminUser({ email, name, role, status: status || 'active', password });
      return NextResponse.json({ success: true, message: `Admin ${name} (${role}) saved successfully.` }, { headers: privateHeaders });
    }

    if (action === 'delete_admin') {
      const requesterEmail = body?.requesterEmail;
      const requester = requesterEmail ? await getAdminUserByEmail(requesterEmail) : null;
      if (!requester || requester.role !== 'super_admin') {
        return NextResponse.json({ error: "Only Super Admins can remove staff members." }, { status: 403, headers: privateHeaders });
      }

      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400, headers: privateHeaders });
      }

      if (email.toLowerCase() === requesterEmail.toLowerCase()) {
        return NextResponse.json({ error: "You cannot delete your own Super Admin account." }, { status: 400, headers: privateHeaders });
      }

      await deleteAdminUser(email);
      return NextResponse.json({ success: true, message: `Admin ${email} removed.` }, { headers: privateHeaders });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400, headers: privateHeaders });
  } catch (err: any) {
    console.error("Admin Auth POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: privateHeaders });
  }
}
