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

export async function generarDictamenPDF(tipo, datos) {
  try {
    // Determinar qué plantilla usar
    const templateName = tipo === 'ACEPTADO' 
      ? 'dictamen-aceptado.hbs' 
      : 'dictamen-rechazado.hbs';
    
    // Leer la plantilla
    const templatePath = path.join(process.cwd(), 'templates', templateName);
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
    
    // Generar el PDF con configuración similar a Word
    const pdfBuffer = await page.pdf({
      format: 'Letter', // Tamaño carta (común en México)
      printBackground: true,
      margin: {
        top: '2.54cm',    // 1 pulgada
        right: '2.54cm',  // 1 pulgada
        bottom: '2.54cm', // 1 pulgada
        left: '2.54cm'    // 1 pulgada
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
}
