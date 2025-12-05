import yahooFinance from 'yahoo-finance2';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const quote = await yahooFinance.quote(symbol);

        // Determine currency and market based on symbol or result
        let currency = quote.currency || 'USD';
        let market = 'US';

        if (symbol.endsWith('.HK')) {
            market = 'HK';
            currency = 'HKD';
        } else if (symbol.endsWith('.SS') || symbol.endsWith('.SZ')) {
            market = 'CN';
            currency = 'CNY';
        }

        return NextResponse.json({
            symbol: symbol.toUpperCase(),
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice,
            changePercent: quote.regularMarketChangePercent,
            currency: currency,
            market: market
        });
    } catch (error) {
        console.error('Yahoo Finance Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data', details: error.message },
            { status: 500 }
        );
    }
}
