
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, ContentPlan, BlogPost } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async performSEOAudit(targetUrl: string, competitorUrl?: string): Promise<AuditResult> {
    const prompt = `
      Act as a Senior SEO Expert and Market Research Analyst. Perform an exhaustive deep-dive SEO audit for the target site: ${targetUrl} 
      ${competitorUrl ? `benchmarked against the competitor: ${competitorUrl}.` : ''}
      
      CRITICAL INSTRUCTIONS:
      1. USE GOOGLE SEARCH GROUNDING: Find real-world organic ranking data, top performing pages, and keyword sets for both domains.
      2. CRAWL POLICY: Simulate a polite crawl using logic equivalent to "time.sleep(2)" between requests to avoid detection.
      3. ORGANIC INTEL: 
         - Identify Top 10 performing pages for both sites.
         - Identify Top 10 organic keywords for both sites.
         - Identify frequent topics in the competitor's blog/resources section.
      4. ON-PAGE SEO FIXES: Provide specific, actionable suggestions for improving title tag lengths (aim for 50-60 chars), meta description effectiveness (compelling CTAs, 150-160 chars), and H1 usage (semantic uniqueness).
      5. GAP ANALYSIS: Find 3 high-intent topics covered by ${competitorUrl} that ${targetUrl} is missing.
      6. SERP ANALYSIS: For the primary keywords, provide ranking estimates comparing target vs competitor.
      7. TECHNICAL: Identify broken links (internal/external), redirect chains, and performance scores.
      
      The response MUST be strictly valid JSON according to the requested schema.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                totalPages: { type: Type.NUMBER },
                healthScore: { type: Type.NUMBER },
                errors: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                warnings: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                notices: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                technical: {
                  type: Type.OBJECT,
                  properties: {
                    redirectChains: { type: Type.NUMBER },
                    robotsTxtStatus: { type: Type.STRING },
                    httpsSecurity: { type: Type.STRING },
                    mixedContent: { type: Type.BOOLEAN },
                    mixedContentUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mobileFriendly: { type: Type.BOOLEAN },
                    performanceScore: { type: Type.NUMBER },
                    brokenInternalLinks: {
                      type: Type.OBJECT,
                      properties: {
                        count: { type: Type.NUMBER },
                        list: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    brokenExternalLinks: {
                      type: Type.OBJECT,
                      properties: {
                        count: { type: Type.NUMBER },
                        list: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    internalLinking: {
                      type: Type.OBJECT,
                      properties: {
                        orphanPagesCount: { type: Type.NUMBER },
                        orphanPagesList: { type: Type.ARRAY, items: { type: Type.STRING } },
                        internalLinkScore: { type: Type.NUMBER }
                      }
                    }
                  }
                },
                onPage: {
                  type: Type.OBJECT,
                  properties: {
                    missingTitles: { type: Type.NUMBER },
                    duplicateTitles: { type: Type.NUMBER },
                    missingMetaDescriptions: { type: Type.NUMBER },
                    missingH1s: { type: Type.NUMBER },
                    keywordOptimizationScore: { type: Type.NUMBER },
                    actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                organicIntel: {
                  type: Type.OBJECT,
                  properties: {
                    topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    topPages: { type: Type.ARRAY, items: { type: Type.STRING } },
                    gapAnalysis: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          topic: { type: Type.STRING },
                          intent: { type: Type.STRING },
                          competitorUrl: { type: Type.STRING }
                        }
                      }
                    },
                    frequentTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    serpAnalysis: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          query: { type: Type.STRING },
                          targetRank: { type: Type.NUMBER },
                          competitorRank: { type: Type.NUMBER },
                          topCompetitor: { type: Type.STRING }
                        }
                      }
                    }
                  }
                },
                images: {
                  type: Type.OBJECT,
                  properties: {
                    overSizeLimit: { type: Type.NUMBER },
                    missingAlt: { type: Type.NUMBER }
                  }
                },
                content: {
                  type: Type.OBJECT,
                  properties: {
                    thinContentCount: { type: Type.NUMBER },
                    duplicateContentHashes: { type: Type.NUMBER },
                    avgWordCount: { type: Type.NUMBER }
                  }
                },
                coreWebVitals: {
                  type: Type.OBJECT,
                  properties: {
                    lcp: { type: Type.STRING },
                    fid: { type: Type.STRING },
                    cls: { type: Type.STRING },
                    tti: { type: Type.STRING }
                  }
                },
                authority: {
                  type: Type.OBJECT,
                  properties: {
                    domainAuthority: { type: Type.NUMBER },
                    pageRank: { type: Type.NUMBER },
                    toxicLinks: { type: Type.NUMBER },
                    referringDomains: { type: Type.NUMBER },
                    topReferringDomains: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              required: ["url", "healthScore", "technical", "onPage", "authority", "organicIntel"]
            },
            competitor: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                healthScore: { type: Type.NUMBER },
                technical: {
                    type: Type.OBJECT,
                    properties: {
                        performanceScore: { type: Type.NUMBER },
                        brokenInternalLinks: {
                          type: Type.OBJECT,
                          properties: { count: { type: Type.NUMBER } }
                        }
                    }
                },
                organicIntel: {
                  type: Type.OBJECT,
                  properties: {
                    topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    topPages: { type: Type.ARRAY, items: { type: Type.STRING } },
                    frequentTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                authority: {
                  type: Type.OBJECT,
                  properties: {
                    domainAuthority: { type: Type.NUMBER },
                    referringDomains: { type: Type.NUMBER },
                    topReferringDomains: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"]
            }
          },
          required: ["target", "swot"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async generateBlogContentPlan(audit: AuditResult): Promise<ContentPlan> {
    const prompt = `Based on the SEO audit for ${audit.target.url}, create a 30-day blog content plan to fix weaknesses and capture opportunities. Return JSON.`;
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
                  funnelStage: { type: Type.STRING, enum: ['TOFU', 'MOFU', 'BOFU'] },
                  targetKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedWordCount: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async writeFullBlog(post: BlogPost): Promise<string> {
    const prompt = `Write a professional blog post for: ${post.title}. Use Markdown.`;
    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text || "Failed to generate blog content.";
  }
}
