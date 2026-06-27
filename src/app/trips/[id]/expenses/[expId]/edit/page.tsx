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
    <main className="pb-32">
      <div className="px-5 pt-3">
        <Link
          href={`/trips/${tripId}/expenses`}
          className="ts-textlink inline-flex items-center gap-1.5"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Expenses
        </Link>
        <h1 className="ts-display mt-2.5 text-[1.85rem]">Edit expense</h1>
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
