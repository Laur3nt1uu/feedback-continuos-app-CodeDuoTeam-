import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 

const STUDENT_EMAIL_DOMAINS = [
    '@stud.ase.ro',         
    '@student.ase.ro',      
    '@student.upt.ro',      
    '@student.utcluj.ro',  
    '@stud.ubbcluj.ro',     
    '@student.upb.ro',      
];

const PROFESSOR_EMAIL_DOMAINS = [
    '@ase.ro',              
    '@ie.ase.ro',           
    '@upt.ro',              
    '@utcluj.ro',          
    '@ubbcluj.ro',          
    '@upb.ro',              
];

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false,
    },
    
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
        validate: {
            isEmail: true,
        },
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    role: {
        type: DataTypes.ENUM('Professor', 'Student'), 
        defaultValue: 'Student', 
        allowNull: false,
    },

    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Users', 
    timestamps: true, 
});

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