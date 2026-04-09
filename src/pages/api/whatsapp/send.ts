import type { APIRoute } from 'astro';
import { WASSENGER_TOKEN } from 'astro:env/server';

const url = 'https://www.wasenderapi.com/api/send-message';
let options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${WASSENGER_TOKEN}`,
  },
  body: '',
};

export const POST: APIRoute = async ({ request }) => {
  const { assistant } = await request.json();

  options = {
    ...options,
    body: JSON.stringify({
      to: '120363161174939335@g.us', // Confirmaciones boda Arantxa y Luis
      text: `${assistant.full_name} ha confirmado que ${assistant.attending ? 'SI' : 'NO'} asistirá el día "${new Date().toLocaleDateString(
        'es-ES',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}"`,
    }),
  };

  const whatsappResponse = await fetch(url, options);

  return new Response(
    JSON.stringify(
      whatsappResponse.status === 201
        ? {
            status: 201,
            ok: true,
            message: 'Whatsapp de confirmación enviado',
          }
        : {
            status: 400,
            ok: false,
            message: 'Ha ocurrido un error al enviar el mensaje',
          }
    )
  );
};
