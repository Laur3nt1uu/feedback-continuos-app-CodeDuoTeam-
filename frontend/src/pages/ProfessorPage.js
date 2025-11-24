// frontend/src/pages/ProfessorPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';


const API_BASE_URL = process.env.REACT_APP_BASE_URL; 
const API_URL_ACTIVITIES = `${API_BASE_URL}/activities`;


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
    const [feedbackData, setFeedbackData] = useState([]); // Feedback-uri brute
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

 
    const fetchFeedback = async (activityId) => {
        try {
            const res = await axios.get(`${API_URL_ACTIVITIES}/${activityId}/feedback`);
           
            setFeedbackData(res.data.details); 
        } catch (err) {
            console.error('Eroare la preluarea feedback-ului:', err);
        }
    };
    
   
    useEffect(() => {
        let interval;
        if (currentActivity) {
            
            interval = setInterval(() => {
                fetchFeedback(currentActivity.id);
            }, 5000); 
        }
       
        return () => clearInterval(interval); 
    }, [currentActivity]);


    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL_ACTIVITIES}`, { name, description: name, durationMinutes: duration });
            setCurrentActivity(res.data);
            setLoading(false);
         
            fetchFeedback(res.data.id); 
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la creare activitate.');
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


    if (!currentActivity) {
        return (
            <form onSubmit={handleCreateActivity}>
                <h2>Definire Activitate</h2>
                <input type="text" placeholder="Nume Curs/Activitate" value={name} onChange={(e) => setName(e.target.value)} required /><br/>
                <input type="number" placeholder="Durată (min)" value={duration} onChange={(e) => setDuration(e.target.value)} required /><br/>
                <button type="submit" disabled={loading}>
                    {loading ? 'Se încarcă...' : 'Start Activitate (Generează Cod)'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        );
    }

   
    return (
        <div>
            <h2>Tablou de Bord (Profesor)</h2>
            <p>Cod de Acces: <strong style={{fontSize: '1.5em'}}>{currentActivity.uniqueCode}</strong></p>
            <p><small>Activitatea se încheie la: {new Date(new Date(currentActivity.startTime).getTime() + currentActivity.durationMinutes * 60000).toLocaleTimeString()}</small></p>
            <hr/>
            <h3>Feedback Continuu (Total: {feedbackData.length})</h3>
            
            <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Număr de Reacții" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            

            <p style={{marginTop: '20px'}}><small>Graficul se actualizează automat la fiecare 5 secunde.</small></p>
        </div>
    );
};

export default ProfessorPage;