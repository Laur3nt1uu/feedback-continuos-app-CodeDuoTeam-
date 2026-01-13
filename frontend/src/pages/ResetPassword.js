import React, { useEffect, useState } from 'react';
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
    const [tokenStatus, setTokenStatus] = useState('checking'); // checking | valid | invalid
    const [redirectCountdown, setRedirectCountdown] = useState(4);

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

    useEffect(() => {
        let isMounted = true;
        const validateToken = async () => {
            try {
                await api.get(`/users/reset-password/${token}`);
                if (isMounted) setTokenStatus('valid');
            } catch (err) {
                if (!isMounted) return;
                setTokenStatus('invalid');
                setError(err.response?.data?.message || 'Link-ul de resetare este invalid sau a expirat.');
            }
        };

        validateToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    useEffect(() => {
        if (!success) return;

        const interval = setInterval(() => {
            setRedirectCountdown((value) => {
                if (value <= 1) {
                    navigate('/');
                    return 0;
                }
                return value - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (tokenStatus !== 'valid') {
            setError('Link-ul de resetare nu este valid.');
            setLoading(false);
            return;
        }

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
            
            setMessage(response.data.message || 'Parola a fost resetată cu succes!');
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la resetarea parolei');
        } finally {
            setLoading(false);
        }
    };

    if (tokenStatus === 'checking') {
        return (
            <div className="auth-page">
                <motion.div 
                    className="auth-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={itemVariants}>
                        🔑 Verificăm link-ul...
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ textAlign: 'center' }}>
                        Te rugăm să aștepți câteva momente.
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (tokenStatus === 'invalid') {
        return (
            <div className="auth-page">
                <motion.div 
                    className="auth-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={itemVariants}>
                        ❌ Link invalid sau expirat
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        {error || 'Link-ul de resetare nu mai este valid.'}
                    </motion.p>
                    <motion.div variants={itemVariants}>
                        <Link to="/forgot-password" style={{ color: '#6366f1', fontWeight: '600' }}>
                            Trimite un nou link de resetare
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-page">
                <motion.div 
                    className="auth-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={itemVariants}>
                        🔐 Resetare Parolă
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        Parola a fost resetată cu succes!
                    </motion.p>

                    <motion.div 
                        className="alert alert-success"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring' }}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <p style={{ margin: '0.5rem 0', fontWeight: '500' }}>
                            ✅ {message || 'Parola a fost resetată cu succes!'}
                        </p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                            Poți folosi noua parolă pentru a te conecta.
                        </p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#065f46' }}>
                            Vei fi redirecționat la pagina principală în <strong>{redirectCountdown} secunde</strong>...
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            style={{ marginTop: '1rem', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            ✓ Mergi acum la pagina principală
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

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
                
                <motion.p variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    Introduceți noua parolă pentru a vă reseta accesul.
                </motion.p>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
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

                    <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
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
            </motion.div>
        </div>
    );
};

export default ResetPassword;