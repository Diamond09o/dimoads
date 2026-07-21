/**
 * Fraud Detection Radar Module
 */
import { AIService } from '../services/ai-service';
import { FraudDetectionInput, FraudDetectionResult, AIResponse } from '../types';

export const FraudDetection = {
  async analyze(input: FraudDetectionInput): Promise<AIResponse<FraudDetectionResult>> {
    return AIService.detectFraud(input);
  }
};
