import React from "react";
import { NavLink } from "react-router-dom";

const NavTabs = ({ tabs }) => {
  return (
    <nav className="border-b border-gray-700 mb-6">
      <ul className="flex space-x-6 px-4">
        {tabs.map((tab) => (
          <li key={tab.name}>
            <NavLink
              to={tab.href}
              className={({ isActive }) =>
                `inline-block px-2 py-3 border-b-2 transition-colors duration-200 ${
                  isActive
                    ? "border-blue-500 text-white font-medium"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
                }`
              }
            >
              {tab.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavTabs;
