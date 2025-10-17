import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

// Componente Alert reutilizable
export default function Alert  ({ type = 'success', message, isVisible, onClose })  {
  const alertConfig = {
    success: {
      bgColor: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-white',
      title: 'Éxito'
    },
    error: {
      bgColor: 'bg-red-500',
      icon: AlertCircle,
      iconColor: 'text-white',
      title: 'Error'
    },
    warning: {
      bgColor: 'bg-yellow-500',
      icon: AlertTriangle,
      iconColor: 'text-white',
      title: 'Advertencia'
    }
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
      <div className={`${config.bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-96 max-w-2xl`}>
        <Icon className={config.iconColor} size={24} />
        <div className="flex-1">
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};