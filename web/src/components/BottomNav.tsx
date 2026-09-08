import Link from "next/link";

type NavKey = "pronosticos" | "liga" | "grupos" | "perfil";

const ITEMS: { key: NavKey; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "pronosticos",
    href: "/pronosticos",
    label: "PRODE",
    icon: (
      <g transform="scale(0.046875)" fill="currentColor" stroke="none">
        <path d="M417.3 360.1l-71.6-4.8c-5.2-.3-10.3 1.1-14.5 4.2s-7.2 7.4-8.4 12.5l-17.6 69.6C289.5 445.8 273 448 256 448s-33.5-2.2-49.2-6.4L189.2 372c-1.3-5-4.3-9.4-8.4-12.5s-9.3-4.5-14.5-4.2l-71.6 4.8c-17.6-27.2-28.5-59.2-30.4-93.6L125 228.3c4.4-2.8 7.6-7 9.2-11.9s1.4-10.2-.5-15l-26.7-66.6C128 109.2 155.3 89 186.7 76.9l55.2 46c4 3.3 9 5.1 14.1 5.1s10.2-1.8 14.1-5.1l55.2-46c31.3 12.1 58.7 32.3 79.6 57.9l-26.7 66.6c-1.9 4.8-2.1 10.1-.5 15s4.9 9.1 9.2 11.9l60.7 38.2c-1.9 34.4-12.8 66.4-30.4 93.6zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm14.1-325.7c-8.4-6.1-19.8-6.1-28.2 0L194 221c-8.4 6.1-11.9 16.9-8.7 26.8l18.3 56.3c3.2 9.9 12.4 16.6 22.8 16.6l59.2 0c10.4 0 19.6-6.7 22.8-16.6l18.3-56.3c3.2-9.9-.3-20.7-8.7-26.8l-47.9-34.8z" />
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
