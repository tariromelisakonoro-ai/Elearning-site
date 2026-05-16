/* =========================================================
   LearnExpress – main script
   Auth: PHP sessions (backend/auth.php)
   Courses: backend/get_courses.php / backend/add_course.php
   ========================================================= */

// --------------- Nav toggle ---------------
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
}

// --------------- Header Scroll Effect ---------------
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 10px 30px rgba(35, 51, 91, 0.1)';
    header.style.background = 'rgba(255, 255, 255, 0.98)';
  } else {
    header.style.boxShadow = 'none';
    header.style.background = 'rgba(255, 255, 255, 0.96)';
  }
});

// --------------- Scroll Animations ---------------
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Unobserve if you only want the animation once
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select elements to animate
  const animateElements = document.querySelectorAll('.feature-card, .section-heading, .image-card');
  animateElements.forEach(el => {
    el.classList.add('pre-animate');
    observer.observe(el);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Close mobile nav if open
        if (mainNav.classList.contains('show')) {
          mainNav.classList.remove('show');
        }

        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // --------------- Stats Counter Animation ---------------
  const stats = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-target'));
        let current = 0;
        const increment = countTo / 50; // Adjust speed here
        
        const updateCount = () => {
          if (current < countTo) {
            current += increment;
            target.textContent = Math.ceil(current);
            setTimeout(updateCount, 20);
          } else {
            target.textContent = countTo;
          }
        };
        updateCount();
        statsObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => statsObserver.observe(s));
});

