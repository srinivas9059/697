'use server';

/**
 * @fileOverview A flow to generate an initial city grid layout based on a text prompt.
 *
 * - suggestInitialMapLayout - A function that handles the generation of the initial map layout.
 * - SuggestInitialMapLayoutInput - The input type for the suggestInitialMapLayout function.
 * - SuggestInitialMapLayoutOutput - The return type for the suggestInitialMapLayout function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestInitialMapLayoutInputSchema = z.object({
  cityDescription: z
    .string()
    .describe(
      'A description of the city grid layout including the size and density of different areas.'
    ),
});
export type SuggestInitialMapLayoutInput = z.infer<
  typeof SuggestInitialMapLayoutInputSchema
>;

const SuggestInitialMapLayoutOutputSchema = z.object({
  gridData: z
    .string()
    .describe(
      'A JSON representation of the city grid layout, where each cell has a type like road, bike lane, pollution zone, charging station, pickup location, or dropoff location.'
    ),
});
export type SuggestInitialMapLayoutOutput = z.infer<
  typeof SuggestInitialMapLayoutOutputSchema
>;

export async function suggestInitialMapLayout(
  input: SuggestInitialMapLayoutInput
): Promise<SuggestInitialMapLayoutOutput> {
  return suggestInitialMapLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInitialMapLayoutPrompt',
  input: {
    schema: z.object({
      cityDescription: z
        .string()
        .describe(
          'A description of the city grid layout including the size and density of different areas.'
        ),
    }),
  },
  output: {
    schema: z.object({
      gridData: z
        .string()
        .describe(
          'A JSON representation of the city grid layout, where each cell has a type like road, bike lane, pollution zone, charging station, pickup location, or dropoff location.'
        ),
    }),
  },
  prompt: `You are a city planner designing a city grid for a sustainable delivery simulation.

Based on the following description, generate a JSON representation of the city grid layout.

Description: {{{cityDescription}}}

The JSON should represent a 2D array where each element is a string representing the cell type. The possible cell types are: road, bike lane, pollution zone, charging station, pickup location, dropoff location.

Ensure the JSON is valid and parsable.
`,
});

const suggestInitialMapLayoutFlow = ai.defineFlow<
  typeof SuggestInitialMapLayoutInputSchema,
  typeof SuggestInitialMapLayoutOutputSchema
>(
  {
    name: 'suggestInitialMapLayoutFlow',
    inputSchema: SuggestInitialMapLayoutInputSchema,
    outputSchema: SuggestInitialMapLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
