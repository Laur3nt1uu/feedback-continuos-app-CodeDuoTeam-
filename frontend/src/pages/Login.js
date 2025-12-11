import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api'; 
const API_URL_USERS = `${API_BASE_URL}/users`;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
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

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL_USERS}/login`, {
                email,
                password,
            });

            if (login) {
                login(res.data);
            }

            if (res.data.role === 'Professor') {
                navigate('/professor');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Credențiale invalide. Verifică email-ul și parola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                className="auth-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                <div className="text-center mb-3">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        👨‍🏫 Autentificare
                    </motion.h1>
                    <p className="auth-subtitle">Intră în contul tău de profesor</p>
                </div>

                {error && (
                    <motion.div 
                        className="alert alert-danger"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring' }}
                    >
                        {error}
                    </motion.div>
                )}

                <motion.form 
                    onSubmit={onSubmit}
                    className="auth-form"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="form-group" variants={itemVariants}>
                        <label htmlFor="email">Email Address</label>
                        <motion.input 
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Enter your email"
                            required
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        />
                    </motion.div>

                    <motion.div className="form-group" variants={itemVariants}>
                        <label htmlFor="password">Parolă</label>
                        <motion.input 
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Enter your password"
                            required
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        />
                    </motion.div>

                    <motion.button 
                        type="submit"
                        disabled={loading}
                        className="auth-button"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? (
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                ⏳ Se autentifică...
                            </motion.span>
                        ) : (
                            '🔐 Login'
                        )}
                    </motion.button>
                </motion.form>

                <motion.div 
                    className="auth-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>Nu ai cont? <Link to="/register">Înregistrează-te aici</Link></p>
                    <p><Link to="/forgot-password">Ai uitat parola?</Link></p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;