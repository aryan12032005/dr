import React, { useState } from "react";
import Groups from "./Groups";
import { Link, Routes, Route } from "react-router-dom";
import RequestedDocument from "./RequestedDocument";

const Faculty = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <aside className="bg-[#1f2937] text-white w-64 p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">
            Faculty
          </h2>
          <nav className="space-y-4">
            {[
              { label: "Groups Management", path: "/facultypanel/groups" },
              { label: "Requested Documents", path: "/facultypanel/requested-docs" },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-4 px-2 py-2 rounded-lg transition-all duration-200 
                  hover:bg-gray-700 hover:shadow-lg active:scale-[0.98] ${
                    location.pathname === path ? "bg-gray-700 shadow-md" : ""
                  }`}
              >
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/groups" element={<Groups />} />
          <Route path="/requested-docs" element={<RequestedDocument />} />
        </Routes>
      </main>
    </div>
  );
};

export default Faculty;
