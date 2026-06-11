"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/* Thin line icons — 24×24, stroke 1.5, Heroicons-outline style */
function I({ d, className }: { d: string | string[]; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[19px] w-[19px]"}
    >
      {(Array.isArray(d) ? d : [d]).map((p, i) => (
        <path key={i} d={p}></path>
      ))}
    </svg>
  );
}

const PATHS = {
  trips:
    "M20 7h-3V5.5A2.5 2.5 0 0 0 14.5 3h-5A2.5 2.5 0 0 0 7 5.5V7H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 20h16a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 20 7zM9 7V5.5A.5.5 0 0 1 9.5 5h5a.5.5 0 0 1 .5.5V7H9z",
  people: [
    "M15 19.13v-1.5a3.38 3.38 0 0 0-3.38-3.38H5.63a3.38 3.38 0 0 0-3.38 3.38v1.5",
    "M8.63 11.25a3.38 3.38 0 1 0 0-6.75 3.38 3.38 0 0 0 0 6.75z",
    "M21.75 19.13v-1.5a3.38 3.38 0 0 0-2.53-3.27",
    "M15.84 4.61a3.38 3.38 0 0 1 0 6.54",
  ],
  summary: ["M3 20h18", "M6.5 20v-7", "M12 20V9", "M17.5 20V4.5"],
  expenses: [
    "M6 3.5h12a1 1 0 0 1 1 1V21l-2.4-1.5L14.4 21 12 19.5 9.6 21l-2.2-1.5L5 21V4.5a1 1 0 0 1 1-1z",
    "M9 8.5h6",
    "M9 12h6",
  ],
  add: ["M12 5v14", "M5 12h14"],
};

function NavSpinner() {
  return (
    <span className="h-[19px] w-[19px] animate-spin rounded-full border-[1.5px] border-rose-border border-t-rose" />
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
        className={`text-[0.66rem] uppercase tracking-[0.16em] ${
          active ? "font-semibold" : "font-normal"
        }`}
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
      <span className="-mt-px flex h-[21px] w-[21px] items-center justify-center bg-rose text-white transition-colors group-hover:bg-rose-hover">
        {pending ? (
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
        ) : (
          <I d={PATHS.add} className="h-[15px] w-[15px]" />
        )}
      </span>
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-rose">
        Add
      </span>
    </>
  );
}

const tabClass = (active: boolean) =>
  `relative flex min-h-14 flex-1 flex-col items-center gap-1.5 py-3 transition-colors ${
    active ? "text-rose" : "text-ink-2 hover:text-ink"
  }`;

export default function BottomNav() {
  const pathname = usePathname();
  const tripMatch = pathname.match(/^\/trips\/(\d+)/);
  const tripId = tripMatch?.[1];

  if (tripId) {
    const base = `/trips/${tripId}`;
    const expensesActive =
      pathname.startsWith(`${base}/expenses`) && pathname !== `${base}/expenses/new`;
    const tabs = [
      { href: base, label: "Summary", active: pathname === base, icon: <I d={PATHS.summary} /> },
      { href: `${base}/expenses`, label: "Expenses", active: expensesActive, icon: <I d={PATHS.expenses} /> },
      { href: `${base}/members`, label: "On Trip", active: pathname === `${base}/members`, icon: <I d={PATHS.people} /> },
      { href: "/", label: "Trips", active: false, icon: <I d={PATHS.trips} /> },
    ];

    return (
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-hairline bg-[rgba(254,253,251,0.94)] backdrop-blur-xl">
        <div className="flex items-stretch">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={tabClass(t.active)}>
              <TabInner icon={t.icon} label={t.label} active={t.active} />
            </Link>
          ))}
          <Link
            href={`${base}/expenses/new`}
            className="group flex flex-1 flex-col items-center gap-1.5 py-3"
          >
            <AddInner />
          </Link>
        </div>
      </nav>
    );
  }

  const homeTabs = [
    { href: "/", label: "Trips", active: pathname === "/", icon: <I d={PATHS.trips} /> },
    { href: "/people", label: "People", active: pathname.startsWith("/people"), icon: <I d={PATHS.people} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-hairline bg-[rgba(254,253,251,0.94)] backdrop-blur-xl">
      <div className="flex items-stretch">
        {homeTabs.map((t) => (
          <Link key={t.href} href={t.href} className={tabClass(t.active)}>
            <TabInner icon={t.icon} label={t.label} active={t.active} />
          </Link>
        ))}
      </div>
    </nav>
  );
}
