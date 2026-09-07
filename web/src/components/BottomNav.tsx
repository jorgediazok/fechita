import Link from "next/link";

type NavKey = "duelos" | "liga" | "grupos" | "perfil";

const ITEMS: { key: NavKey; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "duelos",
    href: "/duelos",
    label: "DUELOS",
    icon: (
      <path
        d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
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
    <div className="fixed inset-x-0 bottom-0 md:sticky md:inset-x-auto flex items-center justify-between bg-[#15162A] px-6 py-3.5 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FFFFFF" : "#6B6F94"}>
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
