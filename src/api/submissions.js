import API from './axios';

// Get all submissions (for dashboard or user)
export const getSubmissions = () => API.get('/submissions');

// Comment on approved submission
export const addComment = (submissionId, text) => 
  API.post(`/submissions/${submissionId}/comment`, { text });

// etc. — approve, reject, create submission