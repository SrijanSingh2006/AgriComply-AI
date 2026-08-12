import React from 'react';
import Button from '../common/Button';
import { FaFileArchive } from 'react-icons/fa';

const FilingCard = ({ title, dueDate, status }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-red-500 font-medium">Due: {dueDate}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {status}
        </span>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
        <p>Contains: GST Return, Sales Invoices, Purchase Register</p>
      </div>

      <Button variant="outline" className="w-full">
        <FaFileArchive /> Download Filing ZIP
      </Button>
    </div>
  );
};

export default FilingCard;