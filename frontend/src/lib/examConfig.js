const examConfig = [
  {
    courseId: 1,
    chapterId: 1,
    title: "Introduction to Hazardous Materials",
    description: "Fundamentals of hazardous materials recognition and protocols",
    totalQuestions: 40,
    timeLimit: 160, // in minutes
    startTime: "2025-06-10T10:00:00Z" // When this exam becomes available
  },
  {
    courseId: 1,
    chapterId: 2,
    title: "Recognize and Identify the Presence of Hazmat",
    description: "Identification techniques for hazardous materials incidents",
    totalQuestions: 100,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 1,
    chapterId: 3,
    title: "Initiate Protective Actions",
    description: "Implementing safety measures and protective responses",
    totalQuestions: 35,
    timeLimit: 140,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 1,
    title: "Identify Potential Hazards",
    description: "Hazard assessment and risk analysis techniques",
    totalQuestions: 100,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 2,
    title: "Identify Criminal or Terrorist Activity",
    description: "Container recognition and hazard evaluation",
    totalQuestions: 100,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 3,
    title: "Recognize and Identify the Presence of Hazmat",
    description: "Recognizing indicators of illicit activities",
    totalQuestions: 75,
    timeLimit: 300,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 4,
    title: "Planning the Initial Response",
    description: "Developing incident action plans",
    totalQuestions: 25,
    timeLimit: 100,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 5,
    title: "Incident Command System and Action Plan Implementation",
    description: "ICS structure and plan execution",
    totalQuestions: 60,
    timeLimit: 240,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 6,
    title: "Emergency Decontamination",
    description: "Decontamination procedures and protocols",
    totalQuestions: 20,
    timeLimit: 80,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 7,
    title: "Personal Protective Equipment",
    description: "Selection and use of appropriate PPE",
    totalQuestions: 100,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 2,
    chapterId: 8,
    title: "Mass and Technical Decontamination",
    description: "Advanced decontamination techniques",
    totalQuestions: 65,
    timeLimit: 260,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 1,
    title: "Introduction to the Fire Service and Firefighter Safety",
    description: "Fire service fundamentals and safety protocols",
    totalQuestions: 47,
    timeLimit: 188,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 2,
    title: "Communications",
    description: "Fireground communication systems and procedures",
    totalQuestions: 17,
    timeLimit: 68,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 3,
    title: "Building Construction",
    description: "Building types and collapse hazards",
    totalQuestions: 50,
    timeLimit: 200,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 4,
    title: "Fire Dynamics",
    description: "Fire behavior and combustion principles",
    totalQuestions: 100,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 5,
    title: "Firefighter Personal Protective Equipment",
    description: "Proper use and maintenance of PPE",
    totalQuestions: 60,
    timeLimit: 240,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 6,
    title: "Portable Fire Extinguishers",
    description: "Selection and operation of extinguishers",
    totalQuestions: 29,
    timeLimit: 116,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 7,
    title: "Ropes and Knots",
    description: "Rope systems and essential knots",
    totalQuestions: 45,
    timeLimit: 180,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 8,
    title: "Ground Ladders",
    description: "Ladder operations and safety",
    totalQuestions: 70,
    timeLimit: 280,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 9,
    title: "Forcible Entry",
    description: "Techniques for gaining entry",
    totalQuestions: 46,
    timeLimit: 184,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 10,
    title: "Structural Search and Rescue",
    description: "Victim search and rescue operations",
    totalQuestions: 90,
    timeLimit: 360,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 11,
    title: "Tactical Ventilation",
    description: "Ventilation strategies and techniques",
    totalQuestions: 75,
    timeLimit: 300,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 12,
    title: "Fire Hose",
    description: "Hose types, handling and deployment",
    totalQuestions: 59,
    timeLimit: 240,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 13,
    title: "Hose Operations and Hose Streams",
    description: "Nozzle techniques and water application",
    totalQuestions: 99,
    timeLimit: 400,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 14,
    title: "Fire Suppression",
    description: "Structural firefighting techniques",
    totalQuestions: 20,
    timeLimit: 80,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 3,
    chapterId: 15,
    title: "Overhaul, Property Conservation, and Scene Preservation",
    description: "Post-fire operations and evidence preservation",
    totalQuestions: 20,
    timeLimit: 80,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 1,
    title: "Building Materials, Structural Collapse, and Effects of Fire Suppression",
    description: "Structural stability and collapse risks",
    totalQuestions: 47,
    timeLimit: 188,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 2,
    title: "Technical Rescue Support and Vehicle Extrication Operations",
    description: "Rescue operations and extrication techniques",
    totalQuestions: 30,
    timeLimit: 120,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 3,
    title: "Foam Fire Fighting, Liquid Fires, and Gas Fires",
    description: "Specialized extinguishing agents and techniques",
    totalQuestions: 38,
    timeLimit: 152,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 4,
    title: "Incident Scene Operations",
    description: "Managing complex incident scenes",
    totalQuestions: 38,
    timeLimit: 152,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 5,
    title: "Fire Origin and Cause Determination",
    description: "Basic fire investigation principles",
    totalQuestions: 30,
    timeLimit: 120,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 6,
    title: "Maintenance and Testing Responsibilities",
    description: "Equipment maintenance protocols",
    totalQuestions: 30,
    timeLimit: 120,
    startTime: "2025-06-12T00:00:00Z"
  },
  {
    courseId: 4,
    chapterId: 7,
    title: "Community Risk Reduction",
    description: "Advanced equipment testing procedures",
    totalQuestions: 30,
    timeLimit: 120,
    startTime: "2025-06-12T00:00:00Z"
  }

];

export default examConfig;
