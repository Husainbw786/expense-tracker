"use client";

import { useState } from "react";
import { addFamily, addMember, deleteFamily, deleteMember } from "@/app/actions";
import { SubmitButton, SubmitLink } from "@/components/SubmitButton";

const COLORS = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-sky-100", text: "text-sky-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-teal-100", text: "text-teal-600" },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

type Family = { id: number; name: string };
type Member = { id: number; name: string; familyId: number };

function FamilyCard({ family, members, ci }: { family: Family; members: Member[]; ci: number }) {
  const [open, setOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);
  const color = COLORS[ci % COLORS.length];

  async function handleAddMember(fd: FormData) {
    await addMember(fd);
    setAddKey((k) => k + 1);
  }

  return (
    <div className="card overflow-hidden mb-3">
      {/* Family header — tap to expand/collapse */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div
            className={`w-9 h-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}
          >
            {initials(family.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{family.name}</p>
            <p className="text-xs text-gray-400">
              {members.length} {members.length === 1 ? "member" : "members"} — tap to{" "}
              {open ? "collapse" : "expand"}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <form action={deleteFamily}>
          <input type="hidden" name="id" value={family.id} />
          <SubmitLink className="text-xs font-medium text-rose-500 hover:text-rose-700 px-1 py-1">
            Delete
          </SubmitLink>
        </form>
      </div>

      {open && (
        <div className="border-t border-gray-100">
          {/* Add member — at the top of the expanded section */}
          <form
            key={addKey}
            action={handleAddMember}
            className="flex gap-2 px-3 py-3 bg-gray-50 border-b border-gray-100"
          >
            <input type="hidden" name="familyId" value={family.id} />
            <input
              name="name"
              required
              autoComplete="off"
              placeholder="New person's name…"
              className="input flex-1 text-sm"
            />
            <SubmitButton
              loadingText="Adding…"
              className="shrink-0 rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white text-sm disabled:opacity-60"
            >
              + Add
            </SubmitButton>
          </form>

          {/* Member list */}
          {members.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-400 text-center">
              No people yet — add someone above.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold`}
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-800">{m.name}</span>
                  </div>
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitLink className="text-xs text-gray-400 hover:text-rose-500 font-medium">
                      Remove
                    </SubmitLink>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PeopleList({
  families,
  members,
}: {
  families: Family[];
  members: Member[];
}) {
  const [famKey, setFamKey] = useState(0);

  async function handleAddFamily(fd: FormData) {
    await addFamily(fd);
    setFamKey((k) => k + 1);
  }

  return (
    <div>
      {/* Add family — always visible at top */}
      <form key={famKey} action={handleAddFamily} className="card p-4 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Add Family
        </p>
        <div className="flex gap-2">
          <input
            name="name"
            required
            autoComplete="off"
            placeholder="Family name (e.g. Barodwala Family)"
            className="input flex-1"
          />
          <SubmitButton
            loadingText="Adding…"
            className="shrink-0 rounded-2xl bg-indigo-600 px-4 font-semibold text-white text-sm disabled:opacity-60"
          >
            Add
          </SubmitButton>
        </div>
      </form>

      {families.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="font-semibold text-gray-800">No families yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add a family above, then tap it to add people.
          </p>
        </div>
      ) : (
        <div>
          {families.map((f, i) => (
            <FamilyCard
              key={f.id}
              family={f}
              members={members.filter((m) => m.familyId === f.id)}
              ci={i}
            />
          ))}
          <p className="mt-2 px-1 text-xs text-gray-400 text-center">
            Tap a family card to expand and add or remove people.
          </p>
        </div>
      )}
    </div>
  );
}
