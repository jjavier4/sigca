import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generarReferenciaPagoPDF } from '@/lib/pdfGeneratorRef';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    const { userId, trabajoid, } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }
    const usuario = await prisma.usuarios.findUnique({
      where: {
        id: userId
      },
      select: {
        nombre: true,
        apellidoP: true,
        apellidoM: true,
        curp: true,
        rfc: true,
        numero_control: true,
      }
    });

    const nommbreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`
    const identidficadorreferencia = usuario.curp ? usuario.curp : usuario.rfc
    const numero_control = usuario.numero_control ? usuario.numero_control : 'N/A'
    /*  Llamar al servicio web externo para obtener los datos de la referencia de pago 
    const response = await fetch('urlwebservice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: nommbreCompleto,
        numero_control: numero_control,
        id: identidficadorreferencia
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener datos de referencia de pago' },
        { status: 500 }
      );
    }
    const data = await response.json();

    const { referencia, costo, costo_letras, fecha_vencimiento, fecha_emision } = data;
    */

    // Datos simulados para la referencia de pago (para propósitos de este ejemplo)
    const referencia = '123456789012345677';
    const costo = numero_control !== 'N/A' ? 500.00 : 1000.00;
    const costo_letras = numero_control !== 'N/A' ? 'QUINIENTOS' : 'MIL';
    const fecha_vencimiento = '30/12/2024';
    const fecha_emision = '01/12/2024';

    const trabajoActualizado = await prisma.trabajos.update({
      where: {
        id: trabajoid, 
      },
      data: {
        referencia_pago: referencia,
      },
    });

    // Determinar tipo de pago
    const tipoPago = numero_control !== 'N/A'
      ? 'Estudiante'
      : 'Investigadores, profesores y público en general';

    // Formatear monto con Intl.NumberFormat
    const montoFormateado = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(costo);

    // Construir cadena de pago
    const pagoTexto = `${montoFormateado} (${costo_letras} PESOS 00/100 M.N.)`;

    // Año actual
    const anio = new Date().getFullYear();

    // Datos para el PDF
    const datosPDF = {
      vigencia: fecha_vencimiento,
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