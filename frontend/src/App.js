import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfessorPage from './pages/ProfessorPage';
import StudentPage from './pages/StudentPage';
import Register from './pages/Register';
import Login from './pages/Login';    
import PrivateRoute from './PrivateRoute'; 
import { useAuth } from './AuthContext'; 

import './App.css'; 


const AppHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    return (
        <header style={{ 
            padding: '15px 30px', 
            backgroundColor: '#8884d8', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
            <Link to={isAuthenticated && user.role === 'Professor' ? '/professor' : '/'} 
                  style={{ color: 'white', textDecoration: 'none' }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>Feedback Live 🎓</h1>
            </Link>

            {isAuthenticated ? (
              
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span>Salut, *{user.name}* ({user.role})</span>
                    <button 
                        onClick={handleLogout} 
                        style={{ 
                            padding: '8px 15px', 
                            backgroundColor: '#ff5c5c', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                
                <div>
                    <Link to="/login" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Login</Link>
                    <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
                </div>
            )}
        </header>
    );
};


function App() {
  return (
    <Router>
      <div className="App">
        <AppHeader /> 
        
        <main style={{ padding: '20px' }}>
          <Routes>
            
            <Route path="/" element={<HomePage />} />
            
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            
            <Route path="/student/:uniqueCode" element={<StudentPage />} />
            
            
            <Route element={<PrivateRoute requiredRole="Professor" />}>
                
                <Route path="/professor" element={<ProfessorPage />} />
            </Route>

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;