
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bell, User, Filter, Globe, TrendingUp, Loader2, Upload, Sparkles, Building2, ChevronRight, ExternalLink, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Job, SearchFilters, AppLocation, Company } from './types';
import { LOCATIONS, CATEGORIES, MOCK_JOBS, MOCK_COMPANIES } from './constants';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import CompanyModal from './components/CompanyModal';
import PostJobModal from './components/PostJobModal';
import GlobalCVModal from './components/GlobalCVModal';
import { searchJobsWithGemini } from './services/geminiService';

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
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: AppLocation.LAGOS,
    category: ''
  });

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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setActiveView('jobs');
    
    const results = await searchJobsWithGemini(filters.query, filters.location);
    if (results && results.length > 0) {
      const resultsWithTime = results.map(r => ({ ...r, postedAt: Date.now() })) as Job[];
      setJobs(prev => [...resultsWithTime, ...prev]);
    }
    setIsSearching(false);
  };

  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    if (!companies[newJob.company]) {
      const newCompany: Company = {
        name: newJob.company,
        description: `A fast-growing organization hiring talent for ${newJob.title}.`,
        website: "https://everjobs.ng",
        industry: newJob.category || "Professional Services",
        location: newJob.location,
        employeeCount: "1 - 50",
        logo: newJob.logo
      };
      setCompanies(prev => ({ ...prev, [newJob.company]: newCompany }));
    }
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
            <button onClick={() => setActiveView('jobs')} className={`transition-colors py-2 border-b-2 ${activeView === 'jobs' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Find Jobs</button>
            <button onClick={() => setActiveView('companies')} className={`transition-colors py-2 border-b-2 ${activeView === 'companies' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Companies</button>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Bell size={20} /></button>
            <button onClick={() => setIsPostJobOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg"><User size={18} /><span className="hidden sm:inline">Post a Job</span></button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {activeView === 'jobs' && (
        <section className="relative py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-indigo-100">
              <Sparkles size={12} />
              AI-Powered Matchmaking
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">Nigeria's <span className="gradient-text">verified</span> portal for top careers.</h1>
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-2xl shadow-slate-200 flex flex-col md:flex-row items-stretch gap-2 border border-slate-100">
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0"><Search className="text-slate-400" size={20} /><input type="text" placeholder="Job title, keywords, or company" className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900" value={filters.query} onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))} /></div>
              <div className="flex-[0.6] flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0"><MapPin className="text-slate-400" size={20} /><select className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 appearance-none cursor-pointer" value={filters.location} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}>{LOCATIONS.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select></div>
              <button type="submit" disabled={isSearching} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 min-w-[140px]">{isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search Jobs'}</button>
            </form>
          </div>
        </section>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {activeView === 'jobs' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-72 flex-shrink-0 space-y-8">
              {/* Companies Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-indigo-600" />Top Recruiting</h3>
                <div className="space-y-4">
                  {companiesList.slice(0, 4).map((comp) => (
                    <div key={comp.name} onClick={() => setSelectedCompany(comp)} className="group flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-2xl transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">{comp.logo ? <img src={comp.logo} className="w-full h-full object-cover" /> : <Building2 size={16} className="text-slate-300" />}</div>
                      <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate">{comp.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{jobs.filter(j => j.company === comp.name).length} Openings</p></div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Elevate Your Reach Button - FIXED */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setIsGlobalCVOpen(true)}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight">Elevate your reach</h3>
                  <p className="text-indigo-200 text-sm mb-8 font-medium leading-relaxed">Let our AI match your CV with the top 1% of opportunities in Nigeria.</p>
                  <button className="w-full bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl flex items-center justify-center gap-3 group-hover:scale-[1.02] transition-transform">
                    <Upload size={16} className="text-indigo-600" />
                    Analyze Resume
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[70px] opacity-20 -mr-16 -mt-16"></div>
              </div>
            </aside>
            <div className="flex-1 space-y-10">
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onClick={setSelectedJob} onCompanyClick={c => setSelectedCompany(companies[c])} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companiesList.map(company => (
              <div key={company.name} onClick={() => setSelectedCompany(company)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-6 flex items-center justify-center">
                  {company.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{company.name}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{company.description}</p>
                <div className="flex items-center justify-between text-indigo-600 font-black text-xs uppercase tracking-widest">
                  <span>{jobs.filter(j => j.company === company.name).length} Jobs</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg"><Briefcase className="text-white" size={16} /></div>
                <span className="text-2xl font-black text-slate-900">Ever<span className="gradient-text">Jobs</span></span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Connecting Nigeria's top talent with verified opportunities in the country's biggest economic hubs.</p>
              <div className="flex items-center gap-4 text-slate-400">
                <a href="#" className="hover:text-indigo-600 transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="hover:text-indigo-600 transition-colors"><Twitter size={20} /></a>
                <a href="#" className="hover:text-indigo-600 transition-colors"><Instagram size={20} /></a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-900">For Candidates</h4>
              <ul className="space-y-2 text-sm text-slate-500 font-bold">
                <li><button onClick={() => setActiveView('jobs')} className="hover:text-indigo-600">Browse Jobs</button></li>
                <li><button onClick={() => setIsGlobalCVOpen(true)} className="hover:text-indigo-600">CV Analysis</button></li>
                <li><a href="#" className="hover:text-indigo-600">Career Insights</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-900">For Employers</h4>
              <ul className="space-y-2 text-sm text-slate-500 font-bold">
                <li><button onClick={() => setIsPostJobOpen(true)} className="hover:text-indigo-600">Post a Job</button></li>
                <li><a href="#" className="hover:text-indigo-600">Talent Search</a></li>
                <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-900">Location Hubs</h4>
              <ul className="space-y-2 text-sm text-slate-500 font-bold">
                <li><a href="#" className="hover:text-indigo-600">Lagos Jobs</a></li>
                <li><a href="#" className="hover:text-indigo-600">Abuja Jobs</a></li>
                <li><a href="#" className="hover:text-indigo-600">Remote Works</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-bold">© {new Date().getFullYear()} EverJobs Nigeria. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-slate-400 font-bold">
              <a href="#" className="hover:text-slate-900">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900">Terms of Service</a>
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
