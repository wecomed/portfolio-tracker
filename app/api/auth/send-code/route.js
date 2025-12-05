import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { saveOtp } from '../../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        const saved = await saveOtp(email, code);
        if (!saved) {
            return NextResponse.json({ error: 'Failed to save OTP' }, { status: 500 });
        }

        // Send Email
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Tracker <onboarding@resend.dev>',
            to: [email],
            subject: 'Your Verification Code',
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`
        });

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send Code Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
