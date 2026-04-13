import type { APIRoute } from 'astro';
import { CRON_SECRET, RESEND_TOKEN } from 'astro:env/server';
import { Resend } from 'resend';
import { supabaseClient } from '../../../db/config';
import { createXlsx, type ConfirmRow } from '../../../utils';

const MADRID_TIMEZONE = 'Europe/Madrid';

const isAuthorized = (request: Request) => {
  if (!CRON_SECRET) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${CRON_SECRET}`;
};

const isMondayAtNoonInMadrid = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: MADRID_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value.toLowerCase()])
  );

  const hour = Number(values.hour);
  const minute = Number(values.minute);

  return (
    values.weekday === 'lun' && hour === 12 && minute >= 10 && minute <= 15
  );
};

const sendWeeklyConfirmationEmail = async () => {
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
    to: ['arantxacr12@hotmail.com', 'luquica1992@gmail.com'],
    cc: ['rubenjuanmolinawd@gmail.com'],
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

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), {
      status: 401,
    });
  }

  if (!isMondayAtNoonInMadrid()) {
    return new Response(
      JSON.stringify({
        message: 'Cron omitido fuera de la ventana semanal de Europe/Madrid',
        ok: true,
      }),
      {
        status: 202,
      }
    );
  }

  return sendWeeklyConfirmationEmail();
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), {
      status: 401,
    });
  }

  return sendWeeklyConfirmationEmail();
};
