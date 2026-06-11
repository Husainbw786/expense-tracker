import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripSummary } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { requireTripAccess } from "@/lib/auth";
import DeleteTripButton from "@/components/DeleteTripButton";

export const dynamic = "force-dynamic";

const FAMILY_COLORS = [
  { avatarBg: "bg-violet-100", avatarText: "text-violet-600" },
  { avatarBg: "bg-emerald-100", avatarText: "text-emerald-600" },
  { avatarBg: "bg-sky-100", avatarText: "text-sky-600" },
  { avatarBg: "bg-amber-100", avatarText: "text-amber-600" },
  { avatarBg: "bg-rose-100", avatarText: "text-rose-600" },
];

export default async function TripSummary({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const { role } = await requireTripAccess(tripId, "viewer");
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const s = await getTripSummary(tripId);

  return (
    <main className="pb-28">
      {/* Page header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-indigo-600 font-medium">
            ← All Trips
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`/api/trips/${tripId}/bill/simple`}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Simple
            </a>
            <a
              href={`/api/trips/${tripId}/bill/detailed`}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Detailed
            </a>
          </div>
        </div>
        <h1 className="mt-2 text-xl font-bold text-gray-900">{trip.name}</h1>
        {trip.startDate && (
          <p className="text-sm text-gray-400">{trip.startDate}</p>
        )}

        {s.memberCount > 0 && (
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-indigo-50 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-indigo-700">{formatMoney(s.totalSpent)}</p>
              <p className="text-xs text-indigo-400 mt-0.5">Total</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-gray-700">{s.memberCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">People</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-gray-700">{s.expenseCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">Expenses</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Link
            href={`/trips/${tripId}/activity`}
            className="flex-1 text-center rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold py-2"
          >
            🕑 Activity
          </Link>
          {role === "owner" && (
            <Link
              href={`/trips/${tripId}/collaborators`}
              className="flex-1 text-center rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold py-2"
            >
              👥 Share &amp; invite
            </Link>
          )}
        </div>
        {role === "owner" && (
          <div className="mt-2">
            <DeleteTripButton tripId={tripId} />
          </div>
        )}
      </div>

      {s.memberCount === 0 ? (
        <div className="mx-4 mt-6 card p-8 text-center">
          <p className="text-4xl mb-3">🧑‍🤝‍🧑</p>
          <p className="font-semibold text-gray-800">No one on this trip yet</p>
          <p className="mt-1 text-sm text-gray-400">Add who&apos;s coming along.</p>
          <Link
            href={`/trips/${tripId}/members`}
            className="mt-4 inline-block rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add people to trip
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-5 space-y-6">

          {/* ── SECTION 1: Per-person balances ── */}
          <div>
            <p className="section-label">Each person&apos;s balance</p>
            <div className="card divide-y divide-gray-50">
              {s.familyBalances.map((f, fi) => {
                const c = FAMILY_COLORS[fi % FAMILY_COLORS.length];
                return f.members.map((m) => {
                  const settled = Math.abs(m.net) < 0.01;
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full ${c.avatarBg} ${c.avatarText} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                        {m.name[0]}
                      </div>
                      {/* Name + family */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{f.name}</p>
                      </div>
                      {/* What they paid vs their share */}
                      <div className="text-right mr-3 hidden sm:block">
                        <p className="text-xs text-gray-400">Paid {formatMoney(m.paid)}</p>
                        <p className="text-xs text-gray-400">Share {formatMoney(m.share)}</p>
                      </div>
                      {/* Net badge */}
                      {settled ? (
                        <span className="chip bg-gray-100 text-gray-400 font-medium text-xs flex-shrink-0">
                          Even
                        </span>
                      ) : m.net > 0 ? (
                        <span className="chip bg-emerald-50 text-emerald-600 font-semibold text-xs flex-shrink-0">
                          Gets {formatMoney(m.net)}
                        </span>
                      ) : (
                        <span className="chip bg-rose-50 text-rose-600 font-semibold text-xs flex-shrink-0">
                          Owes {formatMoney(-m.net)}
                        </span>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          </div>

          {/* ── SECTION 2: Exact transfers ── */}
          <div>
            <p className="section-label">Who pays whom</p>
            {s.settlement.length === 0 ? (
              <div className="card p-5 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-medium text-gray-700">
                  {s.expenseCount === 0
                    ? "No expenses yet — add one to see the settlement."
                    : "All settled up! Everyone is even."}
                </p>
              </div>
            ) : (
              <div className="card divide-y divide-gray-50">
                {s.settlement.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    {/* From avatar */}
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 flex-shrink-0">
                      {t.fromName[0]}
                    </div>
                    {/* From → To */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-sm flex-wrap">
                        <span className="font-semibold text-gray-900">{t.fromName}</span>
                        <span className="text-gray-400 text-base">→</span>
                        <span className="font-semibold text-gray-900">{t.toName}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Transfer to settle up</p>
                    </div>
                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-rose-600 text-sm">{formatMoney(t.amount)}</p>
                    </div>
                    {/* To avatar */}
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
                      {t.toName[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 3: Family totals (collapsible) ── */}
          <div>
            <p className="section-label">By family</p>
            <div className="space-y-2">
              {s.familyBalances.map((f, fi) => {
                const c = FAMILY_COLORS[fi % FAMILY_COLORS.length];
                const settled = Math.abs(f.net) < 0.01;
                return (
                  <details key={f.id} className="card overflow-hidden group">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <div className={`avatar-circle w-9 h-9 ${c.avatarBg} ${c.avatarText}`}>
                          {f.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                          <p className="text-xs text-gray-400">
                            {f.memberCount} people · Paid {formatMoney(f.paid)}
                          </p>
                        </div>
                      </div>
                      {settled ? (
                        <span className="chip bg-gray-100 text-gray-400 font-medium">Even</span>
                      ) : (
                        <span className={`chip font-semibold ${f.net > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {f.net > 0 ? "Gets " : "Owes "}{formatMoney(Math.abs(f.net))}
                        </span>
                      )}
                    </summary>
                    <div className="border-t border-gray-50 divide-y divide-gray-50">
                      {f.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${c.avatarBg} ${c.avatarText} flex items-center justify-center text-xs font-bold`}>
                              {m.name[0]}
                            </div>
                            <span className="text-sm text-gray-700">{m.name}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-semibold ${m.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {m.net >= 0 ? "+" : ""}{formatMoney(m.net)}
                            </span>
                            <p className="text-xs text-gray-400">
                              Paid {formatMoney(m.paid)} · Share {formatMoney(m.share)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
