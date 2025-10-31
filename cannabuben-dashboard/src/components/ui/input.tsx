import React from "react";

export function Input({ value, onChange, type = "text", placeholder = "", className = "" }: any) {
  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className={`border px-3 py-2 rounded-md w-full ${className}`}
    />
  );
}
