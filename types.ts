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

export interface SEOFinding {
  category: string;
  label: string;
  status: 'Pass' | 'Warning' | 'Critical';
  value: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface TrafficDataPoint {
  date: string;
  visits: number;
  organic: number;
  paid: number;
}

export interface IndustryBenchmark {
  metric: string;
  industryAvg: string;
  targetValue: string;
  competitorValue: string;
  status: 'Above' | 'Below' | 'Equal';
}

export interface CompetitiveIntelligence {
  estimatedPpcValue: string;
  serpFeatures: { feature: string; ownedByTarget: boolean; ownedByCompetitor: boolean; probability: number }[];
  contentVelocity: string;
  keywordOverlap: {
    shared: number;
    targetUnique: number;
    competitorUnique: number;
  };
  marketPosition: 'Leader' | 'Challenger' | 'Niche' | 'Laggard';
  tacticalRecommendations: { title: string; action: string; impact: string }[];
  strategicGaps: StrategicGap[];
  ppcIntel?: {
    estimatedMonthlySpend: string;
    adStrategy: string;
    topPaidKeywords: { keyword: string; cpc: string; position: number }[];
    adCopyThemes: string[];
  };
  industryBenchmarks: IndustryBenchmark[];
  marketShareTrend: { date: string; targetShare: number; competitorShare: number }[];
  visibilityIndex: number;
  semanticVelocity: number;
  rankingVolatility: number;
  serpFeatureOptimization: { feature: string; tactic: string; goal: string }[];
}

export interface SEOAuditData {
  url: string;
  totalPages: number;
  healthScore: number;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
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
    sitemapStatus: string;
    serverProtocol: string;
    cachingStatus: string;
    compressionType: string;
    ttfb: string;
    domSize: number;
    hydrationLag: string;
    unusedByteBloat: string;
    renderBlockingCount: number;
    breadcrumbsStatus: string;
    httpStatusCodes: { code: number; percentage: number }[];
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
      maxDepth: number;
    };
    schemaMarkup: {
      detectedTypes: string[];
      validationScore: number;
      missingCriticalTypes: string[];
    };
    technicalDebtLedger: { issue: string; impact: string; effort: string; recommendation: string }[];
    renderingStrategyInsight: string;
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
    topOnPageKeywords: { keyword: string; density: number; prominence: string; position?: string }[];
    findings: SEOFinding[];
    semanticRelevanceScore: number;
    contentFreshness: number;
    entityCount: number;
    entitiesDetected: string[];
    keywordCannibalizationRisk: number;
    semanticMapInsights: { topic: string; coverage: number; gapImportance: string }[];
    informationGainScore: number;
  };
  organicIntel: {
    estimatedMonthlyTraffic: number;
    trafficSources: { source: string; percentage: number }[];
    dailyTrafficStats: TrafficDataPoint[];
    topKeywords: {
      keyword: string;
      volume: string;
      difficulty: number;
      intent: string;
      serpFeatures?: string[];
      cpc?: string;
      conversionPotential: number;
      trendingStatus: 'Rising' | 'Stable' | 'Declining';
      competitiveAnalysis: string;
    }[];
    topPages: string[];
    gapAnalysis: {
      topic: string;
      intent: string;
      competitorUrl: string;
    }[];
    frequentTopics: string[];
    competitiveIntelligence?: CompetitiveIntelligence;
  };
  engagement: {
    predictedCtr: number;
    predictedDwellTime: string;
    engagementScore: number;
    scrollDepthPrediction: string;
    serpPreview: {
      title: string;
      description: string;
      displayUrl: string;
    };
  };
  images: {
    overSizeLimit: number;
    missingAlt: number;
    webpConversionRate: number;
  };
  content: {
    thinContentCount: number;
    duplicateContentHashes: number;
    avgWordCount: number;
    readabilityGrade: string;
    contentToCodeRatio: string;
  };
  coreWebVitals: {
    lcp: string;
    fid: string;
    cls: string;
    tti: string;
    tbt: string;
    speedIndex: string;
    inp: string;
    assessment: 'PASSED' | 'FAILED';
  };
  authority: {
    domainAuthority: number;
    pageRank: number;
    toxicLinks: number;
    referringDomains: number;
    topReferringDomains: string[];
    highValueTargetLinks?: string[];
    findings: SEOFinding[];
    linkGrowthTrend: { date: string; count: number }[];
    anchorTextProfile: { label: string; percentage: number }[];
    backlinkTypes: { type: string; percentage: number }[];
    linkQualityScore: number;
    referringIps: number;
    followRatio: number;
    tldDistribution: { tld: string; percentage: number }[];
    historicalAuthority: { date: string; score: number }[];
    brandSentiment: 'Positive' | 'Neutral' | 'Negative';
    unlinkedBrandMentions: number;
    toxicLinkProbability: number;
  };
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicPriority: string;
  roadmapTitle: string;
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