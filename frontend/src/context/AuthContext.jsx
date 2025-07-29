import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('userToken');
        
        if (adminToken) {
            setIsAuthenticated(true);
            setUserRole('admin');
        } else if (userToken) {
            setIsAuthenticated(true);
            setUserRole('user');
        }
        
        setIsLoading(false);
    }, []);

    const login = (token, role) => {
        if (role === 'admin') {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.setItem('userToken', token);
        }
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    const value = {
        isAuthenticated,
        userRole,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 