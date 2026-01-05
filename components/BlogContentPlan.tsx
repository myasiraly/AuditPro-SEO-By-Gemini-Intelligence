
import React, { useState } from 'react';
import { ContentPlan, BlogPost } from '../types';
import { GeminiService } from '../services/gemini';
import { marked } from 'marked';

interface BlogContentPlanViewProps {
  plan: ContentPlan;
}

const BlogContentPlanView: React.FC<BlogContentPlanViewProps> = ({ plan }) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-8 rounded-3xl">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Blog Strategy Overview
        </h3>
        <p className="text-slate-300 leading-relaxed text-lg">
          {plan.strategySummary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all flex flex-col group relative">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-slate-400">
            Day {post.day}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${stageColors[post.funnelStage]}`}>
            {post.funnelStage}
          </span>
        </div>
        
        <h4 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors leading-snug">
          {post.title}
        </h4>
        
        <div className="space-y-4 mb-6">
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Focus & Outline</h5>
            <p className="text-sm text-slate-400 leading-relaxed italic line-clamp-4">
              {post.outline}
            </p>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Target Length</span>
            <span className="text-slate-300 font-semibold">{post.suggestedWordCount} words</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="pt-4 border-t border-slate-800">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Target Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {post.targetKeywords.map((keyword, i) => (
                <span key={i} className="text-[10px] font-medium text-blue-500 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleWriteBlog}
            disabled={isWriting}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-blue-900/10"
          >
            {isWriting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
            {isWriting ? 'Writing Article...' : 'Write Full Article'}
          </button>
        </div>
      </div>

      {/* Modal for Full Blog Post */}
      {showModal && fullPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-full flex flex-col rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10 rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-white line-clamp-1">{post.title}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">{post.funnelStage} Strategy Content</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div 
                className="prose prose-invert"
                dangerouslySetInnerHTML={{ __html: marked.parse(fullPost) as string }}
              />
            </div>

            <div className="p-6 border-t border-slate-800 flex items-center justify-end bg-slate-800/20 rounded-b-3xl">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullPost);
                  alert("Copied to clipboard!");
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Content
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogContentPlanView;
