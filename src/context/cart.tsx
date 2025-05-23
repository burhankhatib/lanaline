'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ALL_PRODUCTS_QUERYResult } from '../../sanity.types';

// Type declarations
interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

interface CartItem {
    product: ALL_PRODUCTS_QUERYResult[0];
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: ALL_PRODUCTS_QUERYResult[0]) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'lanaline-cart';

// Helper function to safely access localStorage
const getLocalStorage = (): Storage | null => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        const global = globalThis as unknown as { localStorage: Storage };
        return global.localStorage;
    }
    return null;
};

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const storage = getLocalStorage();
        if (!storage) return;

        const savedCart = storage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                storage.removeItem(CART_STORAGE_KEY);
            }
        }
    }, []);

    useEffect(() => {
        const storage = getLocalStorage();
        if (!storage) return;

        storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (product: ALL_PRODUCTS_QUERYResult[0]) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.product._id === product._id);

            if (existingItem) {
                return currentItems.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems =>
            currentItems.filter(item => item.product._id !== productId)
        );
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.product._id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        const storage = getLocalStorage();
        if (storage) {
            storage.removeItem(CART_STORAGE_KEY);
        }
    };

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 