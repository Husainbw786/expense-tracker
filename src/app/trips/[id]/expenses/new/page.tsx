import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getFamilies, getTripMembers } from "@/lib/data";
import { addExpense } from "@/app/actions";
import ExpenseForm from "@/components/ExpenseForm";

export const dynamic = "force-dynamic";

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const [trip, families, members] = await Promise.all([
    getTrip(tripId),
    getFamilies(),
    getTripMembers(tripId),
  ]);
  if (!trip) notFound();

  return (
    <main className="pb-28">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}/expenses`} className="text-sm text-indigo-600 font-medium">
          ← Expenses
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Add Expense</h1>
      </div>

      {members.length === 0 ? (
        <div className="mx-4 mt-6 card p-8 text-center">
          <p className="text-4xl mb-3">🧑‍🤝‍🧑</p>
          <p className="font-semibold text-gray-800">No people on this trip</p>
          <p className="text-sm text-gray-400 mt-1">Add people first, then log expenses.</p>
          <Link
            href={`/trips/${tripId}/members`}
            className="mt-4 inline-block rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add people to trip
          </Link>
        </div>
      ) : (
        <ExpenseForm
          tripId={tripId}
          members={members}
          families={families}
          action={addExpense}
          submitLabel="Add Expense"
        />
      )}
    </main>
  );
}
