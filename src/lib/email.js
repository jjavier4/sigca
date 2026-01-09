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
 * @param {Array} attachments - Archivos adjuntos (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
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
      attachments: attachments // Agregar soporte para adjuntos
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
 * Plantilla: Invitación a revisor (con token de registro)
 */
export function emailInvitacionRevisor({ nombreRevisor, token }) {
  const registroUrl = `${process.env.NEXTAUTH_URL}/auth/register-revisor?token=${token}`;
  
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
          .button { background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .button:hover { background: #e04560; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 5px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .code-box { background: #f8f9fa; padding: 15px; border: 2px dashed #f5576c; text-align: center; font-family: 'Courier New', monospace; font-size: 14px; color: #f5576c; margin: 20px 0; border-radius: 5px; word-break: break-all; }
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

            <p>Para aceptar esta invitación y registrarse como revisor en nuestra plataforma SIGCA, haga clic en el siguiente botón:</p>

            <div style="text-align: center;">
              <a href="${registroUrl}" class="button">Registrarse como Revisor</a>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">O copia y pega este enlace en tu navegador:</p>
            <div class="code-box">${registroUrl}</div>

            <div class="warning">
              <strong>Importante:</strong> Este enlace de invitación es válido por <strong>15 minutos</strong>. Si expira, por favor contacte al comité organizador para solicitar una nueva invitación.
            </div>

            <p>Una vez registrado, recibirá un correo de verificación para activar su cuenta y podrá acceder al sistema para revisar las propuestas asignadas.</p>

            <p>Agradecemos de antemano su valiosa colaboración en este importante evento académico.</p>

            <p>Atentamente,<br>
            <strong>Comité Organizador CIIDiCI</strong><br>
            Instituto Tecnológico de Toluca</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
            <p style="font-size: 10px; color: #999; margin-top: 10px;">
              Si tiene problemas con el enlace, contacte al comité organizador.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Estimado/a ${nombreRevisor},
    
    Le invitamos a participar como revisor académico en el CIIDiCI.
    
    Para registrarse como revisor, acceda a este enlace:
    ${registroUrl}
    
    Este enlace es válido por 15 minutos.
    
    Una vez registrado, recibirá un correo de verificación para activar su cuenta.
    
    Comité Organizador CIIDiCI
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}

/**
 * Plantilla: Dictamen de trabajo aceptado
 */
export function emailTrabajoAceptado({ nombreCompleto, titulo, modalidad, calificacion, anio }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .info-box p { margin: 8px 0; }
          .label { font-weight: bold; color: #059669; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Felicidades!</h1>
            <p>CIIDiCI ${anio} - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">TRABAJO ACEPTADO</span>
            </div>

            <h2>Estimado/a ${nombreCompleto},</h2>
            <p>Nos complace informarle que su trabajo ha sido <strong>ACEPTADO</strong> para su presentación en el CIIDiCI ${anio}.</p>
            
            <div class="info-box">
              <p><span class="label">Título del Trabajo:</span> ${titulo}</p>
              <p><span class="label">Modalidad de Presentación:</span> ${modalidad}</p>
              <p><span class="label">Calificación Final:</span> ${calificacion}%</p>
            </div>

            <p>Le felicitamos por la calidad de su trabajo. Su contribución ha sido evaluada positivamente por nuestro comité de revisores y cumple con los estándares de calidad requeridos para el congreso.</p>
            
            
            <p><strong>El dictamen oficial en formato PDF se adjunta a este correo.</strong></p>

            <p>Agradecemos su participación y esperamos contar con su presencia en el evento.</p>

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
    ¡Felicidades ${nombreCompleto}!
    
    Su trabajo "${titulo}" ha sido ACEPTADO para el CIIDiCI ${anio}.
    
    Modalidad: ${modalidad}
    Calificación Final: ${calificacion}%
    
    Próximamente recibirá más información sobre su presentación.
    
    Comité Organizador CIIDiCI
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}

/**
 * Plantilla: Dictamen de trabajo rechazado
 */
export function emailTrabajoRechazado({ nombreCompleto, titulo, motivo, calificacion, anio }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .badge { background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; }
          .info-box p { margin: 8px 0; }
          .label { font-weight: bold; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resultado de Evaluación</h1>
            <p>CIIDiCI ${anio} - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">TRABAJO NO ACEPTADO</span>
            </div>

            <h2>Estimado/a ${nombreCompleto},</h2>
            <p>Lamentamos informarle que su trabajo <strong>NO HA SIDO ACEPTADO</strong> para su presentación en el CIIDiCI ${anio}.</p>
            
            <div class="info-box">
              <p><span class="label">Título del Trabajo:</span> ${titulo}</p>
              ${calificacion ? `<p><span class="label">Calificación Final:</span> ${calificacion}%</p>` : ''}
              <p><span class="label">Motivo:</span> ${motivo}</p>
            </div>

            <p>Después de una cuidadosa evaluación por parte de nuestro comité de revisores, se ha determinado que su trabajo no cumple con los criterios requeridos para su inclusión en el congreso.</p>

            <p><strong>El dictamen oficial en formato PDF se adjunta a este correo.</strong></p>

            <p>Le agradecemos sinceramente por su interés en participar en el CIIDiCI y le animamos a continuar con su investigación. Le invitamos a considerar las observaciones de los revisores para futuras presentaciones.</p>

            <p>Esperamos contar con su participación en próximas ediciones del congreso.</p>

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
    Estimado/a ${nombreCompleto},
    
    Lamentamos informarle que su trabajo "${titulo}" no ha sido aceptado para el CIIDiCI ${anio}.
    
    ${calificacion ? `Calificación Final: ${calificacion}%` : ''}
    Motivo: ${motivo}
    
    Le agradecemos su participación y le animamos a considerar las observaciones para futuras presentaciones.
    
    Comité Organizador CIIDiCI
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}

/**
 * Plantilla: Verificación de correo electrónico
 */
export function emailVerificacionCuenta({ nombreCompleto, token }) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
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
          .button { background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .button:hover { background: #764ba2; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .code-box { background: #f8f9fa; padding: 15px; border: 2px dashed #667eea; text-align: center; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #667eea; margin: 20px 0; border-radius: 5px; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Verifica tu Correo Electrónico</h1>
            <p>SIGCA - Sistema de Gestión de Conferencias Académicas</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreCompleto}!</h2>
            <p>Gracias por registrarte en <strong>SIGCA</strong>. Para completar tu registro y activar tu cuenta, necesitamos verificar tu correo electrónico.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;"> ¿Cómo verificar tu cuenta?</h3>
              <p>Haz clic en el botón de abajo para verificar tu correo electrónico:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi correo</a>
              </div>
              <p style="margin-top: 20px;">O copia y pega este enlace en tu navegador:</p>
              <div class="code-box">${verificationUrl}</div>
            </div>

            <div class="warning">
              <strong> Importante:</strong> Este enlace de verificación es válido por <strong>15 minutos</strong>. Si expira, puedes solicitar uno nuevo intentando iniciar sesión nuevamente.
            </div>

            <p>Si no te registraste en SIGCA, puedes ignorar este correo de manera segura.</p>

            <p>Atentamente,<br>
            <strong>Equipo SIGCA</strong><br>
            Instituto Tecnológico de Toluca</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
            <p style="font-size: 10px; color: #999; margin-top: 10px;">
              Si tienes problemas con el botón, copia y pega el enlace en tu navegador.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    ¡Hola ${nombreCompleto}!
    
    Gracias por registrarte en SIGCA.
    
    Para verificar tu correo electrónico, visita este enlace:
    ${verificationUrl}
    
    Este enlace es válido por 15 minutos.
    
    Si no te registraste en SIGCA, ignora este correo.
    
    Equipo SIGCA
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}

/**
 * Plantilla: Restablecimiento de contraseña
 */
export function emailRestablecerPassword({ nombreCompleto, token }) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .button:hover { background: #1e40af; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 5px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .code-box { background: #f8f9fa; padding: 15px; border: 2px dashed #3b82f6; text-align: center; font-family: 'Courier New', monospace; font-size: 14px; color: #3b82f6; margin: 20px 0; border-radius: 5px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer Contraseña</h1>
            <p>SIGCA - Sistema de Gestión de Conferencias Académicas</p>
          </div>
          <div class="content">
            <h2>Hola ${nombreCompleto},</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>SIGCA</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">¿Cómo restablecer tu contraseña?</h3>
              <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">O copia y pega este enlace en tu navegador:</p>
              <div class="code-box">${resetUrl}</div>
            </div>

            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por <strong>15 minutos</strong>. Si expira, deberás solicitar un nuevo enlace de restablecimiento.
            </div>

            <p><strong>Si no solicitaste restablecer tu contraseña, ignora este correo.</strong> Tu cuenta permanecerá segura y no se realizará ningún cambio.</p>

            <p>Atentamente,<br>
            <strong>Equipo SIGCA</strong><br>
            Instituto Tecnológico de Toluca</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
            <p style="font-size: 10px; color: #999; margin-top: 10px;">
              Si tienes problemas con el enlace, contacta al soporte técnico.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hola ${nombreCompleto},
    
    Hemos recibido una solicitud para restablecer tu contraseña en SIGCA.
    
    Para restablecer tu contraseña, visita este enlace:
    ${resetUrl}
    
    Este enlace es válido por 15 minutos.
    
    Si no solicitaste esto, ignora este correo.
    
    Equipo SIGCA
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}