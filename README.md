# Feedback Continuu - Aplicație Web

## 1. Descriere proiect
Aceasta este o aplicație web pentru acordarea de feedback continuu la cursuri sau seminarii.  

- Profesorul poate crea activități cu titlu, descriere și cod unic.  
- Studentul poate introduce codul și trimite feedback prin emoji (😊, ☹️, 😮, 😕).  
- Feedback-ul este anonim și vizibil live pe dashboard-ul profesorului.  

Aplicația este formată din **backend Node.js + Express + Sequelize + Socket.IO** și **frontend React SPA**.  
Baza de date este PostgreSQL (sau MySQL).

---

## 2. Tehnologii folosite
- **Frontend:** React.js, React Router, Axios, Chart.js  
- **Backend:** Node.js, Express, Sequelize, Socket.IO  
- **Baza de date:** PostgreSQL / MySQL  
- **Versionare:** Git 
- **Deploy:** Vercel (frontend) + Render / Azure (backend)   
- **Inca ne gandim daca vom folosi toate aceste tehnologii**

---

## 3. Specificații detaliate
- Profesorul poate crea activități cu titlu, descriere și dată de începere și finalizare.  
- Studentul introduce codul activității pentru a participa.  
- Studentul poate trimite feedback prin emoji: happy, sad, surprised, confused.  
- Feedback-ul este anonim și poate fi trimis de mai multe ori.  
- Profesorul vede feedback-ul live în listă și grafic.  
- Feedback-ul rămâne stocat și poate fi accesat și după terminarea activității.  

---

## 4. Planul nostru de realizare al proiectului

### Etapa 1 – Structura proiectului și cod minimal
- Creăm folderele `server` și `client` și punem fișierele principale (`index.js`, `App.js`, `README.md` etc.)  
- **Backend:** facem modelele `Activity` și `Feedback`, creăm rutele principale (fără toate validările)  
- **Frontend:** pagini SPA minimale – `StudentJoin`, `ActivityView`, `ProfessorDashboard`  
- Adăugăm README cu descriere, specificații și plan  
- Punem codul pe GitHub  

### Etapa 2 – Funcționalități principale
- Profesorul poate crea activitate cu titlu, descriere și cod  
- Studentul introduce codul și poate trimite feedback prin emoji  
- Backend-ul primește și salvează feedback-ul în baza de date  
- Frontend-ul afișează feedback-ul live prin Socket.IO  
- Testăm local că totul funcționează  

### Etapa 3 – Funcționalități suplimentare și optimizări
- Feedback-ul se afișează și după încheierea activității  
- Adăugăm grafice și listă pentru vizualizare mai ușoară  
- Curățăm codul, adăugăm comentarii și facem verificări minimale  
- Deploy online pe Vercel (frontend) și Render/Azure (backend) 

**ETAPELE SUNT ORIENTATIVE SI NE AJUTA PE NOI SA NE DESFASURAM PROIECTUL INTR-O MANIERA ORGANIZATA SI TOTODATA SA INTELEGI SI DUMNEAVOASTRA PROCESUL PRIN CARE TRECEM**

## 5. Structura proiectului

```
feedback-continuous-app/
│
├── server/                     # backend Node.js
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   ├── models/
│   │   ├── Activity.js
│   │   └── Feedback.js
│   └── routes/
│       ├── activities.js
│       └── feedback.js
│
├── client/                     # frontend React SPA
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── pages/
│       │   ├── StudentJoin.js
│       │   ├── ActivityView.js
│       │   └── ProfessorDashboard.js
│       ├── components/
│       │   ├── EmojiButton.js
│       │   └── LiveChart.js
│       └── services/
│           ├── api.js
│           └── socket.js
│
└── README.md
```

---
**DETALII DESPRE CUM SE VA PUTEA RULA PROIECTUL VETI PRIMII ATUNCI CAND VOM LANSA DEMO-UL**