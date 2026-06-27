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
        <h1 className="ts-display mt-2.5 text-[1.85rem]">Add expense</h1>
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
