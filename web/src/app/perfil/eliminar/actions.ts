"use server";

import { getCurrentUser } from "@/lib/session";
import { deleteAccount } from "@/lib/account";
import { signOut } from "@/auth";

export async function deleteAccountAction() {
  const user = await getCurrentUser();
  if (!user) return;

  await deleteAccount(user._id);
  await signOut({ redirectTo: "/login" });
}
