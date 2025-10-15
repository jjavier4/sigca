import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Sobre CIIDiCI</h3>
            <p className="text-sm leading-relaxed">
              Congreso Internacional de la Investigación y Divulgación de la Ciencia y la Ingeniería del Instituto Tecnológico de Toluca.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-400" />
                <span>Instituto Tecnológico de Toluca</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-blue-400" />
                <span>+52 (722) 208 7200</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-400" />
                <span>contacto@toluca.tecnm.mx</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">SIGCA</h3>
            <p className="text-sm leading-relaxed mb-3">
              Sistema de Gestión de Conferencias Académicas
            </p>
            <p className="text-xs text-gray-500">
              Desarrollado por José Javier Palma Aguilar<br />
              Instituto Tecnológico de Toluca - 2025
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; 2025 Instituto Tecnológico de Toluca. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}