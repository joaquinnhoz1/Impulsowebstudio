import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido',
    });
  }

  try {
    const { nombre, email, mensaje } = req.body;

    const data = await resend.emails.send({
      from: 'Impulso Web Studio <onboarding@resend.dev>',
      to: 'studioimpulsoweb@gmail.com',
      subject: 'Nuevo mensaje desde tu web',
      html: `
        <h2>Nuevo contacto</h2>

        <p><strong>Nombre:</strong> ${nombre}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Mensaje:</strong></p>

        <p>${mensaje}</p>
      `,
    });

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Error enviando mail',
    });
  }
}