import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    reactionType: {
        type: DataTypes.ENUM('SMILEY', 'FROWNY', 'SURPRISED', 'CONFUSED'),
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    // Foreign key to Activity
    activityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Activities',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
}, {
    tableName: 'Feedbacks',
    timestamps: true,
});

export default Feedback;