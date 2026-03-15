import { ClientFieldKey } from "./client";

export interface ScriptItem {
  id: string;
  question: string;
  answer?: string;
  linkedClientField?: ClientFieldKey | null;
}

export interface Script {
  id: string;
  name: string;
  status: boolean;
  scriptItems?: ScriptItem[];
}

export interface AnalysisRequest {
  clientId: string;
  transcription?: string;
  scriptId: string;
  scriptItems: {
    question: string;
    answer: string;
  }[];
}

export interface AnalysisResult {
  approved: boolean;
  transcription: string;
  output: {
    question: string;
    answer: string;
    correct: boolean;
    analysis: string;
  }[];
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  status: boolean;
}

export interface ServiceSubType {
  id: string;
  name: string;
  description?: string;
  status: boolean;
}

export type AnalysisItem = {
  id: string;
  date: Date;
  clientId?: string;
  clientName: string;
  clientCpf?: string;
  service: string;
  subType: string;
  scriptName?: string;
  approved: boolean;
  creditsUsed?: number;
  executedBy?: string;
  audioFilename?: string;
  audioUrl?: string;
  transcription?: string;
  aiOutput?: {
    output?: {
      question: string;
      answer: string;
      correct: boolean;
      questionAsked: boolean;
      analysis: string;
      adminOverride?: {
        correct?: boolean;
        questionAsked?: boolean;
        overriddenBy: string;
        overriddenAt: string;
      };
    }[];
  };
};
