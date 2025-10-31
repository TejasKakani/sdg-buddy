'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Consistent LeafIcon for branding
export function LeafIcon() {
  return (
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
}

// Array of SDG data for the visual panel
const sdgGoals = [
  { id: 1, title: "No Poverty", color: "#E5243B" },
  { id: 4, title: "Quality Education", color: "#C5192D" },
  { id: 5, title: "Gender Equality", color: "#FF3A21" },
  { id: 10, title: "Reduced Inequalities", color: "#DD1367" },
  { id: 13, title: "Climate Action", color: "#3F7E44" },
  { id: 14, title: "Life Below Water", color: "#0A97D9" },
  { id: 15, title: "Life on Land", color: "#56C02B" },
  { id: 17, title: "Partnerships", color: "#19486A" },
];

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        let message = 'Failed to sign up';
        try {
          const data = await response.json();
          if (typeof data === 'string') message = data;
          else if (data?.error) message = data.error;
        } catch {}
        throw new Error(message);
      }

      setSuccess('Account created! Please check your email to verify your account.');
      setName('');
      setEmail('');
      setPassword('');
      // Optionally route to sign-in after a short delay
      setTimeout(() => router.replace('/sign-in'), 2000);
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
        <div className="absolute -top-10 -left-10 w-72 h-72 md:w-96 md:h-96 bg-emerald-600 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 md:w-96 md:h-96 bg-sky-600 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-green-600 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        <style jsx global>{`
          .animate-blob { animation: blob 8s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(40px, -60px) scale(1.15); }
            66% { transform: translate(-30px, 30px) scale(0.85); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `}</style>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden md:grid md:grid-cols-2">
          
          {/* Left Panel: Mission & Visuals */}
          <div className="p-8 md:p-10 border-r border-white/10 hidden md:block">
            <div className="flex items-center space-x-3 mb-6">
              <LeafIcon />
              <h1 className="text-xl font-bold text-white">SDG Buddy</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Begin Your Journey</h2>
            <p className="text-gray-400 mb-8">
              Join a global community making a tangible impact on the UN Sustainable Development Goals.
            </p>
            <div className="grid grid-cols-4 gap-4">
              {sdgGoals.map(goal => (
                <div key={goal.id} className="group flex flex-col items-center text-center p-2 rounded-lg transition-all duration-300 hover:bg-white/5">
                   <div 
                     className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2 transition-all duration-300 group-hover:scale-110"
                     style={{ backgroundColor: goal.color }}
                   >
                     {goal.id}
                   </div>
                   <p className="text-xs text-gray-400 group-hover:text-white transition-colors">{goal.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="p-8 md:p-10">
             <div className="md:hidden text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-2">
                    <LeafIcon />
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                </div>
                <p className="text-gray-400 text-sm">Join the movement for a better future.</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="sr-only">Full Name</label>
                <input 
                  id="fullName" type="text" required
                  className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-signup" className="sr-only">Email</label>
                <input 
                  id="email-signup" type="email" required
                  className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
                  placeholder="email@address.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password-signup" className="sr-only">Password</label>
                <input 
                  id="password-signup" type="password" required
                  className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
                  placeholder="Create a Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm" role="alert">{error}</p>
              )}
              {success && (
                <p className="text-emerald-400 text-sm" role="status">{success}</p>
              )}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-400 transition-colors"
                >
                  {isSubmitting ? 'Creating Account…' : 'Create My Impact Account'}
                </button>
              </div>
            </form>
            <p className="mt-8 text-center text-sm text-gray-400">
               Already have an account? <a href="/sign-in" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Log In.</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}