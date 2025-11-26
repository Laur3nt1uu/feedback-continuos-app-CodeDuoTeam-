import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 


const protect = async (req, res, next) => {
    let token;

   
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            
            token = req.headers.authorization.split(' ')[1];

            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            
            req.user = await User.findById(decoded.id).select('-password');

            next(); 
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Neautorizat, token eșuat.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Neautorizat, niciun token.' });
    }
};


const professorGuard = (req, res, next) => {
    
    if (req.user && req.user.role === 'Professor') {
        next(); 
    } else {
        res.status(403).json({ message: 'Acces interzis. Doar pentru profesori.' });
    }
};

export { protect, professorGuard };