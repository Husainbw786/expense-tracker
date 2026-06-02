import { getFamilies, getMembersWithFamily } from "@/lib/data";
import {
  addFamily,
  addMember,
  deleteFamily,
  deleteMember,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const [families, members] = await Promise.all([
    getFamilies(),
    getMembersWithFamily(),
  ]);

  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-bold">People</h1>
      <p className="mt-1 text-sm text-gray-500">
        Your family roster — reused across every trip. {families.length} families ·{" "}
        {members.length} people
      </p>

      {/* Add family */}
      <form action={addFamily} className="mt-4 flex gap-2">
        <input
          name="name"
          required
          placeholder="New family name"
          className="input"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-indigo-600 px-4 font-semibold text-white"
        >
          Add
        </button>
      </form>

      {/* Add member */}
      {families.length > 0 && (
        <form action={addMember} className="mt-2 flex gap-2">
          <input
            name="name"
            required
            placeholder="New person's name"
            className="input"
          />
          <select name="familyId" required className="input max-w-[8rem]">
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gray-800 px-4 font-semibold text-white"
          >
            Add
          </button>
        </form>
      )}

      {/* Families with members */}
      <div className="mt-6 space-y-3">
        {families.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Add a family first (e.g. “My family”, “Uncle’s family”), then add
            people to it.
          </div>
        ) : (
          families.map((f) => {
            const fmembers = members.filter((m) => m.familyId === f.id);
            return (
              <div key={f.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {f.name}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      ({fmembers.length})
                    </span>
                  </p>
                  <form action={deleteFamily}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="text-xs font-medium text-rose-600">
                      Delete family
                    </button>
                  </form>
                </div>
                <ul className="mt-2 divide-y divide-gray-100">
                  {fmembers.length === 0 ? (
                    <li className="py-2 text-sm text-gray-400">
                      No people yet.
                    </li>
                  ) : (
                    fmembers.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span>{m.name}</span>
                        <form action={deleteMember}>
                          <input type="hidden" name="id" value={m.id} />
                          <button className="text-xs font-medium text-gray-400">
                            Remove
                          </button>
                        </form>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 px-1 text-xs text-gray-400">
        Deleting a family or person also removes their expenses and shares.
      </p>
    </main>
  );
}
