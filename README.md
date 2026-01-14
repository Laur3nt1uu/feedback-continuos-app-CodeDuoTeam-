# Feedback Continuu — Aplicație Web

O aplicație simplă pentru colectarea de feedback (prin emoticoane) în timp real, folosită de profesori pentru a primi reacții anonime de la studenți în timpul cursurilor sau seminariilor.

## Cuprins

- [Ce face proiectul](#ce-face-proiectul)
- [Tehnologii](#tehnologii)
- [Structura proiectului](#structura-proiectului)
- [Pornire rapidă](#pornire-rapidă)
- [Variabile de mediu](#variabile-de-mediu)
- [Endpoint-uri principale](#endpoint-uri-principale)
- [Exemple API (curl)](#exemple-api-curl)

## Ce face proiectul

- Profesorul poate crea activități cu titlu, descriere și cod unic.
- Studentul poate introduce codul activității și trimite feedback (😊, ☹️, 😮, 😕).
- Feedback-ul este anonim și apare live în dashboard-ul profesorului.

Aplicația este împărțită în două părți: backend (Node.js / Express) și frontend (React).

## Tehnologii

- Frontend: React (hooks, Context)
- Backend: Node.js + Express
- Bază de date: PostgreSQL (folosit cu Sequelize)
- Autentificare: JWT
- Email: Nodemailer (opțional, pentru reset parole)

## Structura proiectului (scurt)

```
├── backend/         # API, modele, rute, middleware
├── frontend/        # aplicație React
└── README.md
```

## Pornire rapidă

Precondiții

- Node.js (>= 14)
- npm
- PostgreSQL (sau folosește SQLite în configurație alternativă)

1) Backend

```powershell
cd backend
npm install
```

Crează fișierul `.env` (sau copiază `.env.example`) și completează valorile necesare:

```text
# Exemplu (backend/.env)
PORT=8080
NODE_ENV=development
JWT_SECRET=your_jwt_secret
DB_NAME=feedback_continuous_dev
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
FRONTEND_URL=http://localhost:3000
```

Pornește serverul backend (nodemon recomandat pentru dezvoltare):

```powershell
npm run dev
```

2) Frontend

```powershell
cd frontend
npm install
npm start
```

Accesează aplicația front-end în browser la:

- http://localhost:3000

## Variabile de mediu importante

- `JWT_SECRET` — secretul pentru semnarea token-urilor JWT
- `DATABASE_URL` sau `DB_*` — conexiunea la baza de date
- `EMAIL_USER`, `EMAIL_PASSWORD` — cont pentru trimitere email (opțional)

## Endpoint-uri principale

- `POST /api/users/register` — înregistrare
- `POST /api/users/login` — autentificare
- `POST /api/users/forgot-password` — solicitare reset parolă
- `GET /api/users/reset-password/:token` — validare token
- `POST /api/users/reset-password/:token` — reset parolă

- `POST /api/activities` — creează activitate (Profesor)
- `GET /api/activities/active` — preia activități active
- `GET /api/activities/:id/feedback` — feedback pentru activitate

- `POST /api/feedback/join` — alăturare la activitate folosind `uniqueCode`
- `POST /api/feedback` — trimite feedback

## Exemple API (curl)

Register (exemplu):

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@stud.ase.ro","password":"secret","role":"Student"}'
```

Login (exemplu):

```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@stud.ase.ro","password":"secret"}'
```

## Testare manuală (scurt)

1. Creează un cont profesor și unul student.
2. Profesorul creează o activitate (setează start/end date).
3. Studentul se alătură folosind codul activității și trimite feedback prin emoji.
4. Profesorul verifică dashboard-ul live.


---

## Deployment

Aplicația este deja deployată pe Render (backend + frontend). Setările folosite sunt în `render.yaml` 




