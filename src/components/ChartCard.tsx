import React from 'react';
import type { ReactNode } from 'react'; 
interface ChartCardProps {
    title: string;
    children: ReactNode;
    allowEdit?: boolean;
    onEdit?: () => void;
    isDisabled?: boolean; 
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, allowEdit = false, onEdit, isDisabled = false }) => {
    
    // Determine button state based on whether onEdit is defined and if the component is disabled
    const buttonClasses = `text-sm px-3 py-1 rounded-lg transition duration-150 ${
        isDisabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
    }`;

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 h-[400px] flex flex-col transition duration-300 hover:shadow-indigo-500/50">
            <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                {allowEdit && onEdit && (
                    <button
                        onClick={onEdit}
                        className={buttonClasses}
                        disabled={isDisabled} 
                    >
                        {isDisabled ? 'Connecting...' : 'Customize'}
                    </button>
                )}
            </div>
            <div className="flex-grow min-h-0">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
