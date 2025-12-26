import React, { useEffect, useState } from 'react';
import { TrendItem } from '../types';
import { fetchDailyTrends } from '../services/geminiService';
import { TrendingUp, RefreshCw, Search, ArrowRight, Key } from 'lucide-react';

interface Props {
  onSelectTrend: (keyword: string) => void;
  isDemoMode: boolean;
  onConnectKey: () => void;
}

export const TrendDashboard: React.FC<Props> = ({ onSelectTrend, isDemoMode, onConnectKey }) => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyTrends();
      setTrends(data);
    } catch (err) {
      setError("트렌드를 불러오는 데 실패했습니다. API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when switching from Demo to Real mode
  useEffect(() => {
    if (!isDemoMode) {
      loadTrends();
    }
  }, [isDemoMode]);

  const handleConnectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        onConnectKey(); // Update parent state
        loadTrends();   // Refresh data
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-pink-500" />
            오늘의 급상승 트렌드
          </h2>
          <p className="text-slate-400 mt-1">Google Search 기반 실시간 검색어 분석</p>
        </div>
        <button 
          onClick={loadTrends}
          disabled={loading}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && !error && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-100">Demo Mode Active</h3>
              <p className="text-sm text-blue-300/70">현재 샘플 데이터를 보고 있습니다. 실시간 트렌드를 보려면 API 키를 연결하세요.</p>
            </div>
          </div>
          <button
            onClick={handleConnectKey}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Key className="w-4 h-4" />
            API 키 연결하기
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <span>{error}</span>
          </div>
          <button 
            onClick={handleConnectKey}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg whitespace-nowrap"
          >
            <Key className="w-4 h-4" />
            API 키 연결
          </button>
        </div>
      )}

      {loading && trends.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectTrend(trend.keyword)}
              className="group bg-slate-800 border border-slate-700 hover:border-pink-500 p-5 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-pink-500/10"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded-md font-medium">
                  {trend.category}
                </span>
                <div className="flex items-center text-green-400 text-sm font-semibold">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {trend.growth}%
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                {trend.keyword}
              </h3>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-slate-400">
                  Vol: <span className="text-slate-200">{trend.volume}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-pink-500 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Search Input */}
      <div className="relative mt-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="관심있는 키워드를 직접 입력하여 분석하기..."
          className="block w-full pl-10 pr-4 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSelectTrend(e.currentTarget.value);
            }
          }}
        />
      </div>
    </div>
  );
};