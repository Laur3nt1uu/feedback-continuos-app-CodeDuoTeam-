import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { useAuth } from '../AuthContext'; 


const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api'; 
const API_URL_USERS = `${API_BASE_URL}/users`;


const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
            } else {
                console.error("Funcția login din useAuth nu este disponibilă.");
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
        <motion.div 
            className="auth-container" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '50px' }}
        >
            <h2>Autentificare</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <motion.form 
                onSubmit={onSubmit} 
                initial="hidden"
                animate="visible"
                style={{ 
                    maxWidth: '400px', 
                    margin: '0 auto', 
                    padding: '20px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                }}
            >
                {/* 1. Input Email */}
                <motion.input 
                    variants={itemVariants}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    type="email" 
                    placeholder="Email" 
                    name="email" 
                    value={email} 
                    onChange={onChange} 
                    required 
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                />
                
                {/* 2. Input Parolă */}
                <motion.input 
                    variants={itemVariants}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    type="password" 
                    placeholder="Parolă" 
                    name="password" 
                    value={password} 
                    onChange={onChange} 
                    required 
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                />
                
                {/* 3. Buton Login */}
                <motion.button 
                    variants={itemVariants}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05, backgroundColor: '#6a66b2' }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    disabled={loading} 
                    style={{ 
                        padding: '12px 25px', 
                        marginTop: '25px', 
                        backgroundColor: loading ? '#b3b3b3' : '#8884d8', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50px', 
                        cursor: loading ? 'wait' : 'pointer', 
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s',
                    }}
                >
                    {loading ? 'Se autentifică...' : 'Login'}
                </motion.button>
            </motion.form>
            <p style={{ marginTop: '20px' }}>Nu ai cont? <a href="/register" style={{ color: '#8884d8', textDecoration: 'none', fontWeight: 'bold' }}>Înregistrează-te aici</a></p>
        </motion.div>
    );
};

export default Login;