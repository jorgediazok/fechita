import Link from "next/link";

type NavKey = "pronosticos" | "liga" | "grupos" | "perfil";

const ITEMS: { key: NavKey; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "pronosticos",
    href: "/pronosticos",
    label: "PRODE",
    icon: (
      <g transform="scale(0.025) translate(0, 960)" fill="currentColor" stroke="none">
        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm293 108q25-4 49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4q26 0 51-4ZM390-360h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
      </g>
    ),
  },
  {
    key: "liga",
    href: "/liga",
    label: "LIGA",
    icon: <path d="M4 21V10M12 21V3M20 21v-7" strokeWidth="2.6" strokeLinecap="round" />,
  },
  {
    key: "grupos",
    href: "/grupos",
    label: "GRUPOS",
    icon: (
      <>
        <circle cx="8.5" cy="8" r="3" strokeWidth="2.2" />
        <circle cx="16.5" cy="9.5" r="2.3" strokeWidth="2.2" />
        <path d="M3 20c0-3.4 2.6-5.5 5.5-5.5S14 16.6 14 20" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M14.8 14.8c2.5.2 4.2 2 4.2 5.2" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "perfil",
    href: "/perfil",
    label: "PERFIL",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" strokeWidth="2.4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
];

export function BottomNav({ active }: { active: NavKey }) {
  return (
    <div className="flex shrink-0 items-center justify-between bg-[#15162A] px-6 py-3.5 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Link key={item.key} href={item.href} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-10 items-center justify-center rounded-[10px] ${
                isActive ? "shadow-[0_4px_14px_rgba(124,92,255,0.45)]" : ""
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #6845E0, #9B5CFF)" } : undefined}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? "#FFFFFF" : "#6B6F94"}
                style={{ color: isActive ? "#FFFFFF" : "#6B6F94" }}
              >
                {item.icon}
              </svg>
            </div>
            <span className={`text-[9px] font-extrabold ${isActive ? "text-[#7C5CFF]" : "text-[#6B6F94]"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
