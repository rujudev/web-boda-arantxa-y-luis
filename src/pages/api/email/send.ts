import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { supabaseClient } from '../../../db/config';
import { createXlsx } from '../../../utils';

const resend = new Resend('re_V1GeByLb_75bEiX6FTrHLxTpfGeDX3G5a');

export const POST: APIRoute = async ({ request }) => {
  const { data, error } = await supabaseClient.from('confirms_export').select();

  console.log(resend.apiKeys.list());
  const confirms = data?.map((confirm) => ({
    ...confirm,
    attending: confirm.attending ? 'Sí' : 'No',
  }));

  const bufferConfirmaciones = await createXlsx(confirms);

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'onboarding@resend.dev',
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

  console.log({ emailData, emailError });

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
