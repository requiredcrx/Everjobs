
import React, { useEffect, useState, useRef } from 'react';
// Fix: Removed CVAnalysis from '../types' import as it is defined in geminiService
import { Job } from '../types';
import { X, MapPin, Briefcase, DollarSign, ExternalLink, Sparkles, Loader2, FileText, CheckCircle2, AlertCircle, Upload, Lightbulb, ArrowRight } from 'lucide-react';
// Fix: Added CVAnalysis to geminiService import
import { getJobInsights, analyzeCV, AIInsights, CVAnalysis } from '../services/geminiService';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
  onJobSelect?: (jobId: string) => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose, onJobSelect }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [cvFile, setCvFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (job) {
      setLoadingInsights(true);
      setCvAnalysis(null);
      setCvFile(null);
      getJobInsights(job.description).then(res => {
        setInsights(res);
        setLoadingInsights(false);
      });
    } else {
      setInsights(null);
    }
  }, [job]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setCvFile({ name: file.name, base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!job || !cvFile) return;
    setLoadingAnalysis(true);
    const result = await analyzeCV(
      { base64: cvFile.base64, mimeType: cvFile.mimeType },
      { jobDescription: job.description }
    );
    setCvAnalysis(result);
    setLoadingAnalysis(false);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
                {job.logo ? <img src={job.logo} alt={job.company} className="w-full h-full object-cover" /> : <Briefcase className="text-indigo-600" />}
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h2>
                <p className="text-slate-500 font-medium">{job.company}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-10">
          {/* Core Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Location</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <MapPin size={16} className="text-indigo-500" />
                  {job.location}
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Salary</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <DollarSign size={16} className="text-indigo-500" />
                  {job.salary || 'Negotiable'}
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl hidden sm:block">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Type</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Briefcase size={16} className="text-indigo-500" />
                  {job.type}
                </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="relative bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={20} />
                <h3 className="font-black text-lg">AI Quick Take</h3>
              </div>
              {loadingInsights && <Loader2 className="animate-spin text-indigo-400" size={20} />}
            </div>
            {insights && (
              <p className="text-slate-600 italic leading-relaxed text-sm bg-slate-50 p-4 rounded-xl">
                {insights.summary}
              </p>
            )}
          </div>

          {/* Enhanced CV Analysis Section */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                  <FileText />
                  Smart CV Match
                </h3>
                <p className="text-slate-400 text-sm">Upload PDF, DOCX or TXT to check your compatibility.</p>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.docx,.txt" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/10"
                >
                  <Upload size={16} />
                  {cvFile ? 'Change File' : 'Upload CV'}
                </button>
              </div>
            </div>

            {cvFile && !cvAnalysis && (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center gap-4">
                <div className="text-indigo-400 font-bold text-sm">File: {cvFile.name}</div>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={loadingAnalysis}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAnalysis ? <Loader2 className="animate-spin" size={20} /> : 'Run Compatibility Engine'}
                </button>
              </div>
            )}

            {cvAnalysis && (
              <div className="space-y-8 animate-in zoom-in duration-500">
                {/* Result Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center font-black text-xl">
                      {cvAnalysis.matchScore}%
                    </div>
                    <div>
                      <div className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-1">Verdict</div>
                      <div className="text-xl font-black">{cvAnalysis.verdict}</div>
                    </div>
                  </div>
                </div>

                {/* Tailoring Advice */}
                <div className="bg-indigo-900/40 p-6 rounded-2xl border border-indigo-500/20">
                  <h4 className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">
                    <Lightbulb size={16} />
                    How to Tailor Your CV for this Role
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {cvAnalysis.tailoringAdvice}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {cvAnalysis.missingKeywords.map(kw => (
                        <span key={kw} className="bg-red-500/10 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-red-500/20">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Optimization Steps</h4>
                    <ul className="space-y-2">
                      {cvAnalysis.suggestions.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-indigo-400 font-bold">→</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Other Recommendations */}
                {cvAnalysis.recommendedJobIds && cvAnalysis.recommendedJobIds.length > 0 && (
                  <div className="pt-6 border-t border-white/10">
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Better Fits for You</h4>
                    <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors" onClick={() => onJobSelect?.(cvAnalysis.recommendedJobIds![0])}>
                      <span className="text-sm font-bold">We found another listing that matches your skills better.</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Full Description</h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
          <a 
            href={job.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
          >
            Apply Now
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
