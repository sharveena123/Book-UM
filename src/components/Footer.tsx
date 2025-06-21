import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#183B4E] text-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-lg">Book@UM</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Book@UM. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm">
            <Link to="#" className="hover:underline">Privacy Policy</Link>
            <Link to="#" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 