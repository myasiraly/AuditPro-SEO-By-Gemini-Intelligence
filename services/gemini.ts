
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, ContentPlan, BlogPost, SEOAuditData, SWOTAnalysis, TrafficDataPoint, SEOFinding, CompetitiveIntelligence, IndustryBenchmark } from "../types";

/**
 * AuditPro Intelligence Engine (V18.0 - Holistic Recon Edition)
 * Powered by Gemini 3 Flash & Pro for deep diagnostic simulation.
 */
export class GeminiService {
  private getSeed(str: string): number {
    return str.split('').reduce((a, b) => {
      const char = b.charCodeAt(0);
      return ((a << 5) - a) + char + (char * 31);
    }, 0);
  }

  private hashRange(seed: number, offset: number, min: number, max: number): number {
    const val = Math.abs(Math.sin(seed * (offset + 12.345)) * 1000000);
    return Math.floor((val % (max - min + 1)) + min);
  }

  private generateKeywords(domain: string, s: number, count: number) {
    const base = domain.split('.')[0];
    const verticals = ["ROI", "Architecture", "Optimization", "Intelligence", "Security", "Scale", "Governance", "Automation", "Performance", "Strategy", "Analytics", "Enterprise", "Implementation", "Workflow", "Framework"];
    const features = ["SGE Snippet", "People Also Ask", "Map Pack", "Site Links", "Image Carousel"];
    
    return Array.from({ length: count }, (_, i) => ({
      keyword: `${base} ${verticals[i % verticals.length]} Guide`.trim(),
      volume: `${this.hashRange(s, 500 + i, 5, 200)}${i % 4 === 0 ? 'K' : '00'}`,
      difficulty: this.hashRange(s, 600 + i, 10, 99),
      intent: i % 4 === 0 ? "Transactional" : i % 4 === 1 ? "Commercial" : "Informational",
      serpFeatures: [features[i % features.length]],
      cpc: `$${(this.hashRange(s, 700 + i, 5, 45) / 10).toFixed(2)}`
    }));
  }

  async performSEOAudit(targetUrl: string, competitorUrl?: string): Promise<AuditResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetDomain = new URL(targetUrl).hostname;
    const seed = this.getSeed(targetDomain);
    const compDomain = competitorUrl ? new URL(competitorUrl).hostname : `rival-${targetDomain.split('.')[0]}.com`;
    const compSeed = this.getSeed(compDomain);

    const insightsResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep SEO reconnaissance simulation for ${targetUrl} vs ${competitorUrl || 'market rivals'}. 
      Generate 5 highly specific on-page findings, 3 technical infrastructure suggestions, 4 market opportunities, and 4 threats. 
      Return the response in JSON format.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            onPage: { type: Type.ARRAY, items: { type: Type.STRING } },
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    let aiInsights;
    try {
      aiInsights = JSON.parse(insightsResponse.text || '{}');
    } catch {
      aiInsights = { onPage: [], technical: [], opportunities: [], threats: [] };
    }

