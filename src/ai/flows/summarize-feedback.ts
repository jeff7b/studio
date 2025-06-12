'use server';

/**
 * @fileOverview Summarizes feedback for a given team member.
 *
 * - summarizeFeedback - A function that summarizes feedback for a given team member.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee to summarize feedback for.'),
  selfReview: z.string().describe('The self-review text provided by the employee.'),
  peerReviews: z.array(z.string()).describe('An array of peer review texts for the employee.'),
});
export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the feedback for the employee, highlighting key areas for improvement.'),
});
export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are a helpful AI assistant that summarizes employee feedback for team leaders.

  Summarize the following feedback for {{employeeName}}, highlighting key areas for improvement.

  Self-Review:
  {{selfReview}}

  Peer Reviews:
  {{#each peerReviews}}
  - {{{this}}}
  {{/each}}
  `,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
