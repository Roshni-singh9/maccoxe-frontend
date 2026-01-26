
export enum DocumentType {
  EMPLOYMENT_CONTRACT = 'Employment Contract',
  INTERNSHIP_CONTRACT = 'Internship Contract',
  INTERNSHIP_CERTIFICATE = 'Internship Certificate',
  COURSE_COMPLETION_CERTIFICATE = 'Course Completion Certificate',
  PROJECT_COMPLETION_CERTIFICATE = 'Project Completion Certificate',
  EXCELLENCE_AWARD = 'Employee Excellence Award',
  TRAINING_CERTIFICATE = 'Training Certificate',
  SALARY_SLIP = 'Salary Slip',
  INVOICE = 'Invoice',
  APPOINTMENT_LETTER = 'Appointment Letter',
  EXPERIENCE_LETTER = 'Experience Letter',
  NDA = 'Non-Disclosure Agreement',
  RELIEVING_LETTER = 'Relieving Letter',
  TERMINATION_LETTER = 'Termination Letter',
  PROMOTION_LETTER = 'Promotion Letter',
  WARNING_LETTER = 'Warning Letter',
  CONSULTANT_AGREEMENT = 'Consultant Agreement',
  ASSET_HANDOVER = 'Asset Handover Form'
}

export type TemplateTheme = 'classic' | 'modern-blue' | 'vibrant-purple';

export interface Signatory {
  name: string;
  role: string;
  signUrl: string;
}

export interface SalaryComponent {
  description: string;
  earnings?: number;
  deductions?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DocumentData {
  companyName: string;
  companyAddress: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyRegNumber?: string;
  recipientName: string;
  recipientAddress: string;
  recipientEmail?: string;
  recipientPhone?: string;
  date: string;
  logoUrl?: string;
  companySignUrl?: string;
  companySignLabel?: string;
  signatories: Signatory[];
  role?: string;
  salary?: string;
  startDate?: string;
  endDate?: string;
  extraTerms?: string;
  acceptanceTerm?: string;
  signatoryMainName: string;
  signatoryMainRole: string;
  showRecipientSign?: boolean;
  templateTheme: TemplateTheme;
  // Contract Specific
  joiningDate?: string;
  probationPeriod?: string;
  noticePeriod?: string;
  reportingTo?: string;
  workMode?: string;
  workingHours?: string;
  annualCTC?: string;
  // Salary Slip Specific
  monthYear?: string;
  employeeId?: string;
  department?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  workingDays?: string;
  paidDays?: string;
  salaryComponents?: SalaryComponent[];
  totalEarnings?: number;
  totalDeductions?: number;
  netPay?: number;
  netPayInWords?: string;
  // NDA Specific
  purposeOfDisclosure?: string;
  confidentialityDuration?: string;
  // Experience Letter Specific
  projectsHandled?: string;
  performanceRemarks?: string;
  // Promotion Specific
  oldDesignation?: string;
  newDesignation?: string;
  effectiveDate?: string;
  salaryRevision?: string;
  // Relieving Specific
  resignationDate?: string;
  lastWorkingDay?: string;
  clearanceStatus?: string;
  // Invoice Specific
  invoiceNumber?: string;
  dueDate?: string;
  taxRate?: number;
  taxAmount?: number;
  subTotal?: number;
  grandTotal?: number;
  invoiceItems?: InvoiceItem[];
  currency?: string;
  poNumber?: string;
}

export interface SavedDocument {
  id: string;
  type: DocumentType;
  recipientName: string;
  recipientEmail: string;
  date: string;
  content: string;
  formData: DocumentData;
  timestamp: number;
}
