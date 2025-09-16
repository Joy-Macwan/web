// controllers/dashboardController.js
const { supabase } = require('../utils/supabase');

class DashboardController {
  async renderDashboard(req, res) {
    const user = req.session.user;
    switch (user.role) {
      case 'student':
        return this.renderStudentDashboard(req, res);
      case 'counselor':
        return this.renderCounselorDashboard(req, res);
      case 'admin':
        return this.renderAdminDashboard(req, res);
      default:
        return this.renderStudentDashboard(req, res);
    }
  }

  // ---------------- Student Dashboard ----------------
  async renderStudentDashboard(req, res) {
    try {
      const userId = req.session.user.id;

      const [appointmentsRes, assessmentsRes, chatRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, counselor(name)')
          .eq('student', userId)
          .eq('status', 'scheduled')
          .order('appointment_date', { ascending: true })
          .limit(5),
        supabase
          .from('assessments')
          .select('*')
          .eq('user', userId)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;
      if (chatRes.error) throw chatRes.error;

      res.render('dashboard/student', {
        title: 'Student Dashboard',
        upcomingAppointments: appointmentsRes.data,
        recentAssessments: assessmentsRes.data,
        chatHistory: chatRes.data
      });
    } catch (error) {
      console.error('Student dashboard error:', error.message);
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  }

  // ---------------- Counselor Dashboard ----------------
  async renderCounselorDashboard(req, res) {
    try {
      const userId = req.session.user.id;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [appointmentsRes, pendingReviewsRes, highRiskRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, student(name)')
          .eq('counselor', userId)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString()),
        supabase
          .from('assessments')
          .select('*, user(name)')
          .eq('counselor_review->reviewed', false) // JSONB filter
          .order('created_at', { ascending: false }),
        supabase
          .from('users')
          .select('id, name, email, mental_health_status')
          .eq('mental_health_status->riskLevel', 'high')
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (pendingReviewsRes.error) throw pendingReviewsRes.error;
      if (highRiskRes.error) throw highRiskRes.error;

      res.render('dashboard/counselor', {
        title: 'Counselor Dashboard',
        todayAppointments: appointmentsRes.data,
        pendingReviews: pendingReviewsRes.data,
        highRiskStudents: highRiskRes.data
      });
    } catch (error) {
      console.error('Counselor dashboard error:', error.message);
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  }

  // ---------------- Admin Dashboard ----------------
  async renderAdminDashboard(req, res) {
    try {
      // User stats grouped by role
      const { data: userStats, error: userErr } = await supabase
        .rpc('count_users_by_role'); // You’ll need a Postgres function

      // Appointment stats grouped by status
      const { data: appointmentStats, error: apptErr } = await supabase
        .rpc('count_appointments_by_status');

      // Assessment stats grouped by severity
      const { data: assessmentStats, error: assessErr } = await supabase
        .rpc('count_assessments_by_severity');

      if (userErr) throw userErr;
      if (apptErr) throw apptErr;
      if (assessErr) throw assessErr;

      res.render('dashboard/admin', {
        title: 'Admin Dashboard',
        userStats,
        appointmentStats,
        assessmentStats
      });
    } catch (error) {
      console.error('Admin dashboard error:', error.message);
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  }
}

module.exports = new DashboardController();
