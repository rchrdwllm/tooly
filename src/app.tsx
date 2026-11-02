import { useRef, useState } from 'react';
import { Box, Static, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { Header } from './components/Header.js';
import { Message } from './components/Message.js';
import { ToolCall } from './components/ToolCall.js';
import { ChatInput } from './components/ChatInput.js';
import type { Agent } from './agent/index.js';
import type { ChatMessage, ToolInfo } from './types.js';
import { runAgent } from './agent/run.js';
import 'dotenv/config';

export function App({agent = runAgent}: {agent?: Agent}) {
  const {exit} = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null); // null = idle
  const [pendingTools, setPendingTools] = useState<Record<string, ToolInfo>>({}); // by toolCallId
  const nextId = useRef(0);

  const busy = streaming !== null;

  const submit = async (raw: string) => {
    const prompt = raw.trim();
    if (!prompt) return;
    if (prompt === '/exit') return exit();

    const history = messages;
    const userMessage: ChatMessage = {id: nextId.current++, role: 'user', content: prompt};
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreaming('');

    let reply = '';
    const running = new Map<string, ToolInfo>();
    const commit = (message: Omit<ChatMessage, 'id'>) =>
      setMessages(prev => [...prev, {...message, id: nextId.current++}]);
    const flushText = () => {
      if (reply.trim()) commit({role: 'assistant', content: reply.trim()});
      reply = '';
      setStreaming('');
    };
    const finishTool = (id: string, status: 'done' | 'error') => {
      const tool = running.get(id);
      if (!tool) return;
      running.delete(id);
      setPendingTools(({[id]: _, ...rest}) => rest);
      commit({role: 'tool', content: '', tool: {...tool, status}});
    };

    try {
      for await (const event of agent([...history, userMessage])) {
        switch (event.type) {
          case 'text':
            reply += event.text;
            setStreaming(reply);
            break;
          case 'tool-call': {
            flushText(); // keep text and tool calls in the order they happened
            const tool: ToolInfo = {name: event.name, input: event.input, status: 'running'};
            running.set(event.id, tool);
            setPendingTools(prev => ({...prev, [event.id]: tool}));
            break;
          }
          case 'tool-result':
            finishTool(event.id, 'done');
            break;
          case 'tool-error':
            finishTool(event.id, 'error');
            break;
        }
      }
    } catch (error) {
      reply += `${reply ? '\n' : ''}Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    for (const id of [...running.keys()]) finishTool(id, 'error');
    flushText();
    setStreaming(null);
  };

  return (
    <Box flexDirection="column">
      {/* Static renders each finished message once, so history never re-renders. */}
      <Static items={[{id: -1} as ChatMessage, ...messages]}>
        {m => (m.id === -1 ? <Header key="header" /> : <Message key={m.id} message={m} />)}
      </Static>

      {Object.entries(pendingTools).map(([id, tool]) => (
        <ToolCall key={id} tool={tool} />
      ))}

      {busy &&
        (streaming ? (
          <Message message={{role: 'assistant', content: streaming}} />
        ) : Object.keys(pendingTools).length > 0 ? null : (
          <Box marginBottom={1}>
            <Text color="magenta">
              <Spinner type="dots" />
            </Text>
            <Text dimColor> Thinking…</Text>
          </Box>
        ))}

      <ChatInput value={input} disabled={busy} onChange={setInput} onSubmit={submit} />
    </Box>
  );
}
