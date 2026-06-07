import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getFamilies, getTripMembers, getExpenseById } from "@/lib/data";
import { updateExpense } from "@/app/actions";
import { requireTripAccess } from "@/lib/auth";
import ExpenseForm from "@/components/ExpenseForm";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string; expId: string }>;
}) {
  const { id, expId } = await params;
  const tripId = Number(id);
  const expenseId = Number(expId);
  await requireTripAccess(tripId, "editor");
  const trip = await getTrip(tripId);
  const [families, members, expense] = await Promise.all([
    getFamilies(trip?.ownerId ?? 0),
    getTripMembers(tripId),
    getExpenseById(expenseId),
  ]);

  if (!trip || !expense || expense.tripId !== tripId) notFound();

  return (
    <main className="pb-28">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Link href={`/trips/${tripId}/expenses`} className="text-sm text-indigo-600 font-medium">
          ← Expenses
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Edit Expense</h1>
      </div>

      <ExpenseForm
        tripId={tripId}
        members={members}
        families={families}
        action={updateExpense}
        submitLabel="Save Changes"
        initial={{
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          spentOn: expense.spentOn,
          paidBy: expense.paidBy,
          participants: expense.participants,
        }}
      />
    </main>
  );
}
