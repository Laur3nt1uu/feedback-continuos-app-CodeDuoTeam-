import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  EMAIL_USER sau EMAIL_PASSWORD nu sunt configurate în .env');
    console.warn('   Email functionality va fi dezactivată');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

if (process.env.NODE_ENV !== 'production') {
    transporter.verify().then(() => {
        console.log('✅ SMTP transporter is ready');
    }).catch((err) => {
        console.warn('⚠️ SMTP transporter verify failed:', err && err.message ? err.message : err);
    });
}


const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: 'Vă rugăm completați toate câmpurile.' });
        return;
    }

    const STUDENT_DOMAINS = [
        '@stud.ase.ro',        
        '@student.ase.ro',      
        '@student.upt.ro',      
        '@student.utcluj.ro',  
        '@stud.ubbcluj.ro',     
        '@student.upb.ro',      
    ];

    const PROFESSOR_DOMAINS = [
        '@ase.ro',              
        '@ie.ase.ro',           
        '@upt.ro',             
        '@utcluj.ro',           
        '@ubbcluj.ro',          
        '@upb.ro',        
    ];

    const domain = email.substring(email.lastIndexOf('@')).toLowerCase();
    const userRole = role || 'Student';

    if (userRole === 'Student') {
        if (!STUDENT_DOMAINS.includes(domain)) {
            res.status(400).json({ 
                message: `Studenții trebuie să folosească email din domenii studențești. Domenii acceptate: ${STUDENT_DOMAINS.join(', ')}`
            });
            return;
        }
    } else if (userRole === 'Professor') {
        if (!PROFESSOR_DOMAINS.includes(domain)) {
            res.status(400).json({ 
                message: `Profesorii trebuie să folosească email din domenii profesionale. Domenii acceptate: ${PROFESSOR_DOMAINS.join(', ')}`
            });
            return;
        }
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        res.status(400).json({ message: 'Utilizatorul cu această adresă de email există deja.' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole, 
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Date de utilizator invalide.' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ message: error.message || 'Eroare la înregistrare.' });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Credențiale invalide.' });
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Vă rugăm introduceți adresa de email.' });
        return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        res.status(404).json({ message: 'Utilizatorul cu această adresă de email nu a fost găsit.' });
        return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const defaultFrontend = 'https://feedback-app-frontend.onrender.com';
    const configured = (process.env.FRONTEND_URL || '').trim();
    const looksLikeBackend = configured.includes('feedback-continuos-app-codeduoteam-1.onrender.com');
    const frontendBase = (looksLikeBackend ? defaultFrontend : configured || defaultFrontend).replace(/\/$/, '');

    if (!configured) {
        console.warn('⚠️  FRONTEND_URL nu este setat; folosim fallback https://feedback-app-frontend.onrender.com');
    }
    if (looksLikeBackend) {
        console.warn('⚠️  FRONTEND_URL pare să indice backend-ul; folosim fallback https://feedback-app-frontend.onrender.com pentru linkul din email');
    }

    const resetURL = `${frontendBase}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Resetare parolă - Feedback Continuu',
        html: `
            <h2>Resetare parolă</h2>
            <p>Ai solicitat resetarea parolei pentru contul tău.</p>
            <p>Click pe butonul de mai jos pentru a reseta parola:</p>
            <a href="${resetURL}" target="_blank" rel="noopener noreferrer" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Resetare parolă
            </a>
            <p>Sau copiază acest link în browser:</p>
            <p><a href="${resetURL}" target="_blank" rel="noopener noreferrer">${resetURL}</a></p>
            <p><small>Link-ul expiră în 30 de minute.</small></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
        res.json({ 
            message: 'Email de resetare parolă a fost trimis. Verificați inbox-ul sau folderul Spam.',
            resetLink: resetURL
        });
    } catch (error) {
        console.error('Eroare trimitere email:', error.message);
        res.json({ 
            message: 'Eroare la trimiterea emailului. Iată link-ul de resetare (deschide-l în browser):',
            resetLink: resetURL
        });
    }
};


const validateResetToken = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        res.status(400).json({ message: 'Token nu a fost furnizat.' });
        return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                [Op.gt]: new Date(),
            },
        },
    });

    if (!user) {
        res.status(400).json({ message: 'Token invalid sau expirat. Solicită un nou link de resetare.' });
        return;
    }

    res.json({ message: 'Token valid.' });
};


const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
        res.status(400).json({ message: 'Vă rugăm introduceți parola și confirmare parolă.' });
        return;
    }

    if (password !== passwordConfirm) {
        res.status(400).json({ message: 'Parolele nu se potrivesc.' });
        return;
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                [Op.gt]: new Date(),
            },
        },
    });

    if (!user) {
        res.status(400).json({ message: 'Token invalid sau expirat.' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ 
        message: 'Parola a fost resetată cu succes. Vă puteți conecta cu noua parolă.',
        token: generateToken(user.id),
    });
};

export {
    registerUser,
    loginUser,
    forgotPassword,
    validateResetToken,
    resetPassword,
};