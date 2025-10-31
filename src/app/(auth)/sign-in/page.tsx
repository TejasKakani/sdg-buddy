'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Reusable SVG icon for branding consistency
const LeafIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-400"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export default function LoginScreen() {
  // State for the live counter
  const [actionsLogged, setActionsLogged] = useState(15482);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to simulate the live data ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActionsLogged(prevCount => prevCount + (Math.floor(Math.random() * 5) + 1));
    }, 2500);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log(response);

      if (!response.ok) {
        let message = 'Failed to sign in';
        try {
          const data = await response.json();
          message = typeof data === 'string' ? data : (data?.error || message);
        } catch {}
        throw new Error(message);
      }

      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-4 relative overflow-hidden font-['Poppins',_sans-serif]">
      {/* Background animated gradient blobs */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-emerald-500 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-sky-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-green-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        <style jsx global>{`
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `}</style>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <LeafIcon />
              <h1 className="text-2xl font-bold text-white">
                SDG Buddy
              </h1>
            </div>
            <p className="text-gray-400 text-sm">Empowering Global Change</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input 
                id="email"
                type="email" 
                required
                className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
                placeholder="email@address.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                id="password"
                type="password" 
                required
                className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm" role="alert">{error}</p>
            )}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-400 transition-colors"
              >
                {isSubmitting ? 'Signing In…' : 'Login Securely'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
             <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Actions Logged This Hour</p>
             <p className="text-3xl font-bold text-emerald-400">
               {actionsLogged.toLocaleString()}
             </p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-400">
           First time here? <a href="/sign-up" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Create an account.</a>
        </p>
      </div>
    </div>
  );
}