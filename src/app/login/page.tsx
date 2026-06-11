import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; invite?: string }>;
}) {
  const { redirect: redirectTo, invite } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(invite ? `/invite/${invite}` : redirectTo || "/");

  return (
    <main className="px-6 pt-14 pb-10">
      <div className="mb-9 text-center">
        <p className="ts-eyebrow ts-eyebrow--accent">Trip Splitter</p>
        <h1 className="ts-display mt-3">
          Welcome <em>back</em>
        </h1>
        <p className="ts-micro mt-2">Log in to your trips</p>
      </div>
      <AuthForm mode="login" redirectTo={redirectTo} invite={invite} />
    </main>
  );
}
