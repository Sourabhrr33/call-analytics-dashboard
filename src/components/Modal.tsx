import React from 'react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Reusable, dark-themed modal component.
 */
const Modal: React.FC<ModalProps> = ({ title, children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-indigo-600">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-white">{title}</h4>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
