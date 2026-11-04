import {Box, Text} from 'ink';
import type {ChatMessage} from '../types.js';
import {ToolCall} from './ToolCall.js';

const STYLE = {
  user: {label: 'You', color: '#FEE786'},
  assistant: {label: 'Agent', color: 'magenta'},
} as const;

export function Message({message}: {message: Pick<ChatMessage, 'role' | 'content' | 'tool'>}) {
  if (message.role === 'tool') return message.tool ? <ToolCall tool={message.tool} /> : null;
  const {label, color} = STYLE[message.role];

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color={color}>
        {label}
      </Text>
      <Text>{message.content}</Text>
    </Box>
  );
}
