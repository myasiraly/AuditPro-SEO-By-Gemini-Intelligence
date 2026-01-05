
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, ContentPlan, BlogPost } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async performSEOAudit(targetUrl: string, competitorUrl?: string): Promise<AuditResult> {
    const prompt = `
      Act as a Senior SEO Expert and Developer. Perform a comprehensive SEO audit for the target site: ${targetUrl} 
      ${competitorUrl ? `and compare it against its competitor: ${competitorUrl}.` : ''}
      
      Simulate a deep crawl of the top 20 pages. 
      Calculate Site Health using this formula: Health = 100 - (((Errors * 5) + (Warnings * 2) + (Notices * 0.5)) / TotalPages).
      
      Analyze:
      1. Technical: Redirect chains, robots.txt, HTTPS, mixed content. 
         Specifically detect and LIST:
         - Broken internal links (404 errors on target site domain).
         - Broken external links (404 errors on outbound domains).
         - Mixed content resources: Identify the SPECIFIC HTTP URLs (e.g., http://example.com/image.jpg, http://cdn.test/script.js) loaded on the HTTPS site.
      2. On-Page: Missing/Duplicate titles, meta descriptions, H1s, Image alt tags, image sizes (>100kb).
      3. Speed: Simulated PageSpeed metrics (LCP, FID, CLS, TTI).
      4. Backlinks: Simulated Authority metrics and Toxic Link flagging.
      5. Content: Word counts (thin content < 300 words), duplicate content detection.
      6. SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats.

      Ensure the data is realistic for the provided URLs. For mixed content, provide a realistic list of at least 2-3 resource URLs if any issues are simulated.
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
                  },
                  required: ["count", "details"]
                },
                warnings: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["count", "details"]
                },
                notices: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["count", "details"]
                },
                technical: {
                  type: Type.OBJECT,
                  properties: {
                    redirectChains: { type: Type.NUMBER },
                    robotsTxtStatus: { type: Type.STRING },
                    httpsSecurity: { type: Type.STRING },
                    mixedContent: { type: Type.BOOLEAN },
                    mixedContentUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
                    brokenInternalLinks: {
                      type: Type.OBJECT,
                      properties: {
                        count: { type: Type.NUMBER },
                        list: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["count", "list"]
                    },
                    brokenExternalLinks: {
                      type: Type.OBJECT,
                      properties: {
                        count: { type: Type.NUMBER },
                        list: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["count", "list"]
                    }
                  },
                  required: [
                    "redirectChains", 
                    "robotsTxtStatus", 
                    "httpsSecurity", 
                    "mixedContent", 
                    "mixedContentUrls",
                    "brokenInternalLinks", 
                    "brokenExternalLinks"
                  ]
                },
                onPage: {
                  type: Type.OBJECT,
                  properties: {
                    missingTitles: { type: Type.NUMBER },
                    duplicateTitles: { type: Type.NUMBER },
                    missingMetaDescriptions: { type: Type.NUMBER },
                    missingH1s: { type: Type.NUMBER }
                  },
                  required: ["missingTitles", "duplicateTitles", "missingMetaDescriptions", "missingH1s"]
                },
                images: {
                  type: Type.OBJECT,
                  properties: {
                    overSizeLimit: { type: Type.NUMBER },
                    missingAlt: { type: Type.NUMBER }
                  },
                  required: ["overSizeLimit", "missingAlt"]
                },
                content: {
                  type: Type.OBJECT,
                  properties: {
                    thinContentCount: { type: Type.NUMBER },
                    duplicateContentHashes: { type: Type.NUMBER },
                    avgWordCount: { type: Type.NUMBER }
                  },
                  required: ["thinContentCount", "duplicateContentHashes", "avgWordCount"]
                },
                coreWebVitals: {
                  type: Type.OBJECT,
                  properties: {
                    lcp: { type: Type.STRING },
                    fid: { type: Type.STRING },
                    cls: { type: Type.STRING },
                    tti: { type: Type.STRING }
                  },
                  required: ["lcp", "fid", "cls", "tti"]
                },
                authority: {
                  type: Type.OBJECT,
                  properties: {
                    domainAuthority: { type: Type.NUMBER },
                    pageRank: { type: Type.NUMBER },
                    toxicLinks: { type: Type.NUMBER },
                    referringDomains: { type: Type.NUMBER }
                  },
                  required: ["domainAuthority", "pageRank", "toxicLinks", "referringDomains"]
                }
              },
              required: ["url", "healthScore", "errors", "warnings", "notices", "technical", "onPage", "images", "content", "coreWebVitals", "authority"]
            },
            competitor: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                healthScore: { type: Type.NUMBER },
                coreWebVitals: {
                  type: Type.OBJECT,
                  properties: {
                    tti: { type: Type.STRING }
                  }
                },
                authority: {
                  type: Type.OBJECT,
                  properties: {
                    domainAuthority: { type: Type.NUMBER },
                    referringDomains: { type: Type.NUMBER }
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
    const prompt = `
      Based on the following SEO Audit Results for ${audit.target.url}:
      Strengths: ${audit.swot.strengths.join(', ')}
      Opportunities: ${audit.swot.opportunities.join(', ')}
      Weaknesses: ${audit.swot.weaknesses.join(', ')}

      Create a 30-day Blog Content Strategy. 
      Instead of social media posts, suggest 8-12 high-impact blog post topics (spaced out over the 30 days, e.g., 2-3 per week).
      The goal is to fix content gaps (weaknesses) and capitalize on opportunities.
      
      For each suggested post, provide:
      1. day: The suggested day of the month for publication (1-30).
      2. title: A catchy, SEO-optimized H1 title.
      3. outline: A brief outline of what the post should cover.
      4. funnelStage: 'TOFU' (Top of Funnel), 'MOFU' (Middle), or 'BOFU' (Bottom).
      5. targetKeywords: 3 target SEO keywords for the post.
      6. suggestedWordCount: Recommended length.

      Also provide a strategySummary explaining how this plan addresses the site's current SEO standing.
    `;

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
                },
                required: ["day", "title", "outline", "funnelStage", "targetKeywords", "suggestedWordCount"]
              }
            }
          },
          required: ["strategySummary", "posts"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async writeFullBlog(post: BlogPost): Promise<string> {
    const prompt = `
      Write a professional, high-quality, SEO-optimized blog post based on these details:
      Title: ${post.title}
      Outline: ${post.outline}
      Target Keywords: ${post.targetKeywords.join(', ')}
      Funnel Stage: ${post.funnelStage}
      Recommended Word Count: ~${post.suggestedWordCount}

      Structure the post with clear headings (H2, H3), an engaging introduction, a conclusion, and a call-to-action.
      Use Markdown formatting for the entire response.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate blog content.";
  }
}
