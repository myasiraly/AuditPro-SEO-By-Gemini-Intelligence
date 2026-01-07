
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, ContentPlan, BlogPost, GroundingSource } from "../types";

export class GeminiService {
  private cleanJson(text: string | undefined): string {
    if (!text) return '{}';
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  async performSEOAudit(targetUrl: string, competitorUrl?: string): Promise<AuditResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const competitorInstruction = competitorUrl 
      ? `STRICT REQUIREMENT: Perform a direct head-to-head deep analysis against: ${competitorUrl}.`
      : `STRICT REQUIREMENT: Auto-identify the strongest organic search rival for ${targetUrl} and analyze them.`;

    const prompt = `
      Act as a Lead SEO Intelligence Analyst. Execute a high-fidelity audit comparing the TARGET and COMPETITOR.
      
      TARGET: ${targetUrl}
      ${competitorInstruction}
      
      CORE ANALYTICS REQUIREMENTS:
      1. TRAFFIC TRENDS: Provide estimated daily traffic visits for the last 30 days for the TARGET.
      2. TOP SEARCH KEYWORDS: Extract the top 10 most valuable organic search keywords for BOTH target and competitor. 
         - Include Monthly Volume (e.g. "12.5K"), Keyword Difficulty (0-100), and Search Intent (Informational, Navigational, Commercial, or Transactional).
      3. STRATEGY GAPS: Identify 4 high-level strategic gaps where the competitor is winning.
      4. ON-PAGE PRECISION: 
         - Analyze Title Tag lengths and Meta Description effectiveness.
      5. PPC & MARKET INTEL: Estimate rival's monthly PPC budget and top paid keywords.
      6. STRATEGIC INSIGHT: Provide 3 "Outranking Tactics" specifically designed to steal traffic from the competitor.

      STRICT JSON SCHEMA REQUIRED. Ensure all numeric values are integers or floats.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["target", "swot"],
          properties: {
            target: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                healthScore: { type: Type.NUMBER },
                onPage: {
                  type: Type.OBJECT,
                  properties: {
                    missingTitles: { type: Type.NUMBER },
                    duplicateTitles: { type: Type.NUMBER },
                    avgTitleLength: { type: Type.NUMBER },
                    missingMetaDescriptions: { type: Type.NUMBER },
                    avgMetaDescriptionLength: { type: Type.NUMBER },
                    metaEffectivenessScore: { type: Type.NUMBER },
                    missingH1s: { type: Type.NUMBER },
                    h1OptimizationScore: { type: Type.NUMBER },
                    keywordOptimizationScore: { type: Type.NUMBER },
                    actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    topOnPageKeywords: { 
                      type: Type.ARRAY, 
                      items: { 
                        type: Type.OBJECT, 
                        properties: { 
                          keyword: { type: Type.STRING }, 
                          density: { type: Type.NUMBER }, 
                          prominence: { type: Type.STRING } 
                        } 
                      } 
                    }
                  }
                },
                organicIntel: {
                  type: Type.OBJECT,
                  properties: {
                    estimatedMonthlyTraffic: { type: Type.NUMBER },
                    dailyTrafficStats: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          date: { type: Type.STRING },
                          visits: { type: Type.NUMBER }
                        }
                      }
                    },
                    topKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, volume: { type: Type.STRING }, difficulty: { type: Type.NUMBER }, intent: { type: Type.STRING } } } }
                  }
                },
                authority: {
                  type: Type.OBJECT,
                  properties: {
                    domainAuthority: { type: Type.NUMBER },
                    referringDomains: { type: Type.NUMBER },
                    topReferringDomains: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                technical: {
                  type: Type.OBJECT,
                  properties: { performanceScore: { type: Type.NUMBER }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }, brokenInternalLinks: { type: Type.OBJECT, properties: { count: { type: Type.NUMBER } } }, internalLinking: { type: Type.OBJECT, properties: { internalLinkScore: { type: Type.NUMBER } } }, httpsSecurity: { type: Type.STRING } }
                },
                errors: { type: Type.OBJECT, properties: { details: { type: Type.ARRAY, items: { type: Type.STRING } } } }
              }
            },
            competitor: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                healthScore: { type: Type.NUMBER },
                onPage: {
                  type: Type.OBJECT,
                  properties: {
                    avgTitleLength: { type: Type.NUMBER },
                    avgMetaDescriptionLength: { type: Type.NUMBER },
                    metaEffectivenessScore: { type: Type.NUMBER },
                    h1OptimizationScore: { type: Type.NUMBER },
                    keywordOptimizationScore: { type: Type.NUMBER },
                    topOnPageKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, density: { type: Type.NUMBER }, prominence: { type: Type.STRING } } } }
                  }
                },
                authority: { type: Type.OBJECT, properties: { domainAuthority: { type: Type.NUMBER }, referringDomains: { type: Type.NUMBER }, highValueTargetLinks: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                organicIntel: {
                  type: Type.OBJECT,
                  properties: {
                    estimatedMonthlyTraffic: { type: Type.NUMBER },
                    topKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, volume: { type: Type.STRING }, difficulty: { type: Type.NUMBER }, intent: { type: Type.STRING } } } },
                    competitiveIntelligence: {
                      type: Type.OBJECT,
                      properties: {
                        estimatedPpcValue: { type: Type.STRING },
                        marketPosition: { type: Type.STRING },
                        contentVelocity: { type: Type.STRING },
                        tacticalRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strategicGaps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              category: { type: Type.STRING },
                              description: { type: Type.STRING },
                              impact: { type: Type.STRING },
                              difficulty: { type: Type.STRING },
                              remedy: { type: Type.STRING }
                            }
                          }
                        },
                        keywordOverlap: { type: Type.OBJECT, properties: { shared: { type: Type.NUMBER }, targetUnique: { type: Type.NUMBER }, competitorUnique: { type: Type.NUMBER } } },
                        serpFeatures: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { feature: { type: Type.STRING }, ownedByTarget: { type: Type.BOOLEAN }, ownedByCompetitor: { type: Type.BOOLEAN } } } },
                        ppcIntel: {
                          type: Type.OBJECT,
                          properties: {
                            estimatedMonthlySpend: { type: Type.STRING },
                            adStrategy: { type: Type.STRING },
                            topPaidKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, cpc: { type: Type.STRING }, position: { type: Type.NUMBER } } } }
                          }
                        },
                        keywordGaps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: { keyword: { type: Type.STRING }, targetRank: { type: Type.STRING }, competitorRank: { type: Type.NUMBER }, volume: { type: Type.STRING }, intent: { type: Type.STRING }, opportunityScore: { type: Type.NUMBER } }
                          }
                        }
                      }
                    }
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
              }
            }
          }
        }
      }
    });

    try {
      const jsonStr = this.cleanJson(response.text);
      const result = JSON.parse(jsonStr);
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title || "Source", uri: chunk.web.uri });
          }
        });
      }
      return { ...result, sources } as AuditResult;
    } catch (e) {
      console.error("JSON Analysis Error:", e);
      throw new Error("Failed to synthesize deep SEO intelligence. Response format was invalid.");
    }
  }

  async generateBlogContentPlan(audit: AuditResult): Promise<ContentPlan> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `Based on the SEO audit for ${audit.target.url}, create a 30-day "Strike Plan" for 6 blog posts targeting competitor gaps. Return JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["strategySummary", "posts"],
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(this.cleanJson(response.text));
  }

  async writeFullBlog(post: BlogPost): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `Write a high-performance SEO blog post: ${post.title}. Use Markdown. Mention keywords: ${post.targetKeywords.join(', ')}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text || "Generation failed.";
  }
}
