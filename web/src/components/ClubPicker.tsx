export type PickerTeam = { _id: string; shortName: string; logoUrl: string };

// Grilla de escudos para elegir club. Compartida entre /signup, /onboarding y /perfil/equipo.
// El <fieldset>/<legend> agrupa los radios para lectores de pantalla; el foco de teclado
// cae en el radio invisible, así que el anillo se dibuja sobre el escudo con peer-focus-visible.
export function ClubPicker({
  teams,
  selectedId,
  legend,
}: {
  teams: PickerTeam[];
  selectedId?: string;
  legend: string;
}) {
  const checkedId = selectedId ?? (teams[0] ? String(teams[0]._id) : undefined);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-display text-sm tracking-wide text-white">{legend}</legend>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4">
        {teams.map((team) => {
          const id = String(team._id);
          return (
            <label key={id} className="flex cursor-pointer flex-col items-center gap-1.5">
              <input
                type="radio"
                name="clubId"
                value={id}
                defaultChecked={id === checkedId}
                className="peer sr-only"
              />
              <span className="flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full bg-[#15162A] shadow-[0_0_0_2px_#2A2C48] transition-transform peer-checked:-rotate-6 peer-checked:shadow-[0_0_0_3px_#7C5CFF] peer-checked:[filter:drop-shadow(0_0_10px_rgba(124,92,255,0.65))] peer-focus-visible:shadow-[0_0_0_3px_#A390FF]">
                {team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={team.logoUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 object-contain"
                  />
                ) : (
                  <span className="text-xs font-extrabold text-[#8A8FB2]">
                    {team.shortName.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="text-center text-[10px] font-extrabold text-[#9195C2] peer-checked:text-[#A390FF]">
                {team.shortName}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
