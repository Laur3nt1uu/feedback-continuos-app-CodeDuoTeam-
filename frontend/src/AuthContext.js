import React, { createContext, useState, useContext } from 'react';


const AuthContext = createContext();


export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        try {
            // Folosim sessionStorage ca să nu rămână logat în tab-uri noi
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
        // Salvăm în sessionStorage pentru sesiunea curentă/tab curent
        sessionStorage.setItem('userToken', userData.token);
        sessionStorage.setItem('userProfile', JSON.stringify({
            _id: userData._id,
            name: userData.name,
            role: userData.role
        }));
        // Curățăm eventuale valori vechi din localStorage (backward compat)
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