import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    className={`toast toast-${type}`}
                    initial={{ opacity: 0, y: 20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <span className="toast-icon">
                        {type === 'success' && '✅'}
                        {type === 'error' && '❌'}
                        {type === 'info' && 'ℹ️'}
                        {type === 'warning' && '⚠️'}
                    </span>
                    <span className="toast-message">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
