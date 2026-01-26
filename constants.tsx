
import React from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Receipt, 
  ShieldCheck, 
  Award,
  LogOut,
  TrendingUp,
  Wallet,
  PackageCheck,
  AlertOctagon
} from 'lucide-react';
import { DocumentType } from './types';

export const DOC_TEMPLATES = [
  {
    type: DocumentType.EMPLOYMENT_CONTRACT,
    icon: <Briefcase className="w-6 h-6" />,
    description: "Legal suite for all hiring agreements (Full-time, Internship, Freelance, Appointment)."
  },
  {
    type: DocumentType.SALARY_SLIP,
    icon: <Wallet className="w-6 h-6" />,
    description: "Monthly compensation breakdown including earnings, deductions, and tax info."
  },
  {
    type: DocumentType.NDA,
    icon: <ShieldCheck className="w-6 h-6" />,
    description: "Non-Disclosure Agreement to protect proprietary source code and data."
  },
  {
    type: DocumentType.EXPERIENCE_LETTER,
    icon: <Award className="w-6 h-6" />,
    description: "Official tenure verification and competency certification."
  },
  {
    type: DocumentType.PROMOTION_LETTER,
    icon: <TrendingUp className="w-6 h-6" />,
    description: "Confirmation of role advancement and updated compensation."
  },
  {
    type: DocumentType.RELIEVING_LETTER,
    icon: <LogOut className="w-6 h-6" />,
    description: "Formal release confirmation after resignation or exit."
  },
  {
    type: DocumentType.INVOICE,
    icon: <Receipt className="w-6 h-6" />,
    description: "Tax-compliant billing for software services or consulting."
  },
  {
    type: DocumentType.ASSET_HANDOVER,
    icon: <PackageCheck className="w-6 h-6" />,
    description: "Inventory record of issued IT hardware and credentials."
  },
  {
    type: DocumentType.WARNING_LETTER,
    icon: <AlertOctagon className="w-6 h-6" />,
    description: "Formal notice regarding performance or conduct issues."
  },
  {
    type: DocumentType.INTERNSHIP_CERTIFICATE,
    icon: <GraduationCap className="w-6 h-6" />,
    description: "Certification for completion of a technical internship program."
  }
];
