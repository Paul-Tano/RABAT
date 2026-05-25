"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/dist/client/components/navigation';


export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

   
    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
   
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-500 font-sans">
            RABAT
          </h1>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100">
            Bon retour au cinéma
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Connecte-toi pour retrouver tes favoris et tes critiques.
          </p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          
          <button
            type="button"
           onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 font-medium rounded-xl border border-zinc-700 transition-all duration-200 active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.102C18.23 2.12 15.42 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.6 0 11-4.62 11-11.18 0-.75-.08-1.32-.18-1.815H12.24z"
              />
            </svg>
            Continuer avec Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-3 text-zinc-500 font-semibold tracking-wider">ou</span>
            </div>
          </div>

           {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link href="#" className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-red-950/50"
            >
              <LogIn size={18} />
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Nouveau sur RABAT ?{' '}
            <Link href="/auth/register" className="font-semibold text-amber-500 hover:text-amber-400 transition-colors duration-200 underline underline-offset-4">
              Crée un compte ici
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}