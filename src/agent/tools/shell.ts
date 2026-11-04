import { tool } from 'ai';
import shellJs from 'shelljs';
import z from 'zod';

export const shell = tool({
  description: 'Execute shell or terminal commands on the host machine. Use when needed to run commands, scripts, programs, or interact with the operating system.',
  inputSchema: z.object({
    command: z.string().describe("The shell or terminal command to execute.")
  }),
  execute: ({ command }) => {
    const result = shellJs.exec(command, { silent: true });
    let output = "";

    if (result.stderr) {
      output += result.stderr;
    }

    if (result.stdout) {
      output += result.stdout;
    }

    if (result.code !== 0) {
      return `Error executing command: ${result.stderr || result.stdout || 'Unknown error'}\nOutput: ${output}`;
    }

    return output || "Command executed successfully with no output.";
  }
})