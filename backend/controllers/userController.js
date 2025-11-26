import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const generateToken = (id) => {
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

/**
 * @desc    
 * @route   
 * @access  
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: 'Vă rugăm completați toate câmpurile.' });
        return;
    }

    
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'Utilizatorul cu această adresă de email există deja.' });
        return;
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({
        name,
        email,
        password: hashedPassword,
       
        role: role || 'Student', 
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), 
        });
    } else {
        res.status(400).json({ message: 'Date de utilizator invalide.' });
    }
};

/**
 * @desc    
 * @route   
 * @access  
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

  
    const user = await User.findOne({ email });

    
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Credențiale invalide.' });
    }
};

export {
    registerUser,
    loginUser,
};