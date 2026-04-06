import type { APIRoute } from 'astro';
import { RESEND_TOKEN } from 'astro:env/server';
import { Resend } from 'resend';
import { supabaseClient } from '../../../db/config';
import { createXlsx, type ConfirmRow } from '../../../utils';

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_TOKEN) {
    return new Response(
      JSON.stringify({ message: 'Token de Resend no configurado' }),
      {
        status: 500,
      }
    );
  }

  const resend = new Resend(RESEND_TOKEN);

  const { data, error } = await supabaseClient.from('confirms_export').select();

  if (error) {
    error;
    return new Response(
      JSON.stringify({ message: 'Error al obtener las confirmaciones', error }),
      {
        status: 500,
      }
    );
  }

  const confirms: ConfirmRow[] | undefined = data?.map((confirm) => ({
    ...confirm,
    attending: confirm.attending ? 'Sí' : 'No',
  }));

  const bufferConfirmaciones = await createXlsx(confirms);

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'Web Boda Arantxa y Luis <confirmacion@labodadeluisyarantxa.es>',
    to: ['rubenjuanmolinawd@gmail.com'],
    subject: 'Documento excel con las confirmaciones para vuestra boda ❤️📩',
    text: 'Espero que os sirva mucho mucho ❤️',
    attachments: [
      {
        filename: 'confirmaciones.xlsx',
        content: Buffer.from(bufferConfirmaciones),
      },
    ],
  });

  const response = {
    message:
      emailError && !emailData
        ? 'Ha ocurrido un error al enviar el email'
        : 'Email enviado con éxito',
    ok: !emailError && !!emailData,
    status: emailError && !emailData ? 400 : 200,
  };

  return new Response(JSON.stringify(response));
};
