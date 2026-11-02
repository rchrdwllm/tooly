import {Box, Text} from 'ink';
import Spinner from 'ink-spinner';
import type {ToolInfo} from '../types.js';

const MAX_INPUT = 80;

function summarize(input: unknown) {
  const text = JSON.stringify(input) ?? '';
  return text.length > MAX_INPUT ? `${text.slice(0, MAX_INPUT)}…` : text;
}

export function ToolCall({tool}: {tool: ToolInfo}) {
  return (
    <Box marginLeft={2} marginBottom={1}>
      {tool.status === 'running' ? (
        <Text color="yellow">
          <Spinner type="dots" />
        </Text>
      ) : (
        <Text color={tool.status === 'done' ? 'green' : 'red'}>{tool.status === 'done' ? '✔' : '✖'}</Text>
      )}
      <Text> {tool.name}</Text>
      <Text dimColor> {summarize(tool.input)}</Text>
    </Box>
  );
}
