import React from "react";

export function Card({ children, className = "" }: any) {
  return <div className={`bg-white border rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children }: any) {
  return <div className="border-b px-4 py-3 bg-gray-50">{children}</div>;
}

export function CardContent({ children }: any) {
  return <div className="p-4">{children}</div>;
}
