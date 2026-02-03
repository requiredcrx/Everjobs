
import React, { useState, useRef } from 'react';
import { X, CheckCircle2, Loader2, Briefcase, MapPin, DollarSign, Link, Upload, ImageIcon } from 'lucide-react';
import { Job, AppLocation } from '../types';
import { LOCATIONS, CATEGORIES } from '../constants';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (job: Job) => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onAddJob }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: AppLocation.LAGOS as string,
    salary: '',
    type: 'Full-time' as any,
    description: '',
    category: CATEGORIES[0],
    sourceUrl: ''
  });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        logo: logoPreview || undefined,
        postedAt: 'Just now',
        location: formData.location as any,
      };
      onAddJob(newJob);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLogoPreview(null);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Post a Job</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center space-y-4 animate-in fade-in scale-in">
            <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Job Posted Successfully!</h3>
            <p className="text-slate-500">Your job listing is now live on EverJobs Nigeria.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[75vh]">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center bg-slate-50 overflow-hidden transition-colors"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={24} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload company logo</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="e.g. Senior Product Manager"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="e.g. Acme Inc"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <select 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                >
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Type</label>
                <select 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salary Range (Optional)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl pl-10 focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="e.g. ₦400k - ₦600k"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Link/Email</label>
              <div className="relative">
                <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="url" 
                  className="w-full bg-slate-50 border-slate-100 rounded-xl pl-10 focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="https://company.com/apply"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Description</label>
              <textarea 
                required
                rows={4}
                className="w-full bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium text-sm" 
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Publish Listing'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostJobModal;
