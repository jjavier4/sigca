import { FileText, Users, CheckCircle, Calendar } from 'lucide-react';
import React from 'react'
import Link from 'next/link';
export default function AboutPage() {
    const features = [
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Envío de Trabajos",
            description: "Plataforma centralizada para la carga y gestión de manuscritos académicos con control de versiones."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Gestión de Revisores",
            description: "Asignación automática de revisores por áreas temáticas con seguimiento en tiempo real."
        },
        {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "Proceso de Revisión",
            description: "Sistema estructurado de evaluación con retroalimentación directa y trazabilidad completa."
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Gestión de Convocatorias",
            description: "Publicación y administración dinámica de convocatorias con fechas límite y requisitos específicos."
        }
    ]

    const steps = [
        { step: "1", title: "Publicación de Convocatoria", desc: "El comité organizador publica la convocatoria con fechas y requisitos específicos." },
        { step: "2", title: "Envío de Propuestas", desc: "Los autores registran y envían sus trabajos académicos en formato PDF." },
        { step: "3", title: "Asignación de Revisores", desc: "El sistema asigna revisores especializados según el área temática del trabajo." },
        { step: "4", title: "Proceso de Revisión", desc: "Los revisores evalúan los trabajos y proporcionan retroalimentación estructurada." },
        { step: "5", title: "Correcciones", desc: "Los autores realizan las modificaciones sugeridas dentro del plazo establecido." },
        { step: "6", title: "Validación Final", desc: "El comité organizador valida y publica los trabajos aceptados." }
    ]


    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
                        ¿Qué es el CIIDiCI?
                    </h2>
                    <div className="prose prose-lg mx-auto text-gray-600">
                        <p className="text-lg leading-relaxed mb-6">
                            El Congreso Internacional de la Investigación y Divulgación de la Ciencia y la Ingeniería
                            representa un espacio fundamental para la difusión del conocimiento, la colaboración científica
                            y el fortalecimiento de la comunidad académica del Instituto Tecnológico de Toluca.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Este evento académico busca promover el intercambio de ideas, experiencias y resultados de
                            investigación entre estudiantes, docentes e investigadores de las áreas de ciencia e ingeniería,
                            fomentando el desarrollo científico y tecnológico en la región.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
                        Sistema SIGCA
                    </h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Plataforma integral para la gestión eficiente de conferencias académicas con tecnología de código abierto
                    </p>

                    <div className="grid grid-cols-1 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-5"
                            >
                                <div className="text-blue-600 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                        Proceso de Gestión
                    </h2>

                    <div className="space-y-6">
                        {steps.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        ¿Listo para participar?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Únete a la comunidad académica del Instituto Tecnológico de Toluca y comparte tu investigación
                    </p>
                    <Link href="/auth" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                        <span className="font-semibold text-lg hidden sm:inline">Comenzar Ahora</span>
                    </Link>
                </div>
            </section>
        </div>
    )
}
