
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
    missingMetaDescriptions: number;
    missingH1s: number;
    keywordOptimizationScore: number;
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
}
