"use client";
import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-[90%] max-w-md border border-neutral-800 animate-fadeIn">
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800">
          <h2 className="text-white text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 text-sm text-gray-300">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
