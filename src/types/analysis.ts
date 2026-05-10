export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export type AIDetectionResult = {
  score: number; // 0..1
  confidence: string; // "TINGGI/SEDANG/RENDAH"
  explanation: string;
};

export type MisinformationAnalysis = {
  score: number; // 0..1
  risk_level: string; // "TINGGI/SEDANG/RENDAH/TIDAK ADA"
  explanation: string;
};

export type HoaxAnalysis = {
  score: number; // 0..1
  risk_level: string; // "TINGGI/SEDANG/RENDAH/TIDAK ADA"
  explanation: string;
};

export type OverallAssessment = {
  recommendation: string;
  key_findings: string[];
};

export type ComprehensiveAnalysis = {
  ai_detection: AIDetectionResult;
  hoax_analysis: HoaxAnalysis;
  misinformation_analysis: MisinformationAnalysis;
  overall_assessment: OverallAssessment;
};

export type AnalysisResult = {
  comprehensive_analysis?: ComprehensiveAnalysis | null;
  analysis_error?: string | null;
  video_title?: string | null;
  video_description?: string | null;
  video_thumbnail_url?: string | null;
  claims?: string[] | null;
};

export type JobResultResponse = {
  status: JobStatus;
  result: AnalysisResult | null;
  error: string | null;
  progress: string | null;
};
