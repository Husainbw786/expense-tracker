import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { deleteExpense } from "@/app/actions";
import { SubmitLink } from "@/components/SubmitButton";
import { requireTripAccess, canWrite } from "@/lib/auth";

export const dynamic = "force-dynamic";

function fmtDateLong(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
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
    <main className="px-6 pb-28">
      {/* Header */}
      <div className="pt-7">
        <Link
          href={`/trips/${tripId}`}
          className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5"
        >
          ← {trip.name}
        </Link>
        <div className="ts-ledgerhead mt-5">
          <p className="ts-eyebrow ts-eyebrow--accent">Ledger</p>
          {expenses.length > 0 && (
            <span className="ts-meta">
              {expenses.length} entries · {formatMoney(total)}
            </span>
          )}
        </div>
        <h1 className="ts-h2 mt-3.5">
          Every <em>expense</em>
        </h1>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty ledger</p>
          <p className="ts-h2 mt-3">No expenses yet</p>
          <p className="ts-micro mt-2">Tap Add to log your first one.</p>
        </div>
      ) : (
        <div className="pt-1">
          {groups.map((g, gi) => (
            <div key={gi}>
              <p className="ts-eyebrow pt-5 pb-2">{fmtDateLong(g.date) ?? "UNDATED"}</p>
              <div>
                {g.items.map((e) => (
                  <details key={e.id} className="group">
                    <summary className="ts-row cursor-pointer list-none group-open:border-b-transparent group-open:bg-surface-accent [&::-webkit-details-marker]:hidden">
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-[0.92rem] tracking-[0.03em] text-ink">
                          {e.description}
                        </span>
                        <span className="ts-meta">
                          {e.category.toUpperCase()} · PAID BY {e.payerName.toUpperCase()} ·{" "}
                          {e.participantCount} {e.participantCount === 1 ? "PERSON" : "PEOPLE"}
                        </span>
                      </span>
                      <span className="ts-money shrink-0 text-[1.08rem]">
                        {formatMoney(e.amount)}
                      </span>
                    </summary>
                    <div className="border-b border-hairline pb-4">
                      <p className="ts-micro text-[0.76rem]">
                        {formatMoney(e.amount / Math.max(1, e.participantCount))} each across{" "}
                        {e.participantCount} {e.participantCount === 1 ? "person" : "people"}.
                      </p>
                      {writable && (
                        <div className="flex items-center gap-3 pt-3">
                          <Link
                            href={`/trips/${tripId}/expenses/${e.id}/edit`}
                            className="ts-textlink"
                          >
                            Edit
                          </Link>
                          <span className="text-border-strong">·</span>
                          <form action={deleteExpense}>
                            <input type="hidden" name="id" value={e.id} />
                            <SubmitLink
                              loadingText="Deleting…"
                              className="ts-textlink ts-textlink--danger"
                            >
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
        </div>
      )}
    </main>
  );
}
