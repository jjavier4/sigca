// lib/email.js
import nodemailer from 'nodemailer';

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Envía un correo electrónico a uno o varios destinatarios
 * @param {string|string[]} to - Correo(s) del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML del correo
 * @param {string} text - Contenido de texto plano (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    // Convertir 'to' a array si es un string
    const recipients = Array.isArray(to) ? to : [to];
    
    // Validar que hay destinatarios
    if (recipients.length === 0) {
      throw new Error('No se especificaron destinatarios');
    }

    // Validar formato de correos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      throw new Error(`Correos inválidos: ${invalidEmails.join(', ')}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients.join(', '),
      subject: subject,
      text: text || '',
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo enviado:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      recipients: recipients,
    };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Plantilla: Confirmación de propuesta recibida
 */
export function emailPropuestaRecibida({ nombreAutor, tituloTrabajo }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Propuesta Recibida!</h1>
            <p>SIGCA - Sistema de Gestión de Conferencias Académicas</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${nombreAutor},</h2>
            <p>Hemos recibido exitosamente su propuesta para el <strong>Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería (CIIDiCI)</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Detalles de su propuesta:</h3>
              <p><strong>Título:</strong> ${tituloTrabajo}</p>
              <p><strong>Estado:</strong> En revisión</p>
            </div>

            <p>Su trabajo será evaluado por nuestro comité de revisores. Le notificaremos por este medio cuando haya actualizaciones sobre el estado de su propuesta.</p>

            <p>Puede consultar el estado de su propuesta en cualquier momento ingresando a su panel de autor.</p>

            <a href="${process.env.NEXTAUTH_URL}/ciidici/auth" class="button">Ver mis propuestas</a>

            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>

            <p>Atentamente,<br>
            <strong>Comité Organizador CIIDiCI</strong><br>
            Instituto Tecnológico de Toluca</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Estimado/a ${nombreAutor},
    
    Hemos recibido su propuesta "${tituloTrabajo}".
    Su trabajo está en proceso de revisión.
    
    Comité Organizador CIIDiCI
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}

/**
 * Plantilla: Invitación a revisor
 */
export function emailInvitacionRevisor({ nombreRevisor }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invitación como Revisor</h1>
            <p>CIIDiCI - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${nombreRevisor},</h2>
            <p>Es un honor invitarle a participar como <strong>revisor académico</strong> en el próximo <strong>Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería (CIIDiCI)</strong> organizado por el Instituto Tecnológico de Toluca.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Su participación incluirá:</h3>
              <ul>
                <li>Revisión de propuestas académicas en su área de especialización</li>
                <li>Evaluación objetiva siguiendo criterios establecidos</li>
                <li>Retroalimentación constructiva a los autores</li>
                <li>Contribución al fortalecimiento de la investigación científica</li>
              </ul>
            </div>

            <p>Para aceptar esta invitación y registrarse como revisor, por favor acceda a nuestra plataforma SIGCA:</p>

            <a href="${process.env.NEXTAUTH_URL}/auth/registro?rol=REVISOR" class="button">Registrarse como Revisor</a>

            <p>Una vez registrado, podrá acceder al sistema para revisar las propuestas asignadas.</p>

            <p>Agradecemos de antemano su valiosa colaboración.</p>

            <p>Atentamente,<br>
            <strong>Comité Organizador CIIDiCI</strong><br>
            Instituto Tecnológico de Toluca</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Estimado/a ${nombreRevisor},
    
    Le invitamos a participar como revisor en el CIIDiCI.
    
    Para registrarse, acceda a: ${process.env.NEXTAUTH_URL}/auth/registro?rol=REVISOR
    
    Comité Organizador CIIDiCI
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}