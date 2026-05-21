import { LogoIcon } from "@/modules/app/ui/components/logo";

export function AppSplash() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background">
      <style>{splashCss}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in oklch, var(--primary) 16%, transparent) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex size-32 items-center justify-center">
          <div
            aria-hidden="true"
            className="memora-halo absolute inset-0 rounded-full"
          />
          <div
            aria-hidden="true"
            className="memora-halo memora-halo-delay absolute inset-0 rounded-full"
          />
          <LogoIcon
            aria-label="Memora"
            className="memora-logo relative size-16 text-primary"
          />
        </div>

        <p className="memora-caption font-semibold text-2xl text-foreground tracking-tight">
          Memora
        </p>
      </div>
    </div>
  );
}

const splashCss = `
@keyframes memora-breathe {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50%      { transform: scale(1.05); opacity: 1; }
}
@keyframes memora-halo {
  0%   { transform: scale(0.85); opacity: 0; }
  40%  { opacity: 0.55; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes memora-caption {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
.memora-logo {
  animation: memora-breathe 2.6s ease-in-out infinite;
  will-change: transform, opacity;
}
.memora-halo {
  background: radial-gradient(circle, color-mix(in oklch, var(--primary) 50%, transparent) 0%, transparent 70%);
  animation: memora-halo 2.6s ease-out infinite;
  will-change: transform, opacity;
}
.memora-halo-delay {
  animation-delay: 1.3s;
}
.memora-caption {
  animation: memora-caption 2.4s ease-in-out infinite;
}
`;
