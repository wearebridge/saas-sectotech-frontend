export interface ScriptItem {
  id: string
  question: string
  answer?: string
}

export interface Script {
  id: string
  name: string
  status: boolean
  scriptItems?: ScriptItem[]
}

export interface AnalysisRequest {
  clientName: string
  transcription?: string
  scriptItems: {
    question: string
    answer: string
  }[]
}

export interface AnalysisResult {
  approved: boolean
  transcription: string
  output: {
    question: string
    answer: string
    correct: boolean
    analysis: string
  }[]
}

export interface ServiceType {
  id: string
  name: string
  description?: string
}

export interface ServiceSubType {
  id: string
  name: string
  description?: string
}