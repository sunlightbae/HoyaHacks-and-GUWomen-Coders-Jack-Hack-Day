
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-white fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              <path d="M10 12c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1zm4 0c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z" />
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5v-1a1 1 0 112 0v1a1 1 0 11-2 0z" clipRule="evenodd" opacity=".3"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">Serve DC</h1>
            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mt-1">DC Neighbors Helping Others</p>
          </div>
        </div>
        
        <div className="hidden sm:block">
          <span className="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
            Pseudo-anonymous Community
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
