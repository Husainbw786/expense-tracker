import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripSummary } from "@/lib/data";
import { formatMoney } from "@/lib/calc";

export const dynamic = "force-dynamic";

export default async function TripSummary({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const s = await getTripSummary(tripId);

  return (
    <main className="px-4 pt-6">
      <Link href="/" className="text-sm text-indigo-600">
        ← All trips
      </Link>
      <h1 className="mt-1 text-2xl font-bold">{trip.name}</h1>

      {s.memberCount === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-5xl">🧑‍🤝‍🧑</p>
          <p className="mt-3 font-semibold">No one on this trip yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add the families and people who came along.
          </p>
          <Link
            href={`/trips/${tripId}/members`}
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
          >
            Add people to trip
          </Link>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <div className="mt-4 rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
            <p className="text-sm opacity-80">Total trip cost</p>
            <p className="mt-1 text-3xl font-bold">{formatMoney(s.totalSpent)}</p>
            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="text-lg font-semibold">{s.memberCount}</span>
                <span className="ml-1 opacity-80">people</span>
              </div>
              <div>
                <span className="text-lg font-semibold">
                  {s.familyBalances.length}
                </span>
                <span className="ml-1 opacity-80">families</span>
              </div>
              <div>
                <span className="text-lg font-semibold">{s.expenseCount}</span>
                <span className="ml-1 opacity-80">expenses</span>
              </div>
            </div>
          </div>

          {/* Settlement */}
          <section className="mt-6">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Who pays whom
            </h2>
            <div className="mt-2 space-y-2">
              {s.settlement.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
                  {s.expenseCount === 0
                    ? "No expenses yet — add one to see the settlement."
                    : "All settled up! Everyone is even. 🎉"}
                </div>
              ) : (
                s.settlement.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-rose-600">
                        {t.fromName}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-emerald-600">
                        {t.toName}
                      </span>
                    </div>
                    <span className="font-bold">{formatMoney(t.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Family balances */}
          <section className="mt-6">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              By family
            </h2>
            <div className="mt-2 space-y-3">
              {s.familyBalances.map((f) => (
                <div key={f.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-xs text-gray-500">
                        {f.memberCount} people
                      </p>
                    </div>
                    <NetBadge net={f.net} />
                  </div>
                  <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
                    <span>Spent {formatMoney(f.paid)}</span>
                    <span>Share {formatMoney(f.share)}</span>
                  </div>

                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-indigo-600">
                      Per person
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {f.members.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">{m.name}</span>
                          <span
                            className={
                              m.net >= 0 ? "text-emerald-600" : "text-rose-600"
                            }
                          >
                            {m.net >= 0 ? "+" : ""}
                            {formatMoney(m.net)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function NetBadge({ net }: { net: number }) {
  if (Math.abs(net) < 0.01) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500">
        Settled
      </span>
    );
  }
  const positive = net > 0;
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      }`}
    >
      {positive ? "Gets " : "Pays "}
      {formatMoney(Math.abs(net))}
    </span>
  );
}
