# Tooly

![Tooly logo](assets/logo-black.png)

A terminal chat agent built with [Ink](https://github.com/vadimdemedes/ink) and the [Vercel AI SDK](https://ai-sdk.dev). Tooly talks to Google Gemini (`gemini-3.5-flash-lite`) and can call tools to work with your files, run shell commands, and search the web (via [Exa](https://exa.ai)).

## Features

- Interactive chat UI in the terminal
- Tool calling with live status for each call
- User approval prompt before destructive actions (`deleteFile`, `shell`)
- Automatic context compaction when the conversation nears the model's context limit, with a context meter in the UI
- Evals for tool routing, tool arguments, multi-turn behavior, and context compaction, run with [Laminar](https://www.lmnr.ai) (see [Evaluation](#evaluation))

## Tools

| Tool | Description | Approval |
| --- | --- | --- |
| `dateTime` | Get the current date and time (ISO) | No |
| `listFiles` | List files in a directory | No |
| `readFile` | Read a file's contents | No |
| `writeFile` | Create, update, or overwrite a file | No |
| `deleteFile` | Delete a file | Yes |
| `shell` | Run a shell command on the host machine | Yes |
| `webSearch` | Web search powered by Exa | No |

## Requirements

- Node.js 20+ (or Bun)
- A [Google AI Studio API key](https://aistudio.google.com/apikey) for Gemini
- An [Exa API key](https://dashboard.exa.ai/api-keys) for web search
- A [Laminar](https://www.lmnr.ai) project API key (only needed to run evals)

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
EXA_API_KEY=your_key_here
LMNR_PROJECT_API_KEY=your_key_here # evals only
```

## Usage

```bash
# Run from source
npm run dev

# Or build and run
npm run build
npm start
```

The build also exposes a `tooly` binary (`dist/cli.js`) through the `bin` field in `package.json`. Run `npm link` to use it as `tooly` from anywhere.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run the CLI from source with `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled CLI |
| `npm run typecheck` | Type-check without emitting |
| `npm run generate:logo` | Regenerate the terminal logo from `assets/logo.png` |
| `npm run eval` | Run the evals in `evals/` |

## Evaluation

Evals run with [Laminar](https://www.lmnr.ai) via `npm run eval` (or `bun run eval`). Each suite lives in `evals/evaluators/` with its dataset in `evals/data/`.

| Suite | Cases | Metric | Score |
| --- | --- | --- | --- |
| Tool routing | 8 | Correct tool chosen for the request | 0.875 |
| Multi-turn agent | 9 | Forbidden tools avoided | 1.00 |
| Multi-turn agent | 9 | Expected tool arguments | 1.00 |
| Multi-turn agent | 9 | Efficiency | 1.00 |
| Multi-turn agent | 9 | Output quality (LLM judge) | 0.99 |
| File tools | 5 | Tool selection / argument correctness | 1.00 / 1.00 |
| Date/time | 1 | Tool selection | 1.00 |
| Compaction | 1 | Fact retention after compaction | 1.00 |

Notes:

- Model under test: Gemini (`gemini-3.5-flash-lite`). The LLM judge uses the same model.
- Results are from a single run on 2026-11-05. LLM output is non-deterministic, so scores can vary between runs.
- The date/time and compaction suites have one case each, so treat them as smoke tests rather than reliable measurements.
- The one tool-routing miss is still being investigated.
- Web search now uses Exa instead of Groq's built-in browser search. Eval cases reference the `webSearch` tool by name, so they apply to either backend.

## Project structure

```
src/
  cli.tsx          Entry point
  app.tsx          Main Ink app and chat state
  components/      UI components (input, messages, approvals, header, ...)
  agent/
    run.ts         Agent loop and tool approval handling
    model.ts       Model configuration
    system/        System prompt
    compaction/    Context compaction
    tools/         Tool definitions
evals/             Datasets, executor, evaluators, and scorers
scripts/           Utility scripts (logo generation)
```

## Safety

The `shell` tool runs commands directly on your machine. Tooly asks for your approval before running a shell command or deleting a file, so review each request before accepting it.
