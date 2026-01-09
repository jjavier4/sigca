import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: false, 
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
    const recipients = Array.isArray(to) ? to : [to];
    
    if (recipients.length === 0) {
      throw new Error('No se especificaron destinatarios');
    }

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
      attachments: attachments
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #667eea; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .info-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
          }
          .button { 
            display: inline-block;
            background: #667eea; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Propuesta Recibida</h1>
            <p>CIIDiCI - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${nombreAutor}</strong>,</p>
            
            <p>Hemos recibido exitosamente su propuesta para el Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería.</p>
            
            <div class="info-box">
              <p><strong>Título:</strong> ${tituloTrabajo}</p>
              <p><strong>Estado:</strong> En revisión</p>
            </div>

            <p>Su trabajo será evaluado por nuestro comité de revisores. Le notificaremos cuando haya actualizaciones.</p>

            <center>
              <a href="${process.env.NEXTAUTH_URL}/auth" class="button">Ver mis propuestas</a>
            </center>

            <p>Atentamente,<br><strong>Comité Organizador CIIDiCI</strong></p>
          </div>
          <div class="footer">
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #f5576c; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .button { 
            display: inline-block;
            background: #f5576c; 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .link-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 15px 0;
            word-break: break-all;
            font-size: 13px;
            color: #666;
          }
          .warning { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invitación como Revisor</h1>
            <p>CIIDiCI - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${nombreRevisor}</strong>,</p>
            
            <p>Es un honor invitarle a participar como revisor académico en el próximo Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería.</p>
            
            <p>Para aceptar esta invitación y registrarse en la plataforma SIGCA, haga clic en el siguiente botón:</p>

            <center>
              <a href="${registroUrl}" class="button">Registrarse como Revisor</a>
            </center>

            <p>O copie y pegue este enlace en su navegador:</p>
            <div class="link-box">${registroUrl}</div>

            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 15 minutos.
            </div>

            <p>Una vez registrado, recibirá un correo de verificación para activar su cuenta.</p>

            <p>Atentamente,<br><strong>Comité Organizador CIIDiCI</strong></p>
          </div>
          <div class="footer">
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Estimado/a ${nombreRevisor},
    
    Le invitamos a participar como revisor académico en el CIIDiCI.
    
    Para registrarse, acceda a: ${registroUrl}
    
    Este enlace es válido por 15 minutos.
    
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #10b981; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .badge { 
            background: #10b981; 
            color: white; 
            padding: 8px 20px; 
            border-radius: 20px; 
            display: inline-block; 
            font-weight: bold;
            margin: 0 0 20px 0;
          }
          .info-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Felicidades!</h1>
            <p>CIIDiCI ${anio}</p>
          </div>
          <div class="content">
            <center>
              <span class="badge">TRABAJO ACEPTADO</span>
            </center>

            <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
            
            <p>Nos complace informarle que su trabajo ha sido <strong>ACEPTADO</strong> para su presentación en el CIIDiCI ${anio}.</p>
            
            <div class="info-box">
              <p><strong>Título:</strong> ${titulo}</p>
              <p><strong>Modalidad:</strong> ${modalidad}</p>
              <p><strong>Calificación Final:</strong> ${calificacion}%</p>
            </div>

            <p>Le felicitamos por la calidad de su trabajo. El dictamen oficial en formato PDF se adjunta a este correo.</p>

            <p>Atentamente,<br><strong>Comité Organizador CIIDiCI</strong></p>
          </div>
          <div class="footer">
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #dc2626; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .badge { 
            background: #dc2626; 
            color: white; 
            padding: 8px 20px; 
            border-radius: 20px; 
            display: inline-block; 
            font-weight: bold;
            margin: 0 0 20px 0;
          }
          .info-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resultado de Evaluación</h1>
            <p>CIIDiCI ${anio}</p>
          </div>
          <div class="content">
            <center>
              <span class="badge">TRABAJO NO ACEPTADO</span>
            </center>

            <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
            
            <p>Lamentamos informarle que su trabajo no ha sido aceptado para su presentación en el CIIDiCI ${anio}.</p>
            
            <div class="info-box">
              <p><strong>Título:</strong> ${titulo}</p>
              ${calificacion ? `<p><strong>Calificación Final:</strong> ${calificacion}%</p>` : ''}
              <p><strong>Motivo:</strong> ${motivo}</p>
            </div>

            <p>Le agradecemos su interés y le animamos a considerar las observaciones para futuras presentaciones. El dictamen oficial se adjunta a este correo.</p>

            <p>Atentamente,<br><strong>Comité Organizador CIIDiCI</strong></p>
          </div>
          <div class="footer">
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #667eea; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .button { 
            display: inline-block;
            background: #667eea; 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .link-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 15px 0;
            word-break: break-all;
            font-size: 13px;
            color: #666;
          }
          .warning { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verifica tu Correo Electrónico</h1>
            <p>SIGCA - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <p>¡Hola <strong>${nombreCompleto}</strong>!</p>
            
            <p>Gracias por registrarte en SIGCA. Para completar tu registro y activar tu cuenta, necesitamos verificar tu correo electrónico.</p>
            
            <center>
              <a href="${verificationUrl}" class="button">Verificar mi correo</a>
            </center>

            <p>O copia y pega este enlace en tu navegador:</p>
            <div class="link-box">${verificationUrl}</div>

            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 15 minutos.
            </div>

            <p>Si no te registraste en SIGCA, puedes ignorar este correo.</p>

            <p>Atentamente,<br><strong>Equipo SIGCA</strong></p>
          </div>
          <div class="footer">
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    ¡Hola ${nombreCompleto}!
    
    Gracias por registrarte en SIGCA.
    
    Para verificar tu correo electrónico, visita: ${verificationUrl}
    
    Este enlace es válido por 15 minutos.
    
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
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
          }
          .header { 
            background: #3b82f6; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .button { 
            display: inline-block;
            background: #3b82f6; 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .link-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 15px 0;
            word-break: break-all;
            font-size: 13px;
            color: #666;
          }
          .warning { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
          .footer { 
            text-align: center; 
            padding: 20px;
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer Contraseña</h1>
            <p>SIGCA - Instituto Tecnológico de Toluca</p>
          </div>
          <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en SIGCA.</p>
            
            <center>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </center>

            <p>O copia y pega este enlace en tu navegador:</p>
            <div class="link-box">${resetUrl}</div>

            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 15 minutos.
            </div>

            <p><strong>Si no solicitaste restablecer tu contraseña, ignora este correo.</strong> Tu cuenta permanecerá segura.</p>

            <p>Atentamente,<br><strong>Equipo SIGCA</strong></p>
          </div>
          <div class="footer">
            <p>Instituto Tecnológico de Toluca - Sistema SIGCA</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hola ${nombreCompleto},
    
    Hemos recibido una solicitud para restablecer tu contraseña en SIGCA.
    
    Para restablecer tu contraseña, visita: ${resetUrl}
    
    Este enlace es válido por 15 minutos.
    
    Si no solicitaste esto, ignora este correo.
    
    Equipo SIGCA
    Instituto Tecnológico de Toluca
  `;

  return { html, text };
}