"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { createGroup, joinGroupByCode, leaveGroup } from "@/lib/groups";
import { isEmailVerified } from "@/lib/emailVerification";

export async function createGroupAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Defensa en profundidad — la UI ya oculta estos forms sin email confirmado (ver grupos/page.tsx).
  if (!isEmailVerified(user)) throw new Error("Confirmá tu email para crear un grupo");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Ingresá un nombre para el grupo");
  }

  const group = await createGroup(user._id, name);
  redirect(`/grupos/${group._id}`);
}

export async function joinGroupAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isEmailVerified(user)) throw new Error("Confirmá tu email para unirte a un grupo");

  const code = String(formData.get("code") ?? "").trim();
  if (!code) {
    throw new Error("Ingresá un código de invitación");
  }

  const group = await joinGroupByCode(user._id, code);
  redirect(`/grupos/${group._id}`);
}

export async function leaveGroupAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const groupId = String(formData.get("groupId"));
  await leaveGroup(user._id, groupId);
  revalidatePath("/grupos");
  redirect("/grupos");
}
