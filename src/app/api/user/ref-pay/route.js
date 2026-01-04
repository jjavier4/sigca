import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generarReferenciaPagoPDF } from '@/lib/pdfGeneratorRef';

function numeroATexto(numero) {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (numero === 0) return 'CERO';
  if (numero === 100) return 'CIEN';
  if (numero === 1000) return 'MIL';

  let texto = '';

  // Miles
  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000);
    if (miles === 1) {
      texto += 'MIL ';
    } else {
      texto += numeroATexto(miles) + ' MIL ';
    }
    numero %= 1000;
  }

  // Centenas
  if (numero >= 100) {
    texto += centenas[Math.floor(numero / 100)] + ' ';
    numero %= 100;
  }

  // Decenas y unidades
  if (numero >= 20) {
    texto += decenas[Math.floor(numero / 10)];
    if (numero % 10 !== 0) {
      texto += ' Y ' + unidades[numero % 10];
    }
  } else if (numero >= 10) {
    texto += especiales[numero - 10];
  } else if (numero > 0) {
    texto += unidades[numero];
  }

  return texto.trim();
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { pagoInscripcion, referencia, pago } = await request.json();

    // Validaciones
    if (typeof pagoInscripcion !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo pagoInscripcion debe ser un booleano' },
        { status: 400 }
      );
    }

    if (!referencia || typeof referencia !== 'string') {
      return NextResponse.json(
        { error: 'El campo referencia es obligatorio y debe ser un texto' },
        { status: 400 }
      );
    }

    if (typeof pago !== 'number' || pago <= 0) {
      return NextResponse.json(
        { error: 'El campo pago debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Construir vigencia: fecha actual + 10 días
    const fechaVigencia = new Date();
    fechaVigencia.setDate(fechaVigencia.getDate() + 10);
    const vigencia = fechaVigencia.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Determinar tipo de pago
    const tipoPago = pagoInscripcion 
      ? 'Estudiante' 
      : 'Investigadores, profesores y público en general';

    // Formatear monto con Intl.NumberFormat
    const montoFormateado = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(pago);

    // Convertir número a texto
    const montoEntero = Math.floor(pago);
    const montoTexto = numeroATexto(montoEntero);

    // Construir cadena de pago
    const pagoTexto = `${montoFormateado} (${montoTexto} PESOS 00/100 M.N.)`;

    // Año actual
    const anio = new Date().getFullYear();

    // Datos para el PDF
    const datosPDF = {
      vigencia,
      pagoInscripcion: tipoPago,
      referencia,
      pago: pagoTexto,
      anio
    };

    // Generar PDF
    const pdfBuffer = await generarReferenciaPagoPDF(datosPDF);

    // Crear nombre del archivo
    const nombreArchivo = `Referencia_Pago_CIIDICI_${anio}_${Date.now()}.pdf`;

    // Retornar PDF para descarga
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error al generar referencia de pago:', error);
    return NextResponse.json(
      { error: 'Error al generar referencia de pago' },
      { status: 500 }
    );
  }
}