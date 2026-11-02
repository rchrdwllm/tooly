import {Box, Text} from 'ink';

const MASCOT = [
  ' ┌─────┐',
  '┌┴─────┴┐',
  '│ ◉   ◉ │',
  '│  ╰─╯  │',
  '└─┬───┬─┘',
  '  └═╤═┘ 🔧',
];

export function Header() {
  return (
    <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
      <Box flexDirection="column" marginRight={2}>
        {MASCOT.map((line, i) => (
          <Text key={i} color="cyan">
            {line}
          </Text>
        ))}
      </Box>
      <Box flexDirection="column" justifyContent="center">
        <Text bold color="cyan">
          Tooly
        </Text>
        <Text>your little toolbox agent</Text>
        <Text dimColor>Enter to send  ·  Ctrl+C or /exit to quit</Text>
      </Box>
    </Box>
  );
}
