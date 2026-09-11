import type { Metadata } from "next";
import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { verifyEmailToken } from "@/lib/emailVerification";

export const metadata: Metadata = {
  title: "Confirmar email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmailToken(token) : false;

  return (
    <PhoneFrame>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-7 text-center">
        {ok ? (
          <>
            <span className="text-4xl" aria-hidden="true">
              ✅
            </span>
            <h1 className="font-display text-xl text-white">Email confirmado</h1>
            <p className="text-[13px] font-medium text-[#8A8FB2]">
              Ya podés cargar pronósticos y sumarte a una liga o grupo.
            </p>
          </>
        ) : (
          <>
            <span className="text-4xl" aria-hidden="true">
              ⚠️
            </span>
            <h1 className="font-display text-xl text-white">El link no es válido</h1>
            <p className="text-[13px] font-medium text-[#8A8FB2]">
              Puede que ya lo hayas usado o que venció (dura 24 horas). Pedí uno nuevo desde el
              cartel en /pronosticos.
            </p>
          </>
        )}
        <Link
          href="/pronosticos"
          className="mt-2 rounded-2xl px-6 py-3 font-display text-sm text-white"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
        >
          IR A PRONÓSTICOS
        </Link>
      </div>
    </PhoneFrame>
  );
}
