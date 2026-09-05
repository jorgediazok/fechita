import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import UserModel from "@/models/User";

const COOKIE_NAME = "cv_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;
  if (!userId) return null;

  await connectToDatabase();
  return UserModel.findById(userId);
}

export async function setCurrentUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
