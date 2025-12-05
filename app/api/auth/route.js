import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        if (action === 'register') {
            try {
                const user = db.createUser(email, password);
                return NextResponse.json({
                    user: { email: user.email, id: user.id },
                    portfolio: user.portfolio
                });
            } catch (e) {
                return NextResponse.json({ error: e.message }, { status: 400 });
            }
        }

        if (action === 'login') {
            const user = db.findUser(email);
            if (!user || user.password !== password) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
            return NextResponse.json({
                user: { email: user.email, id: user.id },
                portfolio: user.portfolio
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
