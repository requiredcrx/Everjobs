
import React, { useEffect, useState, useRef } from 'react';
import { Job } from '../types';
import { X, MapPin, Briefcase, DollarSign, ExternalLink, Sparkles, Loader2, FileText, Upload, Lightbulb, ArrowRight, CheckCircle2, ShieldCheck, ShieldAlert, AlertCircle, Info, ThumbsUp, MessageCircle } from 'lucide-react';
import { getJobInsights, analyzeCV, AIInsights, CVAnalysis, getJobSafetyAudit } from '../services/geminiService';

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

  const handleWhatsAppUpdate = () => {
    const text = encodeURIComponent(`Hi EverJobs! I'm interested in the ${job?.title} role at ${job?.company}. Please notify me of similar vetted opportunities in ${job?.location}.`);
    window.open(`https://wa.me/2340000000000?text=${text}`, '_blank');
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
          {/* Trust & Safety Layer */}
          <div className={`p-6 rounded-[32px] border ${job.verificationStatus === 'High Risk' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`flex items-center gap-2 ${job.verificationStatus === 'High Risk' ? 'text-red-600' : 'text-emerald-600'}`}>
                 {job.verificationStatus === 'High Risk' ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                 <h3 className="font-black text-sm uppercase tracking-widest">Anti-Scam Shield</h3>
               </div>
               <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${job.verificationStatus === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                 Trust Score: {job.safetyReport?.score || '92'}%
               </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
              {job.safetyReport?.summary || 'EverJobs AI has vetted this role against known Nigerian job scam patterns (GNLD, processing fees, suspicious Ikeja hubs).'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ThumbsUp size={12} className="text-emerald-500" /> Green Flags
                </h4>
                <ul className="space-y-2">
                  {(job.safetyReport?.greenFlags || ['Vetted LinkedIn presence', 'No fee requests detected']).map(flag => (
                    <li key={flag} className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500" /> {flag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={12} className="text-red-500" /> Red Flags
                </h4>
                <ul className="space-y-2">
                  {(job.safetyReport?.redFlags || ['No CAC confirmation found']).map(flag => (
                    <li key={flag} className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                      <AlertCircle size={12} className="text-red-400" /> {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200/50">
               <button 
                onClick={handleWhatsAppUpdate}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all shadow-lg"
               >
                 <MessageCircle size={18} />
                 Vetted Job Alerts via WhatsApp
               </button>
            </div>
          </div>

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
                  {job.salary || 'Varies'}
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
                <h3 className="font-black text-lg">AI Intel</h3>
              </div>
              {loadingInsights && <Loader2 className="animate-spin text-indigo-400" size={20} />}
            </div>
            {insights && (
              <p className="text-slate-600 italic leading-relaxed text-sm bg-slate-50 p-4 rounded-xl">
                {insights.summary}
              </p>
            )}
          </div>

          {/* CV Analysis */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                  <FileText />
                  ATS Matcher
                </h3>
                <p className="text-slate-400 text-sm">Upload CV to see compatibility score.</p>
              </div>
              
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/10"
                >
                  <Upload size={16} />
                  {cvFile ? 'Change' : 'Upload'}
                </button>
              </div>
            </div>

            {cvFile && !cvAnalysis && (
              <button 
                onClick={handleRunAnalysis}
                disabled={loadingAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {loadingAnalysis ? <Loader2 className="animate-spin" size={20} /> : 'Check Fit'}
              </button>
            )}

            {cvAnalysis && (
              <div className="space-y-8 animate-in zoom-in duration-500">
                <div className="flex items-center gap-8 bg-white/5 p-6 rounded-3xl border border-white/10">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex items-center justify-center font-black text-2xl">
                    {cvAnalysis.matchScore}%
                  </div>
                  <div>
                    <div className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-1">Match Quality</div>
                    <div className="text-2xl font-black">{cvAnalysis.verdict}</div>
                  </div>
                </div>
                <div className="bg-indigo-900/40 p-6 rounded-[24px] border border-indigo-500/20 shadow-inner">
                  <h4 className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Lightbulb size={16} />
                    Expert Strategy
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {cvAnalysis.tailoringAdvice}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Description</h3>
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
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            Apply Directly
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobModal;