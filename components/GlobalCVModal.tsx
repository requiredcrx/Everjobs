
import React, { useState, useRef } from 'react';
// Fix: Added Briefcase to lucide-react imports
import { X, Upload, FileText, Loader2, Sparkles, CheckCircle2, ArrowRight, BrainCircuit, Briefcase } from 'lucide-react';
// Fix: Removed CVAnalysis from '../types' as it is defined in geminiService
import { Job } from '../types';
// Fix: Added CVAnalysis to geminiService import
import { analyzeCV, CVAnalysis } from '../services/geminiService';

interface GlobalCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onJobSelect: (jobId: string) => void;
}

const GlobalCVModal: React.FC<GlobalCVModalProps> = ({ isOpen, onClose, jobs, onJobSelect }) => {
  const [cvFile, setCvFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setCvFile({ name: file.name, base64, mimeType: file.type });
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!cvFile) return;
    setLoading(true);
    const result = await analyzeCV(
      { base64: cvFile.base64, mimeType: cvFile.mimeType },
      { allJobs: jobs }
    );
    setAnalysis(result);
    setLoading(false);
  };

  const recommendedJobs = analysis?.recommendedJobIds 
    ? jobs.filter(j => analysis.recommendedJobIds!.includes(j.id))
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-2xl text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Career Profiler</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Powered by Gemini 2.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 space-y-8">
          {!analysis ? (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-slate-900">Unlock your professional potential</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">Upload your resume to receive a strategic compatibility report and discover the best-matching roles across Nigeria.</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
                <div className="bg-white p-5 rounded-full shadow-lg group-hover:scale-110 transition-transform mb-6">
                  <Upload size={32} className="text-indigo-600" />
                </div>
                <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">
                  {cvFile ? cvFile.name : 'Select Resume File'}
                </p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">PDF, DOCX, or TXT</p>
              </div>

              {cvFile && (
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Start AI Analysis'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              {/* Profile Assessment */}
              <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-black border-4 border-white/20">
                     {analysis.matchScore}%
                   </div>
                   <div>
                     <h4 className="text-indigo-200 font-black uppercase text-[10px] tracking-widest mb-1">AI Talent Score</h4>
                     <p className="text-2xl font-black">{analysis.verdict}</p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>

              {/* Advice */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">
                  <BrainCircuit size={16} className="text-indigo-600" />
                  Tailoring Advice
                </h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                  {analysis.tailoringAdvice}
                </div>
              </div>

              {/* Recommended Jobs */}
              <div className="space-y-4">
                <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest">Best Job Matches</h4>
                <div className="grid gap-3">
                  {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => onJobSelect(job.id)}
                      className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-400 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                          {job.logo ? <img src={job.logo} className="w-full h-full object-cover" /> : <Briefcase size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{job.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.company} • {job.location}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  )) : (
                    <p className="text-slate-400 italic text-sm text-center py-4">No direct matches found. Try refining your keywords.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setAnalysis(null)}
                className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Analyze Another CV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalCVModal;
