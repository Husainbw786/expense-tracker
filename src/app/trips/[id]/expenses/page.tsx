import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { deleteExpense } from "@/app/actions";
import { SubmitLink } from "@/components/SubmitButton";
import TripTabs from "@/components/TripTabs";
import { requireTripAccess, canWrite } from "@/lib/auth";

export const dynamic = "force-dynamic";

function fmtDateLong(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default async function TripExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const { role } = await requireTripAccess(tripId, "viewer");
  const writable = canWrite(role);
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const expenses = await getTripExpensesWithDetails(tripId);
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  // group by day (undated entries last)
  const groups: { date: string | null; items: typeof expenses }[] = [];
  const sorted = [...expenses].sort((a, b) =>
    (a.spentOn ?? "9999") < (b.spentOn ?? "9999") ? -1 : 1
  );
  for (const e of sorted) {
    const g = groups[groups.length - 1];
    if (g && g.date === (e.spentOn ?? null)) g.items.push(e);
    else groups.push({ date: e.spentOn ?? null, items: [e] });
  }

  return (
    <main className="px-5 pb-32">
      {/* Header */}
      <div className="pt-3">
        <Link href={`/trips/${tripId}`} className="ts-textlink inline-flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          {trip.name}
        </Link>
      </div>

      <div className="mt-3">
        <TripTabs tripId={tripId} active="expenses" />
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty ledger</p>
          <p className="ts-h2 mt-3">No expenses yet</p>
          <p className="ts-micro mt-2">Tap Add to log your first one.</p>
        </div>
      ) : (
        <div className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[0.94rem] font-semibold text-ink">
              Ledger · {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
            </p>
            <span className="ts-money text-[0.98rem]">{formatMoney(total)}</span>
          </div>

          {groups.map((g, gi) => (
            <div key={gi} className="mb-5">
              <p className="ts-meta mb-2.5 text-ink-3">{fmtDateLong(g.date) ?? "Undated"}</p>
              <div className="flex flex-col gap-2.5">
                {g.items.map((e) => (
                  <details key={e.id} className="card group p-0">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface-accent text-rose">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-2-1.3V7z"></path>
                          <path d="M8 9h8M8 13h5"></path>
                        </svg>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[0.94rem] font-semibold text-ink">
                          {e.description}
                        </span>
                        <span className="ts-meta truncate">
                          {e.category} · paid by {e.payerName} · {e.participantCount}{" "}
                          {e.participantCount === 1 ? "person" : "people"}
                        </span>
                      </span>
                      <span className="ts-money shrink-0 text-[1rem]">{formatMoney(e.amount)}</span>
                    </summary>
                    <div className="border-t border-hairline px-4 pb-4 pt-3">
                      <p className="ts-micro text-[0.82rem]">
                        {formatMoney(e.amount / Math.max(1, e.participantCount))} each across{" "}
                        {e.participantCount} {e.participantCount === 1 ? "person" : "people"}.
                      </p>
                      {writable && (
                        <div className="flex items-center gap-3 pt-3">
                          <Link href={`/trips/${tripId}/expenses/${e.id}/edit`} className="ts-textlink">
                            Edit
                          </Link>
                          <span className="text-border-strong">·</span>
                          <form action={deleteExpense}>
                            <input type="hidden" name="id" value={e.id} />
                            <SubmitLink loadingText="Deleting…" className="ts-textlink ts-textlink--danger">
                              Delete
                            </SubmitLink>
                          </form>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {writable && (
            <Link
              href={`/trips/${tripId}/expenses/new`}
              className="btn-primary mt-2 w-full"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add expense
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
