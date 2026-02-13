'use server';
/**
 * @fileOverview This file implements a Genkit flow for suggesting medicine compositions.
 *
 * - suggestMedicineComposition - A function that suggests possible matching medicine compositions or standard generic names.
 * - SuggestMedicineCompositionInput - The input type for the suggestMedicineComposition function.
 * - SuggestMedicineCompositionOutput - The return type for the suggestMedicineComposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMedicineCompositionInputSchema = z.object({
  inputComposition: z
    .string()
    .describe('The chemical composition of a medicine entered by the admin.'),
});
export type SuggestMedicineCompositionInput = z.infer<
  typeof SuggestMedicineCompositionInputSchema
>;

const SuggestMedicineCompositionOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        name: z.string().describe('The suggested standard generic name or composition.'),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe('A confidence score (0-1) for the suggestion.'),
      })
    )
    .describe('A list of suggested standard generic names or compositions.'),
});
export type SuggestMedicineCompositionOutput = z.infer<
  typeof SuggestMedicineCompositionOutputSchema
>;

export async function suggestMedicineComposition(
  input: SuggestMedicineCompositionInput
): Promise<SuggestMedicineCompositionOutput> {
  return suggestMedicineCompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMedicineCompositionPrompt',
  input: {schema: SuggestMedicineCompositionInputSchema},
  output: {schema: SuggestMedicineCompositionOutputSchema},
  prompt: `You are an expert in pharmaceutical compositions and generic medicine names.

The admin has provided the following chemical composition for a new medicine: "{{{inputComposition}}}"

Your task is to suggest possible matching standard generic names or recognized chemical compositions based on the input. Provide at least 3 distinct suggestions, ordered by highest confidence.

For each suggestion, provide a 'name' (the suggested composition/generic name) and a 'confidence' score (a number between 0 and 1, where 1 is absolute certainty).

Example Output format:
{{
  "suggestions": [
    {
      "name": "Paracetamol",
      "confidence": 0.95
    },
    {
      "name": "Acetaminophen",
      "confidence": 0.88
    }
  ]
}}
`,
});

const suggestMedicineCompositionFlow = ai.defineFlow(
  {
    name: 'suggestMedicineCompositionFlow',
    inputSchema: SuggestMedicineCompositionInputSchema,
    outputSchema: SuggestMedicineCompositionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
