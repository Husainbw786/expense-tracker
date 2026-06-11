import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getFamilies, getTripMembers } from "@/lib/data";
import { addExpense } from "@/app/actions";
import { requireTripAccess } from "@/lib/auth";
import ExpenseForm from "@/components/ExpenseForm";

export const dynamic = "force-dynamic";

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  await requireTripAccess(tripId, "editor");
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const [families, members] = await Promise.all([
    getFamilies(trip.ownerId ?? 0),
    getTripMembers(tripId),
  ]);

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
          <p className="ts-eyebrow ts-eyebrow--accent">New entry</p>
        </div>
        <h1 className="ts-h2 mt-3.5">
          Add to the <em>ledger</em>
        </h1>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty trip</p>
          <p className="ts-h2 mt-3">No people on this trip</p>
          <p className="ts-micro mt-2 mb-6">Add people first, then log expenses.</p>
          <Link href={`/trips/${tripId}/members`} className="btn-ghost">
            Add people to trip
          </Link>
        </div>
      ) : (
        <ExpenseForm
          tripId={tripId}
          members={members}
          families={families}
          action={addExpense}
          submitLabel="Add to ledger"
        />
      )}
    </main>
  );
}
