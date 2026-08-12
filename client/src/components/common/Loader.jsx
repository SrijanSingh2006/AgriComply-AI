import React from 'react';
const Loader = ({ text = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-2"></div>
      <span className="text-sm text-gray-500 animate-pulse">{text}</span>
    </div>
  );
};

export default Loader;