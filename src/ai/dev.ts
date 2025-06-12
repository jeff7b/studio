import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-feedback.ts';
import '@/ai/flows/generate-review-questions.ts';
import '@/ai/flows/identify-improvement-areas.ts';