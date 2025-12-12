# Feedback Continuu - Aplicație Web

## 1. Descriere proiect
Aceasta este o aplicație web pentru acordarea de feedback continuu la cursuri sau seminarii.  

- Profesorul poate crea activități cu titlu, descriere și cod unic.  
- Studentul poate introduce codul și trimite feedback prin emoji (😊, ☹️, 😮, 😕).  
- Feedback-ul este anonim și vizibil live pe dashboard-ul profesorului.  

Aplicația este formată din **backend Node.js** și **frontend React SPA**.  


---

## 2. Tehnologii folosite
- **Frontend:** React.js
- **Backend:** Node.js 
- **Baza de date:** PostgreSQL  
- **Versionare:** Git 
- **Deploy:** Render


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
- Punem proiectul pe GitHub  



**ETAPELE SUNT ORIENTATIVE SI NE AJUTA PE NOI SA NE DESFASURAM PROIECTUL INTR-O MANIERA ORGANIZATA SI TOTODATA SA INTELEGETI SI DUMNEAVOASTRA PROCESUL PRIN CARE TRECEM**
**VOM ADAUGA ETAPELE PE PARCURS**

## 5. Structura proiectului



✅ Funcționalități principale

🔐 Autentificare & Autorizare
- Înregistrare și autentificare cu token JWT
- Validarea domeniului de email pentru determinarea rolului (student/profesor)
- Parole criptate cu bcrypt
- Dashboard-uri separate pentru profesori și studenți

🗄️ Bază de date & Backend
- PostgreSQL (Sequelize)
- API RESTful: rute pentru utilizatori, activități și feedback
- Validare input și gestionare erori

💻 Frontend
- React 18 cu hooks și Context API
- Interfețe responsive pentru mobil și desktop
- Comunicare cu API folosind Axios


🚀 Pornire rapidă

Cerințe
- Node.js 18+
- PostgreSQL 12+
- npm sau yarn

1) Backend

```powershell
cd backend
npm install
Creeaza fisierul .env cu urmatoarea configuratie:
# DB_NAME=feedback_continuous_dev
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432
# JWT_SECRET=your-jwt-secret
# FRONTEND_URL=http://localhost:3000
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-email-password

npm 
```

Notă: în producție (Render) setează `DATABASE_URL` în setările serviciului Render și nu mai e nevoie de DB_NAME/DB_USER/DB_PASSWORD.

2) Frontend

```powershell
cd frontend
npm install
# Creează .env în folderul frontend:
# REACT_APP_BASE_URL=http://localhost:5000/api

npm start
```

3) Acces
- Frontend: http://localhost:3000
- API Backend: http://localhost:5000


� Endpoint-uri principale 

- Utilizatori (mounted la `/api/users`)
	- POST /api/users/register — înregistrare
	- POST /api/users/login — autentificare
	- POST /api/users/forgot-password — solicitare reset parolă
	- GET /api/users/reset-password/:token — validare token
	- POST /api/users/reset-password/:token — reset parolă

- Activități (mounted la `/api/activities`)
	- POST /api/activities — creează activitate (profesor, protejat)
	- GET /api/activities/active — preia activitatea activă (profesor, protejat)
	- GET /api/activities/:id/feedback — preia feedback-ul pentru o activitate (profesor)

- Feedback (mounted la `/api/feedback`)
	- POST /api/feedback/join — alăturare la activitate folosind `uniqueCode` (public)
	- POST /api/feedback — trimite feedback (public)

🚀 Deploy

Aplicația este pregătită pentru deploy pe Render. Backend-ul poate folosi variabila de mediu `DATABASE_URL`.
 Pentru deploy pe Render setează `DATABASE_URL` și variabilele necesare (ex: `JWT_SECRET`, `FRONTEND_URL`, `EMAIL_USER`, `EMAIL_PASSWORD`).


