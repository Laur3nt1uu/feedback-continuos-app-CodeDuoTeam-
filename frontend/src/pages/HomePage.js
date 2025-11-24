// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Sistem de Feedback Continuu</h1>
      <p>Alege rolul pentru a începe:</p>
      
      <div style={{ margin: '30px' }}>
        <Link to="/professor">
          <button style={{ padding: '15px 30px', margin: '10px', fontSize: '1.2em' }}>
            👨‍🏫 Sunt Profesor
          </button>
        </Link>
        <Link to="/student">
          <button style={{ padding: '15px 30px', margin: '10px', fontSize: '1.2em' }}>
            🎓 Sunt Student
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;