'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStockQuote, EXCHANGE_RATES } from './marketData';

const getCurrencyFromSymbol = (symbol) => {
    if (symbol.endsWith('.HK')) return 'HKD';
    if (symbol.endsWith('.SS') || symbol.endsWith('.SZ')) return 'CNY';
    return 'USD';
};

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
    // Initial state
    const [user, setUser] = useState(null); // null = Guest
    const [holdings, setHoldings] = useState([]);
    const [cash, setCash] = useState({ USD: 0, HKD: 0, CNY: 0 });
    const [totalNetWorth, setTotalNetWorth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from localStorage on mount (Guest Mode)
    useEffect(() => {
        // Check if user is logged in (persisted in localStorage for now)
        const savedUser = localStorage.getItem('portfolio_user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setUser(u);
            fetchPortfolio(u.email);
        } else {
            // Guest Mode: Load from local storage
            const savedHoldings = localStorage.getItem('portfolio_holdings');
            const savedCash = localStorage.getItem('portfolio_cash');

            if (savedHoldings) setHoldings(JSON.parse(savedHoldings));
            if (savedCash) setCash(JSON.parse(savedCash));

            // If empty, add some dummy data for first-time user experience
            if (!savedHoldings && !savedCash) {
                const dummyHoldings = [
                    { id: 1, symbol: 'AAPL', quantity: 10, costBasis: 150 },
                    { id: 2, symbol: '0700.HK', quantity: 100, costBasis: 300 },
                    { id: 3, symbol: '600519', quantity: 100, costBasis: 1600 }
                ];
                setHoldings(dummyHoldings);
                setCash({ USD: 1000, HKD: 5000, CNY: 10000 });
            }
            setIsLoading(false);
        }
    }, []);

    // Sync with Server or LocalStorage
    useEffect(() => {
        if (isLoading) return;

        if (user) {
            // Auth Mode: Sync to Server
            savePortfolioToServer();
        } else {
            // Guest Mode: Sync to LocalStorage
            localStorage.setItem('portfolio_holdings', JSON.stringify(holdings));
            localStorage.setItem('portfolio_cash', JSON.stringify(cash));
        }
    }, [holdings, cash, user, isLoading]);

    const fetchPortfolio = async (email) => {
        try {
            const res = await fetch('/api/portfolio', {
                headers: { 'x-user-email': email }
            });
            if (res.ok) {
                const data = await res.json();
                setHoldings(data.holdings || []);
                setCash(data.cash || { USD: 0, HKD: 0, CNY: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch portfolio', error);
        } finally {
            setIsLoading(false);
        }
    };

    const savePortfolioToServer = async () => {
        if (!user) return;
        try {
            await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email
                },
                body: JSON.stringify({ holdings, cash })
            });
        } catch (error) {
            console.error('Failed to save portfolio', error);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email, password })
            });

            if (!res.ok) throw new Error('Invalid credentials');

            const data = await res.json();

            // Sync logic: If guest has data, ask to merge? 
            // For simplicity: We overwrite server data with local data if server is empty,
            // or we just load server data. 
            // Better UX: Upload current local data to server immediately to "sync up".

            setUser(data.user);
            localStorage.setItem('portfolio_user', JSON.stringify(data.user));

            // Upload current guest data to new account
            await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': data.user.email
                },
                body: JSON.stringify({ holdings, cash })
            });

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const register = async (email, password) => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', email, password })
            });

            if (!res.ok) throw new Error('Registration failed');

            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('portfolio_user', JSON.stringify(data.user));

            // Upload current guest data to new account
            await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': data.user.email
                },
                body: JSON.stringify({ holdings, cash })
            });

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('portfolio_user');
        // Optional: Clear data or keep it?
        // Let's keep it in memory so they become "guest" again with the same data
        // or we could clear it. For safety, let's keep it.
    };

    // Refresh prices and calculate totals
    const [marketData, setMarketData] = useState({});

    const refreshPrices = async () => {
        const newMarketData = {};
        let totalValueCNY = 0;

        // 1. Calculate Cash Value
        totalValueCNY += cash.USD * EXCHANGE_RATES.USD;
        totalValueCNY += cash.HKD * EXCHANGE_RATES.HKD;
        totalValueCNY += cash.CNY * EXCHANGE_RATES.CNY;

        // 2. Fetch Stock Prices
        for (const holding of holdings) {
            try {
                const quote = await getStockQuote(holding.symbol);
                newMarketData[holding.symbol] = quote;

                const marketValue = parseFloat(quote.price) * holding.quantity;
                const marketValueCNY = marketValue * EXCHANGE_RATES[quote.currency];

                totalValueCNY += marketValueCNY;
            } catch (error) {
                console.error(`Failed to fetch quote for ${holding.symbol}`, error);
            }
        }

        setMarketData(newMarketData);
        setTotalNetWorth(totalValueCNY);
    };

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!isLoading) {
            refreshPrices();
            const interval = setInterval(refreshPrices, 10000);
            return () => clearInterval(interval);
        }
    }, [holdings, cash, isLoading]);

    const addHolding = (symbol, quantity, costBasis) => {
        const cleanSymbol = symbol.toUpperCase();
        const qty = parseFloat(quantity);
        const cost = parseFloat(costBasis);

        setHoldings(prevHoldings => {
            const existingIndex = prevHoldings.findIndex(h => h.symbol === cleanSymbol);

            if (existingIndex >= 0) {
                // Merge with existing holding
                const existing = prevHoldings[existingIndex];
                const totalQty = existing.quantity + qty;

                // Calculate weighted average cost
                // (OldQty * OldCost + NewQty * NewCost) / TotalQty
                const totalCost = (existing.quantity * existing.costBasis) + (qty * cost);
                const newAvgCost = totalCost / totalQty;

                const updatedHoldings = [...prevHoldings];
                updatedHoldings[existingIndex] = {
                    ...existing,
                    quantity: totalQty,
                    costBasis: newAvgCost
                };
                return updatedHoldings;
            } else {
                // Add new holding
                const newHolding = {
                    id: Date.now(),
                    symbol: cleanSymbol,
                    quantity: qty,
                    costBasis: cost
                };
                return [...prevHoldings, newHolding];
            }
        });
    };

    const removeHolding = (id) => {
        setHoldings(holdings.filter(h => h.id !== id));
    };

    const updateCash = (currency, amount) => {
        setCash(prev => ({ ...prev, [currency]: parseFloat(amount) }));
    };

    const adjustCash = (currency, amount) => {
        setCash(prev => ({
            ...prev,
            [currency]: prev[currency] + parseFloat(amount)
        }));
    };

    const buyStock = (symbol, quantity, price) => {
        const currency = getCurrencyFromSymbol(symbol);
        const totalCost = parseFloat(quantity) * parseFloat(price);

        // Deduct cash
        setCash(prev => ({
            ...prev,
            [currency]: prev[currency] - totalCost
        }));

        // Add holding
        addHolding(symbol, quantity, price);
    };

    const sellStock = (symbol, quantity, price) => {
        const cleanSymbol = symbol.toUpperCase();
        const qty = parseFloat(quantity);
        const p = parseFloat(price);
        const currency = getCurrencyFromSymbol(cleanSymbol);
        const totalProceeds = qty * p;

        // Add cash
        setCash(prev => ({
            ...prev,
            [currency]: prev[currency] + totalProceeds
        }));

        // Update holding
        setHoldings(prevHoldings => {
            const existingIndex = prevHoldings.findIndex(h => h.symbol === cleanSymbol);
            if (existingIndex === -1) return prevHoldings;

            const existing = prevHoldings[existingIndex];
            const newQty = existing.quantity - qty;

            if (newQty <= 0) {
                // Remove holding if quantity is 0 or less
                return prevHoldings.filter(h => h.symbol !== cleanSymbol);
            } else {
                // Update quantity
                const updatedHoldings = [...prevHoldings];
                updatedHoldings[existingIndex] = {
                    ...existing,
                    quantity: newQty
                };
                return updatedHoldings;
            }
        });
    };

    return (
        <PortfolioContext.Provider value={{
            user,
            login,
            register,
            logout,
            holdings,
            cash,
            marketData,
            totalNetWorth,
            isLoading,
            addHolding,
            removeHolding,
            updateCash,
            adjustCash,
            buyStock,
            sellStock,
            refreshPrices
        }}>
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    return useContext(PortfolioContext);
}
