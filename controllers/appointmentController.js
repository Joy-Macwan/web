// controllers/appointmentController.js
// controllers/appointmentController.js
const supabase = require('../config/supabase');

class AppointmentController {
  // List appointments for current user
  async listAppointments(req, res) {
    try {
      const userId = req.session.user.id;
      const userRole = req.session.user.role;

      let query = supabase.from('appointments').select(`
        id, appointment_date, reason, type, status, is_anonymous,
        student (id, name, email),
        counselor (id, name, email)
      `);

      if (userRole === 'student') {
        query = query.eq('student', userId);
      } else if (userRole === 'counselor') {
        query = query.eq('counselor', userId);
      }

      const { data: appointments, error } = await query.order('appointment_date', { ascending: false });

      if (error) throw error;

      res.render('appointments/list', {
        title: 'Appointments',
        appointments
      });
    } catch (error) {
      console.error('List appointments error:', error);
      req.flash('error', 'Failed to load appointments');
      res.redirect('/dashboard');
    }
  }

  // Render booking form
  async renderBookAppointment(req, res) {
    try {
      const { data: counselors, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'counselor')
        .eq('is_active', true);

      if (error) throw error;

      res.render('appointments/book', {
        title: 'Book Appointment',
        counselors
      });
    } catch (error) {
      console.error('Render book appointment error:', error);
      req.flash('error', 'Failed to load booking form');
      res.redirect('/appointments');
    }
  }

  // Book appointment
  async bookAppointment(req, res) {
    try {
      const { counselorId, appointmentDate, reason, type, isAnonymous } = req.body;

      const { error } = await supabase.from('appointments').insert([
        {
          student: req.session.user.id,
          counselor: counselorId,
          appointment_date: new Date(appointmentDate).toISOString(),
          reason,
          type,
          is_anonymous: isAnonymous === 'on'
        }
      ]);

      if (error) throw error;

      req.flash('success', 'Appointment booked successfully');
      res.redirect('/appointments');
    } catch (error) {
      console.error('Book appointment error:', error);
      req.flash('error', 'Failed to book appointment');
      res.redirect('/appointments/book');
    }
  }

  // Get single appointment
  async getAppointment(req, res) {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          id, appointment_date, reason, type, status, is_anonymous,
          session_notes, outcome,
          student (id, name, email),
          counselor (id, name, email)
        `)
        .eq('id', req.params.id)
        .single();

      if (error || !appointment) {
        req.flash('error', 'Appointment not found');
        return res.redirect('/appointments');
      }

      res.render('appointments/details', {
        title: 'Appointment Details',
        appointment
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      req.flash('error', 'Failed to load appointment');
      res.redirect('/appointments');
    }
  }

  // Update appointment
  async updateAppointment(req, res) {
    try {
      const { status, sessionNotes, outcome } = req.body;

      const { error } = await supabase
        .from('appointments')
        .update({ status, session_notes: sessionNotes, outcome })
        .eq('id', req.params.id);

      if (error) throw error;

      req.flash('success', 'Appointment updated successfully');
      res.redirect('/appointments');
    } catch (error) {
      console.error('Update appointment error:', error);
      req.flash('error', 'Failed to update appointment');
      res.redirect('/appointments');
    }
  }

  // Cancel appointment
  async cancelAppointment(req, res) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id);

      if (error) throw error;

      req.flash('success', 'Appointment cancelled successfully');
      res.redirect('/appointments');
    } catch (error) {
      console.error('Cancel appointment error:', error);
      req.flash('error', 'Failed to cancel appointment');
      res.redirect('/appointments');
    }
  }
}

module.exports = new AppointmentController();
