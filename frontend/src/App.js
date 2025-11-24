// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfessorPage from './pages/ProfessorPage';
import StudentPage from './pages/StudentPage';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ padding: '20px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
          {}
          <h1>Feedback Live (TW Project)</h1>
        </header>
        
        <main style={{ padding: '20px' }}>
          <Routes>
            {/* Ruta principala / */}
            <Route path="/" element={<HomePage />} />
            
            {/* Ruta pentru Interfața Profesorului */}
            <Route path="/professor" element={<ProfessorPage />} />
            
            {/* Ruta pentru Interfața Studentului */}
            <Route path="/student" element={<StudentPage />} />
            
            {/* Poti adauga o ruta 404/Wildcard la final daca doresti */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;