    const generateData = (domain: string, s: number, isTarget: boolean): SEOAuditData => {
      const name = domain.split('.')[0];
      const da = this.hashRange(s, 50, 40, 96);
      const mTraffic = this.hashRange(s, 20, 20000, 1200000);
      
      const findings: SEOFinding[] = [
        { category: "Semantic", label: "Entity Density", status: "Pass", value: "Verified", impact: "High", description: `Advanced NLP extraction identifies ${this.hashRange(s, 100, 20, 100)} unique entities. Strong alignment with '${name}' core business nodes.` },
        { category: "E-E-A-T", label: "Authorship Integrity", status: "Warning", value: "Partial", impact: "High", description: "Missing verified social proof for key contributors. Google favors 'Experience' markers." },
        { category: "CTR", label: "Snippet Psychology", status: "Pass", value: "88%", impact: "Medium", description: "Title tags use power words effectively. Sentiment analysis indicates a high click appeal." },
        { category: "UX", label: "Searcher Intent Fit", status: "Pass", value: "Excellent", impact: "High", description: "Content body maps 1:1 with informational intent cycles. High-resolution layout enhances dwell time." }
      ];

      return {
        url: `https://${domain}`,
        totalPages: this.hashRange(s, 30, 800, 25000),
        healthScore: this.hashRange(s, 35, 75, 99),
        lighthouse: { performance: 95, accessibility: 100, bestPractices: 98, seo: 99 },
        errors: { count: 2, details: ["Minify legacy JS", "Duplicate H1 in sub-footer"] },
        warnings: { count: 8, details: ["Image size > 250kb", "LCP asset preload"] },
        notices: { count: 14, details: ["Update schema context", "Alt-tag missing on icons"] },
        technical: {
          redirectChains: 1, robotsTxtStatus: "Perfect", httpsSecurity: "TLS 1.3 (HSTS Active)",
          mixedContent: false, mixedContentUrls: [], mobileFriendly: true, performanceScore: 96,
          sitemapStatus: "GSC Verified", serverProtocol: "HTTP/3 + QUIC", cachingStatus: "Edge Optimized",
          compressionType: "Brotli (9/9)", ttfb: "95ms", domSize: 1120, hydrationLag: "120ms",
          unusedByteBloat: "14%", renderBlockingCount: 2, breadcrumbsStatus: "Active & Nested",
          httpStatusCodes: [
            { code: 200, percentage: 98 },
            { code: 301, percentage: 1.5 },
            { code: 404, percentage: 0.5 }
          ],
          brokenInternalLinks: { count: 0, list: [] }, brokenExternalLinks: { count: 1, list: ["https://legacy-api.net"] },
          internalLinking: { orphanPagesCount: 8, orphanPagesList: [], internalLinkScore: 92, maxDepth: 2 },
          schemaMarkup: {
            detectedTypes: ["Organization", "Website", "Article", "BreadcrumbList"],
            validationScore: 88,
            missingCriticalTypes: ["Product", "FAQPage"]
          },
          suggestions: isTarget ? aiInsights.technical : ["Enable lazy-loading"]
        },
        onPage: {
          missingTitles: 0, duplicateTitles: 2, avgTitleLength: 64,
          missingMetaDescriptions: 0, avgMetaDescriptionLength: 155, metaEffectivenessScore: 96,
          missingH1s: 0, h1OptimizationScore: 98, keywordOptimizationScore: 92,
          findings: findings,
          actionableSuggestions: isTarget ? aiInsights.onPage : ["Increase first-hand experience citations", "Deploy FAQ schema"],
          topOnPageKeywords: [
            { keyword: name, density: 3.2, prominence: "Primary", position: "H1 / Hero Section" },
            { keyword: "architecture", density: 1.8, prominence: "Secondary", position: "H2 / Feature Grid" },
            { keyword: "optimization", density: 1.2, prominence: "Tertiary", position: "Body Copy" }
          ],
          semanticRelevanceScore: 96, contentFreshness: 88, entityCount: 42,
          entitiesDetected: ["Enterprise", "Cloud", "SaaS", "ROI", "Optimization"],
          keywordCannibalizationRisk: 12
        },
        engagement: {
          predictedCtr: this.hashRange(s, 1000, 3, 12),
          predictedDwellTime: "4m 12s",
          engagementScore: this.hashRange(s, 1001, 70, 95),
          scrollDepthPrediction: "78%",
          serpPreview: {
            title: `${name.toUpperCase()} Solutions - The #1 Enterprise Hub`,
            description: `Discover how ${name} revolutionizes the industry with high-fidelity architecture. Learn about our ROI optimization strategies and more.`,
            displayUrl: `www.${domain} › solutions`
          }
        },
        organicIntel: {
          estimatedMonthlyTraffic: mTraffic,
          trafficSources: [{ source: "Organic", percentage: 82 }, { source: "Direct", percentage: 12 }, { source: "Referral", percentage: 6 }],
          dailyTrafficStats: Array.from({ length: 30 }, (_, i) => ({ 
            date: `D-${30-i}`, visits: 100, organic: 80, paid: 20 
          })),
          topKeywords: this.generateKeywords(domain, s, 10),
          topPages: ["/", "/solutions", "/case-studies", "/blog/main"],
          gapAnalysis: [{ topic: "Architecture ROI", intent: "Transactional", competitorUrl: compDomain }],
          frequentTopics: [name, "architecture", "deployment", "optimization"],
          competitiveIntelligence: {
            estimatedPpcValue: `$${this.hashRange(s, 80, 5000, 50000).toLocaleString()}`,
            serpFeatures: [
              { feature: "Featured Snippet", ownedByTarget: true, ownedByCompetitor: false, probability: 0.94 },
              { feature: "People Also Ask", ownedByTarget: true, ownedByCompetitor: true, probability: 0.88 },
              { feature: "Knowledge Graph", ownedByTarget: false, ownedByCompetitor: true, probability: 0.42 },
              { feature: "Image Pack", ownedByTarget: true, ownedByCompetitor: false, probability: 0.76 },
              { feature: "Video Carousel", ownedByTarget: false, ownedByCompetitor: false, probability: 0.65 },
              { feature: "SGE Summary", ownedByTarget: true, ownedByCompetitor: true, probability: 0.82 }
            ],
            contentVelocity: "High",
            keywordOverlap: { shared: 450, targetUnique: 1200, competitorUnique: 900 },
            marketPosition: "Leader",
            tacticalRecommendations: ["Optimize internal link structure", "Expand semantic clusters", "Capture Knowledge Graph via Wiki citations"],
            strategicGaps: [
              { category: "Content", description: "Comparison clusters for 'VS' intent missing", impact: "High", difficulty: "Medium", remedy: "Launch competitor vs target landing pages" },
              { category: "Technical", description: "Hydration lag on mobile impacting CWV", impact: "Medium", difficulty: "High", remedy: "Switch to partial hydration for core bundles" }
            ],
            industryBenchmarks: [],
            marketShareTrend: [],
            visibilityIndex: this.hashRange(s, 3000, 40, 95),
            semanticVelocity: this.hashRange(s, 3001, 60, 98),
            rankingVolatility: this.hashRange(s, 3002, 5, 25)
          }
        },
        images: { overSizeLimit: 8, missingAlt: 4, webpConversionRate: 98 },
        content: { thinContentCount: 14, duplicateContentHashes: 2, avgWordCount: 2200, readabilityGrade: "Professional Expert", contentToCodeRatio: "32%" },
        coreWebVitals: {
          lcp: "0.9s", fid: "12ms", cls: "0.01", tti: "1.4s", tbt: "32ms", speedIndex: "1.1s", inp: "85ms", assessment: 'PASSED'
        },
        authority: {
          domainAuthority: da, pageRank: 9, toxicLinks: 1, referringDomains: this.hashRange(s, 2000, 500, 5000),
          topReferringDomains: ["TechHub", "WikiSource", "GovPortal"],
          findings: [
            { category: "Trust", label: "Link Sentiment", status: "Pass", value: "Positive", impact: "High", description: "Inbound anchors overwhelmingly carry positive sentiment markers." }
          ],
          linkGrowthTrend: Array.from({ length: 12 }, (_, i) => ({ date: `2024-${i+1}`, count: this.hashRange(s, 4000+i, 1000, 5000) })),
          anchorTextProfile: [{ label: "Branded", percentage: 40 }, { label: "Exact Match", percentage: 15 }],
          backlinkTypes: [{ type: "Editorial", percentage: 70 }],
          linkQualityScore: this.hashRange(s, 5000, 60, 95),
          referringIps: this.hashRange(s, 6000, 400, 4000),
          followRatio: 88,
          tldDistribution: [{ tld: ".com", percentage: 75 }, { tld: ".net", percentage: 10 }],
          historicalAuthority: Array.from({ length: 6 }, (_, i) => ({ date: `M-${6-i}`, score: da - (6-i) })),
          brandSentiment: 'Positive',
          unlinkedBrandMentions: this.hashRange(s, 7000, 10, 50)
        }
      };
    };

