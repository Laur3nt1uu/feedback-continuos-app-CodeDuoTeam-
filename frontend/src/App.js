import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfessorPage from './pages/ProfessorPage';
import StudentPage from './pages/StudentPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';    
import PrivateRoute from './PrivateRoute'; 
import { useAuth } from './AuthContext';

import './App.css'; 

const RootLandingPage = () => {
    const { isAuthenticated, user } = useAuth();
    
    if (isAuthenticated && user.role === 'Professor') {
        return <Navigate to="/professor" replace />;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };
    
    return (
        <div className="landing-page">
            <motion.div 
                className="landing-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 variants={itemVariants}>
                    📚 Feedback Continuu
                </motion.h1>
                <motion.p variants={itemVariants}>
                    Sistem inteligent de feedback în timp real pentru studenți
                </motion.p>
                
                <motion.div className="landing-buttons" variants={itemVariants}>
                    <Link to={isAuthenticated ? '/professor' : '/login'}> 
                        <motion.button 
                            className="btn-professor"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            👨‍🏫 Sunt Profesor
                        </motion.button>
                    </Link>
                    <Link to="/student">
                        <motion.button 
                            className="btn-student"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🎓 Sunt Student
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

const AppHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                <Link to={isAuthenticated && user?.role === 'Professor' ? '/professor' : '/'} 
                      className="navbar-brand">
                    📊 FeedbackLive
                </Link>

                {isAuthenticated ? (
                    <div className="flex gap-2">
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            👋 {user?.name} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({user?.role})</span>
                        </span>
                        <motion.button 
                            onClick={handleLogout}
                            className="btn-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            🚪 Logout
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login">
                            <motion.button 
                                className="btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            >
                                Login
                            </motion.button>
                        </Link>
                        <Link to="/register">
                            <motion.button 
                                className="btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            >
                                Register
                            </motion.button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

function App() {
    return (
        <Router>
            <div className="App">
                <AppHeader /> 
                
                <main>
                    <Routes>
                        <Route path="/" element={<RootLandingPage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
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
