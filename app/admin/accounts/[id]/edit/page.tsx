import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type EditAccountPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux comptes
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Modifier le compte
          </h1>
        </div>
      </div>

      <form className="space-y-5 rounded-2xl border border-zinc-800/60 bg-[#151518] p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-200">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue="Aminata Kouame"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue="aminata@example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-zinc-200">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="user"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-orange-500"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/accounts"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-[#E25814] px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
