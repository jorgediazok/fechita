export type BadgeTeam = { name: string; shortName: string; logoUrl: string };

export function TeamBadge({ team, size = 34 }: { team: BadgeTeam; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B0C16]"
      style={{ width: size, height: size }}
    >
      {team.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logoUrl} alt="" className="h-[70%] w-[70%] object-contain" />
      ) : (
        <span className="text-[9px] font-extrabold text-[#6B6F94]">
          {team.shortName.slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}
