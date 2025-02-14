// src/components/Navbar.tsx
import React from 'react';
import { FiMenu, FiSearch } from 'react-icons/fi';
import { useStateContext } from '../contexts/ContextProvider';

const Navbar = () => {
  const { activeMenu, setActiveMenu } = useStateContext();

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      {/* Hamburger Icon */}
      <button
        onClick={() => setActiveMenu(!activeMenu)}
        className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiMenu />
      </button>

      {/* Search Input */}
      <div className="flex-1 mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiSearch />
          </div>
        </div>
      </div>

      {/* Right Side (Reserved for future icons/actions) */}
      <div className="w-10"></div>
    </div>
  );
};

export default Navbar;


// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { ContextProvider, useStateContext } from './contexts/ContextProvider';

const MainContent = () => {
  const { activeMenu } = useStateContext();

  return (
    <div className="flex relative">
      {/* Sidebar */}
      {activeMenu && <Sidebar />}

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${activeMenu ? 'ml-64' : 'ml-0'}`}
      >
        {/* Navbar with hamburger and search */}
        <Navbar />

        {/* Page Content */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ContextProvider>
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </ContextProvider>
  );
};

export default App;
