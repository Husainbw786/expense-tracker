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
      <div className="px-6 pt-7">
        <Link
          href={`/trips/${tripId}/expenses`}
          className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5"
        >
          ← Expenses
        </Link>
        <div className="ts-ledgerhead mt-5">
          <p className="ts-eyebrow ts-eyebrow--accent">Edit entry</p>
        </div>
        <h1 className="ts-h2 mt-3.5">
          Edit <em>expense</em>
        </h1>
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
          participants: expense.participants,
        }}
      />
    </main>
  );
}