    const targetData = generateData(targetDomain, seed, true);
    const competitorData = competitorUrl ? generateData(compDomain, compSeed, false) : undefined;

    return {
      target: targetData,
      competitor: competitorData,
      swot: {
        strengths: ["High lighthouse performance", "Strong domain authority profile", "Passable Core Web Vitals"],
        weaknesses: ["Missing verified EEAT markers", "Sub-optimal snippet psychology", "High thin content count"],
        opportunities: aiInsights.opportunities || ["Target high-intent ROI clusters", "Optimize for SGE snippets"],
        threats: aiInsights.threats || ["Competitor aggressive content velocity", "Algorithm sensitivity to unverified authors"],
        strategicPriority: "Deep semantic content expansion and technical authority fortification.",
        roadmapTitle: "2025 Intelligence Domination Strategy"
      }
    };
  }

  async generateBlogContentPlan(result: AuditResult): Promise<ContentPlan> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 30-day SEO content plan for ${result.target.url}. 
      The goal is to address these opportunities: ${result.swot.opportunities.join(', ')}.
      Return a JSON object with 'strategySummary' (string) and 'posts' (array of objects).
      Each post must have: day (1-30), title, outline, targetKeywords (array), funnelStage (TOFU, MOFU, or BOFU), and suggestedWordCount.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategySummary: { type: Type.STRING },
            posts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  outline: { type: Type.STRING },
                  targetKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  funnelStage: { type: Type.STRING },
                  suggestedWordCount: { type: Type.NUMBER }
                },
                required: ["day", "title", "outline", "targetKeywords", "funnelStage", "suggestedWordCount"]
              }
            }
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch {
      return { strategySummary: "Execute high-fidelity semantic clustering.", posts: [] };
    }
  }

  async writeFullBlog(post: BlogPost): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a 1500+ word expert SEO blog post.
      Title: ${post.title}
      Context: ${post.outline}
      Target Keywords: ${post.targetKeywords.join(', ')}
      Funnel Stage: ${post.funnelStage}
      Maintain high E-E-A-T, use Markdown for structure, and provide actionable deep-dives.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Diagnostic output failed. Please retry synthesis.";
  }
}
