import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, FileText, Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AdminQuestions = () => {
  const { courses, questionBank, addQuestion, updateQuestion, deleteQuestion } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    courseId: '',
    chapterId: ''
  });

  const selectedCourseData = courses.find(c => c.id === parseInt(selectedCourse));
  const questions = questionBank.filter(q => {
    const matchesCourse = !selectedCourse || q.courseId === parseInt(selectedCourse);
    const matchesChapter = !selectedChapter || q.chapterId === parseInt(selectedChapter);
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesChapter && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const questionData = {
      ...formData,
      courseId: parseInt(formData.courseId),
      chapterId: parseInt(formData.chapterId),
      options: formData.options.filter(opt => opt.trim() !== '')
    };

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }

    setShowModal(false);
    setEditingQuestion(null);
    resetForm();
  };

  const handleEdit = (question) => {
    setFormData({
      question: question.question,
      options: [...question.options, '', '', '', ''].slice(0, 4),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      difficulty: question.difficulty || 'medium',
      courseId: question.courseId.toString(),
      chapterId: question.chapterId.toString()
    });
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      courseId: selectedCourse || '',
      chapterId: selectedChapter || ''
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChapterTitle = (courseId, chapterId) => {
    const course = courses.find(c => c.id === courseId);
    const chapter = course?.chapters?.find(ch => ch.id === chapterId);
    return chapter?.title || 'Unknown Chapter';
  };

  const exportQuestions = () => {
    if (questions.length === 0) return;

    const csvContent = [
      ['Course', 'Chapter', 'Question_No', 'Question_Text', 'Option_A', 'Option_B', 'Option_C', 'Option_D', 'Correct_Option', 'Difficulty', 'Explanation'],
      ...questions.map((q, index) => {
        const course = courses.find(c => c.id === q.courseId);
        const chapter = course?.chapters?.find(ch => ch.id === q.chapterId);
        return [
          course?.title || 'Unknown Course',
          chapter?.title || 'Unknown Chapter',
          index + 1,
          q.question,
          q.options[0] || '',
          q.options[1] || '',
          q.options[2] || '',
          q.options[3] || '',
          String.fromCharCode(65 + q.correctAnswer), // Convert 0,1,2,3 to A,B,C,D
          q.difficulty || 'medium',
          q.explanation || ''
        ];
      })
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${selectedCourseData?.title?.replace(/\s+/g, '-').toLowerCase() || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateContent = [
      ['Course', 'Chapter', 'Question_No', 'Question_Text', 'Option_A', 'Option_B', 'Option_C', 'Option_D', 'Correct_Option', 'Difficulty', 'Explanation'],
      ['Introduction to React', 'Getting Started with React', '1', 'What is React?', 'A JavaScript library for building user interfaces', 'A database management system', 'A CSS framework', 'A web server', 'A', 'easy', 'React is a JavaScript library developed by Facebook for building user interfaces.'],
      ['Introduction to React', 'Components and JSX', '2', 'What is JSX?', 'JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension', 'A', 'medium', 'JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript.'],
      ['Advanced JavaScript', 'Closures and Scope', '3', 'What is a closure in JavaScript?', 'A function inside another function', 'A loop structure', 'A variable type', 'An array method', 'A', 'hard', 'A closure is a function that has access to variables in its outer scope even after the outer function has returned.']
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // FIXED: Enhanced CSV parsing with better error handling
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row = [];
      let current = '';
      let inQuotes = false;
      let j = 0;
      
      while (j < line.length) {
        const char = line[j];
        const nextChar = line[j + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            j += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            j++;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          row.push(current.trim());
          current = '';
          j++;
        } else {
          current += char;
          j++;
        }
      }
      
      // Add the last field
      row.push(current.trim());
      result.push(row);
    }
    
    return result;
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          alert('CSV file must contain at least a header row and one data row');
          return;
        }

        const headers = rows[0].map(h => h.toLowerCase().trim());
        
        // FIXED: More flexible header validation
        const requiredHeaders = [
          'course',
          'chapter', 
          'question_text',
          'option_a',
          'option_b',
          'correct_option'
        ];
        
        const missingHeaders = requiredHeaders.filter(required => 
          !headers.some(header => 
            header.includes(required.replace('_', ' ')) || 
            header.includes(required.replace('_', '_')) ||
            header === required
          )
        );

        if (missingHeaders.length > 0) {
          alert(`Invalid CSV format. Missing required columns: ${missingHeaders.join(', ')}\n\nRequired columns: Course, Chapter, Question_Text, Option_A, Option_B, Correct_Option\n\nPlease download the template for the correct format.`);
          return;
        }

        // Find column indices
        const getColumnIndex = (searchTerms) => {
          for (const term of searchTerms) {
            const index = headers.findIndex(h => 
              h.includes(term) || h === term || h.replace(/[_\s]/g, '') === term.replace(/[_\s]/g, '')
            );
            if (index !== -1) return index;
          }
          return -1;
        };

        const columnIndices = {
          course: getColumnIndex(['course']),
          chapter: getColumnIndex(['chapter']),
          questionText: getColumnIndex(['question_text', 'question text', 'question']),
          optionA: getColumnIndex(['option_a', 'option a', 'optiona']),
          optionB: getColumnIndex(['option_b', 'option b', 'optionb']),
          optionC: getColumnIndex(['option_c', 'option c', 'optionc']),
          optionD: getColumnIndex(['option_d', 'option d', 'optiond']),
          correctOption: getColumnIndex(['correct_option', 'correct option', 'correct']),
          difficulty: getColumnIndex(['difficulty']),
          explanation: getColumnIndex(['explanation', 'source'])
        };

        // Validate that we found the essential columns
        const essentialColumns = ['course', 'chapter', 'questionText', 'optionA', 'optionB', 'correctOption'];
        const missingColumns = essentialColumns.filter(col => columnIndices[col] === -1);
        
        if (missingColumns.length > 0) {
          alert(`Could not find required columns: ${missingColumns.join(', ')}\n\nPlease check your CSV format and try again.`);
          return;
        }

        const results = {
          success: [],
          errors: [],
          total: rows.length - 1
        };

        // Process data rows
        for (let i = 1; i < rows.length; i++) {
          try {
            const row = rows[i];
            
            if (row.length < Math.max(...Object.values(columnIndices).filter(idx => idx !== -1))) {
              results.errors.push(`Row ${i + 1}: Insufficient columns (expected at least ${Math.max(...Object.values(columnIndices).filter(idx => idx !== -1)) + 1})`);
              continue;
            }

            const courseName = row[columnIndices.course]?.trim();
            const chapterName = row[columnIndices.chapter]?.trim();
            const questionText = row[columnIndices.questionText]?.trim();
            const optionA = row[columnIndices.optionA]?.trim();
            const optionB = row[columnIndices.optionB]?.trim();
            const optionC = row[columnIndices.optionC] ? row[columnIndices.optionC].trim() : '';
            const optionD = row[columnIndices.optionD] ? row[columnIndices.optionD].trim() : '';
            const correctOption = row[columnIndices.correctOption]?.trim().toUpperCase();
            const difficulty = row[columnIndices.difficulty] ? row[columnIndices.difficulty].trim().toLowerCase() : 'medium';
            const explanation = row[columnIndices.explanation] ? row[columnIndices.explanation].trim() : '';

            // Validate required fields
            if (!courseName || !chapterName || !questionText || !optionA || !optionB || !correctOption) {
              results.errors.push(`Row ${i + 1}: Missing required fields (Course, Chapter, Question, Option A, Option B, Correct Option)`);
              continue;
            }

            // Find course
            const course = courses.find(c => 
              c.title.toLowerCase().includes(courseName.toLowerCase()) ||
              courseName.toLowerCase().includes(c.title.toLowerCase())
            );
            
            if (!course) {
              results.errors.push(`Row ${i + 1}: Course "${courseName}" not found. Available courses: ${courses.map(c => c.title).join(', ')}`);
              continue;
            }

            // Find chapter
            const chapter = course.chapters?.find(ch => 
              ch.title.toLowerCase().includes(chapterName.toLowerCase()) ||
              chapterName.toLowerCase().includes(ch.title.toLowerCase())
            );
            
            if (!chapter) {
              results.errors.push(`Row ${i + 1}: Chapter "${chapterName}" not found in course "${course.title}". Available chapters: ${course.chapters?.map(ch => ch.title).join(', ') || 'None'}`);
              continue;
            }

            // Validate correct option
            const correctAnswerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
            const correctAnswerIndex = correctAnswerMap[correctOption];

            if (correctAnswerIndex === undefined) {
              results.errors.push(`Row ${i + 1}: Invalid correct option "${correctOption}". Must be A, B, C, or D`);
              continue;
            }

            // Validate difficulty
            const validDifficulties = ['easy', 'medium', 'hard'];
            const finalDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

            // Create question object
            const question = {
              question: questionText,
              options: [optionA, optionB, optionC, optionD].filter(opt => opt),
              correctAnswer: correctAnswerIndex,
              explanation: explanation,
              difficulty: finalDifficulty,
              courseId: course.id,
              chapterId: chapter.id
            };

            // Validate that correct answer index is within options range
            if (correctAnswerIndex >= question.options.length) {
              results.errors.push(`Row ${i + 1}: Correct option "${correctOption}" is beyond available options (only ${question.options.length} options provided)`);
              continue;
            }

            addQuestion(question);
            results.success.push(`Row ${i + 1}: "${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}"`);

          } catch (error) {
            results.errors.push(`Row ${i + 1}: ${error.message}`);
          }
        }

        setBulkUploadResults(results);

      } catch (error) {
        console.error('CSV parsing error:', error);
        alert('Error reading CSV file. Please check the file format and try again.\n\nError: ' + error.message);
      }
    };

    reader.readAsText(file, 'UTF-8');
    event.target.value = ''; // Reset file input
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600">Create and manage exam questions by course and chapter</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadTemplate}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Template</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Bulk Upload</span>
            </button>
            <button
              onClick={exportQuestions}
              disabled={questions.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedChapter(''); // Reset chapter when course changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                disabled={!selectedCourse}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Chapters</option>
                {selectedCourseData?.chapters?.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Questions</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Question Bank ({questions.length} questions)
            </h2>
          </div>
          
          {questions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {questions.map((question, index) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          Q{index + 1}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty || 'medium'}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {getChapterTitle(question.courseId, question.chapterId)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border text-sm ${
                              optIndex === question.correctAnswer
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              {optIndex === question.correctAnswer ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2 text-gray-400" />
                              )}
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCourse || selectedChapter 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Start by adding your first question'
                }
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Bulk Upload Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Bulk Upload Questions</h2>
                <p className="text-gray-600 mt-1">Upload multiple questions using CSV format</p>
              </div>
              
              <div className="p-6">
                {!bulkUploadResults ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3">📋 CSV Format Requirements:</h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Required Columns:</h4>
                            <ul className="space-y-1 text-xs">
                              <li>• <strong>Course:</strong> Exact course name</li>
                              <li>• <strong>Chapter:</strong> Exact chapter name</li>
                              <li>• <strong>Question_Text:</strong> The question</li>
                              <li>• <strong>Option_A:</strong> First answer option</li>
                              <li>• <strong>Option_B:</strong> Second answer option</li>
                              <li>• <strong>Correct_Option:</strong> A, B, C, or D</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Optional Columns:</h4>
                            <ul className="space-y-1 text-xs">
                              <li>• <strong>Option_C:</strong> Third answer option</li>
                              <li>• <strong>Option_D:</strong> Fourth answer option</li>
                              <li>• <strong>Difficulty:</strong> easy, medium, hard</li>
                              <li>• <strong>Explanation:</strong> Answer explanation</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-yellow-800 text-xs">
                            <strong>⚠️ Important:</strong> Course and chapter names must match exactly with existing ones in your system.
                            Use the template below for the correct format.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                      <p className="text-gray-600 mb-4">Select a CSV file with your questions</p>
                      
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleBulkUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                      >
                        Choose CSV File
                      </label>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Supported format: .csv files with UTF-8 encoding
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={downloadTemplate}
                        className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </button>
                      <button
                        onClick={() => {
                          setShowBulkModal(false);
                          setBulkUploadResults(null);
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        bulkUploadResults.errors.length === 0 ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {bulkUploadResults.errors.length === 0 ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <AlertCircle className="h-8 w-8 text-yellow-600" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Complete</h3>
                      <p className="text-gray-600">
                        {bulkUploadResults.success.length} of {bulkUploadResults.total} questions uploaded successfully
                      </p>
                    </div>

                    {bulkUploadResults.success.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">✅ Successfully Added ({bulkUploadResults.success.length}):</h4>
                        <div className="max-h-32 overflow-y-auto">
                          {bulkUploadResults.success.slice(0, 5).map((success, index) => (
                            <p key={index} className="text-sm text-green-800">• {success}</p>
                          ))}
                          {bulkUploadResults.success.length > 5 && (
                            <p className="text-sm text-green-600 mt-1">
                              ... and {bulkUploadResults.success.length - 5} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {bulkUploadResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">❌ Errors ({bulkUploadResults.errors.length}):</h4>
                        <div className="max-h-40 overflow-y-auto">
                          {bulkUploadResults.errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-800">• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowBulkModal(false);
                          setBulkUploadResults(null);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setBulkUploadResults(null)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Upload More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Single Question Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <select
                        required
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value, chapterId: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                      <select
                        required
                        value={formData.chapterId}
                        onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                        disabled={!formData.courseId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select a chapter</option>
                        {courses.find(c => c.id === parseInt(formData.courseId))?.chapters?.map(chapter => (
                          <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === index}
                            onChange={() => setFormData({ ...formData, correctAnswer: index })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            required={index < 2}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select the radio button next to the correct answer. At least 2 options are required.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                    <textarea
                      rows={3}
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide explanation for the correct answer..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingQuestion(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminQuestions;