import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

/**
 * Convierte una imagen a Base64
 */
function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).substring(1);
        return `data:image/${ext};base64,${base64Image}`;
    } catch (error) {
        console.error('Error al convertir imagen a base64:', error);
        return null;
    }
}

/**
 * Genera el PDF de referencia de pago
 * @param {Object} datos - Datos para la referencia de pago
 * @param {string} datos.vigencia - Fecha de vigencia (formato: dd/mm/yyyy)
 * @param {string} datos.pagoInscripcion - Descripción de quien hace el pago (Ej: "Estudiante", "Profesionista")
 * @param {string} datos.referencia - Número de referencia bancaria
 * @param {string} datos.pago - Monto y descripción del pago (Ej: "$300.00 (TRESCIENTOS PESOS 00/100 M.N.)")
 * @param {number} datos.anio - Año del congreso
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function generarReferenciaPagoPDF(datos) {
    try {
        // Leer la plantilla
        const templatePath = path.join(process.cwd(), 'templates', 'referencia-pago.hbs');
        const templateHTML = fs.readFileSync(templatePath, 'utf-8');

        // Convertir imágenes a Base64
        const logoITTPath = path.join(process.cwd(), 'public', 'images', 'logo-itt.png');
        const logoITT = imageToBase64(logoITTPath);

        // Agregar las imágenes a los datos
        const datosConImagenes = {
            ...datos,
            logoITT
        };
        // Compilar la plantilla con Handlebars
        const template = Handlebars.compile(templateHTML);
        const html = template(datosConImagenes);

        // Iniciar Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generar el PDF
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
                top: '1.5cm',
                right: '2cm',
                bottom: '1.5cm',
                left: '2cm'
            }
        });

        await browser.close();

        return pdfBuffer;
    } catch (error) {
        console.error('Error al generar PDF de referencia de pago:', error);
        throw error;
    }
}
