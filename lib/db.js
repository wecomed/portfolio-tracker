import fs from 'fs';
import path from 'path';
import { sql } from '@vercel/postgres';

const dataDirectory = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDirectory, 'db.json');

// Helper to ensure data directory exists (Local Mode)
function ensureDataDir() {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
    }
}

// Helper to read local DB
function readLocalDb() {
    ensureDataDir();
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileContents);
}

// Helper to write local DB
function writeLocalDb(data) {
    ensureDataDir();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Check if we are in "Cloud Mode" (Postgres)
const isCloud = !!process.env.POSTGRES_URL;

export async function findUser(email) {
    if (isCloud) {
        try {
            // Ensure table exists (lazy init for MVP)
            await sql`CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                portfolio JSONB
            );`;

            const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1;`;
            return rows[0] || null;
        } catch (error) {
            console.error('Postgres Error findUser:', error);
            return null;
        }
    } else {
        // Local Mode
        const db = readLocalDb();
        return db.users.find(u => u.email === email) || null;
    }
}

export async function createUser(email, password, portfolio = []) {
    if (isCloud) {
        try {
            const { rows } = await sql`
                INSERT INTO users (email, password, portfolio)
                VALUES (${email}, ${password}, ${JSON.stringify(portfolio)})
                RETURNING *;
            `;
            return rows[0];
        } catch (error) {
            console.error('Postgres Error createUser:', error);
            throw error;
        }
    } else {
        // Local Mode
        const db = readLocalDb();
        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            portfolio
        };
        db.users.push(newUser);
        writeLocalDb(db);
        return newUser;
    }
}

export async function getPortfolio(email) {
    const user = await findUser(email);
    return user ? (isCloud ? user.portfolio : user.portfolio) : [];
}

export async function savePortfolio(email, portfolio) {
    if (isCloud) {
        try {
            await sql`
                UPDATE users
                SET portfolio = ${JSON.stringify(portfolio)}
                WHERE email = ${email};
            `;
            return true;
        } catch (error) {
            console.error('Postgres Error savePortfolio:', error);
            return false;
        }
    } else {
        // Local Mode
        const db = readLocalDb();
        const userIndex = db.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            db.users[userIndex].portfolio = portfolio;
            writeLocalDb(db);
            return true;
        }
        return false;
    }
}
