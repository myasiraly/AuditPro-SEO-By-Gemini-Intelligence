
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, ContentPlan, BlogPost } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async performSEOAudit(targetUrl: string, competitorUrl?: string): Promise<AuditResult> {
    const prompt = `
      Act as a Senior SEO Expert and Technical Lead. Perform an exhaustive SEO audit for the target site: ${targetUrl} 
      ${competitorUrl ? `and compare it against its main competitor: ${competitorUrl}.` : ''}
      
      CRITICAL TECHNICAL AUDIT REQUIREMENT:
      Identify and list specific technical failures:
      1. Broken Internal Links: Links pointing to missing pages on the same domain (404s).
      2. Broken External Links: Outbound links pointing to dead external resources.
      3. Orphan Pages: Pages on the site that have zero incoming internal links from other pages on the same domain.
      
      Analyze and provide specific data for:
      - Technical: Redirect chains, robots.txt, HTTPS status, mixed content resources. 
         - Mobile Friendliness: True/False.
         - Performance Score: 0-100 scale.
         - Broken Internal/External Links: Return counts and lists of URLs.
         - Internal Linking Analysis: Identify specific Orphan Pages (count and list) and calculate an Internal Link Score (0-100).
      - On-Page & Semantic: Missing/Duplicate meta tags, H1 usage, and Image Alt text.
         - Keyword Optimization: Score 0-100.
      - Authority: Domain Authority, Page Rank, and Toxic Link counts.
         - Top 5 Referring Domains: List specific linking domains.
      - SWOT Analysis: Actionable Strengths, Weaknesses, Opportunities, and Threats.

      COMPETITIVE BENCHMARKING (if competitor provided):
      For the COMPETITOR, return the exact same broken link metrics AND Orphan Page metrics (count and lists), health score, and authority.

      The response MUST be strictly valid JSON according to the requested schema.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
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
                    keywordOptimizationScore: { type: Type.NUMBER }
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
              required: ["url", "healthScore", "technical", "onPage", "authority"]
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
                        mobileFriendly: { type: Type.BOOLEAN },
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
                            orphanPagesList: { type: Type.ARRAY, items: { type: Type.STRING } }
                          }
                        }
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
                onPage: {
                    type: Type.OBJECT,
                    properties: {
                        keywordOptimizationScore: { type: Type.NUMBER }
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

    return JSON.parse(response.text);
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
    return JSON.parse(response.text);
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
