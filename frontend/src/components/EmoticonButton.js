
import React from 'react';

const EmoticonButton = ({ emoji, type, onClick }) => (
  
  <button 
    className={`emoticon-btn ${type.toLowerCase()}`} 
    onClick={() => onClick(type)}
    style={{ 
        fontSize: '3rem', 
        width: '150px', 
        height: '150px', 
        margin: '15px', 
        borderRadius: '10px',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer' 
    }}
  >
    {emoji}
    <br />
    <small style={{fontSize: '0.8rem', fontWeight: 'bold'}}>{type}</small>
  </button>
);

export default EmoticonButton;