
import React from 'react';
import { Job } from '../types';
import { Briefcase, MapPin, Clock, ExternalLink, Building2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  onCompanyClick?: (companyName: string) => void;
  index?: number;
}

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onCompanyClick, index = 0 }) => {
  const handleCompanyClick = (e: React.MouseEvent) => {
    if (onCompanyClick) {
      e.stopPropagation();
      onCompanyClick(job.company);
    }
  };

  return (
    <div 
      onClick={() => onClick(job)}
      style={{ animationDelay: `${index * 100}ms` }}
      className="animate-job-entry group bg-white rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border border-slate-100 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 group-hover:scale-110 transition-transform duration-500">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="text-indigo-600 w-7 h-7" />
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-lg leading-tight line-clamp-1">
              {job.title}
            </h3>
            <button 
              onClick={handleCompanyClick}
              className="text-slate-500 text-sm font-bold flex items-center gap-1.5 hover:text-indigo-600 transition-colors mt-1"
            >
              <Building2 size={14} className="text-indigo-400" />
              {job.company}
            </button>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-xl border border-emerald-100">
          {job.type}
        </div>
      </div>

      <div className="flex flex-wrap gap-y-3 gap-x-6 mb-8">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
          <MapPin size={16} className="text-indigo-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
          <Clock size={16} className="text-indigo-400" />
          <span>{formatRelativeTime(job.postedAt)}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
        <span className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-black">
          {job.category}
        </span>
        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          View Intel
          <ExternalLink size={14} />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
