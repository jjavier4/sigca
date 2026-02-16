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
    const templateName = tipo === 'ACEPTADO' 
      ? 'dictamen-aceptado.hbs' 
      : 'dictamen-rechazado.hbs';
    
    const templatePath = path.join(process.cwd(), 'templates', templateName);
    const templateHTML = fs.readFileSync(templatePath, 'utf-8');
    
    const logoITTPath = path.join(process.cwd(), 'public', 'images', 'logo-itt.png');
    const logoITT = imageToBase64(logoITTPath);
    
    const datosConImagenes = {
      ...datos,
      logoITT
    };
    
    const template = Handlebars.compile(templateHTML);
    const html = template(datosConImagenes);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter', 
      printBackground: true,
      margin: {
        top: '2.54cm',    
        right: '2.54cm',  
        bottom: '2.54cm', 
        left: '2.54cm'    
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
}
