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
    <main className="px-6 pb-28">
      <div className="pt-8 pb-7">
        <p className="ts-eyebrow ts-eyebrow--accent">Your roster</p>
        <h1 className="ts-display mt-2">People</h1>
        <p className="ts-micro mt-2">
          {families.length} {families.length === 1 ? "family" : "families"} · {members.length}{" "}
          people
        </p>
      </div>
      <PeopleList families={families} members={members} />
    </main>
  );
}
