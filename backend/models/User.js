import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 

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
}, {
    tableName: 'Users', 
    timestamps: true, 
});




export default User;