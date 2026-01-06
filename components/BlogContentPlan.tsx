
import React, { useState } from 'react';
import { ContentPlan, BlogPost } from '../types';
import { GeminiService } from '../services/gemini';
import { marked } from 'marked';

interface BlogContentPlanViewProps {
  plan: ContentPlan;
}

const BlogContentPlanView: React.FC<BlogContentPlanViewProps> = ({ plan }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent border border-white/5 p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h3 className="text-3xl font-extrabold mb-6 flex items-center gap-3 text-white font-display tracking-tight">
          <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
          AI Strategy Roadmap
        </h3>
        <p className="text-slate-400 leading-relaxed text-xl max-w-4xl font-medium">
          {plan.strategySummary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plan.posts.sort((a, b) => a.day - b.day).map((post) => (
          <BlogPostCard key={post.day} post={post} />
        ))}
      </div>
    </div>
  );
};

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [fullPost, setFullPost] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const stageColors = {
    TOFU: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MOFU: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    BOFU: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const handleWriteBlog = async () => {
    if (fullPost) {
      setShowModal(true);
      return;
    }

    setIsWriting(true);
    try {
      const gemini = new GeminiService();
      const content = await gemini.writeFullBlog(post);
      setFullPost(content);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to write blog", err);
      alert("Error generating the blog post. Please try again.");
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 hover:border-blue-500/30 transition-all duration-500 flex flex-col group relative backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-slate-800/80 rounded-xl px-4 py-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest-label border border-white/5">
            Day {post.day}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest-label px-2.5 py-1 rounded-full border ${stageColors[post.funnelStage]}`}>
            {post.funnelStage} Strategy
          </span>
        </div>
        
        <h4 className="text-xl font-extrabold text-white mb-4 group-hover:text-blue-400 transition-colors leading-tight font-display tracking-tight">
          {post.title}
        </h4>
        
        <div className="space-y-6 mb-8">
          <div>
            <h5 className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest-label">Content Focus</h5>
            <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">
              {post.outline}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest-label">Target Reach</span>
            <span className="text-xs text-slate-300 font-extrabold font-display">{post.suggestedWordCount} words</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-6">
          <div className="pt-6 border-t border-white/5">
            <h5 className="text-[9px] font-black text-slate-600 uppercase mb-3 tracking-widest-label">Semantic Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {post.targetKeywords.map((keyword, i) => (
                <span key={i} className="text-[10px] font-bold text-blue-400 bg-blue-400/5 px-3 py-1.5 rounded-xl border border-blue-400/10">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleWriteBlog}
            disabled={isWriting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 font-black text-xs uppercase tracking-widest-label transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-blue-600/10 text-white"
          >
            {isWriting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
            {isWriting ? 'Synthesizing...' : 'Generate Full Draft'}
          </button>
        </div>
      </div>

      {/* Modal for Full Blog Post */}
      {showModal && fullPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-full flex flex-col rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900 z-10 rounded-t-[40px]">
              <div className="max-w-[80%]">
                <h3 className="text-3xl font-extrabold text-white font-display tracking-tight leading-tight">{post.title}</h3>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest-label">Draft Status: AI Verified</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest-label">{post.funnelStage} Stage</span>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/20">
              <div 
                className="prose prose-invert"
                dangerouslySetInnerHTML={{ __html: marked.parse(fullPost) as string }}
              />
            </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-between bg-slate-900/50 rounded-b-[40px]">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest-label">
                Final Review Suggested
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullPost);
                  alert("Draft copied to intelligence clipboard.");
                }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest-label transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Full Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogContentPlanView;
