import React, { useState } from 'react';
import { User } from '../types';
import { AetherisLogo } from './logo';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Mock Auth Logic
      if (isLogin) {
        const storedUsers = JSON.parse(localStorage.getItem('aetheris_users') || '[]');
        const user = storedUsers.find((u: any) => (u.email === email || u.username === email) && u.password === password);
        
        if (user) {
          onLogin({ username: user.username, email: user.email });
        } else {
          // Allow generic login for demo if empty
          if (email && password) {
             onLogin({ username: email.split('@')[0], email: email });
          } else {
             setError('Please enter valid credentials.');
             setLoading(false);
          }
        }
      } else {
        const newUser = { username, email, password };
        const storedUsers = JSON.parse(localStorage.getItem('aetheris_users') || '[]');
        localStorage.setItem('aetheris_users', JSON.stringify([...storedUsers, newUser]));
        setIsLogin(true);
        setError('');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex w-full h-screen bg-[#050505]">
      {/* LEFT SIDE - Animated Futuristic Background */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-black">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black bg-[length:400%_400%] animate-gradient-slow">
            {/* Subtle overlay gradients for depth */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-900/10 to-black/80" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
             <img src={AetherisLogo} alt="Aetheris" className="w-32 h-32 mb-6 drop-shadow-[0_0_30px_rgba(56,189,248,0.5)] animate-pulse" />
             <h1 className="text-4xl font-bold text-white tracking-wide">Aetheris AI</h1>
             <p className="text-gray-300 mt-2 font-light tracking-wider">Experience the future of intelligence.</p>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0a0c] text-white">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                {/* Logo for mobile view */}
                <div className="lg:hidden flex justify-center mb-6">
                    <img src={AetherisLogo} alt="Logo" className="w-16 h-16" />
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-white">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                    {isLogin ? 'Please enter your details.' : 'Start your journey today.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Username</label>
                            <input 
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 px-1 text-white placeholder-gray-600 outline-none transition-colors"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">Email</label>
                        <input 
                            type="text"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 px-1 text-white placeholder-gray-600 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
                        <input 
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 px-1 text-white placeholder-gray-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-offset-gray-900" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Remember me</label>
                    </div>
                    {isLogin && (
                        <div className="text-sm">
                            <a href="#" className="font-medium text-gray-400 hover:text-white transition-colors">Forgot password?</a>
                        </div>
                    )}
                </div>

                {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all transform hover:scale-[1.01]"
                >
                    {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
                </button>
            </form>

            <div className="text-center text-sm">
                <p className="text-gray-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-white hover:underline">
                        {isLogin ? 'Register here' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;