// Real market data service

// Exchange Rates (Fixed for now, can be made dynamic later)
export const EXCHANGE_RATES = {
    USD: 7.15, // 1 USD = 7.15 CNY
    HKD: 0.91, // 1 HKD = 0.91 CNY
    CNY: 1.00
};

export async function getStockQuote(symbol) {
    try {
        const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            symbol: data.symbol,
            name: data.name,
            price: data.price.toFixed(2),
            changePercent: data.changePercent.toFixed(2),
            currency: data.currency,
            market: data.market
        };
    } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
        // Fallback to a "safe" error object so the UI doesn't crash
        return {
            symbol: symbol.toUpperCase(),
            name: 'Error Fetching',
            price: '0.00',
            changePercent: '0.00',
            currency: 'USD',
            market: 'N/A'
        };
    }
}

export function formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
