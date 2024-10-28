import type { Eval } from '@/app/lib/definitions';

interface Metrics {
  precision: number;
  recall: number;
  f1: number;
  cohensKappa: number;
  sampleSize: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

export const computeMetrics = (data: Eval[]): Metrics => {
  if (data.length === 0) return {
    precision: 0,
    recall: 0,
    f1: 0,
    cohensKappa: 0,
    sampleSize: 0,
    truePositives: 0,
    trueNegatives: 0,
    falsePositives: 0,
    falseNegatives: 0
  };

  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalAgreement = 0;
  let totalItems = 0;

  data.forEach(row => {
    const prediction = String(row.prediction).trim();
    const label = String(row.label).trim();

    if (prediction !== '' && label !== '' && prediction !== 'null' && label !== 'null') {
      totalItems++;
      if (prediction === label) totalAgreement++;

      if (prediction === '1' && label === '1') {
        truePositives++;
      } else if (prediction === '1' && label === '0') {
        falsePositives++;
      } else if (prediction === '0' && label === '1') {
        falseNegatives++;
      } else if (prediction === '0' && label === '0') {
        trueNegatives++;
      }
    }
  });

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  // Calculate Cohen's Kappa
  const observedAgreement = totalAgreement / totalItems;
  const expectedAgreement = (
    ((truePositives + falsePositives) * (truePositives + falseNegatives) +
     (trueNegatives + falsePositives) * (trueNegatives + falseNegatives)) /
    (totalItems * totalItems)
  );
  const cohensKappa = (observedAgreement - expectedAgreement) / (1 - expectedAgreement);

  return {
    precision,
    recall,
    f1,
    cohensKappa,
    sampleSize: totalItems,
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives
  };
};

