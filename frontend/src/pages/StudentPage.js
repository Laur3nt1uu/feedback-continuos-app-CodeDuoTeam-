// frontend/src/pages/StudentPage.js
import React, { useState } from 'react';
import axios from 'axios';
import EmoticonButton from '../components/EmoticonButton';


const API_BASE_URL = process.env.REACT_APP_BASE_URL;
const API_URL_FEEDBACK = `${API_BASE_URL}/feedback`;

const StudentPage = () => {
  const [code, setCode] = useState('');
  const [activity, setActivity] = useState(null); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL_FEEDBACK}/join`, { uniqueCode: code });
      
      setActivity(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la accesare cod.');
    }
  };

  
  const sendFeedback = async (type) => {
    setMessage('');
    try {
      await axios.post(API_URL_FEEDBACK, { 
        activityId: activity.activityId, 
        reactionType: type 
      });
      setMessage(`Feedback ${type} trimis! Mulțumim.`);
      setTimeout(() => setMessage(''), 1500); 
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la trimitere feedback.');
    }
  };


  if (!activity) {
    return (
      <form onSubmit={handleJoin} style={{textAlign: 'center', marginTop: '50px'}}>
        <h2>Acces Studenți</h2>
        <p>Introduceți codul unic furnizat de profesor:</p>
        <input
          type="text"
          placeholder="COD UNIC"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength="6"
          required
          style={{ padding: '10px', fontSize: '1.2em', width: '200px', textAlign: 'center' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '1.2em', marginLeft: '10px' }}>
            Intră
        </button>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      </form>
    );
  }


  return (
    <div style={{textAlign: 'center', marginTop: '30px'}}>
      <h2>Reacționează la: {activity.name}</h2>
      <p style={{color: 'green', fontWeight: 'bold'}}>{message}</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <EmoticonButton emoji="😊" type="SMILEY" onClick={sendFeedback} />
        <EmoticonButton emoji="😔" type="FROWNY" onClick={sendFeedback} />
        <EmoticonButton emoji="😮" type="SURPRISED" onClick={sendFeedback} />
        <EmoticonButton emoji="🤔" type="CONFUSED" onClick={sendFeedback} />
      </div>
      <p style={{marginTop: '30px'}}><small>Reacțiile sunt anonime și pot fi trimise continuu.</small></p>
    </div>
  );
};

export default StudentPage;