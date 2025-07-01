// src/services/api.js

// ✅ SUBMIT exam result to backend
export const submitExamResult = async (payload) => {
  try {
    const response = await fetch("https://indus-fire-lms-1.onrender.com/submit-exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Return plain text or parsed JSON based on backend response
    const data = await response.text();
    if (!response.ok) {
      throw new Error(`Failed to submit: ${data}`);
    }

    console.log("✅ Exam submitted successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to submit exam result:", error.message);
    throw error;
  }
};

// ✅ FETCH all exam submissions from backend
export const fetchExamSubmissions = async () => {
  try {
    const response = await fetch("https://indus-fire-lms-1.onrender.com/submissions");

    if (!response.ok) {
      throw new Error("Failed to fetch submissions");
    }

    const data = await response.json();
    console.log("✅ Submissions fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching submissions:", error.message);
    return []; // return empty array on error
  }
};


// 1️⃣ Pie Chart Data (completed vs total)
export const fetchPieChartData = async (userId) => {
  const res = await fetch(`https://indus-fire-lms-1.onrender.com/user/${userId}/pie-data`);
  return await res.json();
};

// 2️⃣ Line Chart - Last 5 scores
export const fetchLineChartData = async (userId) => {
  const res = await fetch(`https://indus-fire-lms-1.onrender.com/user/${userId}/line-data`);
  return await res.json();
};

// 3️⃣ Calendar Chart - Exam dates
export const fetchCalendarData = async (userId) => {
  const res = await fetch(`https://indus-fire-lms-1.onrender.com/user/${userId}/calendar-data`);
  return await res.json();
};

// 4️⃣ Bar Chart - Courses vs Chapter count
export const fetchBarChartData = async (userId) => {
  const res = await fetch(`https://indus-fire-lms-1.onrender.com/user/${userId}/bar-data`);
  return await res.json();
};










// // API service for connecting to the backend
// const API_BASE_URL = 'https://indus-fire-lms-1.onrender.com/api';
// const AUTH_BASE_URL = 'https://indus-fire-lms-1.onrender.com/auth';


// // Helper function to get auth token
// const getAuthToken = () => {
//   return localStorage.getItem('lms_token');
// };

// // Helper function to make authenticated requests
// const makeAuthenticatedRequest = async (url, options = {}) => {
//   const token = getAuthToken();
  
//   const config = {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   };

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await fetch(url, config);
  
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// };

// // Authentication API calls
// export const authAPI = {
//   login: async (email, password) => {
//     const response = await fetch(`${AUTH_BASE_URL}/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });
//     return response.json();
//   },

//   register: async (userData) => {
//     const response = await fetch(`${AUTH_BASE_URL}/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(userData),
//     });
//     return response.json();
//   },

//   verify: async (token) => {
//     const response = await fetch(`${AUTH_BASE_URL}/verify`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     return response.json();
//   },

//   logout: async () => {
//     const response = await fetch(`${AUTH_BASE_URL}/logout`, {
//       method: 'POST',
//     });
//     return response.json();
//   },
// };

// // Users API calls
// export const usersAPI = {
//   getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/users`),
  
//   create: (userData) => makeAuthenticatedRequest(`${API_BASE_URL}/users`, {
//     method: 'POST',
//     body: JSON.stringify(userData),
//   }),
  
//   update: (userId, userData) => makeAuthenticatedRequest(`${API_BASE_URL}/users/${userId}`, {
//     method: 'PUT',
//     body: JSON.stringify(userData),
//   }),
  
//   delete: (userId) => makeAuthenticatedRequest(`${API_BASE_URL}/users/${userId}`, {
//     method: 'DELETE',
//   }),
// };

// // Courses API calls
// export const coursesAPI = {
//   getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/courses`),
  
//   getById: (courseId) => makeAuthenticatedRequest(`${API_BASE_URL}/courses/${courseId}`),
  
//   create: (courseData) => makeAuthenticatedRequest(`${API_BASE_URL}/courses`, {
//     method: 'POST',
//     body: JSON.stringify(courseData),
//   }),
  
//   update: (courseId, courseData) => makeAuthenticatedRequest(`${API_BASE_URL}/courses/${courseId}`, {
//     method: 'PUT',
//     body: JSON.stringify(courseData),
//   }),
  
//   delete: (courseId) => makeAuthenticatedRequest(`${API_BASE_URL}/courses/${courseId}`, {
//     method: 'DELETE',
//   }),
// };

// // Chapters API calls
// export const chaptersAPI = {
//   getAll: (courseId = null) => {
//     const url = courseId 
//       ? `${API_BASE_URL}/chapters?course_id=${courseId}`
//       : `${API_BASE_URL}/chapters`;
//     return makeAuthenticatedRequest(url);
//   },
  
//   getById: (chapterId) => makeAuthenticatedRequest(`${API_BASE_URL}/chapters/${chapterId}`),
  
//   create: (chapterData) => makeAuthenticatedRequest(`${API_BASE_URL}/chapters`, {
//     method: 'POST',
//     body: JSON.stringify(chapterData),
//   }),
  
//   update: (chapterId, chapterData) => makeAuthenticatedRequest(`${API_BASE_URL}/chapters/${chapterId}`, {
//     method: 'PUT',
//     body: JSON.stringify(chapterData),
//   }),
  
//   delete: (chapterId) => makeAuthenticatedRequest(`${API_BASE_URL}/chapters/${chapterId}`, {
//     method: 'DELETE',
//   }),
// };

// // Questions API calls
// export const questionsAPI = {
//   getAll: (chapterId = null) => {
//     const url = chapterId 
//       ? `${API_BASE_URL}/questions?chapter_id=${chapterId}`
//       : `${API_BASE_URL}/questions`;
//     return makeAuthenticatedRequest(url);
//   },
  
//   getById: (questionId) => makeAuthenticatedRequest(`${API_BASE_URL}/questions/${questionId}`),
  
//   create: (questionData) => makeAuthenticatedRequest(`${API_BASE_URL}/questions`, {
//     method: 'POST',
//     body: JSON.stringify(questionData),
//   }),
  
//   update: (questionId, questionData) => makeAuthenticatedRequest(`${API_BASE_URL}/questions/${questionId}`, {
//     method: 'PUT',
//     body: JSON.stringify(questionData),
//   }),
  
//   delete: (questionId) => makeAuthenticatedRequest(`${API_BASE_URL}/questions/${questionId}`, {
//     method: 'DELETE',
//   }),
// };

// // Exams API calls
// export const examsAPI = {
//   getAll: (courseId = null) => {
//     const url = courseId 
//       ? `${API_BASE_URL}/exams?course_id=${courseId}`
//       : `${API_BASE_URL}/exams`;
//     return makeAuthenticatedRequest(url);
//   },
  
//   getById: (examId) => makeAuthenticatedRequest(`${API_BASE_URL}/exams/${examId}`),
  
//   create: (examData) => makeAuthenticatedRequest(`${API_BASE_URL}/exams`, {
//     method: 'POST',
//     body: JSON.stringify(examData),
//   }),
  
//   update: (examId, examData) => makeAuthenticatedRequest(`${API_BASE_URL}/exams/${examId}`, {
//     method: 'PUT',
//     body: JSON.stringify(examData),
//   }),
  
//   delete: (examId) => makeAuthenticatedRequest(`${API_BASE_URL}/exams/${examId}`, {
//     method: 'DELETE',
//   }),
// };

// // Materials API calls
// export const materialsAPI = {
//   getAll: (courseId = null) => {
//     const url = courseId 
//       ? `${API_BASE_URL}/materials?course_id=${courseId}`
//       : `${API_BASE_URL}/materials`;
//     return makeAuthenticatedRequest(url);
//   },
  
//   getById: (materialId) => makeAuthenticatedRequest(`${API_BASE_URL}/materials/${materialId}`),
  
//   upload: (formData) => {
//     const token = getAuthToken();
//     return fetch(`${API_BASE_URL}/materials`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     }).then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     });
//   },
  
//   delete: (materialId) => makeAuthenticatedRequest(`${API_BASE_URL}/materials/${materialId}`, {
//     method: 'DELETE',
//   }),
// };

// // Progress API calls
// export const progressAPI = {
//   getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/progress`),
  
//   update: (progressData) => makeAuthenticatedRequest(`${API_BASE_URL}/progress`, {
//     method: 'POST',
//     body: JSON.stringify(progressData),
//   }),
// };

// // Enrollments API calls
// export const enrollmentsAPI = {
//   getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/enrollments`),
  
//   enroll: (courseId) => makeAuthenticatedRequest(`${API_BASE_URL}/enrollments`, {
//     method: 'POST',
//     body: JSON.stringify({ course_id: courseId }),
//   }),
// };

// // Exam Attempts API calls
// export const examAttemptsAPI = {
//   getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/exam-attempts`),
  
//   start: (examId) => makeAuthenticatedRequest(`${API_BASE_URL}/exam-attempts`, {
//     method: 'POST',
//     body: JSON.stringify({ exam_id: examId }),
//   }),
  
//   submit: (attemptId, answers) => makeAuthenticatedRequest(`${API_BASE_URL}/exam-attempts/${attemptId}`, {
//     method: 'PUT',
//     body: JSON.stringify({ answers, completed: true }),
//   }),
// }; 

