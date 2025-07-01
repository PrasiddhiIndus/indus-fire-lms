# Complete Deployment Guide for EduFlow LMS

## 🚀 Frontend Deployment (Current React App)

### Option 1: Netlify (Recommended for Quick Deployment)
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository for automatic deployments

3. **Configure redirects for React Router:**
   Create `public/_redirects` file:
   ```
   /*    /index.html   200
   ```

### Option 2: Vercel
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 3: GitHub Pages
1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## 🔧 Backend Setup Options

### Option 1: Supabase (Recommended - Full Backend as a Service)

#### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Get your project URL and anon key

#### 2. Database Schema
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Courses table
CREATE TABLE public.courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  duration TEXT,
  level TEXT DEFAULT 'Beginner',
  enrolled_students INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE public.chapters (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  video_url TEXT,
  order_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE public.materials (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'lecture',
  file_size TEXT,
  is_required BOOLEAN DEFAULT true,
  order_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id BIGINT REFERENCES public.chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE public.exams (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  total_questions INTEGER,
  selected_chapters JSONB,
  questions_per_chapter JSONB,
  questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Student Progress table
CREATE TABLE public.student_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_chapters JSONB DEFAULT '[]',
  exam_score INTEGER,
  certificate_earned BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses (public read, admin write)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Student Progress
CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.student_progress FOR ALL USING (auth.uid() = user_id);
```

#### 3. Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Option 2: Firebase (Alternative Backend)

#### 1. Setup Firebase
```bash
npm install firebase
```

#### 2. Firebase Configuration
```javascript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Option 3: Custom Node.js Backend

#### 1. Create Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── js
├── package.json
└── server.js
```

#### 2. Basic Express Setup
```javascript
// backend/src/js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
use(helmet());
use(cors());
use(express.json());
use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Routes
use('/api/auth', require('./routes/auth'));
use('/api/courses', require('./routes/courses'));
use('/api/users', require('./routes/users'));

module.exports = app;
```

## 🔐 Authentication Setup

### Supabase Auth Integration
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

```javascript
// src/contexts/AuthContext.jsx - Updated for Supabase
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 📱 Production Optimizations

### 1. Performance Optimizations
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
})
```

### 2. Environment Configuration
```javascript
// src/config/environment.js
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  app: {
    name: 'EduFlow',
    version: '1.0.0',
    environment: import.meta.env.MODE
  }
}
```

### 3. Error Handling & Monitoring
```javascript
// src/lib/errorHandler.js
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error)
  
  // In production, send to monitoring service
  if (import.meta.env.PROD) {
    // Send to Sentry, LogRocket, etc.
  }
}
```

## 🚀 Deployment Steps

### 1. Prepare for Production
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build locally
npm run preview
```

### 2. Deploy Frontend
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or using Vercel
npm install -g vercel
vercel --prod
```

### 3. Configure Domain & SSL
- Set up custom domain in your hosting provider
- SSL certificates are usually auto-configured

### 4. Set up Monitoring
- Google Analytics for user tracking
- Sentry for error monitoring
- Performance monitoring tools

## 🔧 Backend Deployment (if using custom backend)

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_database_url

# Deploy
git push heroku main
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

## 📊 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API endpoints working
- [ ] Database connected and populated
- [ ] Authentication working
- [ ] File uploads working (if applicable)
- [ ] Email notifications configured
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented
- [ ] Performance optimized

## 🔐 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Always use SSL in production
3. **CORS**: Configure properly for your domain
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs
6. **SQL Injection**: Use parameterized queries
7. **XSS Protection**: Sanitize user content
8. **Authentication**: Implement proper session management

## 📈 Scaling Considerations

1. **CDN**: Use CloudFlare or similar for static assets
2. **Database**: Consider read replicas for heavy read workloads
3. **Caching**: Implement Redis for session storage
4. **Load Balancing**: Use multiple server instances
5. **File Storage**: Use cloud storage (AWS S3, Cloudinary)
6. **Monitoring**: Set up alerts for performance issues

This guide provides multiple deployment options. For a quick start, I recommend using **Supabase + Netlify** combination as it provides a complete backend solution with minimal setup.