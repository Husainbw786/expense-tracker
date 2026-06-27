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
    <main className="px-5 pb-32">
      <div className="pt-3 pb-5">
        <p className="ts-micro">Your roster</p>
        <h1 className="ts-display mt-0.5">People</h1>
        <p className="ts-micro mt-1.5">
          {families.length} {families.length === 1 ? "family" : "families"} · {members.length}{" "}
          people
        </p>
      </div>
      <PeopleList families={families} members={members} />
    </main>
  );
}
