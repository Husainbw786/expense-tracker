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
    <main className="pt-6">
      <div className="px-4">
        <Link href={`/trips/${tripId}/expenses`} className="text-sm text-indigo-600">
          ← Expenses
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Add expense</h1>
      </div>
      {members.length === 0 ? (
        <div className="mx-4 mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Add people to this trip first, then you can log expenses.
          </p>
          <Link
            href={`/trips/${tripId}/members`}
            className="mt-3 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
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
          submitLabel="Add expense"
        />
      )}
    </main>
  );
}
