import React, { createContext, useState, useEffect, useContext } from 'react';


const AuthContext = createContext();


export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        try {
            const userProfile = localStorage.getItem('userProfile');
            const token = localStorage.getItem('userToken');
            
           
            if (userProfile && token) {
                return { ...JSON.parse(userProfile), token };
            }
            return null; 
        } catch (error) {
            console.error("Eroare la parsarea localStorage:", error);
            return null;
        }
    });

    
    const login = (userData) => {
        
        setUser(userData);
        localStorage.setItem('userToken', userData.token);
        
        localStorage.setItem('userProfile', JSON.stringify({
            _id: userData._id,
            name: userData.name,
            role: userData.role
        }));
    };

    
    const logout = () => {
        setUser(null);
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