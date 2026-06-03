import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { deleteExpense } from "@/app/actions";
import { SubmitLink } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const CATEGORY_STYLES: Record<string, { dot: string; chip: string; label: string }> = {
  Travel:   { dot: "bg-blue-400",   chip: "bg-blue-50 text-blue-600",     label: "Travel" },
  Train:    { dot: "bg-indigo-400", chip: "bg-indigo-50 text-indigo-600", label: "Train" },
  Rickshaw: { dot: "bg-yellow-400", chip: "bg-yellow-50 text-yellow-600", label: "Rickshaw" },
  Hotel:    { dot: "bg-orange-400", chip: "bg-orange-50 text-orange-600", label: "Hotel" },
  Food:     { dot: "bg-green-400",  chip: "bg-green-50 text-green-600",   label: "Food" },
  Tickets:  { dot: "bg-purple-400", chip: "bg-purple-50 text-purple-600", label: "Tickets" },
  Shopping: { dot: "bg-pink-400",   chip: "bg-pink-50 text-pink-600",     label: "Shopping" },
  Other:    { dot: "bg-gray-400",   chip: "bg-gray-100 text-gray-500",    label: "Other" },
};

export default async function TripExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const expenses = await getTripExpensesWithDetails(tripId);
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <main className="pb-28">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600 font-medium">
          ← {trip.name}
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
            {expenses.length > 0 && (
              <p className="text-sm text-gray-400">
                {expenses.length} expenses · {formatMoney(total)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {expenses.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-semibold text-gray-800">No expenses yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap + Add to log your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => {
              const cat = CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES.Other;
              return (
                <div key={e.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.dot} mt-2 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{e.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`chip ${cat.chip} text-xs`}>{e.category}</span>
                        <span className="text-xs text-gray-400">
                          {e.payerName} · {e.participantCount} people
                          {e.spentOn ? ` · ${e.spentOn}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">{formatMoney(e.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <Link
                      href={`/trips/${tripId}/expenses/${e.id}/edit`}
                      className="flex-1 text-center rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-sm py-2"
                    >
                      Edit
                    </Link>
                    <form action={deleteExpense} className="flex-1">
                      <input type="hidden" name="id" value={e.id} />
                      <SubmitLink
                        loadingText="Deleting…"
                        className="w-full rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm py-2 block text-center disabled:opacity-60"
                      >
                        Delete
                      </SubmitLink>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
