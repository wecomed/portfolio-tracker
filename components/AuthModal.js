'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../lib/store';
import { X, LogIn, UserPlus, Mail, Lock, Loader2, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
    const { login, register } = usePortfolio();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP State
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    if (!isOpen) return null;

    const handleSendCode = async () => {
        if (!email) {
            setError('Please enter your email first.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsCodeSent(true);
                setTimer(60); // 60 seconds cooldown
            } else {
                setError(data.error || 'Failed to send code.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let success;
            if (isLogin) {
                success = await login(email, password);
            } else {
                if (!code) {
                    setError('Please enter the verification code.');
                    setIsLoading(false);
                    return;
                }
                success = await register(email, password, code);
            }

            if (success) {
                onClose();
                setEmail('');
                setPassword('');
                setCode('');
                setIsCodeSent(false);
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
                            : 'Sign up securely with email verification.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Email</label>
                        <div className="relative flex space-x-2">
                            <div className="relative flex-grow">
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
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Verification Code</label>
                            <div className="flex space-x-2">
                                <div className="relative flex-grow">
                                    <KeyRound className="absolute left-3 top-3 text-muted" size={18} />
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                                        required={!isLogin}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={timer > 0 || isLoading || !email}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap"
                                >
                                    {timer > 0 ? `${timer}s` : isCodeSent ? 'Resend' : 'Send Code'}
                                </button>
                            </div>
                            {isCodeSent && <p className="text-xs text-green-400 mt-1">Code sent! Check your email.</p>}
                        </div>
                    )}

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
