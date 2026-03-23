import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';
import { supabaseClient } from '../db/config';

export const server = {
  confirmAssist: defineAction({
    accept: 'form',
    input: z.object({
      full_name: z.string().trim().min(1),
      email: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined)
        .pipe(z.string().email().optional()),
      attending: z.enum(['yes', 'no']).transform((value) => value === 'yes'),
      guest_count: z.coerce.number().int().min(1).max(10),
      allergy_gluten: z.coerce.boolean(),
      allergy_lactose: z.coerce.boolean(),
      allergy_vegetarian: z.coerce.boolean(),
      allergy_vegan: z.coerce.boolean(),
      allergy_nuts: z.coerce.boolean(),
      allergy_seafood: z.coerce.boolean(),
      allergy_other: z.string().trim().optional(),
      message: z.string().trim().optional(),
    }),
    handler: async (input) => {
      const payload = {
        ...input,
        guest_count: input.attending ? input.guest_count : null,
        email: input.email || null,
        allergy_other: input.allergy_other || null,
        message: input.message || null,
      };

      const { error } = await supabaseClient.from('confirms').insert(payload);

      // const whatsappResponse = await fetch(
      //   'http://localhost:4321/api/whatsapp/send',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ assistant: payload }),
      //   }
      // );

      const emailResponse = await fetch(
        'http://localhost:4321/api/email/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: !error && emailResponse.ok,
        message:
          error && !emailResponse.ok
            ? 'Ha ocurrido un error al enviar la confirmación'
            : 'Confirmación enviada correctamente',
      };
    },
  }),
};
