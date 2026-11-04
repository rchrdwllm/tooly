import {fileURLToPath} from 'node:url';
import {Box, Text} from 'ink';
import Image, {useTerminalInfo} from 'ink-picture';
import {LOGO_PIXELS} from '../generated/logo.js';

// Resolves to <package root>/assets/logo.png from both src/ and dist/.
const FULL = fileURLToPath(new URL('../../assets/logo.png', import.meta.url));

type Run = {text: string; fg?: string; bg?: string};

// Each terminal row covers two pixel rows using "▀": fg = top pixel, bg = bottom pixel.
function toRuns(top: string[], bottom: string[]): Run[] {
  const runs: Run[] = [];
  top.forEach((t, x) => {
    const b = bottom[x] ?? '';
    let text = ' ';
    let fg: string | undefined;
    let bg: string | undefined;
    if (t && b) [text, fg, bg] = ['▀', `#${t}`, `#${b}`];
    else if (t) [text, fg] = ['▀', `#${t}`];
    else if (b) [text, fg] = ['▄', `#${b}`];
    const last = runs[runs.length - 1];
    if (last && last.fg === fg && last.bg === bg) last.text += text;
    else runs.push({text, fg, bg});
  });
  return runs;
}

function HalfBlockLogo() {
  const lines: Run[][] = [];
  for (let y = 0; y < LOGO_PIXELS.length; y += 2) {
    lines.push(toRuns(LOGO_PIXELS[y]!, LOGO_PIXELS[y + 1] ?? []));
  }
  return (
    <Box flexDirection="column">
      {lines.map((runs, i) => (
        <Text key={i}>
          {runs.map((r, j) => (
            <Text key={j} color={r.fg} backgroundColor={r.bg}>
              {r.text}
            </Text>
          ))}
        </Text>
      ))}
    </Box>
  );
}

// Full-resolution image where the terminal supports a graphics protocol,
// otherwise our own crisp half-block rendering (ink-picture's half-block mode
// blurs and mis-renders transparent PNGs).
export function Logo() {
  const info = useTerminalInfo();
  const graphical = info.supportsKittyGraphics || info.supportsITerm2Graphics || info.supportsSixelGraphics;

  if (!graphical) return <HalfBlockLogo />;
  return (
    <Image
      src={FULL}
      width={LOGO_PIXELS[0]!.length}
      height={LOGO_PIXELS.length / 2}
      objectFit="contain"
      alt="tooly"
    />
  );
}
