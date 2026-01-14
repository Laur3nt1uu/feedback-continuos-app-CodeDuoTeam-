//  Formular simplu ca să primești link de resetare a parolei.
// Trimiți email și backend se ocupă de rest
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import '../App.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [successEmail, setSuccessEmail] = useState('');

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

        try {
            const response = await api.post('/users/forgot-password', { email });
            setMessage(response.data.message || 'Link generat cu succes');
            setSuccessEmail(email);
            // Nu mai deschidem automat linkul; utilizatorul îl deschide din email.
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la generarea link-ului');
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
                    🔐 Ai uitat parola?
                </motion.h1>
                
                <motion.p variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    Introdu adresa de email a contului tău și îți vom trimite un link pentru resetarea parolei.
                </motion.p>

                {successEmail && (
                    <motion.div 
                        className="alert alert-success"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring' }}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <p style={{ margin: '0.5rem 0', fontWeight: '500' }}>
                            ✅ {message}
                        </p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                            Am trimis un email de resetare la: <strong>{successEmail}</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#065f46' }}>
                            Verifică inbox-ul (și folderul Spam dacă nu găsești emailul).
                        </p>
                        <button
                            onClick={() => setSuccessEmail('')}
                            style={{ marginTop: '1rem', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            ✓ Am înțeles
                        </button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <motion.div variants={itemVariants}>
                        <label>Email:</label>
                        <motion.input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            whileFocus={{ scale: 1.02 }}
                            disabled={loading}
                        />
                    </motion.div>

                    {error && (
                        <motion.div 
                            variants={itemVariants}
                            style={{ 
                                color: '#dc2626', 
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
                        {loading ? '⏳ Se trimite...' : '📧 Trimite link de resetare'}
                    </motion.button>
                </form>

                <motion.div 
                    variants={itemVariants}
                    style={{ marginTop: '1rem', textAlign: 'center' }}
                >
                    <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>
                        ← Înapoi la Login
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
