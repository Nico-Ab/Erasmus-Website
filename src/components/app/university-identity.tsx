import Link from "next/link";
import { cn } from "@/lib/utils";

type UniversityIdentityProps = {
  href?: string;
  className?: string;
  compact?: boolean;
  inverse?: boolean;
  universityName?: string;
  portalName?: string;
  description?: string;
};

function SwuStandInMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl border text-base font-semibold tracking-[0.22em]",
        inverse
          ? "border-white/20 bg-white/10 text-white"
          : "border-primary/15 bg-primary text-white"
      )}
    >
      <span className="text-[0.78rem]">SWU</span>
    </div>
  );
}

export function UniversityIdentity({
  href = "/",
  className,
  compact = false,
  inverse = false,
  universityName = 'South-West University "Neofit Rilski"',
  portalName = "Erasmus Staff Mobility Portal",
  description = "Internal portal for staff mobility cases, review, and administration."
}: UniversityIdentityProps) {
  return (
    <Link className={cn("flex items-start gap-4", className)} href={href}>
      <SwuStandInMark inverse={inverse} />
      <div className={cn("min-w-0", compact ? "space-y-1.5" : "space-y-2")}>
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            inverse ? "text-white/70" : "text-slate-500"
          )}
        >
          {universityName}
        </p>
        <div className="space-y-1">
          <p
            className={cn(
              "text-balance font-semibold tracking-tight",
              compact ? "text-lg" : "text-2xl sm:text-[2rem]",
              inverse ? "text-white" : "text-slate-950"
            )}
          >
            {portalName}
          </p>
          {!compact ? (
            <p
              className={cn(
                "max-w-2xl text-sm leading-6",
                inverse ? "text-white/72" : "text-slate-600"
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
