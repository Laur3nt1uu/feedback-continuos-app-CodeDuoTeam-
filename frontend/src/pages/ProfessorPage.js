import React, { useState, useEffect, useCallback } from 'react';
// 🛑 SCHIMBARE: Importăm clientul Axios securizat în loc de axios simplu
import api from '../api'; 
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';


// Nu mai avem nevoie de API_BASE_URL pentru că 'api' îl gestionează
const API_URL_ACTIVITIES = '/activities';


const REACTION_COLORS = {
    'SMILEY': '#82ca9d', 
    'FROWNY': '#fa5c5c', 
    'SURPRISED': '#ffc658', 
    'CONFUSED': '#8884d8'  
};

const ProfessorPage = () => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(30);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [feedbackData, setFeedbackData] = useState([]); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true); 

    // Am mutat fetchFeedback și checkActiveActivity în useCallback pentru useEffect
    // și pentru a le face disponibile la apel
    const fetchFeedback = useCallback(async (activityId) => {
        try {
            // 🛑 SCHIMBARE: Folosim 'api' (trimite token)
            const res = await api.get(`${API_URL_ACTIVITIES}/${activityId}/feedback`);
            setFeedbackData(res.data.details); 
        } catch (err) {
            console.error('Eroare la preluarea feedback-ului (Posibil token invalid):', err);
            // Putem adăuga aici o logică pentru a forța logout dacă tokenul e invalid 
            // (deși interceptorul api.js ar trebui să se ocupe de 401/403)
        }
    }, []); 
    
    
    const checkActiveActivity = useCallback(async () => {
        try {
            setLoading(true);
            
            // 🛑 SCHIMBARE: Folosim 'api' (rutele active nu sunt protejate, dar folosim clientul consistent)
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
            // Polling la fiecare 5 secunde
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
            // 🛑 SCHIMBARE CRUCIALĂ: Folosim 'api' (aici este esențial să trimitem tokenul!)
            const res = await api.post(API_URL_ACTIVITIES, { name, description: name, durationMinutes: duration });
            setCurrentActivity(res.data);
            setLoading(false);
            
            fetchFeedback(res.data.id); 
        } catch (err) {
            // Eroare 403/401 de la backend dacă tokenul a lipsit sau a fost invalid
            setError(err.response?.data?.message || 'Eroare la creare activitate. Asigură-te că ești logat ca profesor.');
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

    
    if (initialLoad) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Se verifică activitățile active...</div>;
    }

    if (!currentActivity) {
        return (
            <form onSubmit={handleCreateActivity} style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                <h2>Definire Activitate</h2>
                <input 
                    type="text" 
                    placeholder="Nume Curs/Activitate" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
                /><br/>
                <input 
                    type="number" 
                    placeholder="Durată (min)" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    required 
                    min="5"
                    max="180"
                    style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
                /><br/>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: '#8884d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                >
                    {loading ? 'Se încarcă...' : 'Start Activitate (Generează Cod)'}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        );
    }

    
    return (
        <div style={{ padding: '20px' }}>
            <h2>Tablou de Bord (Profesor)</h2>
            <p>Cod de Acces: <strong style={{fontSize: '1.5em', color: '#8884d8'}}>{currentActivity.uniqueCode}</strong></p>
            <p><small>Activitatea se încheie la: **{new Date(new Date(currentActivity.startTime).getTime() + currentActivity.durationMinutes * 60000).toLocaleTimeString()}**</small></p>
            
            <hr style={{ margin: '20px 0' }}/>
            
            <h3>Feedback Continuu (Total: {feedbackData.length})</h3>
            
            <div style={{ width: '100%', maxWidth: '800px', margin: '20px auto', height: 350 }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            {/* Folosim Bar-uri separate pentru a aplica culorile REACTION_COLORS */}
                            {Object.keys(REACTION_COLORS).map(reactionType => (
                                <Bar 
                                    key={reactionType} 
                                    dataKey="count" 
                                    fill={REACTION_COLORS[reactionType]} 
                                    name={reactionType.charAt(0) + reactionType.slice(1).toLowerCase()} // Formatare nume: Smiley, Frowny, etc.
                                    data={chartData.filter(d => d.name === reactionType)}
                                    isAnimationActive={false} // Dezactivează animațiile pentru a nu perturba polling-ul
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign: 'center', marginTop: '50px'}}>Așteptăm primele reacții...</p>
                )}
            </div>
            
            <p style={{marginTop: '20px'}}><small>Graficul se actualizează automat la fiecare 5 secunde.</small></p>
        </div>
    );
};

export default ProfessorPage;