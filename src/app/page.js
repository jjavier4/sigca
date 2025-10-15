import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
        <section className="bg-blue-900 min-h-screen text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              CIIDiCI
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-blue-100">
              Congreso Internacional de la Investigación y Divulgación<br />de la Ciencia y la Ingeniería
            </h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-blue-50">
              Sistema de Gestión de Conferencias Académicas del Instituto Tecnológico de Toluca
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Explorar Convocatorias
              </button>
              <Link href={"/about"} className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Conocer Más
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}