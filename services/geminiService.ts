
import { GoogleGenAI, Type } from "@google/genai";
import { DocumentType, DocumentData } from "../types";

export const generateProfessionalContentStream = async (
  type: DocumentType,
  data: DocumentData,
  onChunk: (chunk: string) => void
): Promise<void> => {
  // CRITICAL: The API key must be obtained from import.meta.env.VITE_GEMINI_API_KEY.
  // We ensure it is cast to a string to handle potential bundler variations.
  const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || "");
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Gemini API Key is not detected in the environment. Please set VITE_GEMINI_API_KEY in your .env.local file.");
  }

  // Always initialize with named parameter apiKey.
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const isSalarySlip = type === DocumentType.SALARY_SLIP;
  const isInvoice = type === DocumentType.INVOICE;

  // Optimized model for text tasks
  const activeModel = 'gemini-3-flash-preview';

  if (isSalarySlip) {
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: `Generate a structured salary slip JSON for ${data.recipientName} at ${data.companyName}.
      Base Salary: ${data.salary || data.annualCTC || '50000'}. Extra Info: ${data.extraTerms || ''}.
      Return JSON with: salaryComponents (array of {description, earnings, deductions}), totalEarnings, totalDeductions, netPay, netPayInWords.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            salaryComponents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  earnings: { type: Type.NUMBER },
                  deductions: { type: Type.NUMBER }
                }
              }
            },
            totalEarnings: { type: Type.NUMBER },
            totalDeductions: { type: Type.NUMBER },
            netPay: { type: Type.NUMBER },
            netPayInWords: { type: Type.STRING }
          }
        }
      },
    });
    onChunk(response.text || "");
    return;
  }

  if (isInvoice) {
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: `Generate a professional invoice itemization for ${data.recipientName} from ${data.companyName}.
      Project/Context: ${data.extraTerms || 'Software Development Services'}.
      Budget/Rate Info: ${data.salary || 'Market Rate'}.
      Tax Rate: ${data.taxRate || 18}%.
      Return JSON with: invoiceItems (array of {description, quantity, rate, amount}), subTotal, taxAmount, grandTotal, netPayInWords.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  rate: { type: Type.NUMBER },
                  amount: { type: Type.NUMBER }
                }
              }
            },
            subTotal: { type: Type.NUMBER },
            taxAmount: { type: Type.NUMBER },
            grandTotal: { type: Type.NUMBER },
            netPayInWords: { type: Type.STRING }
          }
        }
      },
    });
    onChunk(response.text || "");
    return;
  }

  let prompt = `Write ONLY the core body/clauses for a ${type} between ${data.companyName} and ${data.recipientName}.`;

  if (type === DocumentType.NDA) {
    prompt += ` 
    Purpose: ${data.purposeOfDisclosure}.
    Duration: ${data.confidentialityDuration}.
    Start directly with the confidentiality clauses.`;
  } else if (type === DocumentType.EXPERIENCE_LETTER) {
    prompt += `
    Role: ${data.role}.
    Tenure: From ${data.startDate} to ${data.endDate}.
    Projects: ${data.projectsHandled}.
    Performance: ${data.performanceRemarks}.
    Start directly with tenure verification.`;
  } else if (type === DocumentType.PROMOTION_LETTER) {
    prompt += `
    Old Role: ${data.oldDesignation}.
    New Role: ${data.newDesignation}.
    Effective: ${data.effectiveDate}.
    Start directly with the promotion announcement.`;
  } else if (type === DocumentType.RELIEVING_LETTER) {
    prompt += `
    Resignation: ${data.resignationDate}.
    LWD: ${data.lastWorkingDay}.
    Start directly with the confirmation of release.`;
  } else {
    prompt += ` 
    Role: ${data.role}. 
    Joining: ${data.joiningDate || data.startDate}.
    CTC: ${data.annualCTC || data.salary}.
    Probation: ${data.probationPeriod}.
    Notice: ${data.noticePeriod}.
    Reporting: ${data.reportingTo}.
    Start directly with the appointment details or terms.`;
  }

  prompt += `
  
  CRITICAL CONSTRAINTS:
  1. DO NOT include the title of the document (like "${type}").
  2. DO NOT include "Date: ..." or "Dated: ...".
  3. DO NOT include "To, ..." or recipient address info.
  4. DO NOT include a "Subject:" line.
  5. DO NOT include any salutation (like "Dear ${data.recipientName}" or "Dear Sir/Madam"). 
  6. DO NOT include any placeholders like [Insert Date] or [Company Name]. Use provided data.
  7. Start IMMEDIATELY with the first paragraph of the body text or clause 1.
  8. Use professional legal language. No markdown symbols like ** or #.`;

  const responseStream = await ai.models.generateContentStream({
    model: activeModel,
    contents: prompt,
  });

  let fullText = "";
  for await (const chunk of responseStream) {
    fullText += chunk.text;
    onChunk(fullText);
  }
};
