import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 


const protect = async (req, res, next) => {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            
            token = req.headers.authorization.split(' ')[1];

            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            
            // 🛑 SCHIMBARE CRITICĂ: Înlocuim findById (Mongoose) cu findByPk (Sequelize)
            // .select('-password') nu este necesar în Sequelize, folosim 'attributes'
            const user = await User.findByPk(decoded.id, {
                // Excludem coloana 'password'
                attributes: { exclude: ['password'] } 
            });

            if (!user) {
                return res.status(401).json({ message: 'Utilizator neexistent.' });
            }
            
            // Sequelize returnează obiectul user (Data Value), care este atribuit lui req.user
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
    // Logica funcționează la fel, deoarece 'req.user' are acum proprietatea 'role' de la Sequelize
    if (req.user && req.user.role === 'Professor') {
        next(); 
    } else {
        res.status(403).json({ message: 'Acces interzis. Doar pentru profesori.' });
    }
};

export { protect, professorGuard };