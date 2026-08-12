import React from 'react';
const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    outline: "border-2 border-green-600 text-green-700 hover:bg-green-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;