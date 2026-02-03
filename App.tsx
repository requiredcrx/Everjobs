
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bell, User, Filter, Globe, TrendingUp, Loader2, Upload, Sparkles, Building2, ChevronRight, ExternalLink } from 'lucide-react';
import { Job, SearchFilters, AppLocation, Company } from './types';
import { LOCATIONS, CATEGORIES, MOCK_JOBS, MOCK_COMPANIES } from './constants';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import CompanyModal from './components/CompanyModal';
import PostJobModal from './components/PostJobModal';
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
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: AppLocation.LAGOS,
    category: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
    const savedCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      // First time use: Load mocks but convert postedAt to timestamps
      const timestampedMocks = MOCK_JOBS.map(j => ({
        ...j,
        postedAt: Date.now() - (Math.random() * 1000 * 60 * 60 * 48) // Random time within last 48h
      }));
      setJobs(timestampedMocks);
    }

    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      setCompanies(MOCK_COMPANIES);
    }
  }, []);

  // Save data whenever it changes
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
      // Map Gemini results to ensure timestamp
      const resultsWithTime = results.map(r => ({
        ...r,
        postedAt: Date.now()
      })) as Job[];
      setJobs(prev => [...resultsWithTime, ...prev]);
    } else {
      const filtered = jobs.filter(job => {
        const matchesQuery = job.title.toLowerCase().includes(filters.query.toLowerCase()) || 
                            job.company.toLowerCase().includes(filters.query.toLowerCase());
        const matchesLocation = filters.location === 'Remote' ? true : job.location === filters.location;
        return matchesQuery && matchesLocation;
      });
      // Logic for filtering existing list if Gemini finds nothing
      if (filtered.length === 0) {
        // Just clear search if nothing found
      }
    }
    setIsSearching(false);
  };

  const handleCompanySelect = (companyName: string) => {
    const company = companies[companyName] || {
      name: companyName,
      description: "Company details are currently unavailable, but they are hiring through our platform!",
      website: "#",
      industry: "Unknown",
      location: "Nigeria",
      employeeCount: "Unknown"
    };
    setSelectedCompany(company);
  };

  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    
    // Auto-create company if it doesn't exist
    if (!companies[newJob.company]) {
      const newCompany: Company = {
        name: newJob.company,
        description: `A fast-growing organization hiring talent for ${newJob.title}. Join a team dedicated to excellence and innovation in Nigeria.`,
        website: "https://everjobs.ng",
        industry: newJob.category || "Professional Services",
        location: newJob.location,
        employeeCount: "1 - 50",
        logo: newJob.logo
      };
      setCompanies(prev => ({
        ...prev,
        [newJob.company]: newCompany
      }));
    }
  };

  // Fix: Explicitly type companiesList as Company[] to resolve 'unknown' property access errors
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
            <button onClick={() => setActiveView('jobs')} className={`transition-colors py-2 border-b-2 ${activeView === 'jobs' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Find Jobs</button>
            <button onClick={() => setActiveView('companies')} className={`transition-colors py-2 border-b-2 ${activeView === 'companies' ? 'text-indigo-600 border-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'}`}>Companies</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Bell size={20} /></button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <button onClick={() => setIsPostJobOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg"><User size={18} /><span className="hidden sm:inline">Post a Job</span></button>
          </div>
        </div>
      </nav>

      {activeView === 'jobs' && (
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-100 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[60%] bg-purple-100 rounded-full blur-[120px] opacity-40"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-indigo-100"><Sparkles size={12} />Now Powered by Gemini AI</div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">Connecting Nigeria's <br /><span className="gradient-text">top talent</span> with the best.</h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">Search {jobs.length}+ hand-verified opportunities in Lagos, Abuja, and Ogun.</p>
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-2xl shadow-slate-200 flex flex-col md:flex-row items-stretch gap-2 border border-slate-100">
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0"><Search className="text-slate-400" size={20} /><input type="text" placeholder="Job title, keywords, or company" className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 placeholder:text-slate-400" value={filters.query} onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))} /></div>
              <div className="flex-[0.6] flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0"><MapPin className="text-slate-400" size={20} /><select className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 appearance-none cursor-pointer" value={filters.location} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}>{LOCATIONS.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select></div>
              <button type="submit" disabled={isSearching} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 min-w-[140px]">{isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search Jobs'}</button>
            </form>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {activeView === 'jobs' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-72 flex-shrink-0 space-y-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-indigo-600" />Top Recruiting</h3>
                <div className="space-y-4">
                  {companiesList.slice(0, 4).map((comp) => (
                    <div key={comp.name} onClick={() => setSelectedCompany(comp)} className="group flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-2xl transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">{comp.logo ? <img src={comp.logo} className="w-full h-full object-cover" /> : <Building2 size={16} className="text-slate-300" />}</div>
                      <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">{comp.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{jobs.filter(j => j.company === comp.name).length} Openings</p></div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400" />
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveView('companies')} className="w-full text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 pt-2 border-t border-slate-50">View All Companies</button>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2 leading-tight">Elevate your reach</h3><p className="text-indigo-200 text-sm mb-6 font-medium">Get your profile in front of decision-makers at Nigeria's top companies.</p><button className="w-full bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"><Upload size={14} />Analyze CV</button></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
              </div>
            </aside>
            <div className="flex-1 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Opportunities</h2><p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Found {jobs.length} jobs in {filters.location}</p></div>
              </div>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onClick={setSelectedJob} onCompanyClick={handleCompanySelect} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="text-center space-y-4 mb-16"><h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Featured Companies</h1><p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto italic">Explore the top organizations in Lagos, Abuja, and Ogun that are actively hiring talent.</p></div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {companiesList.map(company => {
                  const companyJobsCount = jobs.filter(j => j.company === company.name).length;
                  return (
                    <div key={company.name} onClick={() => setSelectedCompany(company)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-8"><div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center overflow-hidden">{company.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" />}</div><span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100">{company.industry}</span></div>
                      <div className="space-y-4 mb-8"><h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{company.name}</h3><p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">{company.description}</p></div>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50"><div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest"><MapPin size={14} className="text-indigo-400" />{company.location}</div><div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">{companyJobsCount} JOBS<ChevronRight size={14} /></div></div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 max-w-xs"><div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('jobs')}><div className="bg-indigo-600 p-1.5 rounded-lg"><Briefcase className="text-white" size={16} /></div><span className="text-xl font-black tracking-tight text-slate-900">Ever<span className="gradient-text">Jobs</span></span></div><p className="text-slate-400 text-sm font-medium leading-relaxed">Nigeria's most advanced AI-powered job board focusing on verified roles in key economic hubs.</p></div>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4"><h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Platform</h4><ul className="space-y-2 text-sm text-slate-500 font-bold"><li><button onClick={() => setActiveView('jobs')} className="hover:text-indigo-600 transition-colors">Browse Jobs</button></li><li><button onClick={() => setActiveView('companies')} className="hover:text-indigo-600 transition-colors">Companies</button></li></ul></div>
            <div className="space-y-4"><h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Support</h4><ul className="space-y-2 text-sm text-slate-500 font-bold"><li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li></ul></div>
          </div>
        </div>
      </footer>

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <CompanyModal company={selectedCompany} allJobs={jobs} onClose={() => setSelectedCompany(null)} onJobClick={(job) => { setSelectedCompany(null); setSelectedJob(job); }} />
      <PostJobModal isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} onAddJob={handleAddJob} />
    </div>
  );
};

export default App;
