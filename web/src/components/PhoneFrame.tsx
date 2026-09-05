export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#050608] md:flex md:items-center md:justify-center md:py-10">
      <main
        className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden text-white md:min-h-0 md:h-[844px] md:overflow-y-auto md:rounded-[36px] md:shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:ring-1 md:ring-white/10"
        style={{
          backgroundColor: "#0B0C16",
          backgroundImage:
            "radial-gradient(520px circle at 8% -6%, rgba(124,92,255,0.28), transparent 55%), radial-gradient(460px circle at 104% 10%, rgba(255,79,195,0.20), transparent 50%)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
