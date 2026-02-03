
import React from 'react';
import { Job } from '../types';
import { Briefcase, MapPin, Clock, ExternalLink, Building2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  onCompanyClick?: (companyName: string) => void;
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

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onCompanyClick }) => {
  const handleCompanyClick = (e: React.MouseEvent) => {
    if (onCompanyClick) {
      e.stopPropagation();
      onCompanyClick(job.company);
    }
  };

  return (
    <div 
      onClick={() => onClick(job)}
      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 group-hover:scale-110 transition-transform">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="text-indigo-600 w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {job.title}
            </h3>
            <button 
              onClick={handleCompanyClick}
              className="text-slate-500 text-sm font-semibold flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <Building2 size={12} />
              {job.company}
            </button>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full border border-emerald-100">
          {job.type}
        </div>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <MapPin size={14} className="text-indigo-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Clock size={14} className="text-indigo-400" />
          <span>{formatRelativeTime(job.postedAt)}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-black uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black">
          {job.category}
        </span>
        <div className="flex items-center gap-1 text-xs font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
          VIEW DETAILS
          <ExternalLink size={12} />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
