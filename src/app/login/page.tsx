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
    <main className="px-5 pt-16 pb-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl">
          🧳
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-400 mt-1">Log in to your trips</p>
      </div>
      <div className="card p-5">
        <AuthForm mode="login" redirectTo={redirectTo} invite={invite} />
      </div>
    </main>
  );
}
