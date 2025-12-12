import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
    id: string;
    username: string;
    role: string;
    name: string;
    permissions: Record<string, string[] | boolean>;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user data");
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        toast.info("Logged out successfully");
        window.location.href = "/login";
    };

    const hasPermission = (module: string, action: string) => {
        if (!user) return false;
        if ((user.permissions as any).all) return true; // Super Admin

        const modulePerms = (user.permissions as any)[module];
        if (!modulePerms) return false;

        return Array.isArray(modulePerms) && modulePerms.includes(action);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
