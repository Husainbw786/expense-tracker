import { getFamilies, getMembersWithFamily } from "@/lib/data";
import { addFamily, addMember, deleteFamily, deleteMember } from "@/app/actions";
import { SubmitButton, SubmitLink } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const FAMILY_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-600", memberBg: "bg-violet-50" },
  { bg: "bg-emerald-100", text: "text-emerald-600", memberBg: "bg-emerald-50" },
  { bg: "bg-sky-100", text: "text-sky-600", memberBg: "bg-sky-50" },
  { bg: "bg-amber-100", text: "text-amber-600", memberBg: "bg-amber-50" },
  { bg: "bg-rose-100", text: "text-rose-600", memberBg: "bg-rose-50" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function PeoplePage() {
  const [families, members] = await Promise.all([getFamilies(), getMembersWithFamily()]);

  return (
    <main className="px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {families.length} {families.length === 1 ? "family" : "families"} · {members.length} people
        </p>
      </div>

      {/* Families */}
      {families.length === 0 ? (
        <div className="card p-8 text-center mb-4">
          <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="font-semibold text-gray-800">No families yet</p>
          <p className="text-sm text-gray-400 mt-1">Add a family first, then add people to it.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {families.map((f, fi) => {
            const color = FAMILY_COLORS[fi % FAMILY_COLORS.length];
            const fmembers = members.filter((m) => m.familyId === f.id);
            return (
              <div key={f.id} className="card overflow-hidden">
                {/* Family header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`avatar-circle w-9 h-9 ${color.bg} ${color.text}`}>
                      {initials(f.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                      <p className="text-xs text-gray-400">{fmembers.length} {fmembers.length === 1 ? "member" : "members"}</p>
                    </div>
                  </div>
                  <form action={deleteFamily}>
                    <input type="hidden" name="id" value={f.id} />
                    <SubmitLink className="text-xs font-medium text-rose-500 hover:text-rose-700">
                      Delete
                    </SubmitLink>
                  </form>
                </div>

                {/* Members */}
                <div className="divide-y divide-gray-50">
                  {fmembers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">No people yet.</p>
                  ) : (
                    fmembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold`}>
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add forms */}
      <div className="space-y-3">
        <p className="section-label">Add new</p>

        <form action={addFamily} className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Family</p>
          <div className="flex gap-2">
            <input name="name" required placeholder="Family name (e.g. My Family)" className="input flex-1" />
            <SubmitButton loadingText="Adding…" className="shrink-0 rounded-2xl bg-indigo-600 px-4 font-semibold text-white text-sm disabled:opacity-60">
              Add
            </SubmitButton>
          </div>
        </form>

        {families.length > 0 && (
          <form action={addMember} className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Person</p>
            <div className="flex gap-2">
              <input name="name" required placeholder="Person's name" className="input flex-1" />
              <select name="familyId" required className="input w-36">
                {families.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <SubmitButton loadingText="Adding…" className="shrink-0 rounded-2xl bg-gray-800 px-4 font-semibold text-white text-sm disabled:opacity-60">
                Add
              </SubmitButton>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 px-1 text-xs text-gray-400 text-center">
        Deleting a family or person also removes their expenses and shares.
      </p>
    </main>
  );
}
