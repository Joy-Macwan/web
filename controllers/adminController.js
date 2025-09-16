// controllers/adminController.js
const Assessment = require('../models/assessment');
const Appointment = require('../models/Appointment');
const Assessment = require('../models/assessment');
const ForumPost = require('../models/ForumPost');
const ChatSession = require('../models/ChatSession');

class AdminController {
  async renderDashboard(req, res) {
    try {
      const [
        totalUsers,
        totalAppointments,
        totalAssessments,
        highRiskUsers,
        recentActivity
      ] = await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        Assessment.countDocuments(),
        User.countDocuments({ riskLevel: 'high' }), // Changed: removed nested path
        this.getRecentActivity()
      ]);

      const stats = {
        totalUsers,
        totalAppointments,
        totalAssessments,
        highRiskUsers
      };

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats,
        recentActivity
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  }

  async getAnalytics(req, res) {
    try {
      const [
        userGrowth,
        assessmentTrends,
        riskLevelDistribution,
        departmentStats
      ] = await Promise.all([
        this.getUserGrowthData(),
        this.getAssessmentTrendsData(),
        this.getRiskLevelDistribution(),
        this.getDepartmentStats()
      ]);

      res.render('admin/analytics', {
        title: 'Analytics Dashboard',
        userGrowth,
        assessmentTrends,
        riskLevelDistribution,
        departmentStats
      });
    } catch (error) {
      console.error('Analytics error:', error);
      req.flash('error', 'Failed to load analytics');
      res.redirect('/admin/dashboard');
    }
  }

  async listUsers(req, res) {
    try {
      const { role, riskLevel, search } = req.query;
      let filter = {};
      
      if (role) filter.role = role;
      if (riskLevel) filter.riskLevel = riskLevel; // Changed: simplified
      
      // For search, we'll handle it differently since Supabase doesn't have $or
      let users;
      if (search) {
        // We'll get users and filter on the backend for now
        // In production, you might want to use Supabase's text search features
        const allUsers = await User.find(filter);
        users = allUsers.filter(user => 
          user.name?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase()) ||
          user.student_id?.toLowerCase().includes(search.toLowerCase())
        );
      } else {
        users = await User.find(filter);
      }

      // Sort by created_at descending (newest first)
      users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.render('admin/users', {
        title: 'User Management',
        users,
        currentRole: role,
        currentRiskLevel: riskLevel,
        searchQuery: search
      });
    } catch (error) {
      console.error('List users error:', error);
      req.flash('error', 'Failed to load users');
      res.redirect('/admin/dashboard');
    }
  }

  async getReports(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      
      let reportData = {};
      switch (type) {
        case 'mental-health':
          reportData = await this.getMentalHealthReport(startDate, endDate);
          break;
        case 'usage':
          reportData = await this.getUsageReport(startDate, endDate);
          break;
        case 'appointments':
          reportData = await this.getAppointmentsReport(startDate, endDate);
          break;
        default:
          reportData = await this.getOverallReport(startDate, endDate);
      }

      res.render('admin/reports', {
        title: 'Reports',
        reportData,
        reportType: type,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Get reports error:', error);
      req.flash('error', 'Failed to generate reports');
      res.redirect('/admin/dashboard');
    }
  }

  async getModerationQueue(req, res) {
    try {
      // Note: These methods will need to be implemented in your models
      // For now, I'm showing the structure
      const [
        reportedPosts,
        highRiskSessions,
        flaggedContent
      ] = await Promise.all([
        ForumPost.findReported(), // Custom method to be added
        ChatSession.findHighRisk(), // Custom method to be added
        Assessment.findUnreviewed() // Custom method to be added
      ]);

      res.render('admin/moderation', {
        title: 'Moderation Queue',
        reportedPosts,
        highRiskSessions,
        flaggedContent
      });
    } catch (error) {
      console.error('Moderation queue error:', error);
      req.flash('error', 'Failed to load moderation queue');
      res.redirect('/admin/dashboard');
    }
  }

  async moderateContent(req, res) {
    try {
      const { type, id } = req.params;
      const { action, notes } = req.body;
      
      let result = {};
      switch (type) {
        case 'post':
          result = await this.moderatePost(id, action, notes, req.session.user.id);
          break;
        case 'session':
          result = await this.moderateSession(id, action, notes, req.session.user.id);
          break;
        case 'assessment':
          result = await this.moderateAssessment(id, action, notes, req.session.user.id);
          break;
      }

      res.json({ success: true, message: 'Content moderated successfully' });
    } catch (error) {
      console.error('Moderate content error:', error);
      res.status(500).json({ error: 'Failed to moderate content' });
    }
  }

  // Helper methods
  async getRecentActivity() {
    const activities = [];
    
    try {
      // Get recent users (last 5)
      const recentUsers = await User.find({});
      const lastFiveUsers = recentUsers
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Get recent assessments with user info
      const recentAssessments = await Assessment.findWithUser(); // You'll need to implement this
      const lastFiveAssessments = recentAssessments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Get recent appointments with student info
      const recentAppointments = await Appointment.findWithUser(); // You'll need to implement this
      const lastFiveAppointments = recentAppointments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Add to activities array
      lastFiveUsers.forEach(user => {
        activities.push({
          type: 'user_registered',
          description: `${user.name} registered`,
          timestamp: new Date(user.created_at)
        });
      });
      
      lastFiveAssessments.forEach(assessment => {
        activities.push({
          type: 'assessment_taken',
          description: `${assessment.users?.name || 'Unknown'} took ${assessment.type} assessment`,
          timestamp: new Date(assessment.created_at)
        });
      });
      
      // Sort all activities by timestamp and return top 10
      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // These methods need to be rewritten for Supabase
  // Since Supabase doesn't have MongoDB's aggregation, we'll do basic queries
  async getUserGrowthData() {
    try {
      const users = await User.find({});
      const monthlyData = {};
      
      users.forEach(user => {
        const date = new Date(user.created_at);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      });
      
      return Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return {
          _id: { year: parseInt(year), month: parseInt(month) },
          count: monthlyData[key]
        };
      }).sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });
    } catch (error) {
      console.error('Error getting user growth data:', error);
      return [];
    }
  }

  async getAssessmentTrendsData() {
    try {
      const assessments = await Assessment.find({});
      const trends = {};
      
      assessments.forEach(assessment => {
        const key = `${assessment.type}-${assessment.severity}`;
        trends[key] = (trends[key] || 0) + 1;
      });
      
      return Object.keys(trends).map(key => {
        const [type, severity] = key.split('-');
        return {
          _id: { type, severity },
          count: trends[key]
        };
      });
    } catch (error) {
      console.error('Error getting assessment trends:', error);
      return [];
    }
  }

  async getRiskLevelDistribution() {
    try {
      const users = await User.find({});
      const distribution = {};
      
      users.forEach(user => {
        const riskLevel = user.riskLevel || 'unknown';
        distribution[riskLevel] = (distribution[riskLevel] || 0) + 1;
      });
      
      return Object.keys(distribution).map(riskLevel => ({
        _id: riskLevel,
        count: distribution[riskLevel]
      }));
    } catch (error) {
      console.error('Error getting risk level distribution:', error);
      return [];
    }
  }

  async getDepartmentStats() {
    try {
      const users = await User.find({});
      const stats = {};
      
      users.forEach(user => {
        const dept = user.department || 'Unknown';
        if (!stats[dept]) {
          stats[dept] = { count: 0, highRisk: 0 };
        }
        stats[dept].count += 1;
        if (user.riskLevel === 'high') {
          stats[dept].highRisk += 1;
        }
      });
      
      return Object.keys(stats).map(department => ({
        _id: department,
        count: stats[department].count,
        highRisk: stats[department].highRisk
      }));
    } catch (error) {
      console.error('Error getting department stats:', error);
      return [];
    }
  }

  async moderatePost(postId, action, notes, moderatorId) {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Post not found');
    
    const updateData = {
      is_moderated: true,
      moderated_by: moderatorId,
      moderation_notes: notes
    };
    
    if (action === 'delete') {
      await ForumPost.findByIdAndDelete(postId);
    } else if (action === 'lock') {
      updateData.is_locked = true;
      await ForumPost.findByIdAndUpdate(postId, updateData);
    } else {
      await ForumPost.findByIdAndUpdate(postId, updateData);
    }
    
    return { success: true };
  }

  async moderateSession(sessionId, action, notes, moderatorId) {
    const session = await ChatSession.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    const updateData = {};
    if (action === 'escalate') {
      updateData.escalated_to = moderatorId;
      updateData.needs_human_intervention = false;
    }
    
    await ChatSession.findByIdAndUpdate(sessionId, updateData);
    return { success: true };
  }

  async moderateAssessment(assessmentId, action, notes, moderatorId) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    
    const updateData = {
      reviewed: true,
      reviewed_by: moderatorId,
      review_date: new Date().toISOString(),
      review_notes: notes
    };
    
    await Assessment.findByIdAndUpdate(assessmentId, updateData);
    return { success: true };
  }
}

module.exports = new AdminController();