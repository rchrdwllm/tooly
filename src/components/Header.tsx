import {Box, Text} from 'ink';
import {Logo} from './Logo.js';

export function Header() {
  return (
    <Box flexDirection="column" paddingX={1} marginBottom={1} alignSelf="flex-start">
      <Logo />
      <Box marginTop={1} flexDirection="column">
        <Text>your little toolbox agent</Text>
        <Text dimColor>Enter to send  ·  Ctrl+C or /exit to quit</Text>
      </Box>
    </Box>
  );
}
