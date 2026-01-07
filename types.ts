
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface StrategicGap {
  category: 'Content' | 'Technical' | 'Authority' | 'UX';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  difficulty: 'High' | 'Medium' | 'Low';
  remedy: string;
}

export interface TrafficDataPoint {
  date: string;
  visits: number;
}

export interface CompetitiveIntelligence {
  estimatedPpcValue: string;
  serpFeatures: { feature: string; ownedByTarget: boolean; ownedByCompetitor: boolean }[];
  contentVelocity: string;
  keywordOverlap: {
    shared: number;
    targetUnique: number;
    competitorUnique: number;
  };
  marketPosition: 'Leader' | 'Challenger' | 'Niche' | 'Laggard';
  tacticalRecommendations: string[];
  strategicGaps: StrategicGap[];
  ppcIntel?: {
    estimatedMonthlySpend: string;
    adStrategy: string;
    topPaidKeywords: { keyword: string; cpc: string; position: number }[];
  };
  keywordGaps?: {
    keyword: string;
    targetRank: string;
    competitorRank: number;
    volume: string;
    intent: string;
    opportunityScore: number;
  }[];
}

export interface SEOAuditData {
  url: string;
  totalPages: number;
  healthScore: number;
  errors: {
    count: number;
    details: string[];
  };
  warnings: {
    count: number;
    details: string[];
  };
  notices: {
    count: number;
    details: string[];
  };
  technical: {
    redirectChains: number;
    robotsTxtStatus: string;
    httpsSecurity: string;
    mixedContent: boolean;
    mixedContentUrls: string[];
    suggestions: string[];
    mobileFriendly: boolean;
    performanceScore: number;
    brokenInternalLinks: {
      count: number;
      list: string[];
    };
    brokenExternalLinks: {
      count: number;
      list: string[];
    };
    internalLinking: {
      orphanPagesCount: number;
      orphanPagesList: string[];
      internalLinkScore: number;
    };
  };
  onPage: {
    missingTitles: number;
    duplicateTitles: number;
    avgTitleLength: number;
    missingMetaDescriptions: number;
    avgMetaDescriptionLength: number;
    metaEffectivenessScore: number;
    missingH1s: number;
    h1OptimizationScore: number;
    keywordOptimizationScore: number;
    actionableSuggestions: string[];
    topOnPageKeywords: { keyword: string; density: number; prominence: string }[];
  };
  organicIntel: {
    estimatedMonthlyTraffic: number;
    dailyTrafficStats: TrafficDataPoint[];
    topKeywords: {
      keyword: string;
      volume: string;
      difficulty: number;
      intent: string;
    }[];
    topPages: string[];
    gapAnalysis: {
      topic: string;
      intent: string;
      competitorUrl: string;
    }[];
    frequentTopics: string[];
    competitorContentAnalysis?: {
      contentTypes: { type: string; frequency: string; performance: string }[];
      topPerformingContent: { title: string; url: string; strength: string }[];
      contentStrategy: string;
      winningTopics: string[];
    };
    competitiveIntelligence?: CompetitiveIntelligence;
  };
  images: {
    overSizeLimit: number;
    missingAlt: number;
  };
  content: {
    thinContentCount: number;
    duplicateContentHashes: number;
    avgWordCount: number;
  };
  coreWebVitals: {
    lcp: string;
    fid: string;
    cls: string;
    tti: string;
  };
  authority: {
    domainAuthority: number;
    pageRank: number;
    toxicLinks: number;
    referringDomains: number;
    topReferringDomains: string[];
    highValueTargetLinks?: string[];
  };
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface BlogPost {
  day: number;
  title: string;
  outline: string;
  targetKeywords: string[];
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  suggestedWordCount: number;
}

export interface ContentPlan {
  posts: BlogPost[];
  strategySummary: string;
}

export interface AuditResult {
  target: SEOAuditData;
  competitor?: SEOAuditData;
  swot: SWOTAnalysis;
  sources?: GroundingSource[];
}
