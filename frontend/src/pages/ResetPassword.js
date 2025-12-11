import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import '../App.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (password !== passwordConfirm) {
            setError('Parolele nu se potrivesc');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Parola trebuie să aibă cel puțin 6 caractere');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(`/users/reset-password/${token}`, {
                password,
                passwordConfirm
            });
            
            setMessage(response.data.message);
            setSuccess(true);
            
            // Redirecționează la login după 3 secunde
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la resetarea parolei');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                className="auth-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 variants={itemVariants}>
                    🔑 Resetare Parolă
                </motion.h1>
                
                {!success ? (
                    <>
                        <motion.p variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            Introduceți noua parolă pentru a vă reseta accesul.
                        </motion.p>

                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <motion.div variants={itemVariants}>
                                <label>Parolă Nouă:</label>
                                <motion.input
                                    type="password"
                                    placeholder="Min. 6 caractere"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    whileFocus={{ scale: 1.02 }}
                                    disabled={loading}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label>Confirmă Parolă:</label>
                                <motion.input
                                    type="password"
                                    placeholder="Repetă parola"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                    whileFocus={{ scale: 1.02 }}
                                    disabled={loading}
                                />
                            </motion.div>

                            {error && (
                                <motion.div 
                                    variants={itemVariants}
                                    style={{ 
                                        color: 'var(--danger)', 
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    ❌ {error}
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                className="btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                                variants={itemVariants}
                                style={{ marginTop: '1.5rem', width: '100%' }}
                            >
                                {loading ? '⏳ Se resetează...' : '🔄 Resetează Parolă'}
                            </motion.button>
                        </form>

                        <motion.div 
                            variants={itemVariants}
                            style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                        >
                            Parola trebuie să aibă cel puțin 6 caractere și parolele trebuie să se potrivească.
                        </motion.div>
                    </>
                ) : (
                    <motion.div 
                        variants={itemVariants}
                        style={{ textAlign: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            ✅
                        </motion.div>
                        
                        <h2 style={{ color: 'var(--success)' }}>Succes!</h2>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            {message}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
                            Vă veți conecta în 3 secunde...
                        </p>

                        <motion.div 
                            style={{ marginTop: '2rem' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                Conectare Acum
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
