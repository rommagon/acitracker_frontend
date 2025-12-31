import { useEffect, useState } from 'react';
import { useOpenAiGlobal } from './hooks/useOpenAiGlobal';
import { BriefingView } from './components/BriefingView';
import { ExplainPaperView } from './components/ExplainPaperView';
import { Sheet } from './components/Sheet';
import { AskAciTrack } from './components/AskAciTrack';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import type { BriefingData, ExplainPaperData } from './types';

function App() {
  const {
    toolOutput,
    widgetState,
    theme,
    isLoading,
    error,
    callTool,
    updateWidgetState,
    openExternal,
    sendFollowUpMessage
  } = useOpenAiGlobal();

  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [explainData, setExplainData] = useState<ExplainPaperData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  const isBriefing = toolOutput && 'run' in toolOutput && 'must_reads' in toolOutput;
  const isExplanation = toolOutput && 'why_it_matters' in toolOutput;

  // Update briefing data when we get it
  useEffect(() => {
    if (isBriefing) {
      setBriefingData(toolOutput as BriefingData);
    }
  }, [isBriefing, toolOutput]);

  // Update explain data when we get it
  useEffect(() => {
    if (isExplanation) {
      setExplainData(toolOutput as ExplainPaperData);
      setIsSheetOpen(true);
      setIsExplainLoading(false);
    }
  }, [isExplanation, toolOutput]);

  const handleExplain = async (paperId: string) => {
    setIsExplainLoading(true);
    setIsSheetOpen(true);
    await callTool('explain_paper', { paper_id: paperId });
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleToggleSave = async (paperId: string) => {
    const savedPaperIds = widgetState.savedPaperIds || [];
    const newSavedIds = savedPaperIds.includes(paperId)
      ? savedPaperIds.filter(id => id !== paperId)
      : [...savedPaperIds, paperId];

    await updateWidgetState({ savedPaperIds: newSavedIds });
  };

  const handleToggleRead = async (paperId: string) => {
    const readPaperIds = widgetState.readPaperIds || [];
    const newReadIds = readPaperIds.includes(paperId)
      ? readPaperIds.filter(id => id !== paperId)
      : [...readPaperIds, paperId];

    await updateWidgetState({ readPaperIds: newReadIds });
  };

  const handleOpen = (url: string) => {
    openExternal(url);
  };

  const handleAsk = (prompt: string) => {
    sendFollowUpMessage(prompt);
  };

  const handleRetry = async () => {
    await callTool('get_briefing', { since_days: 7 });
  };

  useEffect(() => {
    if (!toolOutput && !isLoading && !error) {
      callTool('get_briefing', { since_days: 7 });
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {isLoading && !briefingData && <LoadingState theme={theme} />}

      {error && !isLoading && (
        <ErrorState error={error} theme={theme} onRetry={handleRetry} />
      )}

      {briefingData && (
        <>
          <BriefingView
            data={briefingData}
            savedIds={widgetState.savedPaperIds || []}
            readIds={widgetState.readPaperIds || []}
            theme={theme}
            onExplain={handleExplain}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onOpen={handleOpen}
          />
          <div style={{ padding: '0 16px 16px' }}>
            <AskAciTrack onSend={handleAsk} theme={theme} />
          </div>
        </>
      )}

      {!isLoading && !error && !briefingData && (
        <div style={{ padding: '16px' }}>
          <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            No data available. Ask me for a briefing!
          </p>
          <AskAciTrack onSend={handleAsk} theme={theme} />
        </div>
      )}

      {/* Sheet for Explain view */}
      <Sheet open={isSheetOpen} onClose={handleCloseSheet} theme={theme}>
        <ExplainPaperView
          data={explainData}
          theme={theme}
          isLoading={isExplainLoading}
        />
      </Sheet>
    </div>
  );
}

export default App;
