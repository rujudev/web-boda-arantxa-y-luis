import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';
import { HOST } from 'astro:env/client';
import { supabaseClient } from '../db/config';

export const server = {
  confirmAssist: defineAction({
    accept: 'form',
    input: z
      .object({
        full_name: z.string().trim().min(1),
        email: z
          .string()
          .trim()
          .optional()
          .transform((value) => value || undefined)
          .pipe(z.string().email().optional()),
        attending: z.enum(['yes', 'no']),
        guest_count: z.preprocess((value) => {
          if (value === '' || value === null || value === undefined) {
            return undefined;
          }

          return value;
        }, z.coerce.number().int().min(1).max(10).optional()),
        allergy_gluten: z.coerce.boolean().default(false),
        allergy_lactose: z.coerce.boolean().default(false),
        allergy_vegetarian: z.coerce.boolean().default(false),
        allergy_vegan: z.coerce.boolean().default(false),
        allergy_nuts: z.coerce.boolean().default(false),
        allergy_seafood: z.coerce.boolean().default(false),
        allergy_other: z.string().trim().optional(),
        message: z.string().trim().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.attending === 'yes' && data.guest_count === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guest_count'],
            message: 'El numero de invitados es obligatorio si asistes',
          });
        }
      }),
    handler: async (input) => {
      const isAttending = input.attending === 'yes';

      const payload = {
        ...input,
        attending: isAttending,
        guest_count: isAttending ? input.guest_count : null,
        email: input.email || null,
        allergy_other: input.allergy_other || null,
        message: input.message || null,
      };

      const { error } = await supabaseClient.from('confirms').insert(payload);

      const whatsappResponse = await fetch(`${HOST}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assistant: payload }),
      });

      const emailResponse = await fetch(`${HOST}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: !error && emailResponse.ok && whatsappResponse.ok,
        message:
          error && !emailResponse.ok && !whatsappResponse.ok
            ? 'Ha ocurrido un error al enviar la confirmación'
            : 'Confirmación enviada correctamente',
      };
    },
  }),
};
