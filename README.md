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


## 4. Structura proiectului

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
```
Creeaza fisierul .env cu urmatoarea configuratie:
```powershell
# DB_NAME=feedback_continuous_dev
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432
# JWT_SECRET=your-jwt-secret
# FRONTEND_URL=http://localhost:3000
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-email-password
```
```powershell
npm run dev
```

2) Frontend

```powershell
cd frontend
npm install
```
Creeaza fisierul .env cu urmatoarea configuratie:
```powershell
#APP_BASE_URL=http://localhost:5000/api

```

```powershell
npm start
```

3) Acces
- Frontend: http://localhost:3000
- API Backend: http://localhost:5000


� Endpoint-uri principale 

- Utilizatori
	- POST /api/users/register — înregistrare
	- POST /api/users/login — autentificare
	- POST /api/users/forgot-password — solicitare reset parolă
	- GET /api/users/reset-password/:token — validare token
	- POST /api/users/reset-password/:token — reset parolă

- Activități 
	- POST /api/activities — creează activitate 
	- GET /api/activities/active — preia activitatea activă 
	- GET /api/activities/:id/feedback — preia feedback-ul pentru o activitate

- Feedback 
	- POST /api/feedback/join — alăturare la activitate folosind `uniqueCode` 
	- POST /api/feedback — trimite feedback 

🚀 Deploy

Aplicația este complet configurată si lansata folosind Render.




