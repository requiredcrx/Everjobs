
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bell, User, Filter, Globe, TrendingUp, Loader2, Upload, Sparkles, Building2, ChevronRight, ExternalLink, Linkedin, Twitter, Instagram, Send, MessageSquare, AlertCircle, RefreshCw, ShieldCheck, MessageCircle } from 'lucide-react';
import { Job, Company } from './types';
import { MOCK_JOBS, MOCK_COMPANIES } from './constants';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import CompanyModal from './components/CompanyModal';
import PostJobModal from './components/PostJobModal';
import GlobalCVModal from './components/GlobalCVModal';
import { searchJobsWithGemini, parseCareerQuery, getJobSafetyAudit } from './services/geminiService';

const STORAGE_KEY_JOBS = 'everjobs_data_jobs';
const STORAGE_KEY_COMPANIES = 'everjobs_data_companies';

const JobSkeleton = () => (
  <div className="bg-white rounded-[32px] p-8 border border-slate-100 h-72 flex flex-col gap-6 relative overflow-hidden">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl skeleton shrink-0"></div>
        <div className="space-y-2">
          <div className="h-5 w-40 skeleton rounded-lg"></div>
          <div className="h-4 w-24 skeleton rounded-lg"></div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-6 w-16 skeleton rounded-xl"></div>
        <div className="h-5 w-20 skeleton rounded-lg"></div>
      </div>
    </div>
    <div className="flex gap-4">
      <div className="h-4 w-24 skeleton rounded-lg"></div>
      <div className="h-4 w-24 skeleton rounded-lg"></div>
      <div className="h-4 w-20 skeleton rounded-lg"></div>
    </div>
    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between">
      <div className="h-4 w-20 skeleton rounded-lg"></div>
      <div className="h-4 w-24 skeleton rounded-lg"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'jobs' | 'companies'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isGlobalCVOpen, setIsGlobalCVOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [agentQuery, setAgentQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  
  const suggestions = [
    "Python developer in Lagos (Remote)",
    "Senior React roles in Abuja",
    "Design internships in Ogun",
    "Customer success roles in Ikeja"
  ];

  useEffect(() => {
    const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
    const savedCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      setJobs(MOCK_JOBS.map(j => ({
        ...j,
        verificationStatus: 'Verified' as const
      })));
    }

    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      setCompanies(MOCK_COMPANIES);
    }
  }, []);

  useEffect(() => {
    if (jobs.length > 0) localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    if (Object.keys(companies).length > 0) localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  }, [jobs, companies]);

  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleAgentSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setSearchError(false);
    setActiveView('jobs');
    setLastQuery(queryText);
    
    try {
      const { query, location } = await parseCareerQuery(queryText);
      const results = await searchJobsWithGemini(query, location);
      
      if (results && results.length > 0) {
        const auditedResults = await Promise.all(results.map(async (job) => {
          try {
            const audit = await getJobSafetyAudit(job);
            return { 
              ...job, 
              postedAt: Date.now(),
              verificationStatus: audit.status,
              safetyReport: audit
            };
          } catch (e) {
            return { ...job, postedAt: Date.now(), verificationStatus: 'Unverified' as const };
          }
        }));
        setJobs(prev => [...auditedResults, ...prev]);
      }
    } catch (err) {
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setAgentQuery(text);
    handleAgentSearch(text);
  };

  const openWhatsApp = () => {
    const contextText = lastQuery ? ` based on my search for "${lastQuery}"` : "";
    const text = encodeURIComponent(`Hi EverJobs! I'm looking for vetted career opportunities in Nigeria${contextText}. Please keep me updated.`);
    window.open(`https://wa.me/2340000000000?text=${text}`, '_blank');
  };

  const companiesList: Company[] = Object.values(companies);

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      <nav className="sticky top-0 z-40 glass border-b border-slate-200 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('jobs')}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Briefcase className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ever<span className="gradient-text">Jobs</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <button onClick={() => setActiveView('jobs')} className={`transition-colors py-2 border-b-2 ${activeView === 'jobs' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Career Agent</button>
            <button onClick={() => setActiveView('companies')} className={`transition-colors py-2 border-b-2 ${activeView === 'companies' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Companies</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPostJobOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg"><User size={18} /><span className="hidden sm:inline">Post Job</span></button>
          </div>
        </div>
      </nav>

      {activeView === 'jobs' && (
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
              <ShieldCheck size={14} className="text-emerald-500" />
              100% Vetted AI Career Hub
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Nigeria's Safest <br />
              <span className="gradient-text">Job Search Agent.</span>
            </h1>

            <div className="relative group max-w-3xl mx-auto">
              <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[36px] blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isSearching ? 'agent-glow opacity-100' : ''}`}></div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAgentSearch(agentQuery); }}
                className="relative flex items-center bg-white rounded-[32px] p-2 shadow-2xl border border-slate-100 transition-all"
              >
                <div className="flex-1 flex items-center px-6 gap-4">
                  <MessageSquare className="text-indigo-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Describe your ideal role (e.g. Sales in Lagos, Remote Design...)" 
                    className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 py-4"
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg shrink-0"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="translate-x-0.5" />}
                </button>
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {suggestions.map((text, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestionClick(text)}
                  className="px-4 py-2 bg-white/50 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  "{text}"
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {activeView === 'jobs' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-72 flex-shrink-0 space-y-8">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[32px] text-white shadow-2xl space-y-4 relative overflow-hidden">
                <ShieldCheck size={28} className="text-emerald-400" />
                <h3 className="font-black text-lg leading-tight">Scam Guard v2.0</h3>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">Our AI filters out 99% of GNLD recruitments and fake Ikeja interview centers automatically.</p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              </div>
              <button 
                onClick={() => setIsGlobalCVOpen(true)}
                className="w-full bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center group hover:border-indigo-400 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="text-indigo-600" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">CV Profiler</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optimize for ATS</p>
              </button>
            </aside>
            <div className="flex-1 space-y-10">
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
                {isSearching ? (
                  <>
                    <JobSkeleton />
                    <JobSkeleton />
                    <JobSkeleton />
                    <JobSkeleton />
                  </>
                ) : (
                  jobs.map((job, idx) => (
                    <JobCard key={job.id} index={idx} job={job} onClick={setSelectedJob} onCompanyClick={c => {const comp = companies[c]; if(comp) setSelectedCompany(comp);}} />
                  ))
                )}
                {!isSearching && jobs.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No vetted roles found yet.</h3>
                    <p className="text-slate-400 text-sm mt-2">Try adjusting your search criteria or talking to the Career Agent.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-job-entry">
            {companiesList.map(company => (
              <div key={company.name} onClick={() => setSelectedCompany(company)} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {company.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{company.name}</h3>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{company.description}</p>
                <div className="flex items-center justify-between text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                  <span>{jobs.filter(j => j.company === company.name).length} Open Roles</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action */}
      <button 
        onClick={openWhatsApp}
        className="fixed bottom-8 right-8 z-[90] bg-[#25D366] text-white w-16 h-16 rounded-full flex items-center justify-center whatsapp-float hover:scale-110 transition-transform active:scale-95 group"
      >
        <MessageCircle size={32} />
        {/* Pulse effect for notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        <div className="absolute right-full mr-4 bg-white text-slate-900 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {lastQuery ? `Vetted ${lastQuery} alerts` : 'Job Alerts on WhatsApp'}
        </div>
      </button>

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} onJobSelect={id => {
        const found = jobs.find(j => j.id === id);
        if (found) setSelectedJob(found);
      }} />
      <CompanyModal company={selectedCompany} allJobs={jobs} onClose={() => setSelectedCompany(null)} onJobClick={setSelectedJob} />
      <PostJobModal isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} onAddJob={handleAddJob} />
      <GlobalCVModal isOpen={isGlobalCVOpen} onClose={() => setIsGlobalCVOpen(false)} jobs={jobs} onJobSelect={id => {
        setIsGlobalCVOpen(false);
        const found = jobs.find(j => j.id === id);
        if (found) setSelectedJob(found);
      }} />
    </div>
  );
};

export default App;
