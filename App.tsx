import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { TrendDashboard } from './components/TrendDashboard';
import { ContentGenerator } from './components/ContentGenerator';
import { ImageStudio } from './components/ImageStudio';
import { LayoutDashboard, Zap, Image as ImageIcon, Key } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [visualPrompt, setVisualPrompt] = useState<string>("");
  const [apiKeyReady, setApiKeyReady] = useState(false);

  // Initialize API Key check
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
         // Try to see if key is selected. If not, user can select manually via button.
         // We assume standard env key exists for basic functions, but paid features need selection
         const hasKey = await window.aistudio.hasSelectedApiKey();
         setApiKeyReady(hasKey);
      } else if (process.env.API_KEY) {
          setApiKeyReady(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setApiKeyReady(true);
    }
  };

  const handleKeyConnected = () => {
    setApiKeyReady(true);
  };

  const handleTrendSelect = (keyword: string) => {
    setSelectedKeyword(keyword);
    setView(ViewState.PLANNER);
  };

  const handleVisualPromptReady = (prompt: string) => {
    setVisualPrompt(prompt);
    // Don't auto switch, let user scroll down or decide
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
              <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">TrendPulse <span className="text-pink-500">AI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
               {!apiKeyReady && (
                   <button 
                    onClick={handleSelectKey}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
                   >
                       <Key className="w-3 h-3" />
                       Connect API Key
                   </button>
               )}
               <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-slate-300"
               >
                   Billing Info
               </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs (Mobile friendly) */}
        {selectedKeyword && (
          <div className="flex space-x-1 rounded-xl bg-slate-900/50 p-1 mb-8 max-w-md mx-auto border border-slate-800">
            <button
              onClick={() => setView(ViewState.DASHBOARD)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === ViewState.DASHBOARD
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Trends
            </button>
            <button
              onClick={() => setView(ViewState.PLANNER)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === ViewState.PLANNER
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              Plan
            </button>
            <button
              onClick={() => setView(ViewState.VISUALS)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === ViewState.VISUALS
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Visuals
            </button>
          </div>
        )}

        {view === ViewState.DASHBOARD && (
          <TrendDashboard 
            onSelectTrend={handleTrendSelect} 
            isDemoMode={!apiKeyReady}
            onConnectKey={handleKeyConnected}
          />
        )}

        {view === ViewState.PLANNER && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                 <h1 className="text-3xl font-bold text-white">
                    <span className="text-pink-500">#{selectedKeyword}</span> 분석 결과
                 </h1>
                 <button 
                    onClick={() => setView(ViewState.VISUALS)}
                    disabled={!visualPrompt}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                    <ImageIcon className="w-4 h-4" />
                    썸네일 생성하기
                 </button>
            </div>
            <ContentGenerator 
                keyword={selectedKeyword} 
                onVisualPromptReady={handleVisualPromptReady} 
            />
          </div>
        )}

        {view === ViewState.VISUALS && (
          <div className="h-[calc(100vh-200px)]">
             <div className="flex items-center justify-between mb-4">
                 <h1 className="text-2xl font-bold text-white">비주얼 스튜디오</h1>
                 <button onClick={() => setView(ViewState.PLANNER)} className="text-slate-400 hover:text-white text-sm">
                    &larr; 기획안으로 돌아가기
                 </button>
             </div>
             <ImageStudio initialPrompt={visualPrompt} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;