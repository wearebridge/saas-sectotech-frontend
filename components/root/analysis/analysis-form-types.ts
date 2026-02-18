export type AnalysisFormValues = {
  scriptId: string;
  clientId: string;
  audioFile?: File;
  answers: Record<string, string>;
};
