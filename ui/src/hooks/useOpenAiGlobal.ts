import { useState, useEffect } from 'react';
import type { WidgetState } from '../types';

export function useOpenAiGlobal() {
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [widgetState, setWidgetStateLocal] = useState<WidgetState>({
    savedPaperIds: [],
    readPaperIds: []
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'toolOutput') {
        setIsLoading(false);
        setError(null);
        try {
          const output = typeof event.data.output === 'string'
            ? JSON.parse(event.data.output)
            : event.data.output;
          setToolOutput(output);
        } catch (e) {
          setError('Failed to parse tool output');
          console.error('Parse error:', e);
        }
      }

      if (event.data.type === 'widgetState') {
        setWidgetStateLocal(event.data.state || { savedPaperIds: [], readPaperIds: [] });
      }

      if (event.data.type === 'theme') {
        setTheme(event.data.theme || 'light');
      }

      if (event.data.type === 'error') {
        setIsLoading(false);
        setError(event.data.message || 'An error occurred');
      }
    };

    window.addEventListener('message', handleMessage);

    if (window.openai?.toolOutput) {
      try {
        const output = typeof window.openai.toolOutput === 'string'
          ? JSON.parse(window.openai.toolOutput)
          : window.openai.toolOutput;
        setToolOutput(output);
      } catch (e) {
        console.error('Initial parse error:', e);
      }
    }

    if (window.openai?.widgetState) {
      setWidgetStateLocal(window.openai.widgetState);
    }

    if (window.openai?.theme) {
      setTheme(window.openai.theme);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const callTool = async (toolName: string, args: any) => {
    setIsLoading(true);
    setError(null);

    if (window.openai?.callTool) {
      try {
        await window.openai.callTool(toolName, args);
      } catch (e) {
        setIsLoading(false);
        setError(e instanceof Error ? e.message : 'Tool call failed');
      }
    } else {
      setIsLoading(false);
      setError('OpenAI global not available');
    }
  };

  const updateWidgetState = async (state: Partial<WidgetState>) => {
    const newState = { ...widgetState, ...state };
    setWidgetStateLocal(newState);

    if (window.openai?.setWidgetState) {
      await window.openai.setWidgetState(newState);
    }
  };

  const openExternal = (href: string) => {
    if (window.openai?.openExternal) {
      window.openai.openExternal({ href });
    } else {
      window.open(href, '_blank');
    }
  };

  const sendFollowUpMessage = (prompt: string) => {
    if (window.openai?.sendFollowUpMessage) {
      window.openai.sendFollowUpMessage({ prompt });
    }
  };

  return {
    toolOutput,
    widgetState,
    theme,
    isLoading,
    error,
    callTool,
    updateWidgetState,
    openExternal,
    sendFollowUpMessage
  };
}
