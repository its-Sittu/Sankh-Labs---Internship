import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Calendar, ClipboardList, CalendarClock, AlertCircle, CheckCircle2 } from 'lucide-react';

function App() {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: '',
    followUpDate: ''
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
        }
        break;
      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d+$/.test(value)) {
          error = 'Phone number must contain only digits';
        } else if (value.length !== 10) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 3 &&
      formData.phone.length === 10 &&
      /^\d+$/.test(formData.phone) &&
      Object.values(errors).every(err => !err)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation and sanitization
    const isNameValid = validateField('name', formData.name);
    const isPhoneValid = validateField('phone', formData.phone);

    if (!isNameValid || !isPhoneValid) return;

    const sanitizedData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      note: formData.note.trim(),
      followUpDate: formData.followUpDate
    };

    const newLead = {
      id: crypto.randomUUID(),
      ...sanitizedData,
      createdAt: new Date().toISOString()
    };

    setLeads([...leads, newLead]);
    setFormData({ name: '', phone: '', note: '', followUpDate: '' });
    setErrors({});
    
    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No follow-up set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine if a follow-up is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const [year, month, day] = dateString.split('-');
    const today = new Date();
    return parseInt(year) === today.getFullYear() &&
           parseInt(month) === today.getMonth() + 1 &&
           parseInt(day) === today.getDate();
  };

  // Determine if a follow-up is past
  const isPast = (dateString) => {
    if (!dateString) return false;
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const todaysFollowUps = leads.filter(lead => lead.followUpDate && isToday(lead.followUpDate));
  const otherLeads = leads.filter(lead => !lead.followUpDate || !isToday(lead.followUpDate));

  return (
    <div className="container">
      <div className="header">
        <h1><Users className="text-primary" /> Lead Management Dashboard</h1>
      </div>

      <aside className="sidebar">
        <div className="card">
          <h2 className="card-title"><UserPlus size={20} /> Add New Lead</h2>
          
          {showSuccess && (
            <div className="success-message">
              <CheckCircle2 size={18} /> Lead added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'invalid' : ''}`}
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={(e) => validateField('name', e.target.value)}
              />
              {errors.name && (
                <span className="error-message">
                  <AlertCircle size={12} /> {errors.name}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-input ${errors.phone ? 'invalid' : ''}`}
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                onBlur={(e) => validateField('phone', e.target.value)}
              />
              {errors.phone && (
                <span className="error-message">
                  <AlertCircle size={12} /> {errors.phone}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="followUpDate">Follow-up Date</label>
              <input
                type="date"
                id="followUpDate"
                name="followUpDate"
                className="form-input"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="note">Notes</label>
              <textarea
                id="note"
                name="note"
                className="form-input"
                placeholder="Enter any details..."
                rows="4"
                value={formData.note}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="btn"
              disabled={!isFormValid()}
            >
              Add Lead
            </button>
          </form>
        </div>
      </aside>

      <main className="leads-layout">
        {/* Today's Follow-ups Section */}
        <section className="card">
          <div className="section-header">
            <h2 className="section-title text-warning">
              <CalendarClock size={22} color="var(--warning)" /> 
              Today's Follow-ups
            </h2>
            <span className="badge today">{todaysFollowUps.length}</span>
          </div>
          
          {todaysFollowUps.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={32} />
              <p>No follow-ups scheduled for today.</p>
            </div>
          ) : (
            <div className="lead-list">
              {todaysFollowUps.map(lead => (
                <div key={lead.id} className="lead-item">
                  <div className="lead-header">
                    <div className="lead-name">{lead.name}</div>
                    <div className="badge today">
                      <Calendar size={12} /> Today
                    </div>
                  </div>
                  <div className="lead-phone">
                    <Phone size={14} /> {lead.phone}
                  </div>
                  {lead.note && (
                    <div className="lead-note">{lead.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All Leads Section */}
        <section className="card">
          <div className="section-header">
            <h2 className="section-title">
              <ClipboardList size={22} /> 
              All Other Leads
            </h2>
            <span className="badge" style={{ background: 'var(--bg-color)' }}>{otherLeads.length}</span>
          </div>
          
          {otherLeads.length === 0 ? (
            <div className="empty-state">
              <Users size={32} />
              <p>No other leads in the system.</p>
            </div>
          ) : (
            <div className="lead-list">
              {otherLeads.map(lead => {
                const past = isPast(lead.followUpDate);
                const upcoming = lead.followUpDate && !past && !isToday(lead.followUpDate);
                
                return (
                  <div key={lead.id} className="lead-item">
                    <div className="lead-header">
                      <div className="lead-name">{lead.name}</div>
                      {lead.followUpDate && (
                        <div className={`badge ${past ? 'past' : 'upcoming'}`}>
                          <Calendar size={12} /> {formatDate(lead.followUpDate)}
                        </div>
                      )}
                    </div>
                    <div className="lead-phone">
                      <Phone size={14} /> {lead.phone}
                    </div>
                    {lead.note && (
                      <div className="lead-note">{lead.note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