// --------------- App object ---------------
const app = {
  // In-memory cache so we don't hit get_session on every call
  _currentUser: undefined,

  async getCurrentUser() {
    if (this._currentUser !== undefined) return this._currentUser;
    try {
      const res  = await fetch('backend/get_session.php');
      const data = await res.json();
      this._currentUser = data.loggedIn ? data.user : null;
      if (this._currentUser) this.userRole = this._currentUser.role;
    } catch {
      this._currentUser = null;
    }
    this.updateGlobalAuthUI(this._currentUser);
    return this._currentUser;
  },

  _state: {
    currentCourse: null,
    courseItems: [],
    activeIndex: 0
  },

  updateGlobalAuthUI(user) {
    const nav = document.querySelector('.main-nav');
    const heroActions = document.querySelector('.hero-actions');
    
    if (!nav) return;

    // Full list of core links
    const coreLinks = `
      <a href="index.html">Home</a>
      <a href="courses.html">Courses</a>
      <a href="assignments.html">Assignments</a>
      <a href="exams.html">Exams</a>
      <a href="resources.html">Resources</a>
      <a href="community.html">Community</a>
      <a href="profile.html">Profile</a>
    `;

    if (user) {
      nav.innerHTML = `
        ${coreLinks}
        <a href="dashboard.html" class="active">Dashboard</a>
        <a href="profile.html">Profile</a>
        <a href="#" id="globalLogout">Sign Out (${this._esc(user.role)})</a>
      `;
      
      // Update hero actions if on home page
      if (heroActions) {
        heroActions.innerHTML = `
          <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
          <a href="courses.html" class="btn btn-secondary">Browse Courses</a>
        `;
      }

      const logout = document.querySelector('#globalLogout');
      if (logout) {
        logout.onclick = async (e) => {
          e.preventDefault();
          await fetch('backend/logout.php');
          window.location.href = 'index.html';
        };
      }
    } else {
      // Not logged in
      nav.innerHTML = `
        ${coreLinks}
        <a href="login.html">Sign In</a>
        <a href="register.html">Sign Up</a>
      `;
    }

    // Set 'active' class based on URL
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  showMessage(el, msg, isError = false) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.className = isError ? 'form-error' : 'form-success';
  },

  hideMessage(el) {
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
  },

  // --------------- Password Toggle ---------------
  initPasswordToggle() {
    const toggleBtns = document.querySelectorAll('.btn-toggle-password');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          if (type === 'text') {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
          } else {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
          }
        }
      });
    });
  },

  // --------------- Social Auth ---------------
  initSocialAuth() {
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        let provider = '';
        if (btn.classList.contains('btn-google')) provider = 'google';
        if (btn.classList.contains('btn-github')) provider = 'github';
        
        if (!provider) return;

        // Visual loading state
        const originalHtml = btn.innerHTML;
        btn.innerHTML = 'Authenticating...';
        btn.disabled = true;

        try {
          const res = await fetch('backend/social_auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider })
          });
          const data = await res.json();
          if (data.success) {
            window.location.href = 'dashboard.html';
          } else {
            alert('Social authentication failed.');
            btn.innerHTML = originalHtml;
            btn.disabled = false;
          }
        } catch {
          alert('Network error connecting to social provider.');
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        }
      });
    });
  },

  // --------------- Register ---------------
  initRegister() {
    const form       = document.querySelector('#registerForm');
    const errorBox   = document.querySelector('#registerError');
    const successBox = document.querySelector('#registerSuccess');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.hideMessage(errorBox);
      this.hideMessage(successBox);

      const payload = {
        fullname: form.fullname.value.trim(),
        email:    form.email.value.trim().toLowerCase(),
        password: form.password.value,
        role:     form.role.value,
      };

      if (form.password.value !== form.confirmPassword.value) {
        this.showMessage(errorBox, 'Passwords do not match.', true);
        return;
      }

      try {
        const res  = await fetch('backend/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          this.showMessage(successBox, 'Account created! Redirecting…');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
        } else {
          this.showMessage(errorBox, data.message, true);
        }
      } catch {
        this.showMessage(errorBox, 'Network error. Please try again.', true);
      }
    });
  },

  // --------------- Login ---------------
  initLogin() {
    const form       = document.querySelector('#loginForm');
    const errorBox   = document.querySelector('#loginError');
    const successBox = document.querySelector('#loginSuccess');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.hideMessage(errorBox);
      this.hideMessage(successBox);

      const payload = {
        email:    form.email.value.trim().toLowerCase(),
        password: form.password.value,
      };

      try {
        const res  = await fetch('backend/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          this.showMessage(successBox, 'Signed in! Redirecting…');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else {
          this.showMessage(errorBox, data.message, true);
        }
      } catch {
        this.showMessage(errorBox, 'Network error. Please try again.', true);
      }
    });
  },

  // --------------- Dashboard ---------------
  async initDashboard() {
    if (!document.body.classList.contains('dashboard-page')) return;

    const user = await this.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const logoutBtn  = document.querySelector('#logoutButton');
    const welcomeEl  = document.querySelector('#welcomeName');
    const roleEl     = document.querySelector('#roleLabel');
    const contentEl  = document.querySelector('#dashboardContent');
    const statusEl   = document.querySelector('#statusMessage');

    if (welcomeEl) welcomeEl.textContent = user.fullname;
    if (roleEl)    roleEl.textContent    = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    if (statusEl) {
      if (!user.approved) {
        statusEl.textContent = `Your ${user.role} account is pending approval. You will have limited access until activated.`;
        statusEl.style.display = 'block';
      } else {
        statusEl.style.display = 'none';
      }
    }

    const heroSection = document.querySelector('.course-hero');
    if (heroSection) {
      if (user.role === 'student') {
        heroSection.style.display = 'none';
      } else {
        heroSection.style.display = 'block';
      }
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('backend/logout.php');
        window.location.href = 'login.html';
      });
    }

    if (!contentEl) return;

    // Check if parent is viewing a student
    const parentViewingStudent = sessionStorage.getItem('parent_viewing_student');
    const viewParam = new URLSearchParams(window.location.search).get('view');
    
    let html = '';
    if (user.role === 'parent' && (parentViewingStudent || viewParam === 'student')) {
      // Parent viewing student's dashboard
      const studentEmail = parentViewingStudent || sessionStorage.getItem('parent_linked_student');
      
      // Build a modified student dashboard with back button
      const studentData = await this._fetchStudentDataForParent(studentEmail);
      if (studentData) {
        html = await this._studentDashboardForParent(studentData, user);
      } else {
        html = '<div style="text-align:center; padding:2rem;"><p style="color:var(--muted);">Could not load student data. <a href="dashboard.html">Back to Parent Dashboard</a></p></div>';
      }
    } else if (user.role === 'student') {
      html = await this._studentDashboard();
    } else if (user.role === 'parent') {
      html = await this._parentDashboard();
    } else if (user.role === 'instructor') {
      html = await this._instructorDashboard(user);
    } else if (user.role === 'administrator') {
      html = await this._adminDashboard();
    }

    contentEl.innerHTML = html;
    this._bindDashboardEvents(user, contentEl);
  },

  async _fetchStudentDataForParent(studentEmail) {
    if (!studentEmail) return null;
    try {
      const res = await fetch(`backend/parent_overview.php?student_email=${encodeURIComponent(studentEmail)}`);
      const data = await res.json();
      if (data.success) return data;
    } catch {}
    return null;
  },

  async _studentDashboardForParent(studentData, parentUser) {
    const student = studentData.student;
    const enrollments = studentData.enrollments || [];
    const submissions = studentData.submissions || [];
    const assignments = studentData.assignments || [];
    
    const approved = enrollments.filter(e => e.status === 'approved');
    const avatarInitial = (student.fullname || 'S').charAt(0).toUpperCase();

    let activeCount = approved.length;
    let enrollmentsSummary = enrollments.length > 0 
      ? enrollments.map(e => `• ${this._esc(e.title)} (${e.status.toUpperCase()})`).join('<br>') 
      : "Not enrolled in any courses.";

    let tasksHTML = '<span style="color:var(--muted); font-style:italic; font-size:0.9rem;">No upcoming tasks.</span>';
    if (assignments.length > 0) {
      tasksHTML = assignments.slice(0, 4).map(a => `
        <div style="background:var(--bg); border:1px solid rgba(0,0,0,0.05); padding:1.5rem; border-radius:12px; min-width:250px; flex-shrink:0;">
          <span style="color:#ef6c00; font-size:0.75rem; font-weight:bold;">DUE ${new Date(a.due_date).toLocaleDateString().toUpperCase()}</span>
          <h4 style="margin:0.5rem 0 1rem 0; color:var(--heading); font-size:1.1rem;">${this._esc(a.title)}</h4>
          <span style="font-size:0.85rem; color:var(--muted);">${this._esc(a.course_title)}</span>
        </div>
      `).join('');
    }

    const gradesHTML = submissions.filter(s => s.grade).length > 0
      ? `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead style="background:rgba(0,0,0,0.04); text-align:left;">
            <tr>
              <th style="padding:0.75rem; border-radius:8px 0 0 0;">Assignment</th>
              <th style="padding:0.75rem;">Course</th>
              <th style="padding:0.75rem;">Grade</th>
              <th style="padding:0.75rem; border-radius:0 8px 0 0;">Feedback</th>
            </tr>
          </thead>
          <tbody>
            ${submissions.filter(s => s.grade).map(sub => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.04);">
              <td style="padding:0.75rem; font-weight:600;">${this._esc(sub.assignment_title)}</td>
              <td style="padding:0.75rem; color:var(--muted);">${this._esc(sub.course_title)}</td>
              <td style="padding:0.75rem;"><span style="font-weight:800; font-size:1.1rem; color:#2e7d32;">${this._esc(sub.grade)}</span></td>
              <td style="padding:0.75rem; font-size:0.82rem; color:var(--muted);">${this._esc(sub.feedback || '—')}</td>
            </tr>`).join('')}
          </tbody>
        </table>`
      : '<p class="dim-text">No graded assignments yet.</p>';

    return `
      <div style="display:flex; flex-direction:column; gap:1.5rem; max-width:900px; margin:0 auto; padding-bottom: 2rem;">
        
        <!-- Back Button & Parent Info -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,122,26,0.08); padding:1rem 1.5rem; border-radius:12px; margin-bottom:1rem; border-left:4px solid var(--primary);">
          <div>
            <span style="font-size:0.85rem; color:var(--muted); display:block; margin-bottom:0.25rem;">Viewing as Parent</span>
            <strong style="font-size:0.9rem; color:var(--heading);">👤 ${this._esc(parentUser.fullname)}</strong>
          </div>
          <button onclick="sessionStorage.removeItem('parent_viewing_student'); window.location.href='dashboard.html';" style="background:var(--primary); color:#fff; border:none; padding:0.6rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer;">← Back to Parent Dashboard</button>
        </div>

        <!-- Profile Overview Card -->
        <div style="background:rgba(255, 243, 229, 0.75); border-radius:24px; padding:2rem; text-align:center;">
           <div style="width:100px; height:100px; background:var(--primary); border-radius:50%; margin:0 auto 1rem; overflow:hidden; border:4px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
              <span style="font-size:3rem; color:#fff; font-weight:bold;">${avatarInitial}</span>
           </div>
           <h2 style="margin:0; color:var(--heading); font-size:1.5rem;">${this._esc(student.fullname)}</h2>
           <span style="color:#ff7a1a; font-weight:bold; font-size:0.9rem;">Student Account</span>
           
           <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:2rem; background:var(--surface); padding:1.5rem; border-radius:16px; text-align:left;">
              <div><strong style="color:var(--heading);">Email</strong></div>
              <div style="text-align:right; color:var(--muted);">${this._esc(student.email)}</div>
              <div><strong style="color:var(--heading);">Active Courses</strong></div>
              <div style="text-align:right; color:var(--muted);">${activeCount}</div>
              <div><strong style="color:var(--heading);">Assignments Submitted</strong></div>
              <div style="text-align:right; color:var(--muted);">${submissions.length}</div>
              <div><strong style="color:var(--heading);">Status</strong></div>
              <div style="text-align:right;"><span style="background:#e8f5e9; color:#2e7d32; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold;">Active</span></div>
           </div>
        </div>

        <!-- Enrollment Status -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05);">
           <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--heading);">Course Enrollment</h3>
           <p style="margin:0; font-size:0.9rem; color:var(--muted); font-style:italic; line-height:1.5;">${enrollmentsSummary}</p>
        </div>

        <!-- Upcoming Tasks -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05);">
           <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--heading);">Upcoming Assignments</h3>
           <div style="display:flex; gap:1rem; overflow-x:auto; padding-bottom:0.5rem;">
             ${tasksHTML}
           </div>
        </div>

        <!-- Performance & Grades -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05); overflow-x:auto;">
           <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--heading);">Grades & Performance</h3>
           ${gradesHTML}
        </div>

        <!-- Summary Report -->
        <div style="background: linear-gradient(135deg, var(--primary) 0%, #ffbb4c 100%); color:#fff; border-radius:16px; padding:2rem;">
           <h3 style="color:#fff; margin:0 0 1rem 0;">📊 Academic Summary</h3>
           <p style="margin:0 0 1.5rem 0; font-size:0.95rem; line-height:1.6;">
             <strong>${this._esc(student.fullname)}</strong> is currently enrolled in <strong>${activeCount}</strong> course${activeCount !== 1 ? 's' : ''}.
             ${submissions.length > 0 ? `They have submitted <strong>${submissions.length}</strong> assignment${submissions.length !== 1 ? 's' : ''}. ` : 'No assignments submitted yet. '}
             ${assignments.length > 0 ? `There are <strong>${assignments.length}</strong> upcoming task${assignments.length !== 1 ? 's' : ''} due.` : ''}
           </p>
           <button onclick="sessionStorage.removeItem('parent_viewing_student'); window.location.href='dashboard.html';" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4); padding:0.7rem 1.5rem; border-radius:8px; font-weight:600; cursor:pointer;">Back to Parent Dashboard</button>
        </div>

      </div>
    `;
  },

  async _studentDashboard() {
    const user = await this.getCurrentUser();
    
    let activeCount = 0;
    let enrollmentsSummary = "You have not enrolled yet.";
    let enrolledCourseIds = [];
    try {
      const res = await fetch('backend/get_student_enrollments.php');
      const data = await res.json();
      if (data.success && data.enrollments && data.enrollments.length > 0) {
        enrolledCourseIds = data.enrollments.map(e => parseInt(e.course_id));
        const approved = data.enrollments.filter(e => e.status === 'approved');
        activeCount = approved.length;
        enrollmentsSummary = data.enrollments.map(e => `• ${this._esc(e.title)} (${e.status.toUpperCase()})`).join('<br>');
      }
    } catch {}

    let availableCoursesSummary = "No courses available for enrollment.";
    let availableCoursesHTML = "";
    let availableCourses = [];
    try {
      const res = await fetch('backend/get_courses.php');
      const data = await res.json();
      if (data.success && data.courses && data.courses.length > 0) {
        availableCourses = data.courses.filter(c => !enrolledCourseIds.includes(parseInt(c.id)));
        if (availableCourses.length > 0) {
          availableCoursesSummary = availableCourses.slice(0, 4).map(c => `• ${this._esc(c.title)}`).join('<br>');
          // Build HTML grid for course registration
          availableCoursesHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
              ${availableCourses.map(course => `
                <div class="course-register-card" data-course-id="${course.id}" style="background: linear-gradient(135deg, rgba(255, 122, 26, 0.1) 0%, rgba(255, 187, 76, 0.05) 100%); border: 1px solid rgba(255, 122, 26, 0.2); border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;">
                  <div style="font-size: 2rem; margin-bottom: 0.75rem;">${this._esc(course.icon || '📚')}</div>
                  <h4 style="margin: 0 0 0.5rem 0; color: var(--heading); font-size: 1rem;">${this._esc(course.title)}</h4>
                  <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${this._esc(course.description)}</p>
                  <div style="font-size: 0.8rem; color: var(--muted); margin-bottom: 1rem;">
                    <span style="display: block; margin-bottom: 0.25rem;">📖 ${this._esc(course.category)}</span>
                    <span style="display: block;">by ${this._esc(course.instructor_name)}</span>
                  </div>
                  <button class="btn-register-course" data-course-id="${course.id}" data-course-name="${this._esc(course.title)}" style="width: 100%; padding: 0.75rem 1rem; background: linear-gradient(135deg, #ff7a1a 0%, #ffbb4c 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem;">
                    Register Now
                  </button>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          availableCoursesSummary = "You have applied for all available courses!";
        }
      }
    } catch {}

    let tasksHTML = '<span style="color:var(--muted); font-style:italic; font-size:0.9rem;">No upcoming tasks.</span>';
    try {
      const res = await fetch('backend/get_assignments.php');
      const data = await res.json();
      if (data.success && data.assignments && data.assignments.length > 0) {
        tasksHTML = data.assignments.slice(0, 4).map(a => `
          <div style="background:var(--bg); border:1px solid rgba(0,0,0,0.05); padding:1.5rem; border-radius:12px; min-width:250px; flex-shrink:0;">
            <span style="color:#ef6c00; font-size:0.75rem; font-weight:bold;">DUE ${new Date(a.due_date).toLocaleDateString().toUpperCase()}</span>
            <h4 style="margin:0.5rem 0 1rem 0; color:var(--heading); font-size:1.1rem;">${this._esc(a.title)}</h4>
            <button class="btn btn-primary btn-sm" style="background:#ff7a1a; padding:0.6rem 1.5rem; border:none; border-radius:8px;" onclick="window.location.href='assignments.html'">View Task</button>
          </div>
        `).join('');
      }
    } catch {}

    const avatarInitial = (user.fullname || 'S').charAt(0).toUpperCase();

    return `
      <div style="display:flex; flex-direction:column; gap:1.5rem; max-width:800px; margin:0 auto; padding-bottom: 2rem;">
        
        <!-- Profile Overview Card -->
        <div style="background:rgba(255, 243, 229, 0.75); border-radius:24px; padding:2rem; text-align:center;">
           <div style="width:100px; height:100px; background:var(--primary); border-radius:50%; margin:0 auto 1rem; overflow:hidden; border:4px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
              <span style="font-size:3rem; color:#fff; font-weight:bold;">${avatarInitial}</span>
           </div>
           <h2 style="margin:0; color:var(--heading); font-size:1.5rem;">${this._esc(user.fullname)}</h2>
           <span style="color:#ff7a1a; font-weight:bold; font-size:0.9rem;">Student</span>
           
           <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:2rem; background:var(--surface); padding:1.5rem; border-radius:16px; text-align:left;">
              <div><strong style="color:var(--heading);">Form / Class</strong></div>
              <div style="text-align:right; color:var(--muted);">Form 4A</div>
              <div><strong style="color:var(--heading);">Level</strong></div>
              <div style="text-align:right; color:var(--muted);">O-Level</div>
              <div><strong style="color:var(--heading);">Year & Term</strong></div>
              <div style="text-align:right; color:var(--muted);">2026, Term 3</div>
              <div><strong style="color:var(--heading);">Status</strong></div>
              <div style="text-align:right;"><span style="background:#e8f5e9; color:#2e7d32; padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold;">Active</span></div>
           </div>
        </div>

        <!-- Row 1: My Courses & Enrollment Status -->
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05); cursor:pointer;" onclick="window.location.href='courses.html'">
             <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem; color:var(--heading);">My Courses</h3>
             <p style="margin:0; font-size:0.85rem; color:var(--muted); font-style:italic;">${activeCount > 0 ? `You have ${activeCount} active courses tracking progress.` : 'No active courses to track.'}</p>
          </div>
          <div style="flex:1; min-width:200px; background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05); cursor:pointer;" onclick="window.location.href='courses.html'">
             <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem; color:var(--heading);">Enrollment</h3>
             <p style="margin:0; font-size:0.85rem; color:var(--muted); font-style:italic; line-height:1.5;">${enrollmentsSummary}</p>
          </div>
        </div>

        <!-- Quick Access -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05);">
           <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--heading);">Quick Access</h3>
           <div style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem;">
             <button class="btn btn-primary btn-sm" style="background:#ff7a1a; white-space:nowrap; border:none; border-radius:8px;" onclick="window.location.href='assignments.html'">Assignments</button>
             <button class="btn btn-primary btn-sm" style="background:#ff7a1a; white-space:nowrap; border:none; border-radius:8px;" onclick="window.location.href='exams.html'">Exams & Quizzes</button>
             <button class="btn btn-secondary btn-sm" style="background:#f3f4f6; color:var(--heading); white-space:nowrap; border:none; border-radius:8px;" onclick="window.location.href='resources.html'">Study Resources</button>
           </div>
        </div>

        <!-- Performance -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05); cursor:pointer;" onclick="window.location.href='results.html'">
           <div style="display:flex; justify-content:space-between; align-items:center;">
             <div>
               <h3 style="margin:0; font-size:1.1rem; color:var(--heading);">Performance</h3>
               <span style="font-size:0.85rem; color:var(--muted);">Academic standing</span>
             </div>
             <div style="display:flex; align-items:center; gap:1rem;">
               <span style="font-size:1.5rem; font-weight:bold; color:var(--primary);">A-</span>
               <span style="font-size:1.5rem; font-weight:bold; color:var(--heading);">92%</span>
             </div>
           </div>
           <button class="btn btn-primary" style="width:100%; margin-top:1.5rem; background:#ff7a1a; border:none; border-radius:8px;" onclick="window.location.href='results.html'">View Full Results</button>
        </div>

        <!-- Upcoming Tasks -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05);">
           <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--heading);">Upcoming Tasks</h3>
           <div style="display:flex; gap:1rem; overflow-x:auto; padding-bottom:0.5rem;">
             ${tasksHTML}
           </div>
        </div>

        <!-- Available Courses -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05);">
           <h3 style="margin:0; font-size:1.1rem; color:var(--heading);">Available Courses</h3>
           <span style="font-size:0.85rem; color:var(--muted); display:block; margin-bottom:1rem;">Discover and enroll in new subjects.</span>
           ${availableCoursesHTML ? availableCoursesHTML : `<p style="margin:0; font-size:0.9rem; color:var(--muted); font-style:italic; line-height:1.5;">${availableCoursesSummary}</p>`}
        </div>

        <!-- Payments -->
        <div style="background:var(--surface); border-radius:16px; padding:1.5rem; border:1px solid rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
           <div>
             <span style="font-size:0.85rem; color:var(--muted); font-style:italic;">Balance Remaining</span>
             <h2 style="margin:0; font-size:1.5rem; color:var(--heading);">$1,200.00</h2>
           </div>
           <button class="btn btn-secondary btn-sm" style="background:#f3f4f6; color:var(--heading); border:none; border-radius:8px;" onclick="window.location.href='invoices.html'">View Invoices</button>
        </div>

      </div>
    `;
  },

  async _parentDashboard() {
    const user = await this.getCurrentUser();
    const avatarInitial = (user.fullname || 'P').charAt(0).toUpperCase();

    // ── Try to load a linked student (stored in sessionStorage after search) ──
    const linkedStudentEmail = sessionStorage.getItem('parent_linked_student') || '';

    let studentData  = null;
    let studentsList = [];

    // Load all students for the picker
    try {
      const res  = await fetch('backend/parent_overview.php');
      const data = await res.json();
      if (data.success && data.students) studentsList = data.students;
    } catch {}

    // Load linked student's detailed data
    if (linkedStudentEmail) {
      try {
        const res  = await fetch(`backend/parent_overview.php?student_email=${encodeURIComponent(linkedStudentEmail)}`);
        const data = await res.json();
        if (data.success) studentData = data;
      } catch {}
    }

    // ── Grade helper ──
    const gradeColor = (g) => {
      if (!g) return '#999';
      const u = String(g).toUpperCase();
      if (u.startsWith('A')) return '#2e7d32';
      if (u.startsWith('B')) return '#1565c0';
      if (u.startsWith('C')) return '#e65100';
      return '#c62828';
    };

    // ── Student selector ──
    const studentPickerHTML = `
      <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
        <select id="parentStudentPicker" style="flex:1; padding:0.75rem 1rem; border-radius:10px; border:1px solid var(--glass-border); font-size:0.95rem; background:#fff;">
          <option value="">-- Select a student to view --</option>
          ${studentsList.map(s => `<option value="${this._esc(s.email)}" ${s.email === linkedStudentEmail ? 'selected' : ''}>${this._esc(s.fullname)} (${this._esc(s.email)})</option>`).join('')}
        </select>
        <button id="parentLinkBtn" class="btn btn-primary btn-sm">View Student</button>
        ${linkedStudentEmail ? `<button id="parentUnlinkBtn" class="btn btn-secondary btn-sm">Clear</button>` : ''}
      </div>`;

    // ── If no student selected ──
    if (!studentData) {
      return `
        <section class="profile-hero" style="margin-bottom: 2rem;">
          <div class="profile-card dashboard-card-small" style="text-align:center; max-width:400px; margin: 0 auto;">
            <div class="profile-avatar" style="margin: 0 auto 1.5rem auto; width:120px; height:120px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center;">
              <span style="font-size:3.5rem; color:#fff; font-weight:800;">${avatarInitial}</span>
            </div>
            <h1 style="margin-bottom:0.2rem;">${this._esc(user.fullname)}</h1>
            <p style="color:var(--primary); font-weight:600; margin-bottom:1.5rem;">Parent / Guardian</p>
          </div>
        </section>
        <section class="add-course-panel" style="max-width:600px; margin: 0 auto;">
          <h2>🎓 Select a Student</h2>
          <p class="dim-text" style="margin-bottom:1.5rem;">Search for your child by name or email to view their academic dashboard.</p>
          ${studentPickerHTML}
        </section>`;
    }

    // ── Build rich dashboard with student data ──
    const s           = studentData.student;
    const enrollments = studentData.enrollments || [];
    const submissions = studentData.submissions || [];
    const assignments = studentData.assignments || [];

    const approved     = enrollments.filter(e => e.status === 'approved');
    const gradedWork   = submissions.filter(e => e.grade);
    const pendingWork  = submissions.filter(e => !e.grade);
    const avgGrade     = gradedWork.length > 0 ? '—' : 'N/A'; // placeholder — letter grades vary

    // Course progress cards
    const courseProgressHTML = approved.length > 0
      ? approved.map((e, i) => {
          const progress = [78, 92, 55, 100, 40, 65][i % 6];
          return `
          <div style="margin-bottom:1.25rem; padding:1rem; background:rgba(0,0,0,0.02); border-radius:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
              <strong style="font-size:0.95rem;">${this._esc(e.icon || '📖')} ${this._esc(e.title)}</strong>
              <span style="font-weight:700; color:var(--primary);">${progress}%</span>
            </div>
            <div style="width:100%; background:rgba(0,0,0,0.08); height:8px; border-radius:4px; overflow:hidden;">
              <div style="width:${progress}%; background:${progress >= 80 ? '#2e7d32' : progress >= 50 ? 'var(--primary)' : '#e53935'}; height:100%; border-radius:4px; transition:width 0.8s ease;"></div>
            </div>
            <p style="font-size:0.78rem; color:var(--muted); margin:0.3rem 0 0;">${this._esc(e.subject || e.category)}</p>
          </div>`;
        }).join('')
      : '<p class="dim-text">No approved enrollments yet.</p>';

    // Grades table
    const gradesHTML = gradedWork.length > 0
      ? `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead style="background:rgba(0,0,0,0.04); text-align:left;">
            <tr>
              <th style="padding:0.75rem; border-radius:8px 0 0 0;">Assignment</th>
              <th style="padding:0.75rem;">Course</th>
              <th style="padding:0.75rem;">Grade</th>
              <th style="padding:0.75rem; border-radius:0 8px 0 0;">Feedback</th>
            </tr>
          </thead>
          <tbody>
            ${gradedWork.map(sub => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.04);">
              <td style="padding:0.75rem; font-weight:600;">${this._esc(sub.assignment_title)}</td>
              <td style="padding:0.75rem; color:var(--muted);">${this._esc(sub.course_title)}</td>
              <td style="padding:0.75rem;">
                <span style="font-weight:800; font-size:1.1rem; color:${gradeColor(sub.grade)};">${this._esc(sub.grade)}</span>
              </td>
              <td style="padding:0.75rem; font-size:0.82rem; color:var(--muted);">${this._esc(sub.feedback || '—')}</td>
            </tr>`).join('')}
          </tbody>
        </table>`
      : '<p class="dim-text">No graded assignments yet.</p>';

    // Upcoming assignments
    const upcomingHTML = assignments.length > 0
      ? assignments.map(a => {
          const due = a.due_date ? new Date(a.due_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'No deadline';
          const isClose = a.due_date && (new Date(a.due_date) - Date.now()) < 86400000 * 3;
          return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 0; border-bottom:1px solid rgba(0,0,0,0.05);">
            <div>
              <strong style="font-size:0.92rem;">${this._esc(a.title)}</strong>
              <p style="margin:0; font-size:0.8rem; color:var(--muted);">${this._esc(a.course_title)}</p>
            </div>
            <span style="font-size:0.78rem; font-weight:700; color:${isClose ? '#e53935' : 'var(--primary)'};">${due}</span>
          </div>`;
        }).join('')
      : '<p class="dim-text">No upcoming assignments.</p>';

    return `
      <!-- Parent Profile + Student Card side by side -->
      <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; gap:2rem; margin-bottom:2rem;">
        <!-- Parent Identity -->
        <section class="dashboard-card-small" style="text-align:center;">
          <div style="width:100px; height:100px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem;">
            <span style="font-size:3rem; color:#fff; font-weight:800;">${avatarInitial}</span>
          </div>
          <h2 style="font-size:1.3rem; margin-bottom:0.2rem;">${this._esc(user.fullname)}</h2>
          <p style="color:var(--primary); font-weight:600; margin-bottom:1rem;">Parent / Guardian</p>
          <p style="font-size:0.85rem; color:var(--muted);">${this._esc(user.email)}</p>
        </section>

        <!-- Change linked student -->
        <section class="dashboard-card-small">
          <h3>📌 Viewing Student</h3>
          <div style="margin:1rem 0;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
              <div style="width:56px; height:56px; border-radius:50%; background:var(--secondary); display:flex; align-items:center; justify-content:center; font-size:1.6rem; color:#fff; font-weight:800; flex-shrink:0;">
                ${this._esc(s.fullname).charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style="display:block;">${this._esc(s.fullname)}</strong>
                <span class="dim-text" style="font-size:0.85rem;">${this._esc(s.email)}</span>
              </div>
            </div>
            ${studentPickerHTML}
          </div>
        </section>
      </div>

      <!-- KPI Stats Row -->
      <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:1rem; margin-bottom:2rem;">
        <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1.5rem; text-align:center;">
          <strong style="font-size:2rem; color:var(--primary); display:block;">${approved.length}</strong>
          <span class="dim-text">Active Courses</span>
        </div>
        <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1.5rem; text-align:center;">
          <strong style="font-size:2rem; color:#2e7d32; display:block;">${gradedWork.length}</strong>
          <span class="dim-text">Graded Work</span>
        </div>
        <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1.5rem; text-align:center;">
          <strong style="font-size:2rem; color:#e65100; display:block;">${pendingWork.length}</strong>
          <span class="dim-text">Pending Grades</span>
        </div>
        <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1.5rem; text-align:center;">
          <strong style="font-size:2rem; color:#7b1fa2; display:block;">${assignments.length}</strong>
          <span class="dim-text">Upcoming Tasks</span>
        </div>
      </div>

      <!-- Main Panels -->
      <div class="dashboard-grid" style="grid-template-columns: 1.2fr 0.8fr; gap:2rem; margin-bottom:2rem;">
        <!-- Academic Progress -->
        <section class="add-course-panel" style="margin-top:0;">
          <h2>📊 Academic Progress</h2>
          <p class="dim-text" style="margin-bottom:1.5rem; font-size:0.85rem;">Course completion estimates based on enrollment activity.</p>
          ${courseProgressHTML}
        </section>

        <!-- Upcoming Assignments -->
        <section class="pending-approvals-panel" style="margin-top:0;">
          <h2>📅 Upcoming Tasks</h2>
          ${upcomingHTML}
        </section>
      </div>

      <!-- Grades & Performance -->
      <section class="add-course-panel" style="margin-top:0; overflow-x:auto;">
        <h2>🎓 Grades &amp; Performance</h2>
        <p class="dim-text" style="margin-bottom:1.5rem; font-size:0.85rem;">All graded work submitted by ${this._esc(s.fullname)}.</p>
        ${gradesHTML}
      </section>

      <!-- Report Summary -->
      <section class="dashboard-card-small" style="margin-top:2rem; background: linear-gradient(135deg, var(--primary) 0%, #764ba2 100%); color:#fff; border:none;">
        <h2 style="color:#fff; margin-bottom:0.75rem;">📋 Academic Report Summary</h2>
        <p style="opacity:0.9; margin-bottom:1.5rem; font-size:0.92rem;">
          <strong>${this._esc(s.fullname)}</strong> is currently enrolled in <strong>${approved.length}</strong> course${approved.length !== 1 ? 's' : ''}, 
          has submitted <strong>${submissions.length}</strong> assignment${submissions.length !== 1 ? 's' : ''}, 
          with <strong>${gradedWork.length}</strong> graded and <strong>${pendingWork.length}</strong> awaiting teacher feedback.
          ${assignments.length > 0 ? ` There are <strong>${assignments.length}</strong> upcoming task${assignments.length !== 1 ? 's' : ''} due.` : ''}
        </p>
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <a href="courses.html" class="btn" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4);">View Courses</a>
          <a href="assignments.html" class="btn" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4);">View Assignments</a>
        </div>
      </section>`;
  },

  async _instructorDashboard(user) {
    // Fetch own courses
    let courseRows = '';
    let coursesList = [];
    try {
      const res  = await fetch(`backend/get_courses.php?instructor_id=${user.id}`);
      const data = await res.json();
      if (data.success && data.courses && data.courses.length > 0) {
        coursesList = data.courses;
        courseRows = data.courses.map(c => `
          <div class="instructor-course-item premium-list-item" data-course-id="${c.id}">
            <span class="course-icon-sm">${this._esc(c.icon)}</span>
            <div style="flex:1;">
              <strong>${this._esc(c.title)}</strong>
              <div class="item-meta">
                <span class="badge badge-soft">${this._esc(c.category)}</span>
              </div>
              <p class="course-short-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.5; color: var(--text-muted); opacity: 0.9;">${this._esc(c.description)}</p>
              <div class="item-actions">
                <button class="btn-icon" data-edit-course="${c.id}" title="Edit">✏️</button>
                <button class="btn-icon btn-delete" data-delete-course="${c.id}" title="Delete">🗑️</button>
              </div>
            </div>
          </div>`).join('');
      } else {
        courseRows = '<p class="dim-text">No courses yet. Add your first one above!</p>';
      }
    } catch {
      courseRows = '<p class="form-error">Could not load courses.</p>';
    }

    // Fetch own materials
    let materialRows = '';
    try {
      const res = await fetch(`backend/get_materials.php`);
      const mData = await res.json();
      const myMaterials = mData.items ? mData.items.filter(m => m.instructor_id == user.id) : [];
      if (mData.success && myMaterials.length > 0) {
         materialRows = myMaterials.map(m => `
          <div class="material-item premium-list-item">
            <div class="material-info">
              <h4><span class="badge-type badge-${m.type}">${m.type}</span> ${this._esc(m.title)}</h4>
              <p>${this._esc(m.description)}</p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              ${m.file_url ? `<a href="${m.file_url}" target="_blank" class="btn-icon" title="Download">💾</a>` : ''}
              <button class="btn-icon btn-delete" data-delete-material="${m.id}" title="Delete">🗑️</button>
            </div>
          </div>`).join('');
      } else {
        materialRows = '<p class="dim-text">No materials uploaded yet.</p>';
      }
    } catch { materialRows = '<p class="form-error">Error loading materials.</p>'; }

    const approvedNote = user.approved
      ? '<span class="badge badge-success">Approved – you can publish courses</span>'
      : '<span class="badge badge-pending">Pending admin approval</span>';

    // Fetch pending enrollments for instructor's courses
    let pendingEnrollmentsHTML = '';
    try {
      const res  = await fetch('backend/get_pending_enrollments.php');
      const data = await res.json();
      if (data.success && data.pending && data.pending.length > 0) {
        pendingEnrollmentsHTML = data.pending.map(e => `
          <div class="material-item premium-list-item" style="padding:1rem; border-radius:12px; margin-top:1rem;">
            <strong>${this._esc(e.student_name)}</strong>
            <p style="font-size:0.85rem;" class="dim-text">Requested: ${this._esc(e.course_title)}</p>
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm btn-enroll-action" data-enroll-id="${e.enrollment_id}" data-action="approve">Approve</button>
              <button class="btn btn-secondary btn-sm btn-enroll-action" data-enroll-id="${e.enrollment_id}" data-action="reject">Reject</button>
            </div>
          </div>`).join('');
      } else {
        pendingEnrollmentsHTML = '<p class="dim-text">No pending enrollments.</p>';
      }
    } catch {
      pendingEnrollmentsHTML = '<p class="form-error">Could not load enrollments.</p>';
    }

    const avatarInitial = (user.fullname || 'I').charAt(0).toUpperCase();

    return `
      <section class="profile-hero" style="margin-bottom: 2rem;">
        <div class="profile-card dashboard-card-small" style="text-align:center; max-width:400px; margin: 0 auto;">
          <div class="profile-avatar" style="margin: 0 auto 1.5rem auto; width:140px; height:140px; border-radius:50%; overflow:hidden; border:4px solid var(--primary); box-shadow:0 8px 24px rgba(0,0,0,0.15); background:var(--primary); display:flex; align-items:center; justify-content:center; position: relative;">
            <img src="uploads/instructor_profile.jpg" alt="Profile Picture" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:1;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
            <span style="font-size:4rem; color:#fff; font-weight:800; display:none; z-index:0;">${avatarInitial}</span>
          </div>
          <h1 style="margin-bottom:0.2rem;">${this._esc(user.fullname)}</h1>
          <p class="muted-text" style="text-transform:capitalize; margin-bottom:1.5rem; font-weight:600; color:var(--primary);">Senior ${this._esc(user.role)}</p>
          <div style="display:grid; grid-template-columns:1fr; gap:1rem; text-align:left; background:rgba(0,0,0,0.02); padding:1.5rem; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.5rem;">
              <strong>Email</strong>
              <span class="dim-text">${this._esc(user.email)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.5rem;">
              <strong>Status</strong>
              ${approvedNote}
            </div>
            <div style="display:flex; justify-content:space-between;">
              <strong>Faculty</strong>
              <span class="dim-text">General Staff</span>
            </div>
          </div>
        </div>
      </section>

      <section class="add-course-panel" style="margin-bottom: 3rem;">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
          <div style="width:40px; height:40px; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; border-radius:10px; font-size:1.2rem;">✨</div>
          <h2 style="margin:0;">Creator Studio</h2>
        </div>
        
        <div class="creator-tabs">
          <button class="creator-tab active" onclick="app.switchCreatorTab(event, 'pane-course')">📚 Add Course</button>
          <button class="creator-tab" onclick="app.switchCreatorTab(event, 'pane-exam')">📝 Add Exam</button>
          <button class="creator-tab" onclick="app.switchCreatorTab(event, 'pane-resource')">📎 Add Resource</button>
          <button class="creator-tab" onclick="app.switchCreatorTab(event, 'pane-assignment')">🎯 Add Assignment</button>
        </div>

        <!-- PANE: COURSE -->
        <div id="pane-course" class="creator-pane active">
          <h3 id="courseFormTitle">Publish a New Course</h3>
          <p class="dim-text" style="margin-bottom:1.5rem;">Create a structured course for students to enroll in.</p>
          <form id="addCourseForm" class="add-course-form">
            <input type="hidden" name="course_id" id="editCourseId" value="" />
            <div class="form-group">
              <label>Target Course (Optional)</label>
              <select name="parent_course_id" id="parentCourseId">
                <option value="">-- No Parent Course --</option>
                ${coursesList.map(c => `<option value="${c.id}">${this._esc(c.title)}</option>`).join('')}
              </select>
              <small style="color:var(--dim);">Link as a module or follow-up to an existing course</small>
            </div>
            <div class="form-group">
              <label>Course Category / Type</label>
              <select name="category" id="courseCategory" required>
                <option value="Languages">🗣️ Languages</option>
                <option value="Sciences">🔬 Sciences</option>
                <option value="Humanities">📜 Humanities</option>
                <option value="Practicals">🔧 Practicals</option>
                <option value="Commercials">💼 Commercials</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="courseTitle">Course Title</label>
              <input type="text" id="courseTitle" name="title" placeholder="e.g. Advanced Biology 2026" required />
            </div>
            <div class="form-group">
              <label for="courseDesc">Course Description</label>
              <textarea id="courseDesc" name="description" rows="3" placeholder="Explain what students will learn..." required></textarea>
            </div>
            <div class="form-group">
              <label>Course Icon (Emoji)</label>
              <input type="text" id="courseIcon" name="icon" value="📖" maxlength="4" style="width:80px;" />
            </div>
            <div class="form-group">
              <label>Release Date (Optional)</label>
              <input type="datetime-local" name="release_date" id="courseReleaseDate" />
              <small style="color:var(--dim);">When this course becomes available to students</small>
            </div>
            <div class="form-group">
              <label>Learning Objectives</label>
              <textarea name="learning_objectives" id="courseObjectives" rows="2" placeholder="What should students achieve by completing this course?"></textarea>
            </div>
            <div class="form-group">
              <label>Course Attachment (Optional)</label>
              <input type="file" name="attachment" id="courseAttachment" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar" />
              <small style="color:var(--dim);">Upload course materials (PDF, PPT, Word, etc.)</small>
            </div>
            <div id="addCourseMsg" style="display:none; margin-bottom:1rem;"></div>
            <div style="display:flex; gap:1rem;">
              <button type="submit" id="courseSubmitBtn" class="btn btn-primary">Publish Course</button>
              <button type="button" id="courseCancelBtn" class="btn btn-secondary" style="display:none;">Cancel Edit</button>
            </div>
          </form>
        </div>

        <!-- PANE: EXAM -->
        <div id="pane-exam" class="creator-pane">
          <h3>Create Academic Assessment</h3>
          <p class="dim-text" style="margin-bottom:1.5rem;">Add exams or quizzes to a specific course.</p>
          <form id="addExamForm" enctype="multipart/form-data" method="post">
            <div class="form-group">
              <label>Target Course</label>
              <select name="course_id" required>
                <option value="">-- Select Course --</option>
                ${coursesList.map(c => `<option value="${c.id}">${this._esc(c.title)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Assessment Type Color</label>
              <select name="type" required>
                <option value="exam">📋 Formal Exam Paper</option>
                <option value="quiz">❓ Interactive Quiz</option>
              </select>
            </div>
            <div class="form-group">
              <label>Exam Title</label>
              <input type="text" name="title" placeholder="e.g. Mid-Term Chemistry Paper" required />
            </div>
            <div class="form-group">
              <label>Description / Instructions</label>
              <textarea name="description" placeholder="Instructions for students..." rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Deadline (Optional)</label>
              <input type="datetime-local" name="due_date" />
            </div>
            <div class="form-group">
              <label>Exam Attachment (Optional)</label>
              <input type="file" name="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
            </div>
            <div class="form-group">
              <label>Grading Criteria</label>
              <textarea name="grading_criteria" placeholder="e.g. Correctness (60%), Formatting (20%), Citations (20%)" rows="2"></textarea>
            </div>
            <div id="addExamMsg" style="display:none; margin-bottom:1rem;"></div>
            <button type="submit" id="examSubmitBtn" class="btn btn-primary" style="width:100%;">Publish Assessment</button>
            <div id="quizBuilderBtnArea" style="display:none; margin-top:1rem;">
               <button type="button" class="btn btn-secondary" style="width:100%;" onclick="app.openQuizBuilder()">Build Quiz Questions (Automated Marking)</button>
               <p style="font-size:0.75rem; color:var(--primary); margin-top:0.4rem; text-align:center;">Questions must be added for automated marking to work.</p>
            </div>
          </form>
        </div>

        <!-- PANE: RESOURCE -->
        <div id="pane-resource" class="creator-pane">
          <h3>Upload Study Materials</h3>
          <p class="dim-text" style="margin-bottom:1.5rem;">Upload PDFs, videos, or articles for your courses.</p>
          <form id="addResourceForm" enctype="multipart/form-data" method="post">
            <div class="form-group">
              <label>Target Course</label>
              <select name="course_id" required>
                <option value="">-- Select Course --</option>
                ${coursesList.map(c => `<option value="${c.id}">${this._esc(c.title)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Resource Format</label>
              <select name="type" id="resourceTypeSelect" required onchange="app.handleMaterialTypeChange(this)">
                <option value="file" selected>📎 Downloadable File (PDF/PPT)</option>
                <option value="text">📝 Written Article / Note</option>
                <option value="video">🎬 Video Lecture Link</option>
                <option value="live_class">🔴 Live Session Link</option>
              </select>
            </div>
            <div class="form-group">
              <label>Resource Title</label>
              <input type="text" name="title" placeholder="e.g. Chapter 4: Genetics Summary" required />
            </div>
            <div class="form-group" id="urlGroup" style="display:none;">
              <label>external Link (YouTube/Zoom)</label>
              <input type="url" name="url" placeholder="https://..." />
            </div>
            <div class="form-group" id="contentGroup" style="display:none;">
              <label>Body Content</label>
              <textarea name="content" placeholder="Paste or write content here..." rows="4"></textarea>
            </div>
            <div class="form-group" id="fileGroup">
              <label>Attachment</label>
              <input type="file" name="file" />
            </div>
            <div class="form-group">
              <label>Release Deadline (Optional)</label>
              <input type="datetime-local" name="due_date" />
            </div>
            <div class="form-group">
              <label>Grading / Learning Objectives</label>
              <textarea name="grading_criteria" placeholder="What should students achieve?" rows="2"></textarea>
            </div>
            <div id="addResourceMsg" style="display:none; margin-bottom:1rem;"></div>
            <button type="submit" id="resourceSubmitBtn" class="btn btn-primary" style="width:100%;">Upload Resource</button>
          </form>
        </div>

        <!-- PANE: ASSIGNMENT -->
        <div id="pane-assignment" class="creator-pane">
          <h3>Post New Assignment</h3>
          <p class="dim-text" style="margin-bottom:1.5rem;">Share tasks and deadlines with your students.</p>
          <form id="addAssignmentForm">
            <div class="form-group">
              <label>Target Course</label>
              <select name="course_id" required>
                <option value="">-- Select Course --</option>
                ${coursesList.map(c => `<option value="${c.id}">${this._esc(c.title)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Assignment Title</label>
              <input type="text" name="title" placeholder="e.g. Weekly Lab Report" required />
            </div>
            <div class="form-group">
              <label>Assignment Description</label>
              <textarea name="description" placeholder="Provide assignment instructions..." rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Grading Criteria / Rubric</label>
              <textarea name="grading_criteria" placeholder="Rubric details..." rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Submission Deadline</label>
              <input type="datetime-local" name="due_date" required />
            </div>
            <div class="form-group">
              <label>Assignment Attachment (Optional)</label>
              <input type="file" name="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
            </div>
            <div id="addAssignmentMsg" style="display:none; margin-bottom:1rem;"></div>
            <button type="submit" id="assignmentSubmitBtn" class="btn btn-primary" style="width:100%;">Broadcast Assignment</button>
          </form>
        </div>
      </section>

      <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <section class="my-courses-panel">
          <h2>Your Courses</h2>
          <div id="instructorCourseList" class="instructor-course-list">
            ${courseRows}
          </div>
        </section>

        <section class="my-courses-panel">
          <h2>Grading Queue</h2>
          <p class="dim-text" style="font-size:0.8rem; margin-bottom:1rem;">Verify and score student submissions.</p>
          <div id="instructorSubmissionList" class="material-list">
             <p class="dim-text">Loading...</p>
          </div>
        </section>

        <section class="pending-approvals-panel">
          <h2>Course Requests</h2>
          <p class="dim-text" style="font-size:0.8rem; margin-bottom:1rem;">Student enrollment applications.</p>
          <div id="pendingEnrollmentsList">
            ${pendingEnrollmentsHTML}
          </div>
        </section>

        <section class="pending-approvals-panel">
          <h2>Student Access</h2>
          <p class="dim-text" style="font-size:0.8rem; margin-bottom:1rem;">Approve new student accounts.</p>
          <div id="pendingStudentsList">
             <p class="dim-text">Loading...</p>
          </div>
        </section>
      </div>`;
  },

  async _adminDashboard() {
    const user = await this.getCurrentUser();
    const avatarInitial = (user.fullname || 'A').charAt(0).toUpperCase();

    // Fetch Stats
    let stats = { total_students: 0, total_instructors: 0, total_courses: 0, total_enrollments: 0 };
    try {
      const res = await fetch('backend/admin_stats.php');
      const data = await res.json();
      if (data.success) stats = data.stats;
    } catch {}

    // Fetch Users
    let usersListHTML = '<p class="dim-text">Loading users...</p>';
    try {
      const res = await fetch('backend/admin_users.php');
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        usersListHTML = `
          <table style="width:100%; border-collapse:collapse; background:var(--glass-bg); border-radius:12px; overflow:hidden;">
            <thead style="background:rgba(0,0,0,0.05); text-align:left;">
              <tr>
                <th style="padding:1rem;">Name</th>
                <th style="padding:1rem;">Role</th>
                <th style="padding:1rem;">Status</th>
                <th style="padding:1rem; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.users.map(u => {
                const isPending = (u.approved == 0);
                const statusBadge = isPending ? '<span class="badge badge-pending">Pending</span>' :
                  (u.status === 'blocked' ? '<span class="badge badge-danger">Blocked</span>' :
                  (u.status === 'suspended' ? '<span class="badge badge-pending">Suspended</span>' :
                  '<span class="badge badge-success">Active</span>'));
                
                const actionBtns = `
                  <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                    ${isPending ? `<button class="btn btn-primary btn-sm btn-admin-user" data-action="approve" data-uid="${u.id}">Approve</button>` : ''}
                    ${u.status === 'active' ? `<button class="btn btn-secondary btn-sm btn-admin-user" data-action="suspended" data-uid="${u.id}">Suspend</button>
                                               <button class="btn btn-danger btn-sm btn-admin-user" style="background:#e53935;color:#fff;" data-action="blocked" data-uid="${u.id}">Block</button>` : 
                                              `<button class="btn btn-success btn-sm btn-admin-user" style="background:#43a047;color:#fff;" data-action="active" data-uid="${u.id}">Activate</button>`}
                    <button class="btn btn-secondary btn-sm btn-admin-user" data-action="reset_password" data-uid="${u.id}">Reset Pwd</button>
                  </div>`;

                return `
                <tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
                  <td style="padding:1rem;"><strong>${this._esc(u.fullname)}</strong><br><small class="dim-text">${this._esc(u.email)}</small></td>
                  <td style="padding:1rem; text-transform:capitalize;">${this._esc(u.role)}</td>
                  <td style="padding:1rem;">${statusBadge}</td>
                  <td style="padding:1rem;">${u.role === 'administrator' ? '<span class="dim-text">Admin</span>' : actionBtns}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        `;
      }
    } catch {}

    // Fetch Pending Enrollments
    let pendingEnrollmentsHTML = '';
    try {
      const res = await fetch('backend/get_pending_enrollments.php');
      const data = await res.json();
      if (data.success && data.pending && data.pending.length > 0) {
        pendingEnrollmentsHTML = data.pending.map(e => `
          <div class="material-item premium-list-item" style="padding:1rem; border-radius:12px; margin-bottom:1rem;">
            <strong>${this._esc(e.student_name)}</strong>
            <p style="font-size:0.85rem;" class="dim-text">Requested: ${this._esc(e.course_title)}</p>
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm btn-enroll-action" data-enroll-id="${e.enrollment_id}" data-action="approve">Approve</button>
              <button class="btn btn-secondary btn-sm btn-enroll-action" data-enroll-id="${e.enrollment_id}" data-action="reject">Reject</button>
            </div>
          </div>`).join('');
      } else {
        pendingEnrollmentsHTML = '<p class="dim-text">No pending course enrollments.</p>';
      }
    } catch {
      pendingEnrollmentsHTML = '<p class="form-error">Could not load pending enrollments.</p>';
    }

    return `
      <!-- ADMIN PROFILE CARD -->
      <section class="admin-profile-card" style="background:#FFFFFF; border-radius:24px; padding:2rem; text-align:center; margin-bottom:1.5rem; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
        <div style="width:100px; height:100px; border-radius:50%; background:var(--primary); color:#FFFFFF; font-size:3rem; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto; box-shadow:0 4px 10px rgba(255,122,26,0.2);">
          ${avatarInitial}
        </div>
        <h1 style="color:var(--heading); font-size:1.8rem; margin-bottom:0.2rem;">${this._esc(user.fullname)}</h1>
        <p style="color:var(--primary); font-weight:bold; font-size:1rem; margin-bottom:1.5rem;">System Administrator</p>
        
        <div style="background:#F8F9FA; border-radius:16px; padding:1rem; text-align:left;">
          <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #E5E7EB;">
            <strong style="color:var(--heading);">Email</strong>
            <span style="color:var(--muted); font-style:italic;">${this._esc(user.email)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:0.5rem 0; align-items:center;">
            <strong style="color:var(--heading);">Privilege Level</strong>
            <span style="color:#166534; background:#DCFCE7; padding:0.2rem 0.8rem; border-radius:12px; font-weight:bold; font-size:0.8rem;">Super Admin</span>
          </div>
        </div>
      </section>

      <!-- STATISTICS SECTION -->
      <section style="display:flex; justify-content:space-between; text-align:center; margin-bottom:2rem; padding:0 1rem;">
        <div style="flex:1;">
          <div style="color:var(--primary); font-size:2rem; font-weight:bold;">${stats.total_students}</div>
          <div style="color:var(--muted); font-size:0.75rem; font-style:italic;">Total Students</div>
        </div>
        <div style="flex:1;">
          <div style="color:var(--heading); font-size:2rem; font-weight:bold;">${stats.total_instructors}</div>
          <div style="color:var(--muted); font-size:0.75rem; font-style:italic;">Instructors</div>
        </div>
        <div style="flex:1;">
          <div style="color:#059669; font-size:2rem; font-weight:bold;">${stats.total_courses}</div>
          <div style="color:var(--muted); font-size:0.75rem; font-style:italic;">Courses</div>
        </div>
        <div style="flex:1;">
          <div style="color:#DC2626; font-size:2rem; font-weight:bold;">${stats.total_enrollments}</div>
          <div style="color:var(--muted); font-size:0.75rem; font-style:italic;">Enrollments</div>
        </div>
      </section>

      <!-- USER MANAGEMENT CARD -->
      <section style="background:#FFFFFF; border-radius:24px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
        <h2 style="color:var(--heading); font-size:1.2rem; margin-bottom:0.2rem;">User Management</h2>
        <p style="color:var(--muted); font-size:0.8rem; font-style:italic; margin-bottom:1.5rem;">Approve, block, suspend, or reset passwords for system users.</p>
        
        <div style="overflow-x:auto;">
          ${usersListHTML.replace(/<table[^>]*>/, '<table style="width:100%; border-collapse:collapse; min-width:600px;">')
                          .replace(/<thead[^>]*>/, '<thead style="background:#F8F9FA; text-align:left; font-size:0.8rem;">')
                          .replace(/<th /g, '<th style="padding:0.8rem; color:var(--heading); font-weight:bold;" ')
                          .replace(/<tr /g, '<tr style="border-bottom:1px solid #F1F5F9;" ')}
        </div>
      </section>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom:2rem;">
        <!-- ENROLLMENT CONTROL -->
        <section style="background:#FFFFFF; border-radius:24px; padding:1.5rem; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <h2 style="color:var(--heading); font-size:1.2rem; margin-bottom:0.5rem;">Enrollment Control</h2>
          <div id="pendingEnrollmentsList">${pendingEnrollmentsHTML}</div>
        </section>

        <!-- POST NOTIFICATION -->
        <section style="background:#FFFFFF; border-radius:24px; padding:1.5rem; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <h2 style="color:var(--heading); font-size:1.2rem; margin-bottom:0.2rem;">Post Notification</h2>
          <p style="color:var(--muted); font-size:0.8rem; font-style:italic; margin-bottom:1rem;">Send an announcement to platform users.</p>
          <form id="adminAnnouncementForm" style="display:flex; flex-direction:column; gap:0.8rem;">
            <input type="text" name="title" placeholder="Announcement Title" required style="padding:0.8rem; border-radius:12px; border:1px solid rgba(35,51,91,0.12);" />
            <textarea name="message" placeholder="Message content..." required rows="4" style="padding:0.8rem; border-radius:12px; border:1px solid rgba(35,51,91,0.12); font-family:inherit;"></textarea>
            <select name="target_role" style="padding:0.8rem; border-radius:12px; border:1px solid rgba(35,51,91,0.12);">
              <option value="all">Every User</option>
              <option value="student">Students Only</option>
              <option value="instructor">Instructors Only</option>
            </select>
            <div id="announcementMsg" style="display:none; color:green; font-size:0.85rem;"></div>
            <button type="submit" class="btn btn-primary" style="border-radius:24px; padding:0.8rem;">Broadcast</button>
          </form>
        </section>
      </div>
    `;
  },

  _bindDashboardEvents(user, contentEl) {
    // ---- COURSE MANAGEMENT ----
    const addCourseForm = contentEl.querySelector('#addCourseForm');
    const courseCancelBtn = contentEl.querySelector('#courseCancelBtn');

    // ---- PARENT ROUTING ----
    const parentLinkBtn = contentEl.querySelector('#parentLinkBtn');
    const parentUnlinkBtn = contentEl.querySelector('#parentUnlinkBtn');
    if (parentLinkBtn) {
      parentLinkBtn.addEventListener('click', async () => {
        const select = contentEl.querySelector('#parentStudentPicker');
        if (!select) return;
        if (!select.value) {
          alert('Please select a student before clicking View Student.');
          return;
        }

        sessionStorage.setItem('parent_viewing_student', select.value);
        sessionStorage.setItem('parent_linked_student', select.value);
        window.location.href = 'dashboard.html?view=student';
      });
    }
    if (parentUnlinkBtn) {
      parentUnlinkBtn.addEventListener('click', () => {
        sessionStorage.removeItem('parent_viewing_student');
        sessionStorage.removeItem('parent_linked_student');
        window.location.href = 'dashboard.html';
      });
    }

    if (addCourseForm) {
      addCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = contentEl.querySelector('#addCourseMsg');
        this.hideMessage(msgEl);
        const submitBtn = contentEl.querySelector('#courseSubmitBtn');
        const courseId = contentEl.querySelector('#editCourseId').value;
        const isEdit = !!courseId;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';

        const fd = new FormData(addCourseForm);
        // Ensure id is appended correctly if it's an edit
        if (isEdit) {
            fd.append('id', courseId);
        }

        try {
          const endpoint = isEdit ? 'backend/update_course.php' : 'backend/add_course.php';
          const res  = await fetch(endpoint, {
            method: 'POST',
            body: fd
          });
          const data = await res.json();
          if (data.success) {
            this.showMessage(msgEl, isEdit ? '✅ Course updated!' : '✅ Course published!');
            setTimeout(() => { this.initDashboard(); }, 1000); // Reload dashboard to refresh lists
          } else {
            this.showMessage(msgEl, data.message, true);
          }
        } catch {
          this.showMessage(msgEl, 'Network error.', true);
        }

        submitBtn.disabled   = false;
        submitBtn.textContent = 'Publish Course';
      });

      if (courseCancelBtn) {
        courseCancelBtn.addEventListener('click', () => {
          addCourseForm.reset();
          contentEl.querySelector('#editCourseId').value = '';
          contentEl.querySelector('#courseFormTitle').textContent = 'Add a New Course';
          contentEl.querySelector('#courseSubmitBtn').textContent = 'Publish Course';
          courseCancelBtn.style.display = 'none';
        });
      }
    }

    // Edit/Delete Course buttons
    contentEl.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-edit-course]');
      const delBtn  = e.target.closest('[data-delete-course]');

      if (editBtn) {
        const id = editBtn.dataset.editCourse;
        const item = editBtn.closest('.instructor-course-item');
        // Fill form
        addCourseForm.querySelector('#editCourseId').value = id;
        addCourseForm.querySelector('#courseTitle').value = item.querySelector('strong').textContent;
        addCourseForm.querySelector('#courseCategory').value = item.querySelector('.badge-soft').textContent;
        addCourseForm.querySelector('#courseDesc').value = item.querySelector('p').textContent;
        addCourseForm.querySelector('#courseIcon').value = item.querySelector('.course-icon-sm').textContent;
        
        contentEl.querySelector('#courseFormTitle').textContent = 'Edit Course';
        contentEl.querySelector('#courseSubmitBtn').textContent = 'Save Changes';
        courseCancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: addCourseForm.offsetTop - 100, behavior: 'smooth' });
      }

      if (delBtn) {
        if (!confirm('Are you sure you want to delete this course?')) return;
        const id = delBtn.dataset.deleteCourse;
        try {
          const res = await fetch('backend/delete_course.php', {
            method: 'POST',
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.success) delBtn.closest('.instructor-course-item').remove();
          else alert(data.message);
        } catch { alert('Network error'); }
      }
    });

    // ---- EXAM MANAGEMENT ----
    const addExamForm = contentEl.querySelector('#addExamForm');
    if (addExamForm) {
      addExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = contentEl.querySelector('#addExamMsg');
        const submitBtn = contentEl.querySelector('#examSubmitBtn');
        this.hideMessage(msgEl);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        const formData = new FormData(addExamForm);
        const isQuiz = formData.get('type') === 'quiz';

        try {
          const res = await fetch('backend/add_material.php', { method: 'POST', body: formData });
          if (!res.ok) {
            const text = await res.text();
            this.showMessage(msgEl, `Upload failed: ${text || res.statusText}`, true);
          } else {
            const data = await res.json();
            if (data.success) {
              this.showMessage(msgEl, isQuiz ? '✅ Quiz shell created! Now add questions below.' : '✅ Exam uploaded!');
              
              if (isQuiz) {
                const quizId = data.item_id;
                sessionStorage.setItem('current_quiz_id', quizId);
                contentEl.querySelector('#quizBuilderBtnArea').style.display = 'block';
              } else {
                 setTimeout(() => { this.initDashboard(); }, 1000);
              }
            } else {
              this.showMessage(msgEl, data.message, true);
            }
          }
        } catch (err) {
          this.showMessage(msgEl, `Upload error: ${err.message}`, true);
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Assessment';
      });
    }

    // ---- RESOURCE MANAGEMENT ----
    const addResourceForm = contentEl.querySelector('#addResourceForm');
    if (addResourceForm) {
      addResourceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = contentEl.querySelector('#addResourceMsg');
        const submitBtn = contentEl.querySelector('#resourceSubmitBtn');
        this.hideMessage(msgEl);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        const formData = new FormData(addResourceForm);

        try {
          const res = await fetch('backend/add_material.php', { method: 'POST', body: formData });
          if (!res.ok) {
            const text = await res.text();
            this.showMessage(msgEl, `Upload failed: ${text || res.statusText}`, true);
          } else {
            const data = await res.json();
            if (data.success) {
              this.showMessage(msgEl, '✅ Resource uploaded!');
              addResourceForm.reset();
              setTimeout(() => { this.initDashboard(); }, 1000);
            } else {
              this.showMessage(msgEl, data.message, true);
            }
          }
        } catch (err) {
          this.showMessage(msgEl, `Upload error: ${err.message}`, true);
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Resource';
      });
    }

    // ---- ASSIGNMENT MANAGEMENT ----
    const addAssignmentForm = contentEl.querySelector('#addAssignmentForm');
    if (addAssignmentForm) {
      addAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = contentEl.querySelector('#addAssignmentMsg');
        const submitBtn = contentEl.querySelector('#assignmentSubmitBtn');
        this.hideMessage(msgEl);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        const formData = new FormData(addAssignmentForm);

        try {
          const res = await fetch('backend/add_assignment.php', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            this.showMessage(msgEl, '✅ Assignment posted!');
            addAssignmentForm.reset();
            setTimeout(() => { this.initDashboard(); }, 1000);
          } else {
            this.showMessage(msgEl, data.message, true);
          }
        } catch { this.showMessage(msgEl, 'Network error', true); }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Assignment';
      });
    }

    // Material deletion buttons (delegated)
    contentEl.addEventListener('click', async (e) => {
      const delMatBtn = e.target.closest('[data-delete-material]');
      if (delMatBtn) {
        if (!confirm('Delete this material?')) return;
        const id = delMatBtn.dataset.deleteMaterial;
        try {
          const res = await fetch('backend/delete_material.php', {
            method: 'POST',
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.success) {
            delMatBtn.closest('.material-item').remove();
          } else alert(data.message);
        } catch { alert('Network error'); }
      }
    });

    // ---- LOAD MATERIALS FOR STUDENT/PARENT ----
    const studentMatList = contentEl.querySelector('#studentMaterialList');
    const parentMatList  = contentEl.querySelector('#parentMaterialList');
    if (studentMatList || parentMatList) {
      (async () => {
        try {
          const res = await fetch('backend/get_materials.php');
        const data = await res.json();
        const target = studentMatList || parentMatList;
        if (data.success && data.items.length > 0) {
          target.innerHTML = data.items.slice(0, 5).map(m => {
            const dLink = m.file_url ? `<a href="${m.file_url}" target="_blank" style="font-size:0.7rem; color:var(--primary);">Download</a>` : '';
            return `
            <div class="material-item premium-list-item" style="padding:0.75rem; border-radius:12px;">
              <div class="material-info">
                <span class="badge-type badge-${m.type}" style="font-size:0.6rem;">${m.type}</span>
                <strong style="font-size:0.9rem; display:block; margin-top:0.2rem;">${this._esc(m.title)}</strong>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem;">
                  <span class="dim-text" style="font-size:0.8rem;">${this._esc(m.subject || m.type)}</span>
                  ${dLink}
                </div>
              </div>
            </div>`;
          }).join('');
        } else {
            target.innerHTML = '<p class="dim-text">No materials available yet.</p>';
          }
        } catch { /* silent fail */ }
      })();
    }

    // ---- ADMIN: APPROVE INSTRUCTOR ----
    const approveButtons = contentEl.querySelectorAll('[data-approve]');
    approveButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const instructorId = btn.getAttribute('data-approve');
        try {
          const res  = await fetch('backend/approve_instructor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instructor_id: instructorId }),
          });
          const data = await res.json();
          if (data.success) {
            btn.closest('article')?.remove();
            const list = document.querySelector('#pendingList');
            if (list && !list.querySelector('article')) {
              list.innerHTML = '<p class="dim-text">No pending instructor approvals.</p>';
            }
          }
        } catch { /* silent */ }
      });
    });

    // ---- ADMIN & STUDENT: COURSE ENROLLMENTS ----
    contentEl.addEventListener('click', async (e) => {
      // Admin: Approve/Reject enrollment
      if (e.target.classList.contains('btn-enroll-action')) {
         const enrollId = e.target.dataset.enrollId;
         const action = e.target.dataset.action;
         const btn = e.target;
         btn.disabled = true;
         btn.textContent = '...';

         try {
           const res = await fetch('backend/update_enrollment.php', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ enrollment_id: enrollId, action })
           });
           const data = await res.json();
           if (data.success) {
             btn.closest('.pending-card, .material-item, .premium-list-item')?.remove();
             const list = document.querySelector('#pendingEnrollmentsList');
             if (list && !list.querySelector('.btn-enroll-action')) {
               list.innerHTML = '<p class="dim-text">No pending course enrollments.</p>';
             }
           } else {
             alert(data.message);
             this.initDashboard();
           }
         } catch {
           alert('Network error.');
           this.initDashboard();
         }
      }
      
      // Student: Request enrollment (new dashboard register buttons)
      if (e.target.classList.contains('btn-register-course')) {
         const courseId = e.target.dataset.courseId;
         const courseName = e.target.dataset.courseName;
         const btn = e.target;
         btn.disabled = true;
         btn.textContent = 'Registering...';
         
         try {
           const res = await fetch('backend/enroll.php', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ course_id: courseId })
           });
           const data = await res.json();
           if (data.success) {
             btn.textContent = '✅ Registered!';
             btn.style.background = '#2e7d32';
             setTimeout(() => { this.initDashboard(); }, 1500);
           } else {
             alert(data.message);
             btn.disabled = false;
             btn.textContent = 'Register Now';
           }
         } catch {
           alert('Network error.');
           btn.disabled = false;
           btn.textContent = 'Register Now';
         }
      }
      // Student: Request enrollment (old button style)
      if (e.target.classList.contains('btn-enroll')) {
         const courseId = e.target.dataset.courseId;
         const btn = e.target;
         btn.disabled = true;
         btn.textContent = 'Requesting...';
         
         const msgEl = contentEl.querySelector('#enrollmentStatusMsg');
         try {
           const res = await fetch('backend/enroll.php', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ course_id: courseId })
           });
           const data = await res.json();
           if (data.success) {
             if (msgEl) {
               msgEl.style.display = 'block';
               msgEl.textContent = 'Enrollment requested! Waiting for admin approval.';
             }
             setTimeout(() => { this.initDashboard(); }, 1500);
           } else {
             alert(data.message);
             btn.disabled = false;
             btn.textContent = 'Enroll';
           }
         } catch {
           alert('Network error.');
           btn.disabled = false;
           btn.textContent = 'Enroll';
         }
      }
      // Admin: User management actions (approve / block / suspend / activate / reset_password)
      if (e.target.classList.contains('btn-admin-user')) {
        const uid = e.target.dataset.uid;
        const action = e.target.dataset.action;
        const btn = e.target;
        const confirmMsg = action === 'reset_password'
          ? 'Reset this user\'s password to Password123?'
          : `Are you sure you want to ${action} this user?`;
        if (!confirm(confirmMsg)) return;
        btn.disabled = true;
        btn.textContent = '...';
        try {
          const res = await fetch('backend/admin_update_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_id: parseInt(uid), action })
          });
          const data = await res.json();
          if (data.success) {
            alert(data.message);
            this.initDashboard();
          } else {
            alert(data.message || 'Action failed.');
            btn.disabled = false;
            btn.textContent = action === 'reset_password' ? 'Reset Pwd' : action.charAt(0).toUpperCase() + action.slice(1);
          }
        } catch {
          alert('Network error.');
          btn.disabled = false;
        }
      }
    });

    // ---- ADMIN: ANNOUNCEMENT FORM ----
    const announcementForm = contentEl.querySelector('#adminAnnouncementForm');

    // ---- INSTRUCTOR: PENDING STUDENT REGISTRATIONS ----
    const instructorPendingList = contentEl.querySelector('#pendingStudentsList');
    if (instructorPendingList && user.role === 'instructor') {
      (async () => {
        try {
          const res = await fetch('backend/admin_users.php');
          const data = await res.json();
          if (data.success) {
            const pending = data.users.filter(u => u.approved == 0 && u.role === 'student');
            if (pending.length > 0) {
              instructorPendingList.innerHTML = pending.map(u => `
                <div class="material-item premium-list-item" style="padding:1rem; border-radius:12px; margin-bottom:1rem;">
                  <strong>${this._esc(u.fullname)}</strong>
                  <p class="dim-text" style="font-size:0.85rem;">${this._esc(u.email)}</p>
                  <button class="btn btn-primary btn-sm btn-admin-user" data-uid="${u.id}" data-action="approve" style="margin-top:0.5rem;">Approve Student</button>
                </div>`).join('');
            } else {
              instructorPendingList.innerHTML = '<p class="dim-text">No pending student registrations.</p>';
            }
          }
        } catch { instructorPendingList.innerHTML = '<p class="form-error">Could not load users.</p>'; }
      })();
    }

    if (announcementForm) {
      announcementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = contentEl.querySelector('#announcementMsg');
        const submitBtn = announcementForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        const fd = new FormData(announcementForm);
        try {
          const res = await fetch('backend/admin_announcements.php', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.success) {
            if (msgEl) { msgEl.style.display = 'block'; msgEl.textContent = '✅ Announcement broadcast successfully!'; }
            announcementForm.reset();
          } else {
            if (msgEl) { msgEl.style.display = 'block'; msgEl.style.color = 'red'; msgEl.textContent = data.message || 'Failed to send.'; }
          }
        } catch {
          if (msgEl) { msgEl.style.display = 'block'; msgEl.style.color = 'red'; msgEl.textContent = 'Network error.'; }
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Broadcast';
      });
    }

    // ---- GRADING MANAGEMENT ----
    const submissionList = contentEl.querySelector('#instructorSubmissionList');
    if (submissionList) {
      (async () => {
        try {
          const res = await fetch('backend/get_submissions.php');
          const data = await res.json();
          if (data.success && data.submissions.length > 0) {
            submissionList.innerHTML = data.submissions.map(s => `
              <div class="material-item premium-list-item" style="padding:1rem; border-radius:12px; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <strong style="display:block;">${this._esc(s.student_name)}</strong>
                    <span class="dim-text" style="font-size:0.8rem;">${this._esc(s.assignment_title)}</span>
                    ${s.file_url ? `<a href="${s.file_url}" target="_blank" style="display:block; font-size:0.8rem; color:var(--primary); margin-top:0.3rem;">View Work</a>` : ''}
                  </div>
                  <span class="status-tag status-${s.status}">${s.status}</span>
                </div>
                <form class="grade-form" style="margin-top:0.8rem; display:flex; flex-direction:column; gap:0.5rem;" data-sub-id="${s.id}">
                  <input type="text" name="grade" placeholder="Grade (e.g. A, 85%)" value="${this._esc(s.grade)}" required />
                  <textarea name="feedback" placeholder="Feedback..." rows="1">${this._esc(s.feedback)}</textarea>
                  <button type="submit" class="btn btn-primary btn-sm" style="align-self:flex-end;">Save Grade</button>
                </form>
              </div>`).join('');

            // Bind grade form events
            submissionList.querySelectorAll('.grade-form').forEach(form => {
              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const subId = form.dataset.subId;
                const fd = new FormData(form);
                fd.append('submission_id', subId);
                const btn = form.querySelector('button');
                btn.disabled = true;
                btn.textContent = 'Saving...';
                try {
                  const res = await fetch('backend/grade_submission.php', { method: 'POST', body: fd });
                  const d = await res.json();
                  if (d.success) {
                    btn.textContent = '✅ Saved';
                    setTimeout(() => { btn.textContent = 'Save Grade'; btn.disabled = false; }, 2000);
                  }
                } catch { btn.disabled = false; btn.textContent = 'Retry'; }
              });
            });
          } else {
            submissionList.innerHTML = '<p class="dim-text">No submissions to grade yet.</p>';
          }
        } catch { submissionList.innerHTML = '<p class="dim-text">Error loading submissions.</p>'; }
      })();
    }
  },

  // --------------- Assignments Page ---------------
  async initAssignmentsPage() {
    if (!document.body.classList.contains('assignments-page')) return;

    const container = document.querySelector('#dynamic-assignments-container');
    if (!container) return;

    try {
      const res = await fetch('backend/get_assignments.php');
      const data = await res.json();

      let subs = [];
      try {
        const sRes = await fetch('backend/get_submissions.php');
        const sData = await sRes.json();
        if (sData.success) subs = sData.submissions;
      } catch { /* ignore if student has no submissions yet */ }

      if (data.success && data.assignments.length > 0) {
        container.innerHTML = `
        <div class="assignment-grid">
          ${data.assignments.map(a => {
            const mySub = subs.find(s => s.assignment_id === a.id);
            const feedbackHTML = mySub && mySub.grade ? `
              <div class="grading-panel" style="background:rgba(0,0,0,0.03); padding:1rem; border-radius:12px; margin-top:1.5rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                  <span style="font-weight:700;">Grade: ${this._esc(mySub.grade)}</span>
                  <span class="status-tag status-completed">Graded</span>
                </div>
                <p style="font-size:0.85rem; margin-bottom:0;"><strong>Feedback:</strong> ${this._esc(mySub.feedback)}</p>
              </div>` : '';

            const now = new Date();
            const dueDate = new Date(a.due_date);
            const isLate = now > dueDate;
            const formattedDate = dueDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

            return `
            <article class="assignment-card animate-cascade-up" style="${isLate ? 'border-color: #ff4d4d33;' : ''}">
              <div class="assignment-meta">
                <span class="badge-soft" style="margin-bottom:0.5rem; display:inline-block;">${this._esc(a.course_title)}</span>
                <span style="font-size:0.75rem; color:${isLate ? '#ff4d4d' : 'var(--text-muted)'}; font-weight:700; float:right;">
                   📅 ${formattedDate} ${isLate ? '(DUE)' : ''}
                </span>
              </div>
              <h2>${this._esc(a.title)}</h2>
              <p>${this._esc(a.description)}</p>

              ${a.grading_criteria ? `
                <div style="background:rgba(67, 97, 238, 0.05); padding:0.8rem; border-radius:10px; margin: 1rem 0; border-left:3px solid var(--primary);">
                  <strong style="font-size:0.75rem; display:block; margin-bottom:0.2rem; text-transform:uppercase;">Grading Criteria:</strong>
                  <p style="font-size:0.8rem; margin:0; line-height:1.4;">${this._esc(a.grading_criteria)}</p>
                </div>
              ` : ''}
              
              <div class="submission-section" style="margin-top:1.5rem;">
                ${this.userRole === 'student' && (!mySub || mySub.status !== 'graded') ? `
                  <form class="submission-form" data-assignment-id="${a.id}">
                    <label style="font-size:0.8rem; display:block; margin-bottom:0.4rem;">Submit your work (PDF/DOCX)</label>
                    <div style="display:flex; gap:0.5rem;">
                      <input type="file" name="file" accept=".pdf,.doc,.docx" required style="font-size:0.8rem;" />
                      <button type="submit" class="btn btn-primary btn-sm">Submit</button>
                    </div>
                  </form>` : ''}
                ${feedbackHTML}
              </div>

              <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.05); font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between; color:var(--muted);">
                   <span><strong>Due:</strong> ${new Date(a.due_date).toLocaleDateString()}</span>
                   <span><strong>By:</strong> ${this._esc(a.instructor_name)}</span>
                </div>
              </div>
            </article>`;
          }).join('')}
        </div>`;

        // Bind submission events
        container.querySelectorAll('.submission-form').forEach(form => {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.disabled = true;
            btn.textContent = '...';
            const fd = new FormData(form);
            fd.append('assignment_id', form.dataset.assignmentId);
            try {
              const r = await fetch('backend/submit_assignment.php', { method: 'POST', body: fd });
              const d = await r.json();
              if (d.success) { this.initAssignmentsPage(); }
              else { alert(d.message); btn.disabled = false; btn.textContent = 'Submit'; }
            } catch { btn.disabled = false; btn.textContent = 'Error'; }
          });
        });
      } else {
        container.innerHTML = '<p class="dim-text" style="text-align:center; padding:4rem;">No active assignments found.</p>';
      }
    } catch {
      container.innerHTML = '<p class="form-error">Failed to load assignments.</p>';
    }
  },

  // --------------- Courses page ---------------
  async initCourses() {
    if (!document.body.classList.contains('courses-page')) return;

    const container = document.querySelector('#db-courses-section');
    if (!container) return;

    try {
      const res  = await fetch('backend/get_courses.php');
      const data = await res.json();

      if (!data.success || data.courses.length === 0) {
        container.innerHTML = '';
        return;
      }

      // Group courses by category
      const grouped = {};
      data.courses.forEach(c => {
        const cat = c.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c);
      });

      let finalHTML = '';
      Object.keys(grouped).sort().forEach(cat => {
        const themeClass = `card-theme-${cat.toLowerCase()}`;
        finalHTML += `
          <section class="course-category">
            <div class="container section-heading">
              <h2>${cat}</h2>
              <p>Explore specialized lessons in the field of ${cat.toLowerCase()}.</p>
            </div>
            <div class="container feature-grid">
              ${grouped[cat].map((c, index) => `
                <article class="feature-card course-card db-course-card animate-cascade-up ${themeClass} delay-${(index % 5) + 1}">
                  <div class="course-card-icon">${this._esc(c.icon)}</div>
                  <h3>${this._esc(c.title)}</h3>
                  <p class="course-short-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.5; color: var(--text-muted); opacity: 0.9; min-height: 2.7rem;">${this._esc(c.description)}</p>
                  <div class="db-course-meta" style="margin-top:auto; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.05);">
                    <span class="course-instructor-tag">by ${this._esc(c.instructor_name)}</span>
                  </div>
                </article>`).join('')}
            </div>
          </section>`;
      });

      container.innerHTML = finalHTML;
    } catch {
      container.innerHTML = '';
    }
  },

  // --------------- Exams/Resources dynamic lists ---------------
  async initMaterialsPage(pageType) {
    const container = document.querySelector('#dynamic-materials-container');
    if (!container) return;

    try {
      const res = await fetch('backend/get_materials.php');
      const data = await res.json();

      if (!data.success || data.items.length === 0) {
        container.innerHTML = `<p class="dim-text" style="text-align:center; padding:4rem;">No ${pageType}s available yet.</p>`;
        return;
      }

      // Filter by type (resource, exam, quiz)
      const filtered = data.items.filter(m => {
        if (pageType === 'exam') return m.type === 'exam' || m.type === 'quiz';
        // Resources includes everything else
        return ['resource', 'file', 'text', 'video', 'live_class'].includes(m.type);
      });

      if (filtered.length === 0) {
        container.innerHTML = `<p class="dim-text" style="text-align:center; padding:4rem;">No ${pageType}s found.</p>`;
        return;
      }

      container.innerHTML = `
        <div class="feature-grid">
          ${filtered.map(m => {
            let icon = '📚';
            if (m.type === 'exam') icon = '📝';
            if (m.type === 'quiz') icon = '❓';
            if (m.type === 'video') icon = '🎬';
            if (m.type === 'live_class') icon = '🔴';
            if (m.type === 'text') icon = '📝';

            const now = new Date();
            const dueDate = m.due_date ? new Date(m.due_date) : null;
            const isLate = dueDate && now > dueDate;
            const formattedDate = dueDate ? dueDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No deadline';

            return `
            <article class="feature-card animate-cascade-up" style="${isLate ? 'border-color: #ff4d4d33;' : ''}">
              <div class="course-card-icon">${icon}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                 <span class="badge-soft">${this._esc(m.course_title || 'General')}</span>
                 <span style="font-size:0.7rem; color:${isLate ? '#ff4d4d' : 'var(--text-muted)'}; font-weight:700;">
                   📅 ${formattedDate} ${isLate ? '(LATE)' : ''}
                 </span>
              </div>
              <h3>${this._esc(m.title)}</h3>
              <p style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--text-muted);">By ${this._esc(m.instructor_name)}</p>
              
              ${m.grading_criteria ? `
                <div style="background:rgba(0,0,0,0.03); padding:0.8rem; border-radius:10px; margin-bottom:1rem; border-left:3px solid var(--primary);">
                  <strong style="font-size:0.75rem; display:block; margin-bottom:0.2rem; text-transform:uppercase;">Grading Criteria:</strong>
                  <p style="font-size:0.8rem; margin:0; line-height:1.4;">${this._esc(m.grading_criteria)}</p>
                </div>
              ` : ''}

              <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:1rem;">
                ${m.file_url ? `<a href="${this._esc(m.file_url)}" target="_blank" class="btn btn-primary btn-sm">Get Material</a>` : ''}
                ${m.url ? `<a href="${this._esc(m.url)}" target="_blank" class="btn btn-secondary btn-sm">Open Link</a>` : ''}
                ${m.type === 'quiz' ? `<button class="btn btn-secondary btn-sm" onclick="app.startQuiz(${m.id}, '${this._esc(m.title)}')">Start Automated Quiz</button>` : ''}
              </div>
            </article>`;
          }).join('')}
        </div>`;
    } catch {
      container.innerHTML = '<p class="form-error">Could not load list.</p>';
    }
  },

  // --------------- Exams countdown ---------------
  initExams() {
    if (!document.body.classList.contains('exams-page')) return;
    const countdownEls = document.querySelectorAll('[data-countdown]');
    if (!countdownEls.length) return;
    const update = () => {
      const now = new Date();
      countdownEls.forEach(el => {
        const diff = new Date(el.dataset.countdown) - now;
        if (diff <= 0) { el.textContent = 'Starting now'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.textContent = `${d}d ${h}h ${m}m ${s}s`;
      });
    };
    update();
    setInterval(update, 1000);
  },

  // --------------- Profile Page ---------------
  async initProfilePage() {
    if (!document.body.classList.contains('profile-page')) return;
    const user = await this.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const nameEl = document.querySelector('#profileName');
    const roleEl = document.querySelector('#profileRole');
    const emailEl = document.querySelector('#profileEmail');
    const statusEl = document.querySelector('#profileStatus');
    
    if (nameEl) nameEl.textContent = user.fullname;
    if (roleEl) roleEl.textContent = user.role;
    if (emailEl) emailEl.textContent = user.email;
    if (statusEl) {
      if (user.role === 'instructor' && !user.approved) {
        statusEl.textContent = 'Pending';
        statusEl.className = 'badge-pending badge';
      } else {
        statusEl.textContent = 'Active';
        statusEl.className = 'badge-success badge';
      }
    }

    const metaGrid = document.querySelector('.profile-meta-grid');
    if (metaGrid && user.role === 'instructor') {
      const imgEl = document.querySelector('#profileImage');
      if (imgEl) imgEl.src = 'uploads/instructor_profile.jpg';
      
      const approvedNote = user.approved ? '<span class="badge-success badge" style="border-radius:12px; padding:0.2rem 0.6rem;">Active (Approved)</span>' : '<span class="badge-pending badge" style="border-radius:12px; padding:0.2rem 0.6rem;">Pending Admin Approval</span>';
      
      metaGrid.innerHTML = `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.5rem;">
          <strong>Email</strong>
          <span class="dim-text">${this._esc(user.email)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.5rem;">
          <strong>Specialization</strong>
          <span class="dim-text">Senior Lecturer</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.5rem;">
          <strong>Status</strong>
          ${approvedNote}
        </div>
        <div style="display:flex; justify-content:space-between;">
          <strong>Faculty</strong>
          <span class="dim-text">General Staff</span>
        </div>
      `;
    }

    const editName = document.querySelector('#editName');
    const editEmail = document.querySelector('#editEmail');
    if (editName) editName.value = user.fullname;
    if (editEmail) editEmail.value = user.email;

    // Fetch active courses to populate statCourses if student
    if (user.role === 'student') {
      try {
        const res = await fetch('backend/get_student_enrollments.php');
        const data = await res.json();
        if (data.success && data.enrollments) {
           const active = data.enrollments.filter(e => e.status === 'approved').length;
           const statEl = document.querySelector('#statCourses');
           if (statEl) statEl.textContent = active;
        }
      } catch {}
    } else {
      const statEl = document.querySelector('#statCourses');
      if (statEl) statEl.parentElement.style.display = 'none'; // hide for non-students for now
    }
  },

  // --------------- Helpers ---------------
  _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // --------------- Boot ---------------
  async init() {
    // 1. Initial auth check & header update
    const user = await this.getCurrentUser();
    this.updateGlobalAuthUI(user);

    this.initPasswordToggle();
    this.initSocialAuth();
    this.initRegister();
    this.initLogin();

    if (document.body.classList.contains('home-page')) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (document.body.classList.contains('dashboard-page')) {
      await this.initDashboard();
    }

    if (document.body.classList.contains('courses-page')) {
      await this.initCourses();
    }

    if (document.body.classList.contains('assignments-page')) {
      await this.initAssignmentsPage();
    }

    if (document.body.classList.contains('exams-page')) {
      await this.initMaterialsPage('exam');
    }

    if (document.body.classList.contains('resources-page')) {
      await this.initMaterialsPage('resource');
    }

    if (document.body.classList.contains('profile-page')) {
      await this.initProfilePage();
    }
  },

  // --------------- Course Viewer ---------------
  async initCourseViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId  = urlParams.get('id');
    if (!courseId) { window.location.href = 'dashboard.html'; return; }

    const user = await this.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    try {
      const res = await fetch(`backend/get_course_content.php?course_id=${courseId}`);
      const data = await res.json();
      if (!data.success) { alert(data.message); window.location.href = 'dashboard.html'; return; }

      this._state.currentCourse = data.course;
      this._state.courseItems   = data.items;
      this._state.completedAt   = data.completed_at;

      if (user.role === 'student') {
        this._state.courseItems.push({
          type: 'certificate',
          title: 'Course Certificate',
          description: 'Your proof of completion for this course.'
        });
      }

      this._state.activeIndex   = 0;

      document.querySelector('#viewerCourseTitle').textContent = data.course.title;
      this._renderLessonList();
      this._renderActiveLesson();

      // Bind nav buttons
      document.querySelector('#btnNext').onclick = () => this._navigateLesson(1);
      document.querySelector('#btnPrev').onclick = () => this._navigateLesson(-1);

    } catch (err) {
      console.error(err);
      alert('Error loading course content.');
    }
  },

  handleMaterialTypeChange(select) {
    const type = select.value;
    const urlGroup = document.querySelector('#urlGroup');
    const contentGroup = document.querySelector('#contentGroup');
    const fileGroup = document.querySelector('#fileGroup');

    if (urlGroup) urlGroup.style.display = (type === 'video' || type === 'live_class') ? 'block' : 'none';
    if (contentGroup) contentGroup.style.display = (type === 'text') ? 'block' : 'none';
    if (fileGroup) fileGroup.style.display = (type === 'file' || type === 'video' || type === 'exam' || type === 'quiz') ? 'block' : 'none';
  },

  _renderLessonList() {
    const list = document.querySelector('#lessonList');
    if (!list) return;

    if (this._state.courseItems.length === 0) {
      list.innerHTML = '<p class="dim-text" style="padding:1rem;">No lessons added yet.</p>';
      return;
    }

    list.innerHTML = this._state.courseItems.map((item, idx) => {
      let icon = '📄';
      if (item.type === 'video') icon = '🎬';
      if (item.type === 'live_class') icon = '🔴';
      if (item.type === 'file') icon = '📁';
      if (item.type === 'certificate') icon = '🎓';

      return `
        <div class="lesson-item ${idx === this._state.activeIndex ? 'active' : ''}" onclick="app._setActiveLesson(${idx})">
          <div class="lesson-icon">${icon}</div>
          <div class="lesson-info">
            <span class="lesson-title">${this._esc(item.title)}</span>
            <span class="lesson-type">${item.type}</span>
          </div>
        </div>`;
    }).join('');

    // Update progress
    const progress = Math.round(((this._state.activeIndex + 1) / this._state.courseItems.length) * 100);
    const fill = document.querySelector('#courseProgressFill');
    if (fill) fill.style.width = `${progress}%`;
  },

  _setActiveLesson(idx) {
    this._state.activeIndex = idx;
    this._renderLessonList();
    this._renderActiveLesson();
  },

  _navigateLesson(dir) {
    const nextIdx = this._state.activeIndex + dir;
    if (nextIdx >= 0 && nextIdx < this._state.courseItems.length) {
      this._setActiveLesson(nextIdx);
    }
  },

  _renderActiveLesson() {
    const viewer = document.querySelector('#mainViewerArea');
    const badge = document.querySelector('#currentLessonTypeBadge');
    if (!viewer) return;

    const item = this._state.courseItems[this._state.activeIndex];
    if (!item) return;

    badge.textContent = item.type.toUpperCase();
    badge.className = `badge-type badge-${item.type}`;

    let contentHTML = `<h3>${this._esc(item.title)}</h3><p class="dim-text">${this._esc(item.description)}</p><hr style="margin:2rem 0; opacity:0.1;"/>`;

    if (item.type === 'video') {
      if (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'))) {
        const vidId = this._extractYoutubeId(item.url);
        contentHTML += `
          <div class="video-container">
            <iframe src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe>
          </div>`;
      } else if (item.file_url) {
        contentHTML += `
          <div class="video-container">
            <video controls src="${item.file_url}"></video>
          </div>`;
      } else if (item.url) {
        contentHTML += `<div class="video-container"><iframe src="${item.url}" allowfullscreen></iframe></div>`;
      }
    } else if (item.type === 'text') {
      contentHTML += `<div class="text-content-card">${item.content.replace(/\n/g, '<br>')}</div>`;
    } else if (item.type === 'file') {
      contentHTML += `
        <div class="resource-card">
          <div style="font-size:3rem;">📎</div>
          <div style="flex:1;">
            <h4>${this._esc(item.title)}</h4>
            <p class="dim-text">Download this resource to study offline.</p>
          </div>
          <a href="${item.file_url}" target="_blank" class="btn btn-primary">Download File</a>
        </div>`;
    } else if (item.type === 'live_class') {
      contentHTML += `
        <div class="live-card">
          <div class="live-status">LIVE SESSION</div>
          <h2 style="color:#fff; margin-bottom:1rem;">${this._esc(item.title)}</h2>
          <p style="margin-bottom:2rem; opacity:0.9;">Join the live session with your instructor and classmates.</p>
          <a href="${item.url}" target="_blank" class="btn" style="background:#fff; color:var(--primary); font-weight:700; padding:1rem 2.5rem; border-radius:12px;">Join Meeting Now</a>
        </div>`;
    } else if (item.type === 'certificate') {
      if (this._state.completedAt) {
         const studentName = this._esc(JSON.parse(localStorage.getItem('le_user')).fullname);
         const dateStr = new Date(this._state.completedAt).toLocaleDateString();
         contentHTML += `
          <div style="border: 10px solid var(--primary); padding: 4rem; text-align: center; border-radius: 8px; background: #fff; position: relative;">
             <div style="font-size: 5rem; margin-bottom: 1rem;">🎓</div>
             <h1 style="font-family: serif; font-size: 3rem; color: #333; margin-bottom: 2rem;">Certificate of Completion</h1>
             <p style="font-size: 1.2rem; color: #666;">This is to certify that</p>
             <h2 style="font-size: 2.5rem; color: var(--primary); margin: 1rem 0;">${studentName}</h2>
             <p style="font-size: 1.2rem; color: #666;">has successfully completed the course</p>
             <h3 style="font-size: 2rem; color: #333; margin: 1rem 0;">${this._esc(this._state.currentCourse.title)}</h3>
             <p style="font-size: 1.2rem; color: #666; margin-top: 3rem;">Completed on: <strong>${dateStr}</strong></p>
          </div>
          <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="window.print()">Print / Save as PDF</button>
          </div>
         `;
      } else {
         contentHTML += `
          <div class="text-content-card" style="text-align:center; padding: 4rem 2rem;">
             <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🏆</div>
             <h2>You're almost there!</h2>
             <p class="dim-text" style="margin-bottom: 2rem;">Complete all course materials to earn your certificate.</p>
             <button class="btn btn-primary btn-lg" id="btnMarkComplete">Mark Course as Complete & Get Certificate</button>
          </div>
         `;
      }
    }

    viewer.innerHTML = contentHTML;
    viewer.scrollTo({ top: 0, behavior: 'smooth' });

    const btnComplete = document.querySelector('#btnMarkComplete');
    if (btnComplete) {
        btnComplete.onclick = async () => {
            btnComplete.disabled = true;
            btnComplete.textContent = 'Generating...';
            try {
                const res = await fetch('backend/mark_completed.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({course_id: this._state.currentCourse.id})
                });
                const data = await res.json();
                if (data.success) {
                    this._state.completedAt = new Date().toISOString();
                    this._renderActiveLesson();
                } else {
                    alert(data.message);
                    btnComplete.disabled = false;
                    btnComplete.textContent = 'Mark Course as Complete & Get Certificate';
                }
            } catch (err) {
                alert('Error marking course as complete.');
                btnComplete.disabled = false;
                btnComplete.textContent = 'Mark Course as Complete & Get Certificate';
            }
        };
    }

    // Update buttons
    document.querySelector('#btnPrev').disabled = this._state.activeIndex === 0;
    document.querySelector('#btnNext').disabled = this._state.activeIndex === this._state.courseItems.length - 1;
  },

  _extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  },

  switchCreatorTab(event, paneId) {
    // Buttons
    document.querySelectorAll('.creator-tab').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Panes
    document.querySelectorAll('.creator-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(paneId).classList.add('active');
  },

  openQuizBuilder() {
    const quizId = sessionStorage.getItem('current_quiz_id');
    if (!quizId) { alert('Create the quiz assessment first.'); return; }

    const overlay = document.createElement('div');
    overlay.className = 'simple-overlay animate-fade-in';
    overlay.innerHTML = `
      <div class="simple-modal" style="max-width:800px; width:95%; max-height:80vh; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 style="margin:0;">Quiz Builder (Automated Marking)</h2>
          <button class="btn btn-secondary btn-sm" onclick="this.closest('.simple-overlay').remove()">Close</button>
        </div>
        <p class="dim-text" style="font-size:0.9rem; margin-bottom:1.5rem;">Add Multiple Choice Questions. The system will automatically grade students based on their answers.</p>
        
        <div id="quizQuestionsContainer">
           <!-- Question rows go here -->
        </div>

        <div style="margin-top:1.5rem; display:flex; gap:1rem;">
          <button class="btn btn-secondary" onclick="app.addQuizQuestionRow()">+ Add New Question</button>
          <button class="btn btn-primary" style="flex:1;" onclick="app.saveQuizQuestions(this)">Save All Questions</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    this.addQuizQuestionRow();
  },

  addQuizQuestionRow() {
    const container = document.getElementById('quizQuestionsContainer');
    const rowId = Date.now();
    const row = document.createElement('div');
    row.className = 'quiz-question-edit-row';
    row.style = 'background:rgba(0,0,0,0.02); padding:1.5rem; border-radius:16px; border:1px solid rgba(0,0,0,0.05); margin-bottom:1rem; position:relative;';
    row.innerHTML = `
      <button style="position:absolute; top:1rem; right:1rem; border:none; background:none; cursor:pointer;" onclick="this.parentElement.remove()">🗑️</button>
      <div class="form-group">
        <label>Question Text</label>
        <input type="text" class="q-text" placeholder="e.g. What is the powerhouse of the cell?" required style="width:100%;" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
        <div class="form-group"><label>Option A</label><input type="text" class="q-a" required /></div>
        <div class="form-group"><label>Option B</label><input type="text" class="q-b" required /></div>
        <div class="form-group"><label>Option C</label><input type="text" class="q-c" required /></div>
        <div class="form-group"><label>Option D</label><input type="text" class="q-d" required /></div>
      </div>
      <div class="form-group" style="margin-top:1rem;">
        <label>Correct Answer</label>
        <select class="q-correct">
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>
      </div>`;
    container.appendChild(row);
  },

  async saveQuizQuestions(btn) {
    const quizId = sessionStorage.getItem('current_quiz_id');
    const rows = document.querySelectorAll('.quiz-question-edit-row');
    const questions = [];

    rows.forEach(row => {
      questions.push({
        question: row.querySelector('.q-text').value,
        option_a: row.querySelector('.q-a').value,
        option_b: row.querySelector('.q-b').value,
        option_c: row.querySelector('.q-c').value,
        option_d: row.querySelector('.q-d').value,
        correct_option: row.querySelector('.q-correct').value,
      });
    });

    if (questions.length === 0) { alert('Add at least one question.'); return; }

    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      const res = await fetch('backend/save_quiz_questions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: quizId, questions })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ All questions saved! The quiz is now ready for automated marking.');
        btn.closest('.simple-overlay').remove();
        this.initDashboard();
      } else {
        alert('Error: ' + data.message);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch {
      alert('Network error.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  },

  async startQuiz(itemId, title) {
    try {
      const res = await fetch(`backend/get_quiz_questions.php?item_id=${itemId}`);
      const data = await res.json();
      
      if (!data.success || data.questions.length === 0) {
        alert('This quiz has no questions for automated marking yet.');
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'simple-overlay animate-fade-in';
      overlay.innerHTML = `
        <div class="simple-modal" style="max-width:700px; width:95%; max-height:90vh; overflow-y:auto;">
          <h2 style="margin-bottom:0.5rem;">${title}</h2>
          <p class="dim-text" style="font-size:0.9rem; margin-bottom:2rem;">Automated Quiz - Select the correct options.</p>
          <form id="quizActiveForm">
            ${data.questions.map((q, idx) => `
              <div class="quiz-q-block" style="margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid rgba(0,0,0,0.05);">
                <p style="font-weight:700; margin-bottom:1rem;">${idx + 1}. ${this._esc(q.question)}</p>
                <div style="display:grid; gap:0.5rem;">
                  <label style="display:flex; gap:0.8rem; align-items:center; cursor:pointer;">
                    <input type="radio" name="q_${q.id}" value="A" required /> <strong>A.</strong> ${this._esc(q.option_a)}
                  </label>
                  <label style="display:flex; gap:0.8rem; align-items:center; cursor:pointer;">
                    <input type="radio" name="q_${q.id}" value="B" /> <strong>B.</strong> ${this._esc(q.option_b)}
                  </label>
                  <label style="display:flex; gap:0.8rem; align-items:center; cursor:pointer;">
                    <input type="radio" name="q_${q.id}" value="C" /> <strong>C.</strong> ${this._esc(q.option_c)}
                  </label>
                  <label style="display:flex; gap:0.8rem; align-items:center; cursor:pointer;">
                    <input type="radio" name="q_${q.id}" value="D" /> <strong>D.</strong> ${this._esc(q.option_d)}
                  </label>
                </div>
              </div>
            `).join('')}
            
            <div style="display:flex; gap:1rem; margin-top:1rem;">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.simple-overlay').remove()">Cancel</button>
              <button type="submit" class="btn btn-primary" style="flex:1;">Submit for Automated Marking</button>
            </div>
          </form>
        </div>`;
      document.body.appendChild(overlay);

      document.getElementById('quizActiveForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Marking...';

        const formData = new FormData(e.target);
        const answers = {};
        formData.forEach((val, key) => {
          const qId = key.split('_')[1];
          answers[qId] = val;
        });

        try {
          const sRes = await fetch('backend/submit_quiz.php', {
            method: 'POST',
            body: JSON.stringify({ item_id: itemId, answers })
          });
          const sData = await sRes.json();
          if (sData.success) {
             overlay.querySelector('.simple-modal').innerHTML = `
               <div style="text-align:center; padding:2rem;">
                  <div style="font-size:4rem; margin-bottom:1rem;">🎓</div>
                  <h2>Results: ${sData.score} / ${sData.total}</h2>
                  <p style="font-size:1.5rem; color:var(--primary); font-weight:800; margin:1rem 0;">${sData.percentage}</p>
                  <p class="dim-text">${sData.message}</p>
                  <button class="btn btn-primary" style="margin-top:2rem;" onclick="location.reload()">Great, Finish!</button>
               </div>
             `;
          } else {
            alert(sData.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit for Automated Marking';
          }
        } catch { alert('Network error'); submitBtn.disabled = false; }
      });

    } catch { alert('Failed to start quiz.'); }
  }
};

app.init();
