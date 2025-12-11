import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import EmoticonButton from '../components/EmoticonButton';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api'; 
const API_URL_FEEDBACK = `${API_BASE_URL}/feedback`;

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

const StudentPage = () => {
  const [code, setCode] = useState('');
  const [activity, setActivity] = useState(null); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Trim whitespace and ensure uppercase before sending to backend
      const normalized = code.toString().trim().toUpperCase();
      const res = await axios.post(`${API_URL_FEEDBACK}/join`, { uniqueCode: normalized }); 
      setActivity(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la accesare cod. Verifică codul introdus!');
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (type) => {
    setMessage('');
    setError('');
    
    if (!activity || !activity.activityId) { 
      setError('Eroare: Activitatea nu este definită.');
      return;
    }

    try {
      await axios.post(API_URL_FEEDBACK, { 
        activityId: activity.activityId, 
        reactionType: type,
        timestamp: new Date().toISOString(), 
      });

      const emojiMap = { SMILEY: "😊", FROWNY: "😔", SURPRISED: "😮", CONFUSED: "🤔" };
      setMessage(`${emojiMap[type]} Feedback trimis! Mulțumim.`);
      
      setTimeout(() => setMessage(''), 2500); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Eroare la trimitere feedback.');
    }
  };

  if (!activity) {
    return (
      <div className="student-page">
        <div className="student-container">
          <motion.div 
            className="student-form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <motion.div 
              className="text-center mb-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 variants={itemVariants} className="text-3xl">
                🎓 Acces Studenți
              </motion.h2>
              <motion.p variants={itemVariants} className="auth-subtitle">
                Introdu codul unic furnizat de profesor pentru a participa
              </motion.p>
            </motion.div>

            <motion.form 
              onSubmit={handleJoin}
              className="code-input-group"
              variants={itemVariants}
            >
              <motion.input
                type="text"
                placeholder="COD UNIC (6 caractere)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength="6"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <motion.button 
                type="submit"
                disabled={loading || code.length < 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? '⏳' : '→'}
              </motion.button>
            </motion.form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="alert alert-danger"
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
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-container">
        <motion.div 
          className="feedback-display"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <motion.div 
            className="feedback-header"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={itemVariants} className="text-3xl">
              ✨ Reacționează
            </motion.h2>
            <motion.p variants={itemVariants} className="auth-subtitle">
              Cum îți simți privind: <strong>{activity.name}</strong>?
            </motion.p>
          </motion.div>

          <motion.div 
            className="emoticon-buttons"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <EmoticonButton emoji="😊" type="SMILEY" onClick={sendFeedback} label="Perfect! Înțeleg totul" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <EmoticonButton emoji="😔" type="FROWNY" onClick={sendFeedback} label="Greu de înțeles" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <EmoticonButton emoji="😮" type="SURPRISED" onClick={sendFeedback} label="Surprinzător! Wow!" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <EmoticonButton emoji="🤔" type="CONFUSED" onClick={sendFeedback} label="Confuz, mai explică" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {message && (
              <motion.div 
                className="feedback-message success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                className="feedback-message error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p 
            className="text-center text-secondary text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            💡 Reacțiile sunt anonime și pot fi trimise continuu în orice moment.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentPage;
