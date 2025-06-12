'use server';

/**
 * @fileOverview This flow identifies potential areas of improvement from combined self and peer reviews.
 *
 * - identifyImprovementAreas - A function that analyzes review data and identifies areas for improvement.
 * - IdentifyImprovementAreasInput - The input type for the identifyImprovementAreas function.
 * - IdentifyImprovementAreasOutput - The return type for the identifyImprovementAreas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyImprovementAreasInputSchema = z.object({
  selfReview: z
    .string()
    .describe('The text content of the self review.'),
  peerReviews: z
    .array(z.string())
    .describe('An array of text contents from peer reviews.'),
});

export type IdentifyImprovementAreasInput = z.infer<
  typeof IdentifyImprovementAreasInputSchema
>;

const IdentifyImprovementAreasOutputSchema = z.object({
  keyImprovementAreas: z
    .array(z.string())
    .describe('A list of key areas for improvement identified from the reviews.'),
  sentimentAnalysis: z
    .string()
    .describe('A summary of the overall sentiment from the reviews.'),
});

export type IdentifyImprovementAreasOutput = z.infer<
  typeof IdentifyImprovementAreasOutputSchema
>;

export async function identifyImprovementAreas(
  input: IdentifyImprovementAreasInput
): Promise<IdentifyImprovementAreasOutput> {
  return identifyImprovementAreasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyImprovementAreasPrompt',
  input: {schema: IdentifyImprovementAreasInputSchema},
  output: {schema: IdentifyImprovementAreasOutputSchema},
  prompt: `Analyze the following self-review and peer reviews to identify key areas for improvement and provide an overall sentiment analysis.

Self-Review: {{{selfReview}}}

Peer Reviews:
{{#each peerReviews}}- {{{this}}}
{{/each}}

Based on these reviews, identify 3-5 key areas for improvement and provide a summary of the overall sentiment. Return a list of key improvement areas. Ensure that each improvement area is specific and actionable.

Output should be structured as a JSON object:
{
  "keyImprovementAreas": ["Improvement Area 1", "Improvement Area 2", ...],
  "sentimentAnalysis": "Overall sentiment analysis summary"
}
`,
});

const identifyImprovementAreasFlow = ai.defineFlow(
  {
    name: 'identifyImprovementAreasFlow',
    inputSchema: IdentifyImprovementAreasInputSchema,
    outputSchema: IdentifyImprovementAreasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
