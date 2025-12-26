import { GoogleGenAI, Type } from "@google/genai";
import { ContentPlan, ImageSize, TrendItem } from "../types";

// Mock Data for fallback
const MOCK_TRENDS: TrendItem[] = [
  { keyword: "탕후루 오마카세", category: "Food", volume: "50k+", growth: 120 },
  { keyword: "여름 뮤직 페스티벌", category: "Events", volume: "100k+", growth: 85 },
  { keyword: "AI 프로필 만들기", category: "Tech", volume: "20k+", growth: 200 },
  { keyword: "장마철 코디", category: "Fashion", volume: "30k+", growth: 150 },
  { keyword: "신상 편의점 간식", category: "Food", volume: "10k+", growth: 90 }
];

const MOCK_PLAN: ContentPlan = {
  title: "집에서 즐기는 탕후루 오마카세 🍓",
  hook: "아직도 줄 서서 드시나요? 10분 만에 집에서 만드는 탕후루 비법!",
  body: "설탕 코팅이 얇고 바삭한 탕후루, 실패 없이 만드는 꿀팁을 알려드립니다. 과일 손질부터 시럽 비율까지 완벽 정리!",
  platforms: ["Instagram Reels", "YouTube Shorts", "TikTok"],
  hashtags: ["#탕후루", "#홈카페", "#디저트만들기", "#간식", "#트렌드"],
  visualPrompt: "Close up shot of colorful candied fruit tanghulu skewers, glistening sugar coating, bright cinematic lighting, 4k resolution",
  sources: [
    { title: "Tanghulu Recipe - Wikipedia", uri: "https://en.wikipedia.org/wiki/Tanghulu" },
    { title: "Viral Food Trends 2024", uri: "https://example.com/trends" }
  ],
  places: [
    { title: "Wangga Tanghulu", uri: "https://maps.google.com", address: "Hongdae, Seoul" },
    { title: "Street Food Zone", uri: "https://maps.google.com", address: "Myeongdong, Seoul" }
  ]
};

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='100%25' height='100%25' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2394a3b8'%3EImage Generation%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'%3E(Mock Mode)%3C/text%3E%3C/svg%3E";

// Helper to get client with current key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchDailyTrends = async (): Promise<TrendItem[]> => {
  const ai = getClient();
  if (!ai) {
    console.warn("No API Key found, returning mock trends.");
    return MOCK_TRENDS;
  }
  
  try {
    // Using Flash with Search Grounding to find real-time trends
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "한국에서 오늘 가장 인기 있는 검색어와 SNS(인스타그램, 유튜브) 트렌드 키워드 5개를 찾아줘. 각 트렌드의 예상 검색량(예: 10k+)과 성장률(%)을 추정해줘.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              category: { type: Type.STRING },
              volume: { type: Type.STRING },
              growth: { type: Type.NUMBER },
            },
            required: ["keyword", "category", "volume", "growth"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return MOCK_TRENDS;
    const data = JSON.parse(text);
    return data.length > 0 ? data : MOCK_TRENDS;
  } catch (e) {
    console.error("Failed to parse trends or API error", e);
    return MOCK_TRENDS;
  }
};

export const generateContentPlan = async (
  keyword: string, 
  locationContext?: { lat: number, lng: number }
): Promise<ContentPlan> => {
  const ai = getClient();
  if (!ai) {
      console.warn("No API Key found, returning mock plan.");
      return { ...MOCK_PLAN, title: `${keyword} 콘텐츠 기획안 (Demo)` };
  }
  
  try {
    // First, gather intelligence using Search and optionally Maps
    const tools: any[] = [{ googleSearch: {} }];
    let systemInstruction = "당신은 전문 콘텐츠 마케터입니다. 트렌드 키워드를 분석하여 바이럴 영상을 위한 기획안을 작성하세요.";

    if (locationContext) {
      tools.push({ googleMaps: {} });
      systemInstruction += " 이 트렌드는 특정 장소와 관련이 있을 수 있습니다. Google Maps를 사용하여 관련 장소를 찾고 추천하세요.";
    }

    const prompt = `
      주제: "${keyword}"
      
      이 주제를 바탕으로 인스타그램 릴스와 유튜브 쇼츠용 콘텐츠 기획안을 작성해주세요.
      1. 현재 이 주제와 관련된 SNS 밈이나 챌린지가 있다면 연결해주세요.
      2. 위치 기반 정보가 필요하다면 근처 핫플레이스를 추천해주세요.
      3. 썸네일 생성을 위한 이미지 프롬프트를 영어로 작성해주세요 (visualPrompt).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: tools,
        toolConfig: locationContext ? {
          retrievalConfig: {
            latLng: {
              latitude: locationContext.lat,
              longitude: locationContext.lng
            }
          }
        } : undefined,
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Catchy title for the content" },
            hook: { type: Type.STRING, description: "The first 3 seconds hook script" },
            body: { type: Type.STRING, description: "Main content description" },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualPrompt: { type: Type.STRING, description: "Prompt for image generation model (in English)" },
          },
          required: ["title", "hook", "body", "platforms", "hashtags", "visualPrompt"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    // Extract Grounding Metadata manually
    const sources: any[] = [];
    const places: any[] = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
        if (chunk.maps) {
          places.push({ 
            title: chunk.maps.title, 
            uri: chunk.maps.googleMapsUri || "",
            address: chunk.maps.formattedAddress
          });
        }
      });
    }

    return {
      ...json,
      sources,
      places
    };
  } catch (e) {
    console.error("API Error during content plan generation", e);
    return { ...MOCK_PLAN, title: `${keyword} 콘텐츠 기획안 (Fallback)` };
  }
};

export const generateThumbnail = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getClient();
  if (!ai) {
      console.warn("No API Key found, returning placeholder image.");
      return PLACEHOLDER_IMAGE;
  }
  
  try {
    // Using gemini-3-pro-image-preview for high quality images
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16", // Vertical for Reels/Shorts
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (e) {
     console.error("Image generation failed", e);
     return PLACEHOLDER_IMAGE;
  }
};