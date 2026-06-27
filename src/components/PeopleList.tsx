"use client";

import { useState } from "react";
import { addFamily, addMember, deleteFamily, deleteMember } from "@/app/actions";
import { SubmitButton, SubmitLink } from "@/components/SubmitButton";

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const i = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return i.toUpperCase() || "··";
}

type Family = { id: number; name: string };
type Member = { id: number; name: string; familyId: number };

function FamilyRow({ family, members }: { family: Family; members: Member[] }) {
  const [open, setOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);

  async function handleAddMember(fd: FormData) {
    await addMember(fd);
    setAddKey((k) => k + 1);
  }

  return (
    <div
      className="rounded-[15px] border bg-surface-card transition-colors"
      style={{ borderColor: open ? "var(--rose-border)" : "var(--hairline)" }}
    >
      {/* Family row — tap to expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="avatar-circle h-[42px] w-[42px] text-[0.8rem]">
          {initials(family.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[0.96rem] font-semibold text-ink">{family.name}</span>
          <span className="ts-meta">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </span>
        <svg
          className={`h-[18px] w-[18px] shrink-0 text-ink-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </button>

      {open && (
        <div className="border-t border-hairline px-4 pb-4 pt-1">
          {/* Members */}
          {members.length === 0 ? (
            <p className="ts-micro py-3">No people yet — add someone below.</p>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 border-b border-hairline py-2.5"
              >
                <span className="text-[0.9rem] font-medium text-ink">{m.name}</span>
                <form action={deleteMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitLink className="ts-textlink ts-textlink--danger">Remove</SubmitLink>
                </form>
              </div>
            ))
          )}

          {/* Add member */}
          <form key={addKey} action={handleAddMember} className="flex items-end gap-3 pt-3.5">
            <input type="hidden" name="familyId" value={family.id} />
            <input
              name="name"
              required
              autoComplete="off"
              placeholder="Add a member…"
              className="flex-1 border-0 border-b border-border-strong bg-transparent px-0 py-1.5 text-[0.9rem] font-medium text-ink outline-none placeholder:text-ink-3 focus:border-rose"
            />
            <SubmitButton loadingText="…" className="ts-textlink pb-1.5">
              Add
            </SubmitButton>
          </form>

          {/* Remove family */}
          <div className="pt-4">
            <form action={deleteFamily}>
              <input type="hidden" name="id" value={family.id} />
              <SubmitLink className="ts-textlink ts-textlink--danger">Remove family</SubmitLink>
            </form>
          </div>
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
      {/* Add family */}
      <form key={famKey} action={handleAddFamily} className="mb-6 flex items-stretch gap-2.5">
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Add a family — e.g. Barodwala Family"
          className="input flex-1"
        />
        <SubmitButton loadingText="…" className="btn-primary shrink-0 px-5">
          Add
        </SubmitButton>
      </form>

      <p className="mb-3 text-[0.94rem] font-semibold text-ink">Families</p>

      {families.length === 0 ? (
        <p className="ts-micro rounded-[15px] border border-hairline bg-surface-card px-4 py-5">
          No families yet — add one above, then tap it to add people.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {families.map((f) => (
            <FamilyRow key={f.id} family={f} members={members.filter((m) => m.familyId === f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
