'use client';

import React, { useState } from 'react';
import { usePortfolio } from '../lib/store';
import { X, LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
    const { login, register } = usePortfolio();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let success;
            if (isLogin) {
                success = await login(email, password);
            } else {
                success = await register(email, password);
            }

            if (success) {
                onClose();
                setEmail('');
                setPassword('');
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-sm p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-muted">
                        {isLogin
                            ? 'Login to sync your portfolio across devices.'
                            : 'Sign up to save your data securely.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-muted" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-muted" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary mt-6 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : isLogin ? (
                            <LogIn className="mr-2" size={18} />
                        ) : (
                            <UserPlus className="mr-2" size={18} />
                        )}
                        {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-accent-primary hover:text-accent-secondary font-medium transition-colors"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
