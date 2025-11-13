"use client"
import React, { useState } from 'react';
import { Menu, X, Users, UserPlus, Home, Settings, LogOut } from 'lucide-react';

export default function DashboardAdmin() {
    return (

        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">AUTORES</h3>
                    <p className="text-3xl font-bold text-gray-800">48</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">REVISORES</h3>
                    <p className="text-3xl font-bold text-gray-800">12</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">COMITÉ</h3>
                    <p className="text-3xl font-bold text-gray-800">5</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">TOTAL USUARIOS</h3>
                    <p className="text-3xl font-bold text-gray-800">65</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                        <div>
                            <p className="font-medium text-gray-800">Nuevo autor registrado</p>
                            <p className="text-sm text-gray-500">juan.perez@example.com</p>
                        </div>
                        <span className="text-sm text-gray-400">Hace 2 horas</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                        <div>
                            <p className="font-medium text-gray-800">Revisor asignado</p>
                            <p className="text-sm text-gray-500">maria.lopez@example.com</p>
                        </div>
                        <span className="text-sm text-gray-400">Hace 5 horas</span>
                    </div>
                </div>
            </div>
        </div>
    )
};
