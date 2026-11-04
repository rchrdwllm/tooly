import {Box, Text, useInput} from 'ink';
import type {PendingApproval} from '../types.js';

export function Approval({approval}: {approval: PendingApproval}) {
  useInput(input => {
    const key = input.toLowerCase();
    if (key === 'y') approval.decide(true);
    if (key === 'n') approval.decide(false);
  });

  return (
    <Box flexDirection="column" marginLeft={2} marginBottom={1}>
      <Text color="yellow">Allow {approval.name}?</Text>
      <Text dimColor>{JSON.stringify(approval.input, null, 2)}</Text>
      <Text>
        <Text color="green">[y]</Text> allow  <Text color="red">[n]</Text> deny
      </Text>
    </Box>
  );
}
