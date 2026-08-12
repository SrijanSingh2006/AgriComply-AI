import { useState } from 'react';
import { docService } from '../services/docService';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file, tag) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tag', tag);
      
      const response = await docService.uploadDocument(formData);
      return response;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
};