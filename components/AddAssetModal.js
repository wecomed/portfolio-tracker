'use client';

import React, { useState } from 'react';
import { usePortfolio } from '../lib/store';
import { X, PlusCircle, Banknote, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function AddAssetModal({ isOpen, onClose }) {
    const { addHolding, buyStock, adjustCash, cash } = usePortfolio();
    const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'cash'

    // Stock State
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');
    const [costBasis, setCostBasis] = useState('');

    // Cash State
    const [cashMode, setCashMode] = useState('deposit'); // 'deposit' or 'withdraw'
    const [currency, setCurrency] = useState('CNY');
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;

    const handleStockSubmit = (e) => {
        e.preventDefault();
        if (!symbol || !quantity) return;

        buyStock(symbol, quantity, costBasis || 0);
        resetAndClose();
    };

    const handleCashSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        const val = parseFloat(amount);
        // If withdraw, make negative
        const finalAmount = cashMode === 'withdraw' ? -val : val;

        adjustCash(currency, finalAmount);
        resetAndClose();
    };

    const resetAndClose = () => {
        setSymbol('');
        setQuantity('');
        setCostBasis('');
        setAmount('');
        setCashMode('deposit');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md p-0 relative overflow-hidden">
                {/* Header / Tabs */}
                <div className="flex border-b border-subtle">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`flex-1 p-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'stock' ? 'bg-panel-hover text-accent-primary' : 'text-muted hover:text-primary'
                            }`}
                    >
                        <TrendingUp size={18} className="mr-2" />
                        Add Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('cash')}
                        className={`flex-1 p-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'cash' ? 'bg-panel-hover text-gold' : 'text-muted hover:text-primary'
                            }`}
                    >
                        <Banknote size={18} className="mr-2" />
                        Manage Cash
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    {activeTab === 'stock' ? (
                        <form onSubmit={handleStockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-secondary mb-1">Stock Symbol</label>
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    placeholder="e.g. AAPL, 0700.HK"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent-primary transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-secondary mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-secondary mb-1">Avg Cost</label>
                                    <input
                                        type="number"
                                        value={costBasis}
                                        onChange={(e) => setCostBasis(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-muted mt-2">
                                Cash will be deducted: <span className="text-red-400 font-bold">
                                    {quantity && costBasis ? (parseFloat(quantity) * parseFloat(costBasis)).toFixed(2) : '0.00'}
                                </span>
                            </div>

                            <button type="submit" className="w-full btn-primary mt-4">
                                Confirm Buy
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCashSubmit} className="space-y-4">
                            {/* Cash Mode Toggle */}
                            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setCashMode('deposit')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center transition-all ${cashMode === 'deposit'
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : 'text-muted hover:text-white'
                                        }`}
                                >
                                    <ArrowUpCircle size={16} className="mr-2" />
                                    Deposit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCashMode('withdraw')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center transition-all ${cashMode === 'withdraw'
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'text-muted hover:text-white'
                                        }`}
                                >
                                    <ArrowDownCircle size={16} className="mr-2" />
                                    Withdraw
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm text-secondary mb-1">Currency</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['CNY', 'USD', 'HKD'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCurrency(c)}
                                            className={`p-2 rounded-lg text-sm font-medium border transition-all ${currency === c
                                                    ? 'bg-slate-700 border-gold text-gold'
                                                    : 'border-slate-700 text-muted hover:border-slate-500'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-secondary mb-1">
                                    {cashMode === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none transition-all ${cashMode === 'deposit'
                                            ? 'border-slate-700 focus:border-emerald-500'
                                            : 'border-slate-700 focus:border-red-500'
                                        }`}
                                    autoFocus
                                />
                            </div>

                            <div className="text-sm text-secondary flex justify-between bg-slate-800/50 p-3 rounded-lg">
                                <span>Current Balance:</span>
                                <span className="font-mono text-gold">{currency} {cash[currency].toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                className={`w-full btn-primary mt-4 shadow-lg ${cashMode === 'deposit'
                                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                    }`}
                            >
                                {cashMode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdraw'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
