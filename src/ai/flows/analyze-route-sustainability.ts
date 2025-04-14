'use server';
/**
 * @fileOverview A route sustainability analysis AI agent.
 *
 * - analyzeRouteSustainability - A function that handles the route sustainability analysis process.
 * - AnalyzeRouteSustainabilityInput - The input type for the analyzeRouteSustainability function.
 * - AnalyzeRouteSustainabilityOutput - The return type for the analyzeRouteSustainability function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeRouteSustainabilityInputSchema = z.object({
  routeDescription: z.string().describe('A detailed description of the route taken by the agent, including the types of zones traversed (e.g., road, bike lane, pollution zone) and their sequence.'),
  distance: z.number().describe('The total distance of the route in meters.'),
  energyConsumption: z.number().describe('The total energy consumed during the route.'),
  pollutionZonesAvoided: z.number().describe('Number of pollution zones avoided.'),
  bikeLanesUtilized: z.number().describe('Number of bike lanes utilized.'),
});
export type AnalyzeRouteSustainabilityInput = z.infer<typeof AnalyzeRouteSustainabilityInputSchema>;

const AnalyzeRouteSustainabilityOutputSchema = z.object({
  summary: z.string().describe('A textual summary analyzing the sustainability of the route, highlighting key factors like pollution zone avoidance and bike lane utilization.'),
  sustainabilityScore: z.number().describe('A numerical score representing the overall sustainability of the route, considering factors like energy consumption, pollution avoidance, and use of green infrastructure.'),
});
export type AnalyzeRouteSustainabilityOutput = z.infer<typeof AnalyzeRouteSustainabilityOutputSchema>;

export async function analyzeRouteSustainability(input: AnalyzeRouteSustainabilityInput): Promise<AnalyzeRouteSustainabilityOutput> {
  return analyzeRouteSustainabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRouteSustainabilityPrompt',
  input: {
    schema: z.object({
      routeDescription: z.string().describe('A detailed description of the route taken by the agent, including the types of zones traversed (e.g., road, bike lane, pollution zone) and their sequence.'),
      distance: z.number().describe('The total distance of the route in meters.'),
      energyConsumption: z.number().describe('The total energy consumed during the route.'),
      pollutionZonesAvoided: z.number().describe('Number of pollution zones avoided.'),
      bikeLanesUtilized: z.number().describe('Number of bike lanes utilized.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A textual summary analyzing the sustainability of the route, highlighting key factors like pollution zone avoidance and bike lane utilization.'),
      sustainabilityScore: z.number().describe('A numerical score representing the overall sustainability of the route, considering factors like energy consumption, pollution avoidance, and use of green infrastructure.'),
    }),
  },
  prompt: `You are an expert in sustainability analysis, specializing in evaluating the environmental impact of transportation routes. Given the following information about a route, provide a concise textual summary of its sustainability, highlighting key factors such as pollution zone avoidance and bike lane utilization. Also provide a sustainability score for the route.

Route Description: {{{routeDescription}}}
Total Distance: {{{distance}}} meters
Energy Consumption: {{{energyConsumption}}}
Pollution Zones Avoided: {{{pollutionZonesAvoided}}}
Bike Lanes Utilized: {{{bikeLanesUtilized}}}

Please provide a summary and a sustainability score. The sustainability score should be higher the more bike lanes are utilized and pollution zones are avoided, and should be lower when energy consumption and distance is high.`,
});

const analyzeRouteSustainabilityFlow = ai.defineFlow<
  typeof AnalyzeRouteSustainabilityInputSchema,
  typeof AnalyzeRouteSustainabilityOutputSchema
>(
  {
    name: 'analyzeRouteSustainabilityFlow',
    inputSchema: AnalyzeRouteSustainabilityInputSchema,
    outputSchema: AnalyzeRouteSustainabilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
