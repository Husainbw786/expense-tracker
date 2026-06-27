"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/* Line icons — 24×24, stroke 1.9 */
function I({ d, className }: { d: string | string[]; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[22px] w-[22px]"}
    >
      {(Array.isArray(d) ? d : [d]).map((p, i) => (
        <path key={i} d={p}></path>
      ))}
    </svg>
  );
}

const PATHS = {
  trips: [
    "M2 7h20v14a0 0 0 0 1 0 0H2a0 0 0 0 1 0 0V7z",
    "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  ],
  people: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  add: ["M12 5v14", "M5 12h14"],
};

function NavSpinner() {
  return (
    <span className="h-[22px] w-[22px] animate-spin rounded-full border-[2px] border-rose-border border-t-rose" />
  );
}

function TabInner({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <NavSpinner /> : icon}
      <span
        className={`text-[0.66rem] font-semibold ${active ? "text-rose" : "text-ink-3"}`}
      >
        {label}
      </span>
    </>
  );
}

function AddInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      <span
        className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-rose"
        style={{ boxShadow: "0 10px 22px -8px rgba(197,102,63,.6)" }}
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-[2px] border-white/40 border-t-white" />
        ) : (
          <I d={PATHS.add} className="h-[26px] w-[26px] text-white" />
        )}
      </span>
      <span className="text-[0.66rem] font-semibold text-rose">Add</span>
    </>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const tripMatch = pathname.match(/^\/trips\/(\d+)/);
  const tripId = tripMatch?.[1];

  const tripsActive = pathname === "/" || pathname.startsWith("/trips");
  const peopleActive = pathname.startsWith("/people");
  // Add expense if we're inside a trip, otherwise go home to start one.
  const addHref = tripId ? `/trips/${tripId}/expenses/new` : "/";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-hairline bg-[rgba(244,242,234,0.94)] backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-4 pb-4 pt-2.5">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center gap-1 py-1"
          style={{ color: tripsActive ? "var(--rose)" : "var(--ink-3)" }}
        >
          <TabInner icon={<I d={PATHS.trips} />} label="Trips" active={tripsActive} />
        </Link>

        <Link
          href={addHref}
          className="-mt-6 flex flex-col items-center gap-1"
        >
          <AddInner />
        </Link>

        <Link
          href="/people"
          className="flex flex-1 flex-col items-center gap-1 py-1"
          style={{ color: peopleActive ? "var(--rose)" : "var(--ink-3)" }}
        >
          <TabInner icon={<I d={PATHS.people} />} label="People" active={peopleActive} />
        </Link>
      </div>
    </nav>
  );
}
