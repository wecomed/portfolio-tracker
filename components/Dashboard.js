'use client';

import React from 'react';
import { usePortfolio } from '../lib/store';
import { formatCurrency, EXCHANGE_RATES } from '../lib/marketData';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

export default function Dashboard() {
    const { totalNetWorth, cash, holdings, marketData } = usePortfolio();

    // Calculate daily P&L (Simulated based on today's change)
    let dailyPnL = 0;
    holdings.forEach(h => {
        const quote = marketData[h.symbol];
        if (quote) {
            const changeAmount = (parseFloat(quote.price) * (parseFloat(quote.changePercent) / 100)) * h.quantity;
            dailyPnL += changeAmount * EXCHANGE_RATES[quote.currency];
        }
    });

    const isPositive = dailyPnL >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Net Worth Card */}
            <div className="glass-panel p-6 md:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={120} />
                </div>
                <h2 className="text-secondary text-sm uppercase tracking-wider mb-2">Total Net Worth</h2>
                <div className="text-4xl font-bold text-primary mb-4">
                    {formatCurrency(totalNetWorth)}
                </div>
                <div className={`flex items-center text-sm ${isPositive ? 'text-up' : 'text-down'}`}>
                    {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                    <span className="font-bold mr-1">{isPositive ? '+' : ''}{formatCurrency(dailyPnL)}</span>
                    <span>Today's P&L</span>
                </div>
            </div>

            {/* Cash Breakdown Card */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-secondary text-sm uppercase tracking-wider">Cash Balance</h2>
                    <PieChart size={20} className="text-muted" />
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">USD</span>
                        <span className="font-mono text-gold">${cash.USD.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">HKD</span>
                        <span className="font-mono text-gold">HK${cash.HKD.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">CNY</span>
                        <span className="font-mono text-gold">¥{cash.CNY.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-subtle my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">Total (CNY)</span>
                        <div className="text-right">
                            <span className="font-bold block">
                                {formatCurrency(
                                    cash.USD * EXCHANGE_RATES.USD +
                                    cash.HKD * EXCHANGE_RATES.HKD +
                                    cash.CNY * EXCHANGE_RATES.CNY
                                )}
                            </span>
                            <span className="text-xs text-muted">
                                {totalNetWorth > 0 ?
                                    ((cash.USD * EXCHANGE_RATES.USD + cash.HKD * EXCHANGE_RATES.HKD + cash.CNY * EXCHANGE_RATES.CNY) / totalNetWorth * 100).toFixed(1)
                                    : '0.0'}% of Portfolio
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
