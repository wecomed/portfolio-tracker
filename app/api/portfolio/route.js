import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { getPortfolio, savePortfolio } from '../../../lib/db';

// Helper to get user from header (Simulated Auth)
// In a real app, use cookies/session
const getUserEmail = (request) => {
    return request.headers.get('x-user-email');
};

export async function GET(request) {
    const email = getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portfolio = await getPortfolio(email);
    return NextResponse.json(portfolio || { holdings: [], cash: { USD: 0, HKD: 0, CNY: 0 } });
}

export async function POST(request) {
    const email = getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const updatedPortfolio = await savePortfolio(email, body);
        return NextResponse.json(updatedPortfolio);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
