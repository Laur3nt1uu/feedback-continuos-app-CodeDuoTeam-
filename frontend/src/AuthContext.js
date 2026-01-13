import React, { createContext, useState, useContext } from 'react';


const AuthContext = createContext();


export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        try {
            const userProfile = sessionStorage.getItem('userProfile');
            const token = sessionStorage.getItem('userToken');

            if (userProfile && token) {
                return { ...JSON.parse(userProfile), token };
            }
            return null; 
        } catch (error) {
            console.error("Eroare la parsarea sessionStorage:", error);
            return null;
        }
    });

    
    const login = (userData) => {
        setUser(userData);
        sessionStorage.setItem('userToken', userData.token);
        sessionStorage.setItem('userProfile', JSON.stringify({
            _id: userData._id,
            name: userData.name,
            role: userData.role
        }));
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
    };

    
    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userProfile');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
    };

    
    const contextValue = {
        user,
        isAuthenticated: !!user, 
        role: user ? user.role : null,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};