"use client";

import { useFormStatus } from "react-dom";
import { deleteTrip } from "@/app/actions";

function DeleteBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold py-2 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "🗑 Delete Trip"}
    </button>
  );
}

export default function DeleteTripButton({ tripId }: { tripId: number }) {
  function handleSubmit(e: React.FormEvent) {
    if (!confirm("Delete this trip permanently? All expenses and data will be lost and this cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteTrip} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={tripId} />
      <DeleteBtn />
    </form>
  );
}
