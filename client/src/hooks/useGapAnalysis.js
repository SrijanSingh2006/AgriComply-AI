import { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { useVault } from '../contexts/VaultContext';

export const useGapAnalysis = (requirements = []) => {
  const { files } = useVault();
  const [missingDocs, setMissingDocs] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState('idle');

  useEffect(() => {
    if (files.length > 0 && requirements.length > 0) {
      runAnalysis();
    }
  }, [files, requirements]);

  const runAnalysis = async () => {
    setAnalysisStatus('analyzing');
    try {
      // 1. Basic Check: Does file with tag exist?
      const missing = requirements.filter(req => 
        !files.some(f => f.tag === req || f.analyzedType === req)
      );

      // 2. Advanced Check: Call AI to verify valid content (optional)
      // const aiResult = await aiService.validateCompliance(files);
      
      setMissingDocs(missing);
      setAnalysisStatus('complete');
    } catch (error) {
      console.error(error);
      setAnalysisStatus('error');
    }
  };

  return { missingDocs, isCompliant: missingDocs.length === 0, status: analysisStatus };
};