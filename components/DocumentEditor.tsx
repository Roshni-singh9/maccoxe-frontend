
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  FileDown, 
  Wand2, 
  Upload, 
  X, 
  Target,
  Database,
  CheckCircle,
  PenTool,
  Hash,
  Plus,
  Trash2,
  Award,
  AlertCircle,
  MessageSquareText,
  Mail,
  Phone,
  Globe,
  UserCircle,
  CreditCard,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Settings2,
  FileText,
  Eye,
  Check,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type as TypeIcon,
  Palette
} from 'lucide-react';
import { DocumentType, DocumentData, SavedDocument, Signatory, SalaryComponent } from '../types';
import { generateProfessionalContentStream, extractSalarySlipData } from '../services/geminiService';

interface DocumentEditorProps {
  type: DocumentType;
  initialDoc?: SavedDocument;
  onBack: () => void;
  appBranding?: {
    name: string;
    logo: string;
    slogan: string;
  };
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ type, onBack, initialDoc, appBranding }) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [activeType, setActiveType] = useState<DocumentType>(initialDoc?.type || type);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [formData, setFormData] = useState<DocumentData>(() => {
    return initialDoc?.formData || {
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      companyWebsite: '',
      companyRegNumber: '',
      logoUrl: '',
      signatories: [
        { name: '', role: '', signUrl: '' }
      ],
      recipientName: '',
      recipientAddress: '',
      recipientEmail: '',
      recipientPhone: '',
      date: new Date().toISOString().split('T')[0],
      role: '',
      salary: '',
      annualCTC: '',
      startDate: '',
      endDate: '',
      joiningDate: '',
      probationPeriod: '',
      noticePeriod: '',
      reportingTo: '',
      workMode: '',
      workingHours: '',
      extraTerms: '',
      acceptanceTerm: '',
      signatoryMainName: '',
      signatoryMainRole: '',
      showRecipientSign: true,
      templateTheme: 'classic',
      monthYear: '',
      employeeId: '',
      department: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      workingDays: '',
      paidDays: '',
      salaryComponents: [],
      totalEarnings: 0,
      totalDeductions: 0,
      netPay: 0,
      netPayInWords: '',
      purposeOfDisclosure: '',
      confidentialityDuration: ''
    };
  });

  const [generatedContent, setGeneratedContent] = useState<string>(initialDoc?.content || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [salarySlipImage, setSalarySlipImage] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const isSalarySlip = activeType === DocumentType.SALARY_SLIP;
  const isContract = activeType === DocumentType.EMPLOYMENT_CONTRACT || activeType === DocumentType.INTERNSHIP_CONTRACT || activeType === DocumentType.CONSULTANT_AGREEMENT || activeType === DocumentType.APPOINTMENT_LETTER;
  const isCertificate = activeType.toLowerCase().includes('certificate') || activeType.toLowerCase().includes('award');

  useEffect(() => {
    if (isSalarySlip && generatedContent && !isGenerating) {
      try {
        const parsed = JSON.parse(generatedContent);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) { }
    }
  }, [generatedContent, isSalarySlip, isGenerating]);

  // Sync editor innerHTML with state if generated externally
  useEffect(() => {
    if (editorRef.current && generatedContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = generatedContent;
    }
  }, [generatedContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setGeneratedContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setGeneratedContent(editorRef.current.innerHTML);
    }
  };

  const handleSalaryComponentChange = (index: number, field: keyof SalaryComponent, value: any) => {
    const updated = [...(formData.salaryComponents || [])];
    updated[index] = { ...updated[index], [field]: value };
    const earnings = updated.reduce((acc, curr) => acc + (Number(curr.earnings) || 0), 0);
    const deductions = updated.reduce((acc, curr) => acc + (Number(curr.deductions) || 0), 0);
    setFormData(prev => ({ 
      ...prev, 
      salaryComponents: updated,
      totalEarnings: earnings,
      totalDeductions: deductions,
      netPay: earnings - deductions
    }));
  };

  const addSalaryComponent = () => {
    setFormData(prev => ({
      ...prev,
      salaryComponents: [...(prev.salaryComponents || []), { description: '', earnings: 0, deductions: 0 }]
    }));
  };

  const removeSalaryComponent = (index: number) => {
    const updated = (formData.salaryComponents || []).filter((_, i) => i !== index);
    const earnings = updated.reduce((acc, curr) => acc + (Number(curr.earnings) || 0), 0);
    const deductions = updated.reduce((acc, curr) => acc + (Number(curr.deductions) || 0), 0);
    setFormData(prev => ({ 
      ...prev, 
      salaryComponents: updated,
      totalEarnings: earnings,
      totalDeductions: deductions,
      netPay: earnings - deductions
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatoryChange = (index: number, field: keyof Signatory, value: string) => {
    const updated = [...formData.signatories];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, signatories: updated }));
  };

  const handleSignatoryUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...formData.signatories];
        updated[index].signUrl = reader.result as string;
        setFormData(prev => ({ ...prev, signatories: updated }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSignatory = () => {
    setFormData(prev => ({
      ...prev,
      signatories: [...prev.signatories, { name: '', role: '', signUrl: '' }]
    }));
  };

  const removeSignatory = (index: number) => {
    if (formData.signatories.length <= 1) return;
    const updated = formData.signatories.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, signatories: updated }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(""); 
    if (editorRef.current) editorRef.current.innerHTML = "";
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      if (activeType === DocumentType.SALARY_SLIP) {
        // For salary slip, generate components and update formData
        let fullResponse = "";
        await generateProfessionalContentStream(activeType, formData, (chunk) => {
          fullResponse += chunk;
        });
        const salaryData = JSON.parse(fullResponse);
        setFormData(prev => ({ ...prev, ...salaryData }));
      } else {
        await generateProfessionalContentStream(activeType, formData, (chunk) => setGeneratedContent(chunk));
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      setErrorMessage(error.message || "Synthesis failed. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtractSalarySlip = async () => {
    if (!salarySlipImage) return;
    setIsExtracting(true);
    setErrorMessage(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const extractedData = await extractSalarySlipData(base64);
        setFormData(prev => ({ ...prev, ...extractedData }));
      };
      reader.readAsDataURL(salarySlipImage);
    } catch (error: any) {
      console.error("Extraction failed:", error);
      setErrorMessage(error.message || "Extraction failed. Check API Key.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveToVault = () => {
    if (!generatedContent && !isSalarySlip) return;
    setIsSaving(true);
    const newDoc: SavedDocument = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      type: activeType,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail || '',
      date: formData.date,
      content: generatedContent,
      formData: formData,
      timestamp: Date.now()
    };
    try {
      const history = JSON.parse(localStorage.getItem('it_docgen_history') || '[]');
      localStorage.setItem('it_docgen_history', JSON.stringify([newDoc, ...history]));
      setTimeout(() => { setIsSaving(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }, 800);
    } catch (e) {
      console.error("Vault save error", e);
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    const element = documentRef.current;
    const opt = {
      margin: 0,
      filename: `${activeType}_${formData.recipientName}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: isCertificate ? 'landscape' : 'portrait' }
    };
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false));
    } else {
      setIsDownloading(false);
    }
  };

  const renderCertificate = () => (
    <div className="h-full w-full border-[12px] border-double border-[#0c1b4d] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-32 h-32 border-l-8 border-t-8 border-indigo-100 -translate-x-4 -translate-y-4"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-8 border-b-8 border-indigo-100 translate-x-4 translate-y-4"></div>
      
      <div className="mb-6">
        {formData.logoUrl ? (
          <img src={formData.logoUrl} className="h-20 object-contain mx-auto" alt="Logo" />
        ) : (
          <div className="w-20 h-20 bg-[#0c1b4d] rounded-full flex items-center justify-center mx-auto mb-4">
             <Award size={40} className="text-white" />
          </div>
        )}
      </div>

      {formData.companyName && <h1 className="text-xl font-black text-slate-500 uppercase tracking-[0.5em] mb-4">{formData.companyName}</h1>}
      <h2 className="text-5xl font-serif italic text-[#0c1b4d] mb-8">{activeType}</h2>
      
      {formData.recipientName && (
        <>
          <p className="text-lg font-medium text-slate-600 mb-4 uppercase tracking-widest">This is to certify that</p>
          <p className="text-4xl font-black text-slate-900 mb-8 border-b-2 border-slate-200 inline-block px-12 pb-2">{formData.recipientName}</p>
        </>
      )}
      
      <div className="doc-body max-w-2xl mx-auto text-center leading-loose text-slate-700 font-medium mb-12 italic whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: generatedContent || (formData.recipientName ? "This document serves as formal recognition for excellence and dedication shown during the tenure." : "") }} />

      <div className="flex justify-between w-full max-w-4xl px-12 mt-auto pt-12">
        <div className="text-center">
          <p className="text-sm font-bold border-t border-slate-400 pt-2 px-8 uppercase">{new Date(formData.date).toLocaleDateString()}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Issue</p>
        </div>
        {formData.signatories.map((sig, idx) => sig.name && (
          <div key={idx} className="text-center">
            <div className="h-16 flex items-end justify-center mb-2">
               {sig.signUrl && <img src={sig.signUrl} className="max-h-14 object-contain" alt="Signature" />}
            </div>
            <p className="text-sm font-bold border-t border-slate-400 pt-2 px-8 uppercase">{sig.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sig.role}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSalarySlip = () => (
    <div className="p-[5mm] text-slate-900 font-sans">
      <div className="flex justify-between items-start mb-8 border-b-2 border-[#0c1b4d] pb-6">
         <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white flex items-center justify-center p-1 border border-slate-100">
              {formData.logoUrl ? <img src={formData.logoUrl} className="max-w-full max-h-full object-contain" /> : <div className="w-full h-full bg-[#0c1b4d] rounded-xl flex items-center justify-center"><Building2 size={32} className="text-white" /></div>}
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-[#0c1b4d] uppercase leading-none mb-1">{formData.companyName}</h1>
              <p className="text-[9px] font-bold text-[#475569] uppercase tracking-wider max-w-[300px] leading-tight">{formData.companyAddress}</p>
              {formData.companyRegNumber && <p className="text-[8px] font-black text-indigo-600 mt-1 uppercase tracking-widest">CIN: {formData.companyRegNumber}</p>}
              <div className="mt-2 space-y-0.5">
                {formData.companyEmail && <p className="text-[8px] font-bold text-slate-500">Email: {formData.companyEmail}</p>}
                {formData.companyPhone && <p className="text-[8px] font-bold text-slate-500">Phone: {formData.companyPhone}</p>}
                {formData.companyWebsite && <p className="text-[8px] font-bold text-slate-500">Website: {formData.companyWebsite}</p>}
              </div>
            </div>
         </div>
         <div className="text-right">
            <h2 className="text-xl font-black text-[#0c1b4d] uppercase mb-1">Pay Slip</h2>
            {formData.monthYear && <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">For {formData.monthYear}</p>}
         </div>
      </div>
      {(formData.recipientName || formData.employeeId || formData.department) && (
        <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] border border-slate-200 p-4 rounded-xl bg-slate-50">
          <div className="space-y-1.5">
            {formData.recipientName && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Employee Name:</span> <span className="font-black">{formData.recipientName}</span></div>}
            {formData.employeeId && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Employee ID:</span> <span className="font-black">{formData.employeeId}</span></div>}
            {formData.department && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Department:</span> <span className="font-black">{formData.department}</span></div>}
            {formData.role && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Designation:</span> <span className="font-black">{formData.role}</span></div>}
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-4">
            {formData.bankName && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Bank Name:</span> <span className="font-black">{formData.bankName}</span></div>}
            {formData.bankAccountNumber && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Bank Account:</span> <span className="font-black">{formData.bankAccountNumber}</span></div>}
            {formData.workingDays && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Working Days:</span> <span className="font-black">{formData.workingDays}</span></div>}
            {formData.paidDays && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase">Paid Days:</span> <span className="font-black">{formData.paidDays}</span></div>}
          </div>
        </div>
      )}
      <table className="w-full text-left border-collapse border border-slate-200 mb-6 text-[11px]">
        <thead>
          <tr className="bg-[#0c1b4d] text-white">
            <th className="p-3 border border-[#0c1b4d] uppercase tracking-widest">Earnings</th>
            <th className="p-3 border border-[#0c1b4d] text-right uppercase tracking-widest">Amount (INR)</th>
            <th className="p-3 border border-[#0c1b4d] uppercase tracking-widest">Deductions</th>
            <th className="p-3 border border-[#0c1b4d] text-right uppercase tracking-widest">Amount (INR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(formData.salaryComponents || []).length > 0 ? (formData.salaryComponents || []).map((comp, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="p-3 border-x border-slate-200 font-medium">{comp.earnings ? comp.description : ''}</td>
              <td className="p-3 border-x border-slate-200 text-right font-black">{comp.earnings ? comp.earnings.toLocaleString() : ''}</td>
              <td className="p-3 border-x border-slate-200 font-medium">{comp.deductions ? comp.description : ''}</td>
              <td className="p-3 border-x border-slate-200 text-right font-black">{comp.deductions ? comp.deductions.toLocaleString() : ''}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-400 italic">No salary components defined</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 font-black">
            <td className="p-3 border border-slate-200 uppercase">Gross Earnings</td>
            <td className="p-3 border border-slate-200 text-right">{formData.totalEarnings?.toLocaleString() || '0'}</td>
            <td className="p-3 border border-slate-200 uppercase">Total Deductions</td>
            <td className="p-3 border border-slate-200 text-right">{formData.totalDeductions?.toLocaleString() || '0'}</td>
          </tr>
        </tfoot>
      </table>
      <div className="flex justify-between items-center bg-slate-100 p-5 rounded-xl border border-slate-200 mb-10">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Pay in Words</p>
          <p className="text-[11px] font-black text-[#0c1b4d] italic uppercase">{formData.netPayInWords || '-'}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Payable</p>
          <p className="text-2xl font-black text-[#0c1b4d]">₹ {formData.netPay?.toLocaleString() || '0'}/-</p>
        </div>
      </div>
    </div>
  );

  const renderStandardDoc = () => (
    <div className="p-[5mm]">
      <div className="flex justify-between items-start mb-12 border-b-2 border-[#0c1b4d] pb-8">
         <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-1 border border-slate-100">
              {formData.logoUrl ? <img src={formData.logoUrl} className="max-w-full max-h-full object-contain" /> : <div className="w-full h-full bg-[#0c1b4d] rounded-xl flex items-center justify-center"><Building2 size={32} className="text-white" /></div>}
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-[#0c1b4d] uppercase leading-none mb-1">{formData.companyName}</h1>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider max-w-[250px]">{formData.companyAddress}</p>
              {formData.companyRegNumber && <p className="text-[8px] font-black text-indigo-600 mt-1 uppercase tracking-widest">Reg No: {formData.companyRegNumber}</p>}
            </div>
         </div>
         <div className="text-right space-y-2">
            {formData.companyPhone && <p className="text-[11px] font-bold text-[#1e293b]">{formData.companyPhone}</p>}
            {formData.companyEmail && <p className="text-[11px] font-bold text-[#1e293b] uppercase">{formData.companyEmail}</p>}
            {formData.companyWebsite && <p className="text-[10px] font-bold text-indigo-500 uppercase">{formData.companyWebsite}</p>}
         </div>
      </div>
      <div className="text-center mb-10">
         <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-[#0c1b4d] border-b-2 border-[#0c1b4d] inline-block px-12 pb-1">{activeType.toUpperCase()}</h2>
         <p className="text-[10px] font-black text-[#475569] mt-2 uppercase tracking-widest">Dated: {new Date(formData.date).toLocaleDateString()}</p>
      </div>
      <div className="flex-1 px-4 mb-10">
         {formData.recipientName && <p className="text-base font-black mb-6 text-[#0c1b4d]">Dear {formData.recipientName},</p>}
         <div className="doc-body text-justify leading-relaxed whitespace-pre-wrap text-[10.5pt] text-[#111827] font-medium mb-12" dangerouslySetInnerHTML={{ __html: generatedContent || (formData.recipientName ? "Your professional content will appear here..." : "") }} />
      </div>
      <div className="mt-20 flex flex-wrap justify-between gap-12 px-4">
        {formData.signatories.map((sig, idx) => sig.name && (
          <div key={idx} className="min-w-[180px]">
            <div className="w-48 border-b-2 border-black mb-2 h-16 flex items-end justify-center">
              {sig.signUrl && <img src={sig.signUrl} className="max-h-14 object-contain" />}
            </div>
            <p className="font-bold text-sm uppercase">{sig.name}</p>
            <p className="text-[10px] uppercase font-black text-slate-400">{sig.role}</p>
          </div>
        ))}
        {formData.showRecipientSign && formData.recipientName && (
          <div className="text-right min-w-[240px]">
            {formData.acceptanceTerm && (
              <p className="text-[9px] italic text-slate-600 mb-4 max-w-[240px] ml-auto leading-tight">{formData.acceptanceTerm}</p>
            )}
            <div className="w-48 border-b-2 border-black mb-2 h-16 ml-auto"></div>
            <p className="font-bold text-sm uppercase">{formData.recipientName}</p>
            <p className="text-[10px] uppercase font-black text-slate-400">Acceptance Signature</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0f172a] overflow-hidden relative">
      {/* SIDEBAR / EDITOR SUITE */}
      <div className={`transition-all duration-500 ease-in-out bg-white border-r border-slate-200 overflow-y-auto no-print flex flex-col shrink-0 shadow-2xl z-50 ${isSidebarCollapsed ? 'w-0 lg:w-0' : 'w-full lg:w-[420px]'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-30 overflow-hidden whitespace-nowrap">
           <div className="flex items-center">
              <button onClick={onBack} className="p-2 text-slate-400 hover:text-cyan-600 bg-slate-50 rounded-lg transition-colors"><ArrowLeft size={18} /></button>
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate ml-4">PRO Editor Suite</h2>
           </div>
           <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-all active:scale-95">
              <ChevronLeft size={20} />
           </button>
        </div>

        <div className="p-6 space-y-8 pb-32 overflow-x-hidden min-w-[380px]">
           {/* TEMPLATE SWITCHER */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><FileText size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Document Template</p></div>
              <select 
                value={activeType} 
                onChange={(e) => setActiveType(e.target.value as DocumentType)} 
                className="w-full px-3 py-2.5 bg-slate-900 text-white border-none rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg outline-none ring-2 ring-slate-800 hover:ring-indigo-500 transition-all"
              >
                <optgroup label="Contracts">
                  <option value={DocumentType.EMPLOYMENT_CONTRACT}>Employment Contract</option>
                  <option value={DocumentType.INTERNSHIP_CONTRACT}>Internship Contract</option>
                  <option value={DocumentType.CONSULTANT_AGREEMENT}>Consultant Agreement</option>
                  <option value={DocumentType.NDA}>NDA Agreement</option>
                </optgroup>
                <optgroup label="Letters">
                  <option value={DocumentType.APPOINTMENT_LETTER}>Appointment Letter</option>
                  <option value={DocumentType.EXPERIENCE_LETTER}>Experience Letter</option>
                  <option value={DocumentType.RELIEVING_LETTER}>Relieving Letter</option>
                  <option value={DocumentType.PROMOTION_LETTER}>Promotion Letter</option>
                  <option value={DocumentType.TERMINATION_LETTER}>Termination Letter</option>
                  <option value={DocumentType.WARNING_LETTER}>Warning Letter</option>
                </optgroup>
                <optgroup label="Certificates">
                  <option value={DocumentType.INTERNSHIP_CERTIFICATE}>Internship Certificate</option>
                  <option value={DocumentType.COURSE_COMPLETION_CERTIFICATE}>Course Completion</option>
                  <option value={DocumentType.EXCELLENCE_AWARD}>Excellence Award</option>
                </optgroup>
                <optgroup label="Finance">
                  <option value={DocumentType.SALARY_SLIP}>Salary Slip</option>
                  <option value={DocumentType.INVOICE}>Professional Invoice</option>
                </optgroup>
              </select>
           </div>
           
           {errorMessage && (
             <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700 shadow-sm">
               <AlertCircle size={14} className="mt-0.5 shrink-0" />
               <div>{errorMessage}</div>
             </div>
           )}

           {/* IDENTITY SECTION */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><Building2 size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Organization Identity</p></div>
              <div className="flex items-center gap-4">
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                {!formData.logoUrl ? (
                  <button onClick={() => logoInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 text-slate-400 shrink-0"><Upload size={14} /><span className="text-[8px] font-black uppercase">Logo</span></button>
                ) : (
                  <div className="relative w-20 h-20"><img src={formData.logoUrl} className="w-full h-full object-contain bg-slate-50 rounded-xl border" /><button onClick={() => setFormData(prev => ({...prev, logoUrl: ''}))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"><X size={10} /></button></div>
                )}
                <div className="flex-1 space-y-2">
                  <input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Company Name" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase" />
                  <div className="relative"><Hash className="absolute left-2.5 top-2 text-slate-400" size={10} /><input name="companyRegNumber" value={formData.companyRegNumber} onChange={handleInputChange} placeholder="Reg Number" className="w-full pl-7 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-indigo-600 uppercase" /></div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="relative"><Mail className="absolute left-2.5 top-2.5 text-slate-400" size={12} /><input name="companyEmail" value={formData.companyEmail || ''} onChange={handleInputChange} placeholder="Company Email" className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium" /></div>
                <div className="relative"><Phone className="absolute left-2.5 top-2.5 text-slate-400" size={12} /><input name="companyPhone" value={formData.companyPhone || ''} onChange={handleInputChange} placeholder="Company Phone" className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium" /></div>
                <div className="relative"><Globe className="absolute left-2.5 top-2.5 text-slate-400" size={12} /><input name="companyWebsite" value={formData.companyWebsite || ''} onChange={handleInputChange} placeholder="Company Website" className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium" /></div>
              </div>
              <textarea name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} placeholder="Office Address" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs h-16 resize-none focus:bg-white transition-colors" />
           </div>

           {/* RECIPIENT SECTION */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><Target size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Recipient Details</p></div>
              <input name="recipientName" value={formData.recipientName} onChange={handleInputChange} placeholder="Recipient Name" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
           </div>

           {/* SALARY SLIP DETAILS */}
           {isSalarySlip && (
             <div className="space-y-6">
                {/* AUTO-FILL FROM SALARY SLIP */}
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                   <div className="flex items-center gap-2 text-indigo-600"><Upload size={12} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Auto-Fill from Salary Slip</p></div>
                   <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setSalarySlipImage(e.target.files?.[0] || null)} 
                      className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                   />
                   <button 
                      onClick={handleExtractSalarySlip} 
                      disabled={!salarySlipImage || isExtracting} 
                      className="w-full py-2.5 bg-[#0c1b4d] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                   >
                      {isExtracting ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      {isExtracting ? 'Extracting...' : 'Extract Details with AI'}
                   </button>
                </div>

                {/* AI SALARY COMPONENT GENERATOR */}
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                   <div className="flex items-center gap-2 text-indigo-600"><Wand2 size={12} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">AI Salary Component Generator</p></div>
                   <textarea name="salaryInstructions" value={formData.salaryInstructions || ''} onChange={handleInputChange} placeholder="Enter salary amount and any specific instructions for Gemini AI (e.g., 'Monthly salary: 50000 INR, include HRA, Conveyance, PF deductions')" className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs h-16 resize-none" />
                   <button 
                      onClick={handleGenerate} 
                      disabled={isGenerating} 
                      className="w-full py-2.5 bg-[#0c1b4d] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                   >
                      {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      {isGenerating ? 'Generating...' : 'Generate Salary Components'}
                   </button>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><UserCircle size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Employee Info</p></div>
                   <div className="grid grid-cols-2 gap-2">
                      <input name="employeeId" value={formData.employeeId || ''} onChange={handleInputChange} placeholder="EMP ID" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold" />
                      <input name="department" value={formData.department || ''} onChange={handleInputChange} placeholder="Department" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold" />
                   </div>
                   <input name="role" value={formData.role || ''} onChange={handleInputChange} placeholder="Designation" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold" />
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><CreditCard size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Bank & Attendance</p></div>
                   <div className="grid grid-cols-2 gap-2">
                      <input name="bankName" value={formData.bankName || ''} onChange={handleInputChange} placeholder="Bank Name" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]" />
                      <input name="ifscCode" value={formData.ifscCode || ''} onChange={handleInputChange} placeholder="IFSC" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]" />
                   </div>
                   <input name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleInputChange} placeholder="Acc Number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]" />
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><MessageSquareText size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Editorial Content</p></div>
                   
                   {/* TOOLBAR */}
                   <div className="bg-slate-900 rounded-xl p-2 flex flex-wrap gap-1 sticky top-0 z-20 shadow-xl border border-slate-800">
                     <div className="flex items-center gap-1 border-r border-slate-700 pr-1 mr-1">
                        <button onClick={() => execCommand('bold')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Bold"><Bold size={14} /></button>
                        <button onClick={() => execCommand('italic')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Italic"><Italic size={14} /></button>
                        <button onClick={() => execCommand('underline')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Underline"><Underline size={14} /></button>
                     </div>
                     
                     <div className="flex items-center gap-1 border-r border-slate-700 pr-1 mr-1">
                        <button onClick={() => execCommand('justifyLeft')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Left"><AlignLeft size={14} /></button>
                        <button onClick={() => execCommand('justifyCenter')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Center"><AlignCenter size={14} /></button>
                        <button onClick={() => execCommand('justifyRight')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Right"><AlignRight size={14} /></button>
                        <button onClick={() => execCommand('justifyFull')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Justify"><AlignJustify size={14} /></button>
                     </div>

                     <div className="flex items-center gap-2">
                        <div className="relative group">
                          <button className="p-1.5 text-white hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors">
                             <TypeIcon size={14} />
                          </button>
                          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl p-2 hidden group-hover:block z-30 shadow-2xl min-w-[140px]">
                             <button onClick={() => execCommand('fontName', 'Inter')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-sans uppercase font-bold">Sans Inter</button>
                             <button onClick={() => execCommand('fontName', 'Lora')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-serif italic">Serif Lora</button>
                             <button onClick={() => execCommand('fontName', 'monospace')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-mono">Monospace</button>
                          </div>
                        </div>

                        <div className="relative group">
                          <button className="p-1.5 text-white hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors">
                             <Palette size={14} />
                          </button>
                          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl p-2 hidden group-hover:grid grid-cols-4 gap-1 z-30 shadow-2xl">
                             {['#000000', '#1e293b', '#475569', '#64748b', '#e11d48', '#2563eb', '#10b981', '#f59e0b'].map(color => (
                               <button key={color} onClick={() => execCommand('foreColor', color)} className="w-5 h-5 rounded shadow-inner" style={{ backgroundColor: color }} />
                             ))}
                          </div>
                        </div>
                     </div>
                   </div>

                   {/* EDITABLE CONTENT AREA */}
                   <div 
                      ref={editorRef}
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: formData.editorialContent || '' }}
                      onInput={(e) => handleInputChange({ target: { name: 'editorialContent', value: e.currentTarget.innerHTML } } as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs min-h-[80px] focus:bg-white transition-colors overflow-auto"
                      placeholder="Add any additional notes or editorial content for the salary slip..."
                   />
                </div>
             </div>
           )}

           {/* AI & MANUAL EDITORIAL SECTION */}
           {!isSalarySlip && (
             <div className="space-y-6">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600"><Wand2 size={12} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Synthesis Engine</p></div>
                  <textarea name="extraTerms" value={formData.extraTerms || ''} onChange={handleInputChange} placeholder="Add custom terms or instructions..." className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs h-20 resize-none" />
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating} 
                    className="w-full py-2.5 bg-[#0c1b4d] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                    {isGenerating ? 'Synthesizing...' : 'Generate AI Content'}
                  </button>
                </div>

                {/* RICH TEXT MANUAL EDITOR SECTION */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2"><MessageSquareText size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Manual Editorial Suite</p></div>
                   
                   {/* TOOLBAR */}
                   <div className="bg-slate-900 rounded-xl p-2 flex flex-wrap gap-1 sticky top-0 z-20 shadow-xl border border-slate-800">
                     <div className="flex items-center gap-1 border-r border-slate-700 pr-1 mr-1">
                        <button onClick={() => execCommand('bold')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Bold"><Bold size={14} /></button>
                        <button onClick={() => execCommand('italic')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Italic"><Italic size={14} /></button>
                        <button onClick={() => execCommand('underline')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Underline"><Underline size={14} /></button>
                     </div>
                     
                     <div className="flex items-center gap-1 border-r border-slate-700 pr-1 mr-1">
                        <button onClick={() => execCommand('justifyLeft')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Left"><AlignLeft size={14} /></button>
                        <button onClick={() => execCommand('justifyCenter')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Center"><AlignCenter size={14} /></button>
                        <button onClick={() => execCommand('justifyRight')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Align Right"><AlignRight size={14} /></button>
                        <button onClick={() => execCommand('justifyFull')} className="p-1.5 text-white hover:bg-slate-700 rounded-lg transition-colors" title="Justify"><AlignJustify size={14} /></button>
                     </div>

                     <div className="flex items-center gap-2">
                        <div className="relative group">
                          <button className="p-1.5 text-white hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors">
                             <TypeIcon size={14} />
                          </button>
                          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl p-2 hidden group-hover:block z-30 shadow-2xl min-w-[140px]">
                             <button onClick={() => execCommand('fontName', 'Inter')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-sans uppercase font-bold">Sans Inter</button>
                             <button onClick={() => execCommand('fontName', 'Lora')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-serif italic">Serif Lora</button>
                             <button onClick={() => execCommand('fontName', 'monospace')} className="w-full text-left px-2 py-1.5 text-[10px] text-white hover:bg-indigo-600 rounded font-mono">Monospace</button>
                          </div>
                        </div>

                        <div className="relative group">
                          <button className="p-1.5 text-white hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors">
                             <Palette size={14} />
                          </button>
                          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl p-2 hidden group-hover:grid grid-cols-4 gap-1 z-30 shadow-2xl">
                             {['#000000', '#1e293b', '#475569', '#64748b', '#e11d48', '#2563eb', '#10b981', '#f59e0b'].map(color => (
                               <button key={color} onClick={() => execCommand('foreColor', color)} className="w-5 h-5 rounded shadow-inner" style={{ backgroundColor: color }} />
                             ))}
                          </div>
                        </div>
                     </div>
                   </div>

                   {/* EDITABLE CONTENT AREA */}
                   <div 
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[400px] text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-serif leading-relaxed shadow-inner overflow-y-auto" 
                      placeholder="Start typing or generating professional content..."
                   />
                </div>
             </div>
           )}

           {/* SIGNATORIES */}
           <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-400"><PenTool size={14} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">Authority Signatures</p></div>
                <button onClick={addSignatory} className="p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"><Plus size={14} /></button>
              </div>
              <div className="space-y-3">
                {formData.signatories.map((sig, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative group hover:border-indigo-100 transition-all shadow-sm">
                    <button onClick={() => removeSignatory(idx)} className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10}/></button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg shrink-0 relative flex items-center justify-center overflow-hidden shadow-inner">
                        {sig.signUrl ? <img src={sig.signUrl} className="w-full h-full object-contain" /> : <Upload size={12} className="text-slate-300" />}
                        <input type="file" onChange={(e) => handleSignatoryUpload(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input value={sig.name} onChange={(e) => handleSignatoryChange(idx, 'name', e.target.value)} placeholder="Name" className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black" />
                        <input value={sig.role} onChange={(e) => handleSignatoryChange(idx, 'role', e.target.value)} placeholder="Role" className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[9px]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* FINAL WRAP UP BUTTON */}
           <div className="pt-10 border-t border-slate-100">
             <button 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 active:scale-95 transition-all group"
             >
                <Eye size={16} className="group-hover:scale-125 transition-transform" />
                Wrap Up & Final Preview
                <Check size={16} />
             </button>
             <p className="text-[9px] text-slate-400 font-bold text-center mt-3 uppercase tracking-widest">Only filled data will be visible in preview</p>
           </div>
        </div>
      </div>

      {/* FLOATING SHOW SIDEBAR BUTTON */}
      {isSidebarCollapsed && (
        <button 
          onClick={() => setIsSidebarCollapsed(false)} 
          className="fixed left-6 top-[50%] -translate-y-[50%] z-50 p-4 bg-white text-indigo-600 rounded-2xl shadow-2xl border border-slate-200 hover:bg-indigo-50 transition-all active:scale-90 animate-in fade-in slide-in-from-left-4"
          title="Show Editor Suite"
        >
          <Settings2 size={24} className="mb-1" />
          <ChevronRight size={24} />
        </button>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-[#e2e8f0] flex flex-col items-center py-10 px-6 transition-all duration-500">
         <div className="w-full max-w-[210mm] flex justify-between items-center mb-8 no-print bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl sticky top-4 z-40">
            <div className="flex items-center gap-3 px-4 border-r border-slate-200 mr-2 shrink-0">
               <ShieldCheck size={18} className="text-emerald-500" />
               <div className="flex flex-col">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Enterprise Suite</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">A4 Compliant</p>
               </div>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
               <button onClick={handleSaveToVault} disabled={(!generatedContent && !isSalarySlip) || isSaving} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all whitespace-nowrap ${saveSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
                 {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <CheckCircle size={14} /> : <Database size={14} />}
                 {saveSuccess ? 'Vault Synced' : 'Sync to Vault'}
               </button>
               <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-200 whitespace-nowrap">
                 {isDownloading ? <Loader2 className="animate-spin" size={14}/> : <FileDown size={14}/>} Export to PDF
               </button>
            </div>
         </div>
         <div id="pdf-document" ref={documentRef} className={`bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative flex flex-col mx-auto text-[#000000] border border-slate-300 transition-all duration-500 ${isCertificate ? 'w-[297mm] h-[210mm]' : 'w-[210mm] min-h-[297mm] p-[15mm]'}`}>
            {isCertificate ? renderCertificate() : isSalarySlip ? renderSalarySlip() : renderStandardDoc()}
         </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
