import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api'; 
const API_URL_USERS = `${API_BASE_URL}/users`;


const formVariants = {
    hidden: { opacity: 0, scale: 0.95 }, 
    visible: { 
        opacity: 1, 
        scale: 1, 
        transition: { 
            delayChildren: 0.2, 
            staggerChildren: 0.1 
        } 
    }
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 }, 
    visible: { y: 0, opacity: 1 }
};


const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Professor', 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    
    const { login } = useAuth() || {}; 

    const { name, email, password, role } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL_USERS}/register`, {
                name,
                email,
                password,
                role
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
            setError(err.response?.data?.message || 'Eroare la înregistrare. Încearcă din nou.');
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
            <h2>Înregistrare Cont</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <motion.form 
                onSubmit={onSubmit} 
                variants={formVariants} 
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
                
                <motion.input 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    type="text" 
                    placeholder="Nume" 
                    name="name" 
                    value={name} 
                    onChange={onChange} 
                    required 
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                />
                
               
                <motion.input 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    type="email" 
                    placeholder="Email" 
                    name="email" 
                    value={email} 
                    onChange={onChange} 
                    required 
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                />
                
                
                <motion.input 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    type="password" 
                    placeholder="Parolă (minim 6 caractere)" 
                    name="password" 
                    value={password} 
                    onChange={onChange} 
                    required 
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                />

                
                <motion.select
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 8px rgba(136, 132, 216, 0.4)' }}
                    name="role"
                    value={role}
                    onChange={onChange}
                    style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                >
                    <option value="Professor">Profesor</option>
                    <option value="Student">Student (Test)</option>
                </motion.select>
                
                
                <motion.button 
                    variants={itemVariants}
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
                    {loading ? 'Se înregistrează...' : 'Înregistrează-te'}
                </motion.button>
            </motion.form>
            <p style={{ marginTop: '20px' }}>Ai deja cont? <a href="/login" style={{ color: '#8884d8', textDecoration: 'none', fontWeight: 'bold' }}>Autentifică-te aici</a></p>
        </motion.div>
    );
};

export default Register;