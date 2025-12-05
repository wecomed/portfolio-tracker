import './globals.css'

export const metadata = {
    title: 'Portfolio Tracker',
    description: 'Track your global assets in real-time',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
