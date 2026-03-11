import React from "react";
import { X } from "lucide-react";

/**
 * Shared Modal component to prevent re-rendering issues 
 * when defined inside other components.
 */
const Modal = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
            <div className="bg-white rounded-xl w-[400px] p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;
