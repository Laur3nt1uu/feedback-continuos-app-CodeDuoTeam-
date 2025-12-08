import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Activity = sequelize.define('Activity', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uniqueCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Foreign key to User (Professor)
    professorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
}, {
    tableName: 'Activities',
    timestamps: true,
});

export default Activity;