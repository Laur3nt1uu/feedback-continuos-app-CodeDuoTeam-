import React from 'react';
import { motion } from 'framer-motion';

const EmoticonButton = ({ emoji, type, onClick, label }) => (
  <motion.button 
    className="emoticon-btn"
    onClick={() => onClick(type)}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
      {emoji}
    </div>
    {label && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>{label}</span>}
  </motion.button>
);

export default EmoticonButton;