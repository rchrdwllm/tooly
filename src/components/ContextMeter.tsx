import {Box, Text} from 'ink';
import {THRESHOLD} from '../agent/compaction/constants.js';

const BAR_WIDTH = 20;
const WARN_RATIO = 0.6;

interface Props {
  used: number | null;
  limit: number;
}

const formatTokens = (tokens: number) => `${(tokens / 1000).toFixed(1)}k`;

export function ContextMeter({used, limit}: Props) {
  if (used === null) return null;

  const ratio = Math.min(used / limit, 1);
  const filled = Math.round(ratio * BAR_WIDTH);
  // Red starts at the same point compaction triggers.
  const color = ratio > THRESHOLD ? 'red' : ratio >= WARN_RATIO ? 'yellow' : 'green';

  return (
    <Box paddingX={1}>
      <Text dimColor>context </Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text dimColor>{'░'.repeat(BAR_WIDTH - filled)}</Text>
      <Text dimColor>
        {` ${formatTokens(used)} / ${formatTokens(limit)} (${Math.round(ratio * 100)}%)`}
      </Text>
    </Box>
  );
}
