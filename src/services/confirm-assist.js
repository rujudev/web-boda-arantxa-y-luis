import { actions } from "astro:actions";
import { supabaseClient } from "../db/config.js";

export const confirmAssist = async (formData) => {
    const { data: successData, error: errorData } = await actions.confirmAssist(formData);

    if (!errorData) {
        const { data, error } = await supabaseClient.from('confirms').insert(successData);

        if (!error) {
            console.log('Assist confirmed and stored in the database:', data);
        }
    }
}