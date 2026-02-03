
import { AppLocation, Job, Company } from './types';

export const LOCATIONS = [
  AppLocation.LAGOS,
  AppLocation.ABUJA,
  AppLocation.OGUN,
  AppLocation.REMOTE
];

export const CATEGORIES = [
  'Software Engineering',
  'Marketing',
  'Design',
  'Finance',
  'Healthcare',
  'Sales',
  'Customer Support',
  'Data Science',
  'Product Management'
];

export const MOCK_COMPANIES: Record<string, Company> = {
  'Paystack': {
    name: 'Paystack',
    description: 'Paystack is a technology company solving payments problems for ambitious businesses. Our mission is to help businesses in Africa become profitable, envied, and loved.',
    website: 'https://paystack.com',
    industry: 'Fintech',
    location: 'Lagos, Nigeria',
    employeeCount: '200 - 500',
    logo: 'https://picsum.photos/id/1/100/100'
  },
  'Flutterwave': {
    name: 'Flutterwave',
    description: 'Flutterwave provides the easiest and most reliable payments solution for businesses anywhere in the world. We are building the payments infrastructure for Africa.',
    website: 'https://flutterwave.com',
    industry: 'Fintech',
    location: 'Lagos, Nigeria',
    employeeCount: '500 - 1000',
    logo: 'https://picsum.photos/id/2/100/100'
  },
  'Zenith Bank': {
    name: 'Zenith Bank',
    description: 'Zenith Bank Plc is a Nigerian financial services provider. It is licensed as a commercial bank by the Central Bank of Nigeria, the national banking regulator.',
    website: 'https://zenithbank.com',
    industry: 'Banking',
    location: 'Victoria Island, Lagos',
    employeeCount: '10,000+',
    logo: 'https://picsum.photos/id/3/100/100'
  }
};

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Paystack',
    companyDetail: MOCK_COMPANIES['Paystack'],
    location: 'Lagos',
    salary: '₦800k - ₦1.2M',
    type: 'Full-time',
    postedAt: '2 days ago',
    description: 'We are looking for a senior frontend engineer to join our core product team in Lagos. You will be responsible for building high-quality, performant React applications. Requirements: 5+ years experience, expert React/TS knowledge, and a passion for UX.',
    sourceUrl: 'https://paystack.com/careers',
    category: 'Software Engineering',
    logo: 'https://picsum.photos/id/1/100/100'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Flutterwave',
    companyDetail: MOCK_COMPANIES['Flutterwave'],
    location: 'Lagos',
    salary: 'Negotiable',
    type: 'Full-time',
    postedAt: '1 day ago',
    description: 'Help us build the future of payments in Africa. You will be responsible for creating seamless user experiences across our mobile and web applications. We value simplicity and attention to detail.',
    sourceUrl: 'https://flutterwave.com/careers',
    category: 'Design',
    logo: 'https://picsum.photos/id/2/100/100'
  },
  {
    id: '3',
    title: 'Financial Analyst',
    company: 'Zenith Bank',
    companyDetail: MOCK_COMPANIES['Zenith Bank'],
    location: 'Abuja',
    salary: '₦500k - ₦700k',
    type: 'Full-time',
    postedAt: '4 hours ago',
    description: 'Join our Abuja branch as a Financial Analyst. Requirements include a BSc in Accounting or Finance, 2 years experience in banking, and expert Excel skills.',
    sourceUrl: 'https://zenithbank.com',
    category: 'Finance',
    logo: 'https://picsum.photos/id/3/100/100'
  }
];
