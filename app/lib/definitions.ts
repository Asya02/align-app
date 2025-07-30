export type InputOutput = {
  id: number;
  input: string;
  output: string;
}

export type Eval = {
  id: number;
  label: string;
  explanation: string;
  prediction: string;
}

export type OptimizationResult = {
  id: number;
  run_number: number;
  prompt: string;
  precision: number;
  recall: number;
  f1: number;
  cohens_kappa: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  split_type: string;
  evaluation_fields: string;
  evaluation_model: string;
}

export type ModelType = 'gpt-4o-mini' | 'claude-3-5-haiku-20241022' | 'claude-3-haiku-20240307' | 'GigaChat-2-Max';
