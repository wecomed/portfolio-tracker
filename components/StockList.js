'use client';

import React from 'react';
import { usePortfolio } from '../lib/store';
import { formatCurrency, EXCHANGE_RATES } from '../lib/marketData';
import { Trash2, ExternalLink, MinusCircle } from 'lucide-react';
import SellAssetModal from './SellAssetModal';

export default function StockList() {
    const { holdings, marketData, removeHolding, totalNetWorth, cash } = usePortfolio();
    const [sellModalOpen, setSellModalOpen] = React.useState(false);
    const [selectedHolding, setSelectedHolding] = React.useState(null);

    const handleSellClick = (holding) => {
        setSelectedHolding(holding);
        setSellModalOpen(true);
    };

    if (holdings.length === 0) {
        return (
            <div className="glass-panel p-8 text-center text-muted">
                <p>No stocks in portfolio. Add one to get started.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-subtle">
                <h3 className="font-semibold text-lg">Portfolio Holdings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Market</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Avg Cost</th>
                            <th className="text-right">Change</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Market Value (Orig)</th>
                            <th className="text-right">Market Value (CNY)</th>
                            <th className="text-right">Total P/L (CNY)</th>
                            <th className="text-right">Allocation</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map(holding => {
                            const quote = marketData[holding.symbol];
                            const price = quote ? parseFloat(quote.price) : 0;
                            const change = quote ? parseFloat(quote.changePercent) : 0;
                            const marketValue = price * holding.quantity;
                            const marketValueCNY = marketValue * (quote ? EXCHANGE_RATES[quote.currency] : 1);
                            const isUp = change >= 0;

                            return (
                                <tr key={holding.id} className="hover:bg-panel-hover transition-colors">
                                    <td>
                                        <div className="font-bold">{holding.symbol}</div>
                                        <div className="text-xs text-muted">{quote?.name || 'Loading...'}</div>
                                    </td>
                                    <td>
                                        <span className={`text-xs px-2 py-1 rounded-full bg-opacity-20 ${quote?.market === 'US' ? 'bg-blue-500 text-blue-300' :
                                            quote?.market === 'HK' ? 'bg-purple-500 text-purple-300' :
                                                'bg-red-500 text-red-300'
                                            }`}>
                                            {quote?.market || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="text-right font-mono">
                                        {quote ? (
                                            <>
                                                {quote.currency === 'USD' ? '$' : quote.currency === 'HKD' ? 'HK$' : '¥'}
                                                {price.toFixed(2)}
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="text-right font-mono text-muted">
                                        {holding.costBasis > 0 ? holding.costBasis.toFixed(2) : '-'}
                                    </td>
                                    <td className={`text-right font-mono ${isUp ? 'text-up' : 'text-down'}`}>
                                        {change > 0 ? '+' : ''}{change.toFixed(2)}%
                                    </td>
                                    <td className="text-right font-mono">{holding.quantity}</td>
                                    <td className="text-right font-mono text-muted">
                                        {quote ? (
                                            <>
                                                {quote.currency === 'USD' ? '$' : quote.currency === 'HKD' ? 'HK$' : '¥'}
                                                {marketValue.toFixed(2)}
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="text-right font-bold font-mono">
                                        {formatCurrency(marketValueCNY)}
                                    </td>
                                    <td className={`text-right font-bold font-mono ${marketValueCNY - (holding.quantity * holding.costBasis * (quote ? EXCHANGE_RATES[quote.currency] : 1)) >= 0 ? 'text-up' : 'text-down'}`}>
                                        {formatCurrency(marketValueCNY - (holding.quantity * holding.costBasis * (quote ? EXCHANGE_RATES[quote.currency] : 1)))}
                                    </td>
                                    <td className="text-right font-mono text-muted">
                                        {totalNetWorth > 0 ? ((marketValueCNY / totalNetWorth) * 100).toFixed(1) + '%' : '0.0%'}
                                    </td>
                                    <td className="text-right flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleSellClick(holding)}
                                            className="p-2 text-muted hover:text-red-400 transition-colors"
                                            title="Sell Holding"
                                        >
                                            <MinusCircle size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeHolding(holding.id)}
                                            className="p-2 text-muted hover:text-down transition-colors"
                                            title="Remove Holding"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Cash Row */}
                        <tr className="bg-panel-hover border-t-2 border-subtle">
                            <td>
                                <div className="font-bold text-gold">CASH</div>
                                <div className="text-xs text-muted">Total Cash Balance</div>
                            </td>
                            <td>
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-yellow-300">
                                    Global
                                </span>
                            </td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-bold font-mono text-gold">
                                {formatCurrency(
                                    cash.USD * EXCHANGE_RATES.USD +
                                    cash.HKD * EXCHANGE_RATES.HKD +
                                    cash.CNY * EXCHANGE_RATES.CNY
                                )}
                            </td>
                            <td className="text-right font-mono text-muted">-</td>
                            <td className="text-right font-mono text-gold">
                                {totalNetWorth > 0 ?
                                    ((cash.USD * EXCHANGE_RATES.USD + cash.HKD * EXCHANGE_RATES.HKD + cash.CNY * EXCHANGE_RATES.CNY) / totalNetWorth * 100).toFixed(1)
                                    : '0.0'}%
                            </td>
                            <td className="text-right"></td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <SellAssetModal
                isOpen={sellModalOpen}
                onClose={() => setSellModalOpen(false)}
                holding={selectedHolding}
            />
        </div >
    );
}
