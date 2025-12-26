import React, { useState } from 'react';
import { ImageSize } from '../types';
import { generateThumbnail } from '../services/geminiService';
import { Download, Image as ImageIcon, Sparkles, Settings2, Key } from 'lucide-react';

interface Props {
  initialPrompt: string;
}

export const ImageStudio: React.FC<Props> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [size, setSize] = useState<ImageSize>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update prompt if prop changes
  React.useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleGenerate = async () => {
    // API Key Check for Paid Features
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setError(null);
    try {
      const url = await generateThumbnail(prompt, size);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError("이미지 생성 실패. API 키 권한이나 모델 접근성을 확인해주세요.");
      if (err.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col md:flex-row h-full">
      {/* Controls */}
      <div className="p-6 md:w-1/3 border-r border-slate-700 flex flex-col">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-500" />
                썸네일 스튜디오
            </h3>
            <p className="text-xs text-slate-400">Gemini 3 Pro Image Preview 모델 사용</p>
        </div>

        <div className="space-y-4 flex-1">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">프롬프트 (영어)</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                    placeholder="Describe the image..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    해상도 설정
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                size === s 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
             <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        생성 중...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        이미지 생성
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="md:w-2/3 bg-slate-900 relative flex items-center justify-center min-h-[400px] p-6">
        {imageUrl ? (
            <div className="relative group max-w-full max-h-full">
                <img 
                    src={imageUrl} 
                    alt="Generated Thumbnail" 
                    className="max-h-[600px] rounded-lg shadow-2xl border border-slate-800" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <a 
                        href={imageUrl} 
                        download="trendpulse-thumbnail.png"
                        className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-all transform hover:scale-110"
                    >
                        <Download className="w-8 h-8" />
                    </a>
                </div>
            </div>
        ) : (
            <div className="text-center text-slate-600">
                {error ? (
                    <div className="text-red-400 max-w-xs mx-auto flex flex-col items-center gap-3">
                        <p>{error}</p>
                        <button 
                            onClick={async () => {
                                if (window.aistudio) await window.aistudio.openSelectKey();
                            }}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm transition-colors flex items-center gap-2"
                        >
                            <Key className="w-4 h-4" />
                            API 키 다시 선택하기
                        </button>
                    </div>
                ) : (
                    <>
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>생성된 이미지가 여기에 표시됩니다.</p>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};