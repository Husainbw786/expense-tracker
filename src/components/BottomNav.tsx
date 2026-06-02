"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: string; match: (p: string) => boolean };

export default function BottomNav() {
  const pathname = usePathname();

  // Inside a trip? e.g. /trips/12 , /trips/12/expenses ...
  const tripMatch = pathname.match(/^\/trips\/(\d+)/);
  const tripId = tripMatch?.[1];

  let tabs: Tab[];
  if (tripId) {
    const base = `/trips/${tripId}`;
    tabs = [
      { href: "/", label: "Trips", icon: "🧳", match: () => false },
      { href: base, label: "Summary", icon: "📊", match: (p) => p === base },
      {
        href: `${base}/expenses`,
        label: "Expenses",
        icon: "🧾",
        match: (p) => p.startsWith(`${base}/expenses`) && p !== `${base}/expenses/new`,
      },
      {
        href: `${base}/expenses/new`,
        label: "Add",
        icon: "➕",
        match: (p) => p === `${base}/expenses/new`,
      },
      {
        href: `${base}/members`,
        label: "On Trip",
        icon: "👥",
        match: (p) => p === `${base}/members`,
      },
    ];
  } else {
    tabs = [
      { href: "/", label: "Trips", icon: "🧳", match: (p) => p === "/" },
      { href: "/people", label: "People", icon: "👥", match: (p) => p.startsWith("/people") },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
