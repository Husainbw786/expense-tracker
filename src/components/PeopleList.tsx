"use client";

import { useState } from "react";
import { addFamily, addMember, deleteFamily, deleteMember } from "@/app/actions";
import { SubmitButton, SubmitLink } from "@/components/SubmitButton";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
    <div>
      {/* Family row — tap to expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`ts-row w-full text-left ${open ? "border-b-transparent" : ""}`}
      >
        <span
          className={`avatar-circle h-10 w-10 ${
            open ? "border-rose-border bg-surface-accent text-rose" : ""
          }`}
        >
          {initials(family.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[0.92rem] tracking-[0.03em] text-ink">{family.name}</span>
          <span className="ts-meta">
            {members.length} {members.length === 1 ? "MEMBER" : "MEMBERS"}
          </span>
        </span>
        <svg
          className={`h-[15px] w-[15px] shrink-0 text-ink-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </button>

      {open && (
        <div className="border-b border-hairline pb-4 pl-[54px]">
          {/* Members */}
          {members.length === 0 ? (
            <p className="ts-micro py-3">No people yet — add someone below.</p>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 border-b border-hairline py-2"
              >
                <span className="text-[0.88rem] font-light tracking-[0.03em] text-ink">
                  {m.name}
                </span>
                <form action={deleteMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitLink className="ts-textlink ts-textlink--danger">Remove</SubmitLink>
                </form>
              </div>
            ))
          )}

          {/* Add member */}
          <form key={addKey} action={handleAddMember} className="flex items-end gap-3 pt-3">
            <input type="hidden" name="familyId" value={family.id} />
            <input
              name="name"
              required
              autoComplete="off"
              placeholder="Add a member…"
              className="flex-1 border-0 border-b border-border-strong bg-transparent px-0 py-1 text-[0.85rem] font-light text-ink outline-none placeholder:text-ink-3 focus:border-rose"
            />
            <SubmitButton loadingText="…" className="ts-textlink ts-textlink--rose pb-1">
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
      <form key={famKey} action={handleAddFamily} className="mb-7 flex items-stretch gap-2.5">
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Family name (e.g. Barodwala Family)"
          className="input flex-1"
        />
        <SubmitButton loadingText="…" className="btn-ghost shrink-0">
          Add
        </SubmitButton>
      </form>

      <div className="ts-ledgerhead">
        <p className="ts-eyebrow ts-eyebrow--accent">Families</p>
      </div>

      {families.length === 0 ? (
        <p className="ts-micro border-b border-hairline py-5">
          No families yet — add one above, then tap it to add people.
        </p>
      ) : (
        <div>
          {families.map((f) => (
            <FamilyRow key={f.id} family={f} members={members.filter((m) => m.familyId === f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
