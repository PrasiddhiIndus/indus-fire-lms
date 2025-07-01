import React, { useEffect } from 'react';
import { useData } from './contexts/DataContext';

const ForceDataRefresh = () => {
  const { forceRefreshData } = useData();
  
  useEffect(() => {
    // Clear localStorage and reset to default data
    console.log('🔄 Forcing data refresh on application load...');
    localStorage.removeItem('lms_courses');
    localStorage.removeItem('lms_users');
    localStorage.removeItem('lms_questions');
    localStorage.removeItem('lms_exams');
    localStorage.removeItem('lms_student_progress');
    
    // Force refresh data from defaults in DataContext
    setTimeout(() => {
      forceRefreshData();
      console.log('✅ Data refresh complete!');
    }, 500);
  }, [forceRefreshData]);
  
  return null; // This component doesn't render anything
};

export default ForceDataRefresh;