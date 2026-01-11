
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
      <div className="bg-gradient-to-br from-violet-600/10 via-indigo-600/10 to-transparent border border-white/10 p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold flex items-center gap-3 text-white font-display tracking-tight uppercase">
              <span className="w-2 h-10 bg-violet-500 rounded-full"></span>
              30-Day Master Offensive
            </h3>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest-label">Generative Authority Strike V23.0</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest-label flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               Trend-Aligned Synthesis Active
            </div>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed text-lg max-w-4xl font-medium italic relative z-10">
          "{plan.strategySummary}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      console.error("Failed to synthesize master draft", err);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <>
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:border-violet-500/40 hover:bg-white/[0.04] transition-all duration-500 flex flex-col group relative backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-black/60 rounded-xl px-4 py-1.5 text-[10px] font-black text-violet-400 uppercase tracking-widest-label border border-violet-500/20">
            Day {post.day.toString().padStart(2, '0')}
          </div>
          <span className={`text-[8px] font-black uppercase tracking-widest-label px-2 py-0.5 rounded-lg border ${stageColors[post.funnelStage]}`}>
            {post.funnelStage}
          </span>
        </div>
        
        <h4 className="text-base font-bold text-white mb-4 group-hover:text-violet-300 transition-colors leading-tight font-display h-12 line-clamp-2">
          {post.title}
        </h4>
        
        <div className="space-y-4 mb-6 flex-1">
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
            {post.outline}
          </p>
          <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Authority</span>
            <span className="text-[10px] text-violet-400 font-black font-display">{post.suggestedWordCount}+ WDS</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={handleWriteBlog}
            disabled={isWriting}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 font-black text-[9px] uppercase tracking-widest-label transition-all flex items-center justify-center gap-2 text-white shadow-lg"
          >
            {isWriting ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {isWriting ? 'Synthesizing Authority...' : 'Generate 2K+ Word Deep-Dive'}
          </button>
        </div>
      </div>

      {showModal && fullPost && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-[#0a0a0f] border border-white/10 w-full max-w-6xl max-h-full flex flex-col rounded-[50px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-black/40">
              <div className="max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">2025 Trend Aligned</span>
                   <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">~{Math.ceil(fullPost.split(' ').length / 200)} Min Read</span>
                </div>
                <h3 className="text-3xl font-black text-white font-display tracking-tight leading-tight uppercase">{post.title}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/10">
              <article className="prose prose-invert lg:prose-xl max-w-none prose-headings:font-display prose-headings:tracking-tighter prose-headings:uppercase prose-p:font-medium prose-p:text-slate-400 prose-code:text-cyan-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(fullPost) as string }} />
              </article>
            </div>

            <div className="p-10 border-t border-white/5 bg-black/60 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                   <p className="text-xs text-white font-black uppercase tracking-widest-label">Master Strike Asset Synthesized</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{fullPost.split(' ').length.toLocaleString()} Words | GEO & SGE Optimized</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const html = marked.parse(fullPost);
                    navigator.clipboard.writeText(html as string);
                    alert("HTML publication asset copied.");
                  }}
                  className="px-8 py-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest-label transition-all"
                >
                  Copy HTML
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullPost);
                    alert("Markdown asset copied.");
                  }}
                  className="px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest-label transition-all flex items-center gap-3 shadow-xl shadow-white/5"
                >
                  Copy Markdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogContentPlanView;
