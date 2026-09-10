// Estado de la carga de la fecha en curso: cuántos pronósticos van, cuántos faltan, y el
// mensaje de "listo" cuando están todos. Server component — sin interacción.
export function RoundProgress({
  roundKey,
  predicted,
  total,
}: {
  roundKey: string;
  predicted: number;
  total: number;
}) {
  if (total === 0) return null;

  const done = predicted >= total;
  const pct = Math.round((predicted / total) * 100);
  const faltan = total - predicted;

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[#4FD17F]/35 bg-[#122019] p-3.5">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4FD17F] text-[#0B0C16]"
          aria-hidden="true"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="text-[13px] font-extrabold text-[#CDEFD9]">
            ¡Listo! Cargaste toda la {roundKey}
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-snug text-[#8FBFA1]">
            Los puntos se suman cuando terminen los partidos. Podés editar cada pronóstico
            hasta 1 h antes de su horario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2A2C48] bg-[#15162A] p-3.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-extrabold tracking-wide text-[#B9BCDA]">
          {predicted === 0 ? `Cargá tus pronósticos de la ${roundKey}` : "Tu carga de la fecha"}
        </p>
        <span className="font-display text-[13px] text-[#9195C2]">
          {predicted}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6845E0] to-[#9B5CFF]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-[#8A8FB2]">
        {predicted === 0
          ? `${total} partidos en juego.`
          : `Te ${faltan === 1 ? "falta" : "faltan"} ${faltan} ${faltan === 1 ? "pronóstico" : "pronósticos"}.`}
      </p>
    </div>
  );
}
