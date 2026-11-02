import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';

interface Props {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function ChatInput({value, disabled, onChange, onSubmit}: Props) {
  return (
    <Box borderStyle="round" borderColor={disabled ? 'gray' : 'green'} paddingX={1}>
      <Text color={disabled ? 'gray' : 'green'}>{'> '}</Text>
      {disabled ? (
        <Text dimColor>Waiting for agent…</Text>
      ) : (
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Ask the agent anything…"
        />
      )}
    </Box>
  );
}
