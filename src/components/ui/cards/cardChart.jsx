// src/components/ui/cards/cardChart.jsx
"use client";
import React from 'react';

export default function CardChart({ 
  title, 
  subtitle, 
  children, 
  icon: Icon,
  className = ""
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon className="text-blue-600" size={24} />}
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Contenido de la gráfica */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}