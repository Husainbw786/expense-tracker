"use client";

import { useMemo, useState } from "react";

type Member = { id: number; name: string; familyId: number; familyName: string };
type Family = { id: number; name: string };

const CATEGORIES = [
  "Travel",
  "Train",
  "Rickshaw",
  "Hotel",
  "Food",
  "Tickets",
  "Shopping",
  "Other",
];

export default function ExpenseForm({
  tripId,
  members,
  families,
  action,
  initial,
  submitLabel = "Save expense",
}: {
  tripId: number;
  members: Member[];
  families: Family[];
  action: (formData: FormData) => void | Promise<void>;
  initial?: {
    id?: number;
    description?: string;
    amount?: number;
    category?: string;
    spentOn?: string | null;
    paidBy?: number;
    participantIds?: number[];
  };
  submitLabel?: string;
}) {
  const allIds = useMemo(() => members.map((m) => m.id), [members]);
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(initial?.participantIds ?? allIds)
  );
  const [amount, setAmount] = useState<string>(
    initial?.amount ? String(initial.amount) : ""
  );
  const amountValue = Number(amount);
  const perHead =
    selected.size > 0 && Number.isFinite(amountValue)
      ? amountValue / selected.size
      : 0;

  const byFamily = useMemo(() => {
    return families
      .map((f) => ({
        family: f,
        members: members.filter((m) => m.familyId === f.id),
      }))
      .filter((g) => g.members.length > 0);
  }, [families, members]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setFamily(ids: number[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  return (
    <form action={action} className="space-y-4 px-4 pt-2">
      <input type="hidden" name="tripId" value={tripId} />
      {initial?.id ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}

      <Field label="What was it for?">
        <input
          name="description"
          required
          defaultValue={initial?.description ?? ""}
          placeholder="e.g. Railway tickets"
          className="input"
        />
      </Field>

      <div className="flex gap-3">
        <Field label="Amount (₹)" className="flex-1">
          <input
            name="amount"
            required
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="input"
          />
        </Field>
        <Field label="Date" className="flex-1">
          <input
            name="spentOn"
            type="date"
            defaultValue={initial?.spentOn ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="flex gap-3">
        <Field label="Who paid?" className="flex-1">
          <select
            name="paidBy"
            required
            defaultValue={initial?.paidBy ?? ""}
            className="input"
          >
            <option value="" disabled>
              Select person
            </option>
            {byFamily.map((g) => (
              <optgroup key={g.family.id} label={g.family.name}>
                {g.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Category" className="flex-1">
          <select
            name="category"
            defaultValue={initial?.category ?? "Other"}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Split between ({selected.size})
          </label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelected(new Set(allIds))}
              className="rounded-lg bg-indigo-50 px-2.5 py-1 font-medium text-indigo-600"
            >
              Everyone
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-600"
            >
              None
            </button>
          </div>
        </div>

        {selected.size > 0 ? (
          <p className="mt-1 text-xs text-gray-500">
            ₹{perHead.toLocaleString("en-IN", { maximumFractionDigits: 2 })} per
            person
          </p>
        ) : (
          <p className="mt-1 text-xs text-rose-500">Select at least one person.</p>
        )}

        <div className="mt-2 space-y-3">
          {byFamily.map((g) => {
            const ids = g.members.map((m) => m.id);
            const allOn = ids.every((id) => selected.has(id));
            return (
              <div
                key={g.family.id}
                className="rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{g.family.name}</span>
                  <button
                    type="button"
                    onClick={() => setFamily(ids, !allOn)}
                    className="text-xs font-medium text-indigo-600"
                  >
                    {allOn ? "Remove all" : "Add all"}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {g.members.map((m) => {
                    const on = selected.has(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggle(m.id)}
                        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                          on
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* hidden inputs carry the selection into the server action */}
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="participants" value={id} />
        ))}
      </div>

      <button
        type="submit"
        disabled={selected.size === 0}
        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}
