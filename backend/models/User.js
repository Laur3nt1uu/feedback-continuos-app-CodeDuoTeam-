import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 

// Domenii email pentru Studenți
const STUDENT_EMAIL_DOMAINS = [
    '@stud.ase.ro',         // ASE - Studenți
    '@student.ase.ro',      // ASE - Studenți (alternativ)
    '@student.upt.ro',      // UPT - Studenți
    '@student.utcluj.ro',   // UTC - Studenți
    '@stud.ubbcluj.ro',     // UBB - Studenți
    '@student.upb.ro',      // UPB - Studenți
];

// Domenii email pentru Profesori
const PROFESSOR_EMAIL_DOMAINS = [
    '@ase.ro',              // ASE - Profesori
    '@ie.ase.ro',           // ASE - Profesori (departament)
    '@upt.ro',              // UPT - Profesori
    '@utcluj.ro',           // UTC - Profesori
    '@ubbcluj.ro',          // UBB - Profesori
    '@upb.ro',              // UPB - Profesori
];

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false,
    },
    
    // name
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    // email
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
        validate: {
            isEmail: true,
        },
    },
    
    // password
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    role: {
        type: DataTypes.ENUM('Professor', 'Student'), 
        defaultValue: 'Student', 
        allowNull: false,
    },

    // Reset password token și expirare
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Users', 
    timestamps: true, 
});

// Validare custom la nivel de model
User.beforeValidate((user) => {
    if (user.email && user.role) {
        const domain = user.email.substring(user.email.lastIndexOf('@')).toLowerCase();
        
        if (user.role === 'Student') {
            if (!STUDENT_EMAIL_DOMAINS.includes(domain)) {
                throw new Error(`Studenții trebuie să folosească email din domenii studențești: ${STUDENT_EMAIL_DOMAINS.join(', ')}`);
            }
        } else if (user.role === 'Professor') {
            if (!PROFESSOR_EMAIL_DOMAINS.includes(domain)) {
                throw new Error(`Profesorii trebuie să folosească email din domenii profesionale: ${PROFESSOR_EMAIL_DOMAINS.join(', ')}`);
            }
        }
    }
});

export default User;