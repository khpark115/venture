import React, { useState, useEffect } from 'react';
import { ContentPlan, MapPlace } from '../types';
import { generateContentPlan } from '../services/geminiService';
import { MapPin, ExternalLink, Loader2, PlayCircle, Hash, Image as ImageIcon } from 'lucide-react';

interface Props {
  keyword: string;
  onVisualPromptReady: (prompt: string) => void;
}

export const ContentGenerator: React.FC<Props> = ({ keyword, onVisualPromptReady }) => {
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  useEffect(() => {
    // Get user location for Maps Grounding relevance
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location access denied, skipping location-aware grounding", err)
      );
    }
  }, []);

  useEffect(() => {
    if (keyword) {
      generatePlan(keyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const generatePlan = async (kw: string) => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateContentPlan(kw, location);
      setPlan(result);
      if (result.visualPrompt) {
        onVisualPromptReady(result.visualPrompt);
      }
    } catch (error) {
      console.error(error);
      alert("콘텐츠 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-white">TrendPulse AI 분석 중...</h3>
        <p className="text-slate-400 mt-2">
          검색 트렌드 확인, 밈 연결, 지도 데이터 분석을 수행하고 있습니다.
        </p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Plan Card */}
      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                    <PlayCircle className="w-6 h-6 text-pink-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
            </div>
            
            <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-semibold text-pink-400 mb-1">3초 훅 (Hook)</h4>
                    <p className="text-slate-200 text-lg">"{plan.hook}"</p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">콘텐츠 내용</h4>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{plan.body}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {plan.hashtags.map((tag, i) => (
                        <span key={i} className="flex items-center text-sm text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag.replace('#', '')}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Sources Section */}
        {plan.sources.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-green-500" />
                    참고 자료 (Google Search)
                </h3>
                <ul className="space-y-2">
                    {plan.sources.slice(0, 3).map((source, i) => (
                        <li key={i}>
                            <a href={source.uri} target="_blank" rel="noreferrer" className="flex items-center text-sm text-slate-400 hover:text-pink-400 transition-colors truncate">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* Map & Visual Context */}
      <div className="space-y-6">
        {/* Maps Grounding Result */}
        {plan.places && plan.places.length > 0 ? (
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    관련 핫플레이스 (Google Maps)
                </h3>
                <div className="space-y-3">
                    {plan.places.slice(0, 3).map((place, i) => (
                        <a key={i} href={place.uri} target="_blank" rel="noreferrer" className="block bg-slate-900 hover:bg-slate-800 border border-slate-700 p-3 rounded-lg transition-colors group">
                            <div className="font-semibold text-slate-200 group-hover:text-blue-400">{place.title}</div>
                            {place.address && <div className="text-xs text-slate-500 mt-1">{place.address}</div>}
                        </a>
                    ))}
                </div>
           </div>
        ) : (
            <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-6 text-center">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">관련된 장소 정보가 없습니다.</p>
            </div>
        )}

        {/* Visual Prompt Hint */}
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 border border-purple-500/30 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                AI 비주얼 프롬프트
            </h3>
            <p className="text-sm text-slate-400 italic mb-4">
                "이 프롬프트를 사용하여 고화질 썸네일을 생성할 수 있습니다."
            </p>
            <div className="bg-black/40 p-3 rounded border border-purple-500/20 text-purple-200 text-xs font-mono">
                {plan.visualPrompt}
            </div>
        </div>
      </div>
    </div>
  );
};