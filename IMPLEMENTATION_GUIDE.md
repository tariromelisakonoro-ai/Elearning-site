# LearnExpress - Exams, Resources & Assignments Implementation Guide

## Overview
The LearnExpress platform now fully supports instructors uploading and students viewing:
- **Exams** (📋) - Exam papers and test documents
- **Quizzes** (❓) - Quiz materials  
- **Resources** (📎) - Study materials and downloadable content
- **Assignments** - Tasks with submission and grading system

---

## System Architecture

### Frontend Pages
1. **exams.html** - Displays exam papers and quizzes uploaded by instructors
2. **resources.html** - Displays study materials and downloadable content
3. **assignments.html** - Displays assignments with student submission capability

### Backend Endpoints
- `GET backend/get_materials.php` - Retrieves all materials (exams, quizzes, resources)
- `POST backend/add_material.php` - Instructors upload new materials
- `GET backend/get_assignments.php` - Retrieves all assignments
- `POST backend/add_assignment.php` - Instructors post new assignments
- `POST backend/submit_assignment.php` - Students submit completed work

---

## How It Works

### For Instructors

#### 1. Upload Exams/Quizzes/Resources
1. Log in as instructor to **Dashboard**
2. Scroll to "Upload Exams & Resources" panel
3. Select:
   - **Target Course** (required)
   - **Type** (choose from):
     - 📝 Text Content / Article
     - 🎬 Video Lecture
     - 📎 Downloadable Resource
     - 📋 **Exam Paper** ← NEW
     - ❓ **Quiz** ← NEW
     - 🔴 Live Class Session
   - **Title** (e.g., "Final Exam - Physics")
   - **File** (upload PDF, DOCX, PPT, MP4, etc.)
4. Click "Upload Material"

#### 2. Post Assignments
1. Scroll to "Post Assignment" panel
2. Select course, title, and description
3. Set due date/time
4. Click "Post Assignment"

#### 3. View Student Work & Grade
1. In "Recent Submissions" panel, view student submissions
2. Enter grade (e.g., "A", "85%", etc.)
3. Add feedback if needed
4. Click "Save Grade"

---

### For Students

#### 1. View Exams & Quizzes
1. Navigate to **Exams & Quiz Schedule** page
2. See all exams and quizzes uploaded by instructors
3. Download and review exam papers
4. Take quizzes (if online portal is configured)

#### 2. Access Study Resources
1. Navigate to **Study Materials & Docs** page
2. Browse resources uploaded by instructors
3. Download materials for offline study
4. Filter by course if needed

#### 3. Complete & Submit Assignments
1. Navigate to **Assignments** page
2. See all active assignments with due dates
3. For each assignment:
   - Read instructions
   - Upload your completed work (PDF/DOCX)
   - Click "Submit"
4. View feedback and grades once graded

#### 4. Track Progress
1. View assignment status (Pending/Submitted)
2. See grades and teacher feedback
3. Check deadlines to avoid late submissions

---

## Database Schema

### Materials Table (`items`)
```sql
- id (INT)
- course_id (INT) - Links to course
- instructor_id (INT) - Uploader
- title (VARCHAR) - Material name
- description (TEXT) - Details
- type (ENUM) - 'text', 'video', 'file', 'exam', 'quiz', 'live_class'
- content (TEXT) - Text content (if applicable)
- url (VARCHAR) - Video/meeting URL (if applicable)
- file_url (VARCHAR) - Upload path
- created_at (TIMESTAMP)
```

### Assignments Table
```sql
- id (INT)
- course_id (INT)
- instructor_id (INT)
- title (VARCHAR)
- description (TEXT)
- due_date (DATETIME)
- created_at (TIMESTAMP)
```

---

## File Organization

```
LearnExpress/
├── exams.html              # Exams & Quizzes page
├── resources.html          # Study Materials page
├── assignments.html        # Assignments page
├── script.js              # Frontend logic (updated with new types)
├── backend/
│   ├── get_materials.php  # Fetch exams, quizzes, resources
│   ├── add_material.php   # Upload materials (updated)
│   ├── get_assignments.php# Fetch assignments
│   ├── add_assignment.php # Create assignments
│   └── submit_assignment.php # Submit work
└── uploads/               # Stored files
```

---

## Features Implemented

✅ **Exams Page**
- Displays exam papers (type: 'exam')
- Displays quizzes (type: 'quiz')
- Shows course name and instructor
- Download buttons for files

✅ **Resources Page**
- Displays study materials (type: 'resource', 'file')
- Shows course name and instructor
- Download buttons for files

✅ **Assignments Page**
- Lists all assignments with due dates
- Shows assignment status (Pending/Submitted)
- Student submission form
- Grade display and feedback
- Instructor grading interface

✅ **Instructor Dashboard**
- Material upload with new exam/quiz types
- Assignment posting
- Submission grading
- Student progress tracking

---

## Testing Checklist

- [ ] Instructor can upload exam papers (type: 'exam')
- [ ] Instructor can upload quizzes (type: 'quiz')
- [ ] Instructor can upload resources (type: 'resource')
- [ ] Students see materials on Exams page
- [ ] Students see materials on Resources page
- [ ] Students can download materials
- [ ] Students can view assignments
- [ ] Students can submit assignments
- [ ] Instructors can grade submissions
- [ ] Students see grades and feedback

---

## Common Issues & Solutions

### Materials not showing on pages?
1. Verify materials are uploaded in dashboard
2. Check browser console (F12) for errors
3. Clear browser cache
4. Ensure correct course is selected

### Can't upload files?
1. Check file format is allowed (PDF, DOCX, PPT, MP4, etc.)
2. Check uploads/ folder has write permissions
3. Check file size limits
4. Verify you're logged in as approved instructor

### Assignments not appearing?
1. Verify assignment is posted from instructor dashboard
2. Check due date/time (future dates show as upcoming)
3. Ensure you're viewing the correct course
4. Refresh page

---

## Next Steps (Optional Enhancements)

- Add filtering by course on materials pages
- Add search functionality
- Add category/tag organization
- Add material preview/preview in modal
- Add due date reminders
- Add attendance/participation tracking
- Add messaging between students and instructors
