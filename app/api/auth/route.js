import { NextResponse } from 'next/server';
import { findUser, createUser, verifyOtp } from '../../../lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        if (action === 'register') {
            const { code } = body;

            // Verify OTP
            if (!code) {
                return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
            }

            const isValid = await verifyOtp(email, code);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
            }

            const existingUser = await findUser(email);
            if (existingUser) {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }

            try {
                const newUser = await createUser(email, password);
                return NextResponse.json({
                    user: { email: newUser.email, id: newUser.id },
                    portfolio: newUser.portfolio || []
                });
            } catch (e) {
                return NextResponse.json({ error: e.message }, { status: 400 });
            }
        }

        if (action === 'login') {
            const user = await findUser(email);
            if (!user || user.password !== password) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
            return NextResponse.json({
                user: { email: user.email, id: user.id },
                portfolio: user.portfolio || []
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Auth API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
