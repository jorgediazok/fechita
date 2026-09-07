import { auth } from "@/auth";
import { connectToDatabase } from "./db";
import UserModel from "@/models/User";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  return UserModel.findById(session.user.id);
}
