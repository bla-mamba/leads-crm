import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import UAParser from 'ua-parser-js';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW: popup state
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!session) throw new Error('No session returned');

      const parser = new UAParser();
      const userAgent = parser.getResult();

      try {
        const logResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            user_id: session.user.id,
            user_agent: userAgent
          })
        });

        if (!logResponse.ok) {
          const errorData = await logResponse.json();
          console.error('Error logging login via Edge Function:', errorData);
        }
      } catch (logError) {
        console.error('Network error logging login:', logError);
      }

      // NEW: Show success popup
      setPopup({
        type: 'success',
        message: "Have a great day today from Cobra, wish yall make big money.\nAlways remember big money never comes clean."
      });

    } catch (error) {
      console.error('Error logging in:', error);
      // NEW: Show error popup
      setPopup({
        type: 'error',
        message: "Login failed. Big money takes patience—check your details and try again!"
      });
    } finally {
      setLoading(false);
    }
  };

  // NEW: handle popup button
  const handlePopupClose = () => {
    if (popup?.type === 'success') {
      navigate('/'); // continue flow on success
    } else {
      setPopup(null); // close popup and allow retry on error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 px-4 relative">

      {/* Animated Border Wrapper */}
      <div className="relative p-[3px] rounded-3xl overflow-hidden w-full max-w-full md:max-w-4xl lg:max-w-6xl">

        {/* Infinite Scrolling Border */}
        <div className="absolute inset-0 rounded-3xl animate-spin-slow bg-[conic-gradient(from_0deg,#f87171,#fbbf24,#34d399,#3b82f6,#f87171)] bg-[length:400%_400%]"></div>

        {/* Login Card */}
        <div className="relative bg-gray-950 rounded-3xl w-full px-8 py-12 md:px-16 md:py-16 lg:px-24 lg:py-20 border border-gray-700 shadow-xl flex flex-col items-center">

          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-800/20 p-5 rounded-full border border-indigo-700 mb-5">
              <LogIn size={48} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Secure Access</h1>
            <p className="text-gray-300 text-base md:text-lg mt-2 text-center">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full max-w-lg space-y-6 md:space-y-8">

            <div>
              <label className="block text-gray-300 mb-2 md:text-lg">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-3 md:py-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base md:text-lg transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 md:text-lg">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-3 md:py-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base md:text-lg transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

          </form>
        </div>
      </div>

      {/* NEW: Custom Popup Modal */}
      {popup && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <p className="text-white whitespace-pre-line mb-6">{popup.message}</p>
            <button
              onClick={handlePopupClose}
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 
                ${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {popup.type === 'success' ? 'Thank you' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;