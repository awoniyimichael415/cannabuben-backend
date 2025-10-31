import React from "react";

export function Button({ children, onClick, className = "", type = "button" }: any) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
