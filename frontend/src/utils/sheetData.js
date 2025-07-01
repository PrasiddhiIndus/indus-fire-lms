export const fetchExamResults = async () => {
  try {
    const response = await fetch('https://sheetdb.io/api/v1/pl2o5edmug7w2'); // Your SheetDB API
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return [];
  }
};

// This function turns raw sheet data into dashboard-friendly format
export const processDashboardData = (examResults, user, courses) => {
  if (!examResults.length || !user || !courses) return {};

  const userResults = examResults.filter(result => result['Student Email'] === user.email);

  let passedCount = 0;
  userResults.forEach(result => {
    if (parseInt(result.Score) >= 70) passedCount++;
  });

  const scoreData = userResults.map(result => ({
    course: result['Course Name'],
    chapter: result['Chapter Name'],
    score: parseInt(result.Score),
    timestamp: new Date(result.Timestamp)
  })).sort((a, b) => a.timestamp - b.timestamp);

  const courseCompletion = {};

  courses.forEach(course => {
    courseCompletion[course.title] = {
      completed: 0,
      total: course.chapters?.length || 0
    };
  });

  userResults.forEach(result => {
    const course = result['Course Name'];
    const score = parseInt(result.Score);
    if (courseCompletion[course] && score >= 70) {
      courseCompletion[course].completed++;
    }
  });

  return {
    pieChartData: {
      totalExams: userResults.length,
      passedCount
    },
    scoreData,
    completionData: Object.entries(courseCompletion).map(([course, data]) => ({
      course,
      completed: data.completed,
      remaining: data.total - data.completed
    }))
  };
};
