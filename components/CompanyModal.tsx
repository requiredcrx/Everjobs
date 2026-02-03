
import React from 'react';
import { Company, Job } from '../types';
import { X, Globe, MapPin, Users, Briefcase, ExternalLink } from 'lucide-react';
import JobCard from './JobCard';

interface CompanyModalProps {
  company: Company | null;
  allJobs: Job[];
  onClose: () => void;
  onJobClick: (job: Job) => void;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ company, allJobs, onClose, onJobClick }) => {
  if (!company) return null;

  const companyJobs = allJobs.filter(j => j.company === company.name);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 -mt-12 relative overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                {company.logo ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" /> : <Briefcase size={32} className="text-slate-300" />}
              </div>
            </div>
            <div className="pt-12 md:pt-14 space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900">{company.name}</h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{company.industry}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-500 font-medium text-sm">
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                  <Globe size={16} /> {company.website.replace(/^https?:\/\//, '')}
                </a>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} /> {company.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={16} /> {company.employeeCount} employees
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">About {company.name}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Current Openings</h3>
                <div className="grid gap-4">
                  {companyJobs.length > 0 ? (
                    companyJobs.map(job => (
                      <JobCard key={job.id} job={job} onClick={onJobClick} />
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No other open positions at this time.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4">Company Snapshot</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Industry</span>
                    <span className="font-bold text-slate-700">{company.industry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Location</span>
                    <span className="font-bold text-slate-700">{company.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Size</span>
                    <span className="font-bold text-slate-700">{company.employeeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
