import React from 'react';
// 🛑 AM ELIMINAT: import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ProfessorPage from './pages/ProfessorPage';
import StudentPage from './pages/StudentPage';
import Register from './pages/Register';
import Login from './pages/Login';    
import PrivateRoute from './PrivateRoute'; 
import { useAuth } from './AuthContext'; // Ai nevoie de useAuth pentru logica de redirecționare

import './App.css'; 


// --------------------------------------------------------------------------------------------------
// 🛑 NOU: Componenta care înlocuiește HomePage.js
// Aceasta afișează butoanele sau redirecționează dacă e logat.
const RootLandingPage = () => {
    const { isAuthenticated, user } = useAuth();
    
    // Dacă este logat ca Profesor, mergi automat la dashboard
    if (isAuthenticated && user.role === 'Professor') {
        return <Navigate to="/professor" replace />;
    }

    // Dacă este logat, dar nu e Profesor (ex: Student), îl putem lăsa să aleagă sau îl putem redirecționa
    // Aici păstrăm funcționalitatea originală a HomePage pentru utilizatorii neautentificați sau studenți.
    
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Sistem de Feedback Continuu</h1>
            <p>Alege rolul pentru a începe:</p>
            
            <div style={{ margin: '30px' }}>
                {/* Dacă nu e logat, îl trimitem la /login pentru Profesor */}
                <Link to={isAuthenticated ? '/professor' : '/login'}> 
                    <button style={{ padding: '15px 30px', margin: '10px', fontSize: '1.2em', backgroundColor: '#8884d8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        👨‍🏫 Sunt Profesor
                    </button>
                </Link>
                {/* Studentul nu necesită logare, deci merge direct la /student */}
                <Link to="/student">
                    <button style={{ padding: '15px 30px', margin: '10px', fontSize: '1.2em', backgroundColor: '#82ca9d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        🎓 Sunt Student
                    </button>
                </Link>
            </div>
        </div>
    );
};
// --------------------------------------------------------------------------------------------------


const AppHeader = () => {
    // ... (AppHeader-ul tău rămâne neschimbat)
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
            <Link to={isAuthenticated && user?.role === 'Professor' ? '/professor' : '/'} 
                  style={{ color: 'white', textDecoration: 'none' }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>Feedback Live 🎓</h1>
            </Link>

            {isAuthenticated ? (
              
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span>Salut, *{user?.name}* ({user?.role})</span>
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
            
            {/* 🛑 SCHIMBARE: Acum '/' încarcă componenta RootLandingPage */}
            <Route path="/" element={<RootLandingPage />} />
            
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            
            <Route path="/student" element={<StudentPage />} /> 
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