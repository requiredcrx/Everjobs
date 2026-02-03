
export interface Company {
  name: string;
  description: string;
  website: string;
  logo?: string;
  industry: string;
  location: string;
  employeeCount: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyDetail?: Company;
  location: 'Lagos' | 'Ogun' | 'Abuja' | 'Remote';
  salary?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedAt: string;
  description: string;
  sourceUrl: string;
  logo?: string;
  category: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
}

export enum AppLocation {
  LAGOS = 'Lagos',
  OGUN = 'Ogun',
  ABUJA = 'Abuja',
  REMOTE = 'Remote'
}
