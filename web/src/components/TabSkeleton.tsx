import { BottomNav, type NavKey } from "./BottomNav";
import { PhoneFrame } from "./PhoneFrame";

// Fallback instantáneo mientras el Server Component de la pestaña se renderiza. Deja el
// marco y el nav de abajo fijos (con el ítem ya resaltado) para que cambiar de pestaña
// se sienta inmediato en vez de un freeze en la pantalla anterior.
export function TabSkeleton({ active, rows = 4 }: { active: NavKey; rows?: number }) {
  return (
    <PhoneFrame nav={<BottomNav active={active} />}>
      <div className="flex animate-pulse flex-col gap-4 px-4.5 py-6" aria-busy="true">
        <div className="h-5 w-28 rounded bg-white/[0.06]" />
        <div className="h-24 rounded-2xl bg-white/[0.06]" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
