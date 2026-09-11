import crypto from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import UserModel from "@/models/User";
import EmailVerificationTokenModel from "@/models/EmailVerificationToken";
import { sendEmail } from "./email/send";
import { SITE_URL } from "./site";

// "Existe la cuenta" ≠ "participa" (docs/product-design.md): un usuario sin confirmar puede
// loguearse y mirar la app, pero no cargar pronósticos ni crear/unirse a un grupo. Los de
// Google no pasan por acá — ya llegan con emailVerified seteado (ver auth.ts).
export function isEmailVerified(user: { emailVerified?: Date | null }): boolean {
  return Boolean(user.emailVerified);
}

export async function sendVerificationEmail(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  const user = await UserModel.findById(userId);
  if (!user || user.emailVerified) return;

  const token = crypto.randomBytes(32).toString("hex");
  await EmailVerificationTokenModel.create({ userId: user._id, token });

  const url = `${SITE_URL}/verificar-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Confirmá tu email en Fechita",
    html: `
      <p>Hola ${user.name} 👋</p>
      <p>Confirmá tu email para poder cargar pronósticos y sumarte a una liga o grupo en Fechita:</p>
      <p><a href="${url}">${url}</a></p>
      <p>El link vence en 24 horas.</p>
    `,
  });
}

// true = token válido, ya quedó confirmado. false = token inválido, vencido, o ya usado.
export async function verifyEmailToken(token: string): Promise<boolean> {
  await connectToDatabase();
  const doc = await EmailVerificationTokenModel.findOne({ token });
  if (!doc) return false;

  await UserModel.findByIdAndUpdate(doc.userId, { emailVerified: new Date() });
  await EmailVerificationTokenModel.deleteOne({ _id: doc._id });
  return true;
}
