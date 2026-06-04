import axios from 'axios'

const API_BASE = 'https://ai-resume-parser-4-mur0.onrender.com'



export const api = {
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getResumes: (search = '') => axios.get(`${API_BASE}/resumes?search=${search}`),
  getResume: (id) => axios.get(`${API_BASE}/resumes/${id}`),
  deleteResume: (id) => axios.delete(`${API_BASE}/resumes/${id}`),
  getStats: () => axios.get(`${API_BASE}/stats`),
  matchJob: (id, jobDescription) => {
    const formData = new FormData()
    formData.append('job_description', jobDescription)
    return axios.post(`${API_BASE}/match/${id}`, formData)
  }
}

