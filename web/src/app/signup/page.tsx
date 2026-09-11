import type { Metadata, ResolvingMetadata } from "next";
import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SignupForm } from "./SignupForm";
import type { PickerTeam } from "@/components/ClubPicker";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(
  _props: PageProps<"/signup">,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return pageMetadata(parent, {
    title: "Crear cuenta",
    description:
      "Creá tu cuenta gratis, elegí tu club y empezá a pronosticar la fecha del fútbol argentino con tu liga.",
    path: "/signup",
  });
}

export default async function SignupPage() {
  await connectToDatabase();
  const rows = await TeamModel.find({}, { shortName: 1, logoUrl: 1 }).sort({ name: 1 }).lean();
  // Serializar a objetos planos: Mongoose deja el _id como ObjectId aún con .lean(), y eso
  // no se puede pasar a un client component (SignupForm).
  const teams: PickerTeam[] = rows.map((t) => ({
    _id: String(t._id),
    shortName: String(t.shortName),
    logoUrl: String(t.logoUrl),
  }));

  return (
    <PhoneFrame>
      <div
        className="px-7 pt-10 pb-14"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-[28px] leading-none text-white">
            CREAR CUENTA
          </h1>
          <p className="text-center text-[13px] font-bold text-white/70">
            Pronosticá. Sumá puntos. Bancá a tu club.
          </p>
        </div>
      </div>

      <SignupForm teams={teams} />
    </PhoneFrame>
  );
}
