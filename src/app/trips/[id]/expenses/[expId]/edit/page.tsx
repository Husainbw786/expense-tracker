import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTrip,
  getFamilies,
  getTripMembers,
  getExpenseById,
} from "@/lib/data";
import { updateExpense } from "@/app/actions";
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
  const [trip, families, members, expense] = await Promise.all([
    getTrip(tripId),
    getFamilies(),
    getTripMembers(tripId),
    getExpenseById(expenseId),
  ]);

  if (!trip || !expense || expense.tripId !== tripId) notFound();

  return (
    <main className="pt-6">
      <div className="px-4">
        <Link href={`/trips/${tripId}/expenses`} className="text-sm text-indigo-600">
          ← Expenses
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit expense</h1>
      </div>
      <ExpenseForm
        tripId={tripId}
        members={members}
        families={families}
        action={updateExpense}
        submitLabel="Save changes"
        initial={{
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          spentOn: expense.spentOn,
          paidBy: expense.paidBy,
          participantIds: expense.participantIds,
        }}
      />
    </main>
  );
}
