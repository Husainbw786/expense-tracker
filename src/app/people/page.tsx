import { getFamilies, getMembersWithFamily } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import PeopleList from "@/components/PeopleList";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const user = await requireUser();
  const [families, members] = await Promise.all([
    getFamilies(user.id),
    getMembersWithFamily(user.id),
  ]);

  return (
    <main className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {families.length} {families.length === 1 ? "family" : "families"} ·{" "}
          {members.length} people
        </p>
      </div>
      <PeopleList families={families} members={members} />
    </main>
  );
}
