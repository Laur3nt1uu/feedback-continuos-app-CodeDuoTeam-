// Middleware care protejează rutele cu JWT — dacă n-ai token, nu intri.
// verifica token, găseste userul și continua
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 


const protect = async (req, res, next) => {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];    
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] } 
            });

            if (!user) {
                return res.status(401).json({ message: 'Utilizator neexistent.' });
            }
            
            req.user = user; 

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