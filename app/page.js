'use client';

import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from '../lib/store';
import Dashboard from '../components/Dashboard';
import StockList from '../components/StockList';
import AddAssetModal from '../components/AddAssetModal';
import AuthModal from '../components/AuthModal';
import { Plus, LogIn, LogOut, User } from 'lucide-react';

function PortfolioContent() {
    const { user, logout } = usePortfolio();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <main className="min-h-screen pb-20 pt-24">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 border-b border-subtle bg-panel backdrop-blur-md z-50">
                <div className="container mx-auto flex items-center justify-between py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-accent-primary/20">
                            P
                        </div>
                        <div className="flex flex-col leading-none">
                            <h1 className="text-lg font-bold tracking-tight text-white">Portfolio<span className="text-accent-primary">Tracker</span></h1>
                            <span className="text-[10px] text-muted font-medium tracking-wider uppercase">Personal Asset Manager</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-muted">
                                    <User size={16} className="mr-2" />
                                    <span className="hidden sm:inline">{user.email}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-muted hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-sm font-medium text-muted hover:text-white transition-colors flex items-center"
                            >
                                <LogIn size={16} className="mr-2" />
                                Login / Sign Up
                            </button>
                        )}

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary flex items-center shadow-lg shadow-accent-primary/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Asset
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mt-8 animate-fade-in">
                <Dashboard />
                <StockList />
            </div>

            {/* Modals */}
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </main>
    );
}

export default function Home() {
    return (
        <PortfolioProvider>
            <PortfolioContent />
        </PortfolioProvider>
    );
}
