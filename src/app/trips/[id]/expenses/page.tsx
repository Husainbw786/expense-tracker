import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { deleteExpense } from "@/app/actions";

export const dynamic = "force-dynamic";

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
    <main className="px-4 pt-6">
      <Link href={`/trips/${tripId}`} className="text-sm text-indigo-600">
        ← {trip.name}
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link
          href={`/trips/${tripId}/expenses/new`}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add
        </Link>
      </div>

      {expenses.length > 0 && (
        <p className="mt-1 text-sm text-gray-500">
          {expenses.length} expenses · {formatMoney(total)} total
        </p>
      )}

      <div className="mt-4 space-y-2">
        {expenses.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No expenses yet. Tap “+ Add” to log your first one.
          </div>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{e.description}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Paid by {e.payerName} · split {e.participantCount}-way
                    {e.spentOn ? ` · ${e.spentOn}` : ""}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {e.category}
                  </span>
                </div>
                <p className="shrink-0 font-bold">{formatMoney(e.amount)}</p>
              </div>
              <div className="mt-3 flex gap-4 border-t border-gray-100 pt-2 text-sm">
                <Link
                  href={`/trips/${tripId}/expenses/${e.id}/edit`}
                  className="font-medium text-indigo-600"
                >
                  Edit
                </Link>
                <form action={deleteExpense}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="font-medium text-rose-600">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
