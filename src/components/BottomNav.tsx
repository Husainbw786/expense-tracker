"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function NavSpinner() {
  return (
    <span className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
  );
}

// Inner content of a nav tab — shows a spinner over the icon while the
// tapped link's navigation is pending (useLinkStatus must run inside <Link>).
function TabInner({
  icon,
  label,
  active,
  underlineClass,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  underlineClass: string;
}) {
  const { pending } = useLinkStatus();
  return (
    <>
      {active && (
        <span className={`absolute top-0 h-0.5 bg-indigo-600 rounded-b-full ${underlineClass}`} />
      )}
      {pending ? <NavSpinner /> : icon}
      {label}
    </>
  );
}

function AddInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200">
        {pending ? (
          <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </span>
      <span className="text-[10px] font-semibold text-indigo-600">Add</span>
    </>
  );
}

function IconTrips({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}
function IconPeople({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconSummary({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconExpenses({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const tripMatch = pathname.match(/^\/trips\/(\d+)/);
  const tripId = tripMatch?.[1];

  if (tripId) {
    const base = `/trips/${tripId}`;
    const tabs = [
      { href: base, label: "Summary", active: pathname === base, icon: <IconSummary active={pathname === base} /> },
      {
        href: `${base}/expenses`,
        label: "Expenses",
        active: pathname.startsWith(`${base}/expenses`) && pathname !== `${base}/expenses/new`,
        icon: <IconExpenses active={pathname.startsWith(`${base}/expenses`) && pathname !== `${base}/expenses/new`} />,
      },
      { href: `${base}/members`, label: "On Trip", active: pathname === `${base}/members`, icon: <IconPeople active={pathname === `${base}/members`} /> },
      { href: "/", label: "All Trips", active: false, icon: <IconTrips active={false} /> },
    ];

    return (
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-white border-t border-gray-200">
        <div className="flex items-center">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors relative ${
                t.active ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <TabInner icon={t.icon} label={t.label} active={t.active} underlineClass="left-3 right-3" />
            </Link>
          ))}
          {/* Add button in center */}
          <Link
            href={`${base}/expenses/new`}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <AddInner />
          </Link>
        </div>
      </nav>
    );
  }

  const homeTabs = [
    { href: "/", label: "Trips", active: pathname === "/", icon: <IconTrips active={pathname === "/"} /> },
    { href: "/people", label: "People", active: pathname.startsWith("/people"), icon: <IconPeople active={pathname.startsWith("/people")} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-white border-t border-gray-200">
      <div className="flex">
        {homeTabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors relative ${
              t.active ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <TabInner icon={t.icon} label={t.label} active={t.active} underlineClass="left-8 right-8" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
