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

// Verificare configurație email
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  EMAIL_USER sau EMAIL_PASSWORD nu sunt configurate în .env');
    console.warn('   Email functionality va fi dezactivată');
}

// Configurare Nodemailer pentru trimitere email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'placeholder',
    },
});

// Verificăm conexiunea SMTP în development (utile pentru debugging local)
if (process.env.NODE_ENV !== 'production') {
    transporter.verify().then(() => {
        console.log('✅ SMTP transporter is ready');
    }).catch((err) => {
        console.warn('⚠️ SMTP transporter verify failed:', err && err.message ? err.message : err);
    });
}

/**
 * @desc    Înregistrare utilizator cu validare domeniu email
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: 'Vă rugăm completați toate câmpurile.' });
        return;
    }

    // Domenii studențești
    const STUDENT_DOMAINS = [
        '@stud.ase.ro',         // ASE - Studenți
        '@student.ase.ro',      // ASE - Studenți (alternativ)
        '@student.upt.ro',      // UPT - Studenți
        '@student.utcluj.ro',   // UTC - Studenți
        '@stud.ubbcluj.ro',     // UBB - Studenți
        '@student.upb.ro',      // UPB - Studenți
    ];

    // Domenii profesori
    const PROFESSOR_DOMAINS = [
        '@ase.ro',              // ASE - Profesori
        '@ie.ase.ro',           // ASE - Profesori (departament)
        '@upt.ro',              // UPT - Profesori
        '@utcluj.ro',           // UTC - Profesori
        '@ubbcluj.ro',          // UBB - Profesori
        '@upb.ro',              // UPB - Profesori
    ];

    const domain = email.substring(email.lastIndexOf('@')).toLowerCase();
    const userRole = role || 'Student';

    // Validare domeniu în funcție de rol
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

/**
 * @desc    Login utilizator
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Credențiale invalide.' });
    }
};

/**
 * @desc    Trimitere email de resetare parolă
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Verificare configurație email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ EMAIL_USER sau EMAIL_PASSWORD nu sunt configurate');
        res.status(500).json({ 
            message: 'Email functionality nu este configurată. Contactează administratorul.' 
        });
        return;
    }

    if (!email) {
        res.status(400).json({ message: 'Vă rugăm introduceți adresa de email.' });
        return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        res.status(404).json({ message: 'Utilizatorul cu această adresă de email nu a fost găsit.' });
        return;
    }

    // Generare token de resetare
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Salvare token și expirare (30 minute)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // URL de resetare parolă
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Resetare parolă - Feedback Continuu',
        html: `
            <h2>Resetare parolă</h2>
            <p>Introduceți email-ul</p>
            <a href="${resetURL}" target="_blank" rel="noopener noreferrer" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Resetare parolă
            </a>
            <p><a href="${resetURL}" target="_blank" rel="noopener noreferrer">${resetURL}</a></p>
        `,
    };

    try {
        // Loguri utile doar în development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Sending email to:', email);
            console.log('Email user:', process.env.EMAIL_USER);
            console.log('Reset URL:', resetURL);
        }

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
        // Răspuns generic (nu expunem URL-ul în API în varianta finală)
        res.json({ message: 'Email de resetare parolă a fost trimis. Verificați inbox-ul dumneavoastră.' });
    } catch (error) {
        console.error('Eroare trimitere email:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: `Eroare la trimiterea emailului: ${error.message}` });
    }
};

/**
 * @desc    Validare token de resetare
 * @route   GET /api/users/reset-password/:token
 * @access  Public
 */
const validateResetToken = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        res.status(400).json({ message: 'Token nu a fost furnizat.' });
        return;
    }

    // Hash token din URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Căutare utilizator cu token valid și neexpired
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

/**
 * @desc    Resetare parolă cu token
 * @route   POST /api/users/reset-password/:token
 * @access  Public
 */
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

    // Hash token din URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Căutare utilizator cu token valid și neexpired
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

    // Hash noua parolă
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