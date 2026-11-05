import { webSearch as webSearchTool } from '@exalabs/ai-sdk';
import 'dotenv/config';

export const webSearch = webSearchTool({
  apiKey: process.env.EXA_API_KEY || '',
})