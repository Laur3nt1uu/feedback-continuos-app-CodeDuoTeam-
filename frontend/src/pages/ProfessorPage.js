import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; 
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [stoppingActivity, setStoppingActivity] = useState(false);
    const [activityHistory, setActivityHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [allActivities, setAllActivities] = useState([]);
    const [showActivitiesList, setShowActivitiesList] = useState(false); 

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
            const res = await api.get(`${API_URL_ACTIVITIES}/active`);
            setCurrentActivity(res.data); 
            fetchFeedback(res.data.id); 
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setCurrentActivity(null);
            } else {
                console.error("Eroare la check active:", err);
            }
        }
    }, [fetchFeedback]); 
    
    const fetchActivityHistory = useCallback(async () => {
        try {
            const res = await api.get(`${API_URL_ACTIVITIES}/history`);
            setActivityHistory(res.data);
            setAllActivities(res.data);
        } catch (err) {
            console.error('Eroare la preluare istoric:', err);
        }
    }, []);
    
    // Check for active activity AND load all activities history on mount
    useEffect(() => {
        const initLoad = async () => {
            await checkActiveActivity();
            await fetchActivityHistory();
        };
        initLoad();
    }, [checkActiveActivity, fetchActivityHistory]);
    
    // Poll for feedback updates when there's an active activity
    useEffect(() => {
        if (!currentActivity) return;
        
        const interval = setInterval(() => {
            fetchFeedback(currentActivity.id);
        }, 5000); 
        
        return () => clearInterval(interval); 
    }, [currentActivity, fetchFeedback]);
    
    // Poll to check if current activity has expired or if new activities available
    useEffect(() => {
        const interval = setInterval(async () => {
            await checkActiveActivity();
            await fetchActivityHistory();
        }, 10000); // Check every 10 seconds
        
        return () => clearInterval(interval);
    }, [checkActiveActivity, fetchActivityHistory]);

    const loadActivity = async (activityId) => {
        try {
            const res = await api.get(`${API_URL_ACTIVITIES}/${activityId}`);
            setCurrentActivity(res.data);
            fetchFeedback(activityId);
            setShowActivitiesList(false);
        } catch (err) {
            console.error('Eroare la încărcare activitate:', err);
            setToast({ message: 'Eroare la încărcare activitate', type: 'error' });
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post(API_URL_ACTIVITIES, { name, description: name, durationMinutes: duration });
            setCurrentActivity(res.data);
            fetchFeedback(res.data.id);
            setToast({ message: `🚀 Activitate "${name}" creată cu succes!`, type: 'success' });
            setName('');
            setDuration(30);
            setShowCreateForm(false);
            // Refresh history after creating new activity
            await fetchActivityHistory();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Eroare la creare activitate. Asigură-te că ești logat ca profesor.';
            setError(errorMsg);
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleStopActivity = async () => {
        if (!currentActivity || !window.confirm('Sigur vrei să oprești activitatea?')) return;
        
        setStoppingActivity(true);
        try {
            await api.post(`${API_URL_ACTIVITIES}/${currentActivity.id}/end`);
            setCurrentActivity(null);
            setFeedbackData([]);
            
            // Refresh activities immediately to reflect the endTime change
            await new Promise(r => setTimeout(r, 300)); // Small delay to ensure DB write
            await fetchActivityHistory();
            
            // Close all modals to show empty state with new button states
            setShowActivitiesList(false);
            setShowHistory(false);
            setToast({ message: '⏹️ Activitate oprită cu succes!', type: 'success' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Eroare la oprire activitate.';
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setStoppingActivity(false);
        }
    };

    // Helpers pentru filtrare liste - logic corect și real
    const isActivityActive = useCallback((a) => {
        // Active = nu a fost oprită manual ȘI nu a expirat încă
        if (a.endTime) return false; // Dacă e oprită manual, nu-i activă
        const endTimeMs = new Date(a.startTime).getTime() + a.durationMinutes * 60000;
        return endTimeMs > Date.now();
    }, []);
    
    const isActivityPast = useCallback((a) => {
        // Past = a fost oprită manual SAU a expirat
        if (a.endTime) return true; // Oprită manual
        const endTimeMs = new Date(a.startTime).getTime() + a.durationMinutes * 60000;
        return endTimeMs <= Date.now(); // Expirat
    }, []);
    
    const activeActivities = allActivities.filter(isActivityActive);
    const pastActivities = allActivities.filter(isActivityPast);

    const downloadReport = async (activityId, format = 'csv') => {
        try {
            const res = await api.get(`${API_URL_ACTIVITIES}/${activityId}/export?format=${format}`, {
                responseType: format === 'csv' ? 'blob' : 'json'
            });
            
            if (format === 'csv') {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `raport_activitate_${activityId}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setToast({ message: '📥 Raport descărcat cu succes!', type: 'success' });
            }
        } catch (err) {
            setToast({ message: 'Eroare la download raport', type: 'error' });
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

    // Stare: istoric activități
        // Stare: listă activități (doar active)
        if (showActivitiesList && !currentActivity) {
            return (
                <div className="professor-page">
                    <Toast 
                        message={toast.message} 
                        type={toast.type}
                        onClose={() => setToast({ message: '', type: '' })}
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}
                    >
                        <div className="flex-between mb-4">
                            <h1 className="text-3xl">📚 Activități Active</h1>
                            <motion.button
                                onClick={() => setShowActivitiesList(false)}
                                className="btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ← Înapoi
                            </motion.button>
                        </div>

                        {activeActivities.length === 0 ? (
                            <motion.div 
                                className="text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-secondary text-lg">Nu ai nicio activitate activă.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {activeActivities.map((activity, idx) => {
                                    const isActive = true;
                                    return (
                                        <motion.div 
                                            key={activity.id}
                                            className="card"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{ 
                                                padding: '16px', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                borderLeft: isActive ? '4px solid #10b981' : '4px solid #6b7280',
                                                cursor: 'pointer'
                                            }}
                                            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            onClick={() => loadActivity(activity.id)}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <h3 className="text-lg font-semibold">{activity.name}</h3>
                                                    {isActive && (
                                                        <span style={{ 
                                                            fontSize: '0.75rem', 
                                                            backgroundColor: '#10b981', 
                                                            color: 'white', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '12px' 
                                                        }}>
                                                            ● ACTIVĂ
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-secondary">
                                                    🕐 {new Date(activity.startTime).toLocaleString()} 
                                                    {activity.endTime && ` - ${new Date(activity.endTime).toLocaleString()}`}
                                                </p>
                                                <p className="text-xs text-secondary">
                                                    Cod: <strong>{activity.uniqueCode}</strong> | 
                                                    Durată: {activity.durationMinutes} min
                                                </p>
                                            </div>
                                            <div style={{ fontSize: '2rem' }}>→</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }

        // Stare: istoric activități
    if (showHistory && !currentActivity) {
        return (
            <div className="professor-page">
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: '' })}
                />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}
                >
                    <div className="flex-between mb-4">
                        <h1 className="text-3xl">📜 Activități Completate</h1>
                        <motion.button
                            onClick={() => setShowHistory(false)}
                            className="btn-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ← Înapoi
                        </motion.button>
                    </div>

                    {pastActivities.length === 0 ? (
                        <motion.div 
                            className="text-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-secondary text-lg">Nu ai nicio activitate finalizată.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {pastActivities.map((activity, idx) => (
                                <motion.div 
                                    key={activity.id}
                                    className="card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">{activity.name}</h3>
                                        <p className="text-sm text-secondary">
                                            🕐 {new Date(activity.startTime).toLocaleString()} 
                                            {activity.endTime && ` - ${new Date(activity.endTime).toLocaleString()}`}
                                        </p>
                                        <p className="text-xs text-secondary">Cod: <strong>{activity.uniqueCode}</strong></p>
                                    </div>
                                    <motion.button
                                        onClick={() => downloadReport(activity.id, 'csv')}
                                        className="btn-primary"
                                        style={{ padding: '8px 16px' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        📥 Descarcă Raport
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // Stare: fără activitate și formular de criere închis - Empty State
    if (!currentActivity && !showCreateForm) {
        return (
            <div className="professor-page flex-center" style={{ minHeight: '70vh' }}>
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: '' })}
                />
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{ maxWidth: '500px', padding: '40px' }}
                >
                    <motion.div 
                        style={{ fontSize: '5rem', marginBottom: '20px' }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                        📋
                    </motion.div>
                    <h2 className="text-2xl mb-3">Nu există nicio activitate activă</h2>
                    <p className="text-secondary mb-4">
                        Creează o activitate nouă pentru a începe să primești feedback de la studenți
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-start btn-lg"
                            style={{ fontSize: '1.1rem', padding: '15px 40px' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ➕ Adaugă Activitate
                        </motion.button>
                        {activeActivities.length > 0 && (
                            <motion.button
                                onClick={() => setShowActivitiesList(true)}
                                className="btn-primary btn-lg"
                                style={{ fontSize: '1.1rem', padding: '15px 40px' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📚 Vezi Activități
                            </motion.button>
                        )}
                        {pastActivities.length > 0 && (
                            <motion.button
                                onClick={() => setShowHistory(true)}
                                className="btn-secondary btn-lg"
                                style={{ fontSize: '1.1rem', padding: '15px 40px' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📜 Vezi Istoric
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Stare: formular de creare deschis
    if (!currentActivity && showCreateForm) {
        return (
            <div className="professor-page">
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: '' })}
                />
                <motion.div 
                    className="activity-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <div className="flex-between mb-4">
                        <h1 className="text-3xl">Creează o Nouă Activitate</h1>
                        <motion.button
                            onClick={() => setShowCreateForm(false)}
                            className="btn-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ← Înapoi
                        </motion.button>
                    </div>
                    <p className="text-secondary mb-4">Configurează parametrii cursului sau activității tale</p>
                    
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

    // Stare: are activitate activă - Dashboard cu grafice și feedback
    return (
        <div className="professor-page">
            <Toast 
                message={toast.message} 
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
            />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                    <div className="professor-header mb-4">
                        <div className="flex-between">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <motion.button
                                                                onClick={() => {
                                                                    setCurrentActivity(null);
                                                                    setFeedbackData([]);
                                                                    setShowActivitiesList(false);
                                                                }}
                                                                className="btn-secondary"
                                                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                ← Înapoi
                                                            </motion.button>
                                                            <div>
                            <div>
                                <h1>📊 Tablou de Bord - Feedback Continuu</h1>
                                <p>Monitorează feedback-ul elevilor în timp real</p>
                                                            </div>
                                                        </div>
                            </div>
                            <motion.button
                                onClick={handleStopActivity}
                                disabled={stoppingActivity}
                                className="btn-danger"
                                style={{ padding: '10px 20px', backgroundColor: '#ef4444' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {stoppingActivity ? '⏳ Se oprește...' : '⏹️ Oprește Activitate'}
                            </motion.button>
                        </div>
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