export type AnalysisFormValues = {
  serviceSubTypeId: string;
  serviceTypeId: string;
  scriptId: string;
  clientId: string;
  audioFile?: File;
  answers: Record<string, string>;
};
