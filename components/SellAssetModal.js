'use client';

import React, { useState } from 'react';
import { usePortfolio } from '../lib/store';
import { X, MinusCircle } from 'lucide-react';

export default function SellAssetModal({ isOpen, onClose, holding }) {
    const { sellStock } = usePortfolio();
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');

    if (!isOpen || !holding) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!quantity || !price) return;

        sellStock(holding.symbol, quantity, price);

        // Reset and close
        setQuantity('');
        setPrice('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center text-red-400">
                    <MinusCircle className="mr-2" />
                    Sell {holding.symbol}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-slate-800 rounded-lg text-sm text-secondary mb-4">
                        <div className="flex justify-between mb-1">
                            <span>Available Quantity:</span>
                            <span className="font-mono text-white">{holding.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Avg Cost:</span>
                            <span className="font-mono text-white">{holding.costBasis.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-secondary mb-1">Sell Quantity</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0"
                                max={holding.quantity}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-secondary mb-1">Sell Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-muted mt-2">
                        Cash will be added: <span className="text-gold font-bold">
                            {quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '0.00'}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary mt-4 bg-red-600 hover:bg-red-500 shadow-red-900/20"
                        style={{ '--accent-glow': 'rgba(239, 68, 68, 0.3)' }}
                    >
                        Confirm Sell
                    </button>
                </form>
            </div>
        </div>
    );
}
