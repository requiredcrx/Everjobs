
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bell, User, Filter, Globe, TrendingUp, Loader2, Upload, Sparkles, Building2, ChevronRight, ExternalLink, Linkedin, Twitter, Instagram, Send, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { Job, SearchFilters, AppLocation, Company } from './types';
import { LOCATIONS, CATEGORIES, MOCK_JOBS, MOCK_COMPANIES } from './constants';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import CompanyModal from './components/CompanyModal';
import PostJobModal from './components/PostJobModal';
import GlobalCVModal from './components/GlobalCVModal';
import { searchJobsWithGemini, parseCareerQuery } from './services/geminiService';

const STORAGE_KEY_JOBS = 'everjobs_data_jobs';
const STORAGE_KEY_COMPANIES = 'everjobs_data_companies';

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
  
  // Suggested Prompts for the AI Agent
  const suggestions = [
    "Python developer in Lagos looking for remote role paying at least 600k/month",
    "Senior React roles in Abuja",
    "Internships for designers in Ogun",
    "High paying marketing jobs in Lagos"
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
    const savedCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      const timestampedMocks = MOCK_JOBS.map(j => ({
        ...j,
        postedAt: Date.now() - (Math.random() * 1000 * 60 * 60 * 48)
      }));
      setJobs(timestampedMocks);
    }

    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      setCompanies(MOCK_COMPANIES);
    }
  }, []);

  // Save data
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    }
    if (Object.keys(companies).length > 0) {
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    }
  }, [jobs, companies]);

  // Define handleAddJob to fix the missing name error on line 304
  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleAgentSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setSearchError(false);
    setActiveView('jobs');
    
    try {
      // 1. Let AI parse the natural language
      const { query, location } = await parseCareerQuery(queryText);
      
      // 2. Fetch results based on parsed criteria
      const results = await searchJobsWithGemini(query, location);
      if (results && results.length > 0) {
        const resultsWithTime = results.map(r => ({ ...r, postedAt: Date.now() })) as Job[];
        setJobs(prev => [...resultsWithTime, ...prev]);
      } else if (results.length === 0) {
         // This might mean no jobs found OR a failed API call that returned []
         // The service handles retries internally.
      }
    } catch (err) {
      console.error("Search failed completely:", err);
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
    
    // Scroll to results
    const resultsElement = document.getElementById('results-view');
    resultsElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestionClick = (text: string) => {
    setAgentQuery(text);
    handleAgentSearch(text);
  };

  const companiesList: Company[] = Object.values(companies);

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      {/* Navigation */}
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
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Bell size={20} /></button>
            <button onClick={() => setIsPostJobOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg"><User size={18} /><span className="hidden sm:inline">Post a Job</span></button>
          </div>
        </div>
      </nav>

      {/* Hero with Reimagined Career Agent */}
      {activeView === 'jobs' && (
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 shadow-sm">
              <Sparkles size={14} className="text-indigo-500" />
              Your Personal Career Agent
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Tell EverJobs what <br />
              <span className="gradient-text">you're looking for.</span>
            </h1>

            {/* AI Agent Interaction Field */}
            <div className="relative group max-w-3xl mx-auto">
              <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[36px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isSearching ? 'agent-glow opacity-100' : ''}`}></div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAgentSearch(agentQuery); }}
                className="relative flex items-center bg-white rounded-[32px] p-2 shadow-2xl border border-slate-100 transition-all"
              >
                <div className="flex-1 flex items-center px-6 gap-4">
                  <MessageSquare className="text-indigo-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="E.g. I'm a Python developer in Lagos looking for a remote role paying at least 600k/month" 
                    className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 placeholder:text-slate-300 py-4"
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-100 shrink-0"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="translate-x-0.5" />}
                </button>
              </form>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {suggestions.map((text, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestionClick(text)}
                  className="px-4 py-2 bg-white/50 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all whitespace-nowrap"
                >
                  "{text}"
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main content */}
      <main id="results-view" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {activeView === 'jobs' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-72 flex-shrink-0 space-y-8">
              {/* Companies Card */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-indigo-600" />Market Trends</h3>
                <div className="space-y-4">
                  {companiesList.slice(0, 4).map((comp) => (
                    <div key={comp.name} onClick={() => {setSelectedCompany(comp); setActiveView('companies');}} className="group flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-2xl transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">{comp.logo ? <img src={comp.logo} className="w-full h-full object-cover" /> : <Building2 size={16} className="text-slate-300" />}</div>
                      <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate">{comp.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{jobs.filter(j => j.company === comp.name).length} Openings</p></div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Global AI Analysis Sidebar Button */}
              <div 
                className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.02]" 
                onClick={() => setIsGlobalCVOpen(true)}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight">Elevate your reach</h3>
                  <p className="text-indigo-200 text-sm mb-8 font-medium leading-relaxed text-balance">Let our AI match your CV with Nigeria's top-tier organizations automatically.</p>
                  <button className="w-full bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors hover:bg-indigo-50">
                    <Upload size={16} className="text-indigo-600" />
                    Analyze Resume
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[70px] opacity-20 -mr-16 -mt-16"></div>
              </div>
            </aside>
            <div className="flex-1 space-y-10">
              {searchError ? (
                <div className="text-center py-20 bg-red-50/50 rounded-[40px] border border-dashed border-red-200 animate-in fade-in">
                  <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-red-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">The Agent is taking a nap</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">We're having trouble connecting to the AI hub. This usually clears up in a minute.</p>
                  <button 
                    onClick={() => handleAgentSearch(agentQuery)}
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl"
                  >
                    <RefreshCw size={14} />
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
                    {jobs.map((job, idx) => (
                      <JobCard key={job.id} index={idx} job={job} onClick={setSelectedJob} onCompanyClick={c => {const comp = companies[c]; if(comp) setSelectedCompany(comp);}} />
                    ))}
                  </div>
                  {jobs.length === 0 && !isSearching && (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-slate-300" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No roles found</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">Try talking to the Career Agent using a broader term like "Engineering" or "Sales".</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-job-entry">
            {companiesList.map(company => (
              <div key={company.name} onClick={() => setSelectedCompany(company)} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {company.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 leading-tight">{company.name}</h3>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{company.description}</p>
                <div className="flex items-center justify-between text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">
                  <span>{jobs.filter(j => j.company === company.name).length} Open Jobs</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Improved Footer */}
      <footer className="bg-white border-t border-slate-200 pt-24 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100"><Briefcase className="text-white" size={20} /></div>
                <span className="text-2xl font-black text-slate-900">Ever<span className="gradient-text">Jobs</span></span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Nigeria's most advanced AI job platform, powered by Gemini technology to automate your career growth.</p>
              <div className="flex items-center gap-6 text-slate-300">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors"><Linkedin size={24} /></a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors"><Twitter size={24} /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors"><Instagram size={24} /></a>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Career Agent</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-bold">
                <li><button onClick={() => setActiveView('jobs')} className="hover:text-indigo-600 transition-colors">Start Conversation</button></li>
                <li><button onClick={() => setIsGlobalCVOpen(true)} className="hover:text-indigo-600 transition-colors">AI CV Diagnostic</button></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Market Intel</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Company Access</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-bold">
                <li><button onClick={() => setIsPostJobOpen(true)} className="hover:text-indigo-600 transition-colors">Post Talent Request</button></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Verify Organization</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Recruiter API</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Innovation Hubs</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-bold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Lagos Tech</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Abuja FinTech</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Ogun Production</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© {new Date().getFullYear()} EverJobs Nigeria. Powered by Gemini Core.</p>
            <div className="flex gap-10 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <a href="#" className="hover:text-slate-900 transition-colors">Legal</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} onJobSelect={id => {
        const found = jobs.find(j => j.id === id);
        if (found) { setSelectedJob(found); }
      }} />
      <CompanyModal company={selectedCompany} allJobs={jobs} onClose={() => setSelectedCompany(null)} onJobClick={setSelectedJob} />
      <PostJobModal isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} onAddJob={handleAddJob} />
      <GlobalCVModal isOpen={isGlobalCVOpen} onClose={() => setIsGlobalCVOpen(false)} jobs={jobs} onJobSelect={id => {
        setIsGlobalCVOpen(false);
        const found = jobs.find(j => j.id === id);
        if (found) { setSelectedJob(found); }
      }} />
    </div>
  );
};

export default App;
