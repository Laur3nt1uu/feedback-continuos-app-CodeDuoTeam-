# 🔧 Fix: Email Nu Se Trimite

## ❌ Problema Identificată

Credențialele email din `.env` sunt placeholder-uri:
```env
EMAIL_USER=your-gmail@gmail.com          ← PLACEHOLDER!
EMAIL_PASSWORD=your-app-specific-password ← PLACEHOLDER!
```

Acesta este motivul pentru care emailurile **nu se trimit**.

---

## ✅ Soluție: Configurare Gmail

### Pasul 1: Verifică dacă ai 2FA activat pe Gmail

1. Mergi: https://myaccount.google.com
2. Click: **Security** (Securitate)
3. Caută: **2-Step Verification** (Verificare în 2 pași)
4. Dacă NU e activat, click: **Get Started** și urmează pașii

### Pasul 2: Generează App-Specific Password

1. Mergi: https://myaccount.google.com/apppasswords
2. **Selectează: Mail**
3. **Selectează: Windows**
4. Google va genera o **parolă de 16 caractere** cu spații
5. **Copiază TOATĂ parola** (exemplu: `xxxx xxxx xxxx xxxx`)

### Pasul 3: Actualizează `.env`

1. Deschide: `backend/.env`
2. Actualizează aceste linii:

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:3000
```

**Exemplu complet:**
```env
EMAIL_USER=ion.popescu@gmail.com
EMAIL_PASSWORD=nvqo yqwa zzvc xlkc
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANT:**
- Pune **EXACT** email-ul Gmail (cum l-ai creat pe Google)
- Pune **EXACT** parola generată (cu spații!)
- **NU** folosi parola ta de Gmail obișnuită!

### Pasul 4: Restart Backend

```powershell
# Oprește backend (Ctrl+C în terminal)
# Apoi restart:
npm start
```

### Pasul 5: Test

1. Mergi: http://localhost:3000/login
2. Click: "Uita-ți parola?"
3. Introduc: un email valid (ex: `student@student.ase.ro`)
4. Click: "Trimite Link Resetare"
5. **Verifică inbox Gmail** - ar trebui să primești email în 10-30 secunde

---

## 📧 Dacă incă nu primești email...

### Debugging Steps:

1. **Check Terminal Logs**
   - Deschide terminalul unde rulezi backend (`npm start`)
   - Căuta linii cu `Sending email to:` și `Error`
   - Noteaza exact care e eroarea

2. **Verifică EMAIL_USER**
   ```
   Email user: ion.popescu@gmail.com  ← Trebuie să fie email real
   ```

3. **Verifică EMAIL_PASSWORD**
   - NU ar trebui să fie placeholder
   - Trebuie sa fie 16 caractere cu spații

4. **Verifică Reset URL**
   ```
   Reset URL: http://localhost:3000/reset-password/TOKEN
   ```
   - Ar trebui să se formeze corect

### Common Errors:

| Eroare | Cauză | Soluție |
|--------|-------|---------|
| `Invalid login` | Parola greșită | Regenerez app password de la Google |
| `less secure app` | 2FA nu e activat | Activez 2FA pe Gmail |
| `Connection timeout` | Gmail SMTP blocked | Verific firewall/VPN |
| `Invalid credentials` | EMAIL_USER/PASSWORD placeholder | Updatez .env cu valori reale |

---

## 🔍 Testare Directă (Optional)

Daca vrei să testezi email-ul direct din PowerShell:

```powershell
# Deschide PowerShell și rulează:
$email = "test@student.ase.ro"
$body = @{ email = $email } | ConvertTo-Json
$header = @{ "Content-Type" = "application/json" }

Invoke-RestMethod -Uri "http://localhost:5000/api/users/forgot-password" `
                  -Method Post `
                  -Body $body `
                  -Headers $header
```

Dacă funcționează, ar trebui să primești răspuns:
```json
{
  "message": "Email de resetare parolă a fost trimis..."
}
```

---

## ⚠️ Probleme de Securitate

**NU** comite `.env` pe GitHub!

Verifica că `.gitignore` conține:
```
.env
node_modules/
```

---

## 📝 Pași Rezumare

1. ✅ Activează 2FA pe Gmail
2. ✅ Generează App-Specific Password
3. ✅ Actualizează `.env`
4. ✅ Restart backend
5. ✅ Test forgot password flow
6. ✅ Verifica inbox-ul Gmail

---

**După acești pași, emailurile ar trebui să funcționeze!** ✉️

Dacă incă ai probleme, trimite-mi log-urile din terminal.
