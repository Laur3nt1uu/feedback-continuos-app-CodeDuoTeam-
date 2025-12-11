import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const API_URL_ACTIVITIES = '/activities';

const REACTION_COLORS = {
    'SMILEY': '#10b981', 
    'FROWNY': '#ef4444', 
    'SURPRISED': '#f59e0b', 
    'CONFUSED': '#6366f1'  
};

const REACTION_EMOJIS = {
    'SMILEY': '😊',
    'FROWNY': '😔',
    'SURPRISED': '😮',
    'CONFUSED': '🤔'
};

const ProfessorPage = () => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(30);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [feedbackData, setFeedbackData] = useState([]); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true); 

    const fetchFeedback = useCallback(async (activityId) => {
        try {
            const res = await api.get(`${API_URL_ACTIVITIES}/${activityId}/feedback`);
            setFeedbackData(res.data.details); 
        } catch (err) {
            console.error('Eroare la preluarea feedback-ului:', err);
        }
    }, []); 
    
    const checkActiveActivity = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`${API_URL_ACTIVITIES}/active`);
            setCurrentActivity(res.data); 
            fetchFeedback(res.data.id); 
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setCurrentActivity(null);
            } else {
                setError(err.response?.data?.message || 'Eroare la verificare activitate activă.');
                console.error("Eroare la check active:", err);
            }
        } finally {
            setLoading(false);
            setInitialLoad(false); 
        }
    }, [fetchFeedback]); 
    
    useEffect(() => {
        if (initialLoad) {
            checkActiveActivity();
        }
        
        let interval;
        if (currentActivity) {
            interval = setInterval(() => {
                fetchFeedback(currentActivity.id);
            }, 5000); 
        }
        
        return () => clearInterval(interval); 
    }, [currentActivity, initialLoad, fetchFeedback, checkActiveActivity]); 

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post(API_URL_ACTIVITIES, { name, description: name, durationMinutes: duration });
            setCurrentActivity(res.data);
            fetchFeedback(res.data.id); 
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la creare activitate. Asigură-te că ești logat ca profesor.');
        } finally {
            setLoading(false);
        }
    };
    
    const feedbackCounts = feedbackData.reduce((acc, item) => {
        acc[item.reactionType] = (acc[item.reactionType] || 0) + 1;
        return acc;
    }, {});
    
    const chartData = Object.keys(feedbackCounts).map(key => ({
        name: key,
        count: feedbackCounts[key],
        fill: REACTION_COLORS[key]
    }));

    const pieData = Object.keys(feedbackCounts).map(key => ({
        name: `${REACTION_EMOJIS[key]} ${key}`,
        value: feedbackCounts[key],
        fill: REACTION_COLORS[key]
    }));

    if (initialLoad) {
        return (
            <div className="professor-page flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        style={{ fontSize: '3rem', marginBottom: '20px' }}
                    >
                        ⏳
                    </motion.div>
                    <p className="text-lg">Se verifică activitățile active...</p>
                </div>
            </div>
        );
    }

    if (!currentActivity) {
        return (
            <div className="professor-page">
                <motion.div 
                    className="activity-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <h1 className="text-3xl mb-3">Creează o Nouă Activitate</h1>
                    <p className="text-secondary mb-4">Configurează parametrii cursuluи sau activității tale</p>
                    
                    <form onSubmit={handleCreateActivity} className="activity-form">
                        <div className="form-control">
                            <label htmlFor="name">Nume Curs/Activitate</label>
                            <motion.input 
                                id="name"
                                type="text"
                                placeholder="Ex: Curs de Matematică - Lecția 5"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                whileFocus={{ scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="duration">Durată (minute)</label>
                            <motion.input 
                                id="duration"
                                type="number"
                                placeholder="Durată în minute"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                                min="5"
                                max="180"
                                whileFocus={{ scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            />
                        </div>

                        <motion.button 
                            type="submit"
                            disabled={loading}
                            className="btn-start btn-lg"
                            style={{ width: '100%' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? '⏳ Se generează...' : '🚀 Start Activitate (Generează Cod)'}
                        </motion.button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                className="alert alert-danger mt-3"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="professor-page">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="professor-header mb-4">
                    <h1>📊 Tablou de Bord - Feedback Continuu</h1>
                    <p>Monitorează feedback-ul elevilor în timp real</p>
                </div>

                {/* Activity Status Card */}
                <motion.div 
                    className="activity-status"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex-between mb-2">
                        <div>
                            <h3>🎯 Activitate Activă</h3>
                            <p><strong>{currentActivity.name}</strong></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-secondary">Cod de Acces</p>
                            <motion.div 
                                style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: 'bold', 
                                    color: '#667eea',
                                    fontFamily: 'monospace'
                                }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {currentActivity.uniqueCode}
                            </motion.div>
                        </div>
                    </div>
                    <p className="text-sm text-secondary">
                        ⏱️ Se încheie la: <strong>{new Date(new Date(currentActivity.startTime).getTime() + currentActivity.durationMinutes * 60000).toLocaleTimeString()}</strong>
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4" style={{ marginBottom: '30px' }}>
                    <motion.div 
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-center">
                            <p className="text-secondary mb-2">Total Feedback</p>
                            <motion.h2 
                                className="text-3xl"
                                key={feedbackData.length}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {feedbackData.length}
                            </motion.h2>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-center">
                            <p className="text-secondary mb-2">Tipuri de Reacții</p>
                            <h2 className="text-3xl">{Object.keys(feedbackCounts).length}</h2>
                        </div>
                    </motion.div>
                </div>

                {/* Charts */}
                {chartData.length > 0 ? (
                    <>
                        <div className="feedback-chart">
                            <h2>📈 Distribuția Feedback-ului</h2>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{ width: '100%', height: 350 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        <div className="feedback-chart mt-4">
                            <h2>🥧 Proporția Reacțiilor</h2>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ width: '100%', height: 350 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </>
                ) : (
                    <motion.div 
                        className="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-center text-secondary py-4">
                            ⏳ Așteptăm primele reacții. Asigură-te că elevii au codul corect!
                        </p>
                    </motion.div>
                )}

                <p className="text-center text-secondary mt-4 text-sm">
                    ♻️ Graficele se actualizează automat la fiecare 5 secunde
                </p>
            </motion.div>
        </div>
    );
};

export default ProfessorPage;