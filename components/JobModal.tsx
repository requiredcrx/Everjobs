
import React, { useEffect, useState, useRef } from 'react';
import { Job } from '../types';
import { X, MapPin, Briefcase, DollarSign, ExternalLink, Sparkles, Loader2, FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { getJobInsights, analyzeCVForJob, AIInsights, CVAnalysis } from '../services/geminiService';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [cvText, setCvText] = useState('');
  const [showCvInput, setShowCvInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (job) {
      setLoadingInsights(true);
      setCvAnalysis(null);
      setCvText('');
      setShowCvInput(false);
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
        const text = event.target?.result as string;
        setCvText(text);
        setShowCvInput(true);
      };
      reader.readAsText(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!job || !cvText) return;
    setLoadingAnalysis(true);
    const result = await analyzeCVForJob(job.description, cvText);
    setCvAnalysis(result);
    setLoadingAnalysis(false);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
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

          {/* AI Talent Insights */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl"><Sparkles size={20} /></div>
                  <h3 className="font-black text-lg">AI Talent Insights</h3>
                </div>
                {loadingInsights && <Loader2 className="animate-spin text-indigo-400" size={20} />}
              </div>

              {insights ? (
                <div className="space-y-6">
                  <p className="text-slate-600 italic leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-400">
                    "{insights.summary}"
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Why you'll love it
                      </h4>
                      <ul className="space-y-2">
                        {insights.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-500" />
                        Must-Have Skills
                      </h4>
                      <ul className="space-y-2">
                        {insights.requirements.map((req, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-slate-300 italic">
                  Collecting AI insights...
                </div>
              )}
            </div>
          </div>

          {/* CV Analysis Section */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-indigo-400" />
                  CV Compatibility Check
                </h3>
                <p className="text-slate-400 text-sm">Upload your CV to see how you match up for this role.</p>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/10"
                >
                  <Upload size={16} />
                  Upload .txt CV
                </button>
              </div>
            </div>

            {showCvInput && !cvAnalysis && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2">Review your content</p>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-300 min-h-[100px]"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={loadingAnalysis}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAnalysis ? <Loader2 className="animate-spin" size={20} /> : 'Analyze My Match'}
                </button>
              </div>
            )}

            {cvAnalysis && (
              <div className="space-y-8 animate-in zoom-in duration-500">
                <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path className="text-white/10" strokeDasharray="100, 100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-indigo-500" strokeDasharray={`${cvAnalysis.matchScore}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="text-white text-[8px] font-black" textAnchor="middle" fill="currentColor">{cvAnalysis.matchScore}%</text>
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest">Verdict</h4>
                    <p className="text-2xl font-black text-white">{cvAnalysis.verdict}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Missing from your CV</h4>
                    <div className="flex flex-wrap gap-2">
                      {cvAnalysis.missingKeywords.map(kw => (
                        <span key={kw} className="bg-red-500/10 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-red-500/20">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Actionable Tips</h4>
                    <ul className="space-y-2">
                      {cvAnalysis.suggestions.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-indigo-400 font-bold">→</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">About the Role</h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
          <a 
            href={job.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
          >
            Apply Directly
            <ExternalLink size={18} />
          </a>
          <button className="px-6 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-2xl transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
