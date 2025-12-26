export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  VISUALS = 'VISUALS',
  SETTINGS = 'SETTINGS'
}

export interface TrendItem {
  keyword: string;
  category: string;
  volume: string;
  growth: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  rating?: number;
  address?: string;
}

export interface ContentPlan {
  title: string;
  hook: string;
  body: string;
  platforms: string[];
  hashtags: string[];
  visualPrompt: string;
  sources: GroundingSource[];
  places: MapPlace[];
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: ImageSize;
}