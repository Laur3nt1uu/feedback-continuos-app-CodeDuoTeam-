import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vă rugăm adăugați un nume'],
    },
    email: {
        type: String,
        required: [true, 'Vă rugăm adăugați o adresă de email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Vă rugăm adăugați o parolă'],
        minlength: 6,
    },
   
    role: {
        type: String,
        enum: ['Professor', 'Student'],
        default: 'Student', 
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;