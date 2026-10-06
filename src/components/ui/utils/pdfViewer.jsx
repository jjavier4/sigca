//import { apiUrl } from '@/lib/paths';

export default function PDFViewer({ id, title = 'Documento PDF', height = '80vh' }) {
 // if (!id) return null;
  const src = `/ciidici/api/works/${id}`

  return (
    <div>
      <p>
        <a href={src} target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva</a>
        {' · '}
        <a href={`${src}?download=1`}>Descargar</a>
      </p>
    </div>
  );
}