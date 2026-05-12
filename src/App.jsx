import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Mail, Calendar, ClipboardList, CalendarClock, AlertCircle, CheckCircle2, Sun, Moon, Edit2, Trash2 } from 'lucide-react';

function App() {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
    followUpDate: '',
    status: 'Interested'
  });

  const [editingLeadId, setEditingLeadId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'This field is required';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = 'This field is required';
        } else if (!emailRegex.test(value.trim())) {
          error = 'Enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'This field is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = 'Enter a valid 10-digit phone number';
        }
        break;
      case 'followUpDate':
        if (!value) {
          error = 'This field is required';
        } else {
          const [year, month, day] = value.split('-');
          const selectedDate = new Date(year, month - 1, day);
          selectedDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = 'Past dates are not allowed';
          }
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const isFormValid = () => {
    const isNameValid = formData.name.trim().length > 0;
    const isPhoneValid = /^\d{10}$/.test(formData.phone.trim());
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    
    let isDateValid = false;
    if (formData.followUpDate) {
      const [year, month, day] = formData.followUpDate.split('-');
      const selectedDate = new Date(year, month - 1, day);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isDateValid = selectedDate >= today;
    }

    return isNameValid && isPhoneValid && isEmailValid && isDateValid && Object.values(errors).every(err => !err);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation and sanitization
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phone', formData.phone);
    const isDateValid = validateField('followUpDate', formData.followUpDate);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isDateValid) return;

    const sanitizedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      note: formData.note.trim(),
      followUpDate: formData.followUpDate,
      status: formData.status || 'Interested'
    };

    if (editingLeadId) {
      setLeads(leads.map(lead => lead.id === editingLeadId ? { ...lead, ...sanitizedData } : lead));
      setEditingLeadId(null);
    } else {
      const newLead = {
        id: crypto.randomUUID(),
        ...sanitizedData,
        createdAt: new Date().toISOString()
      };
      setLeads([...leads, newLead]);
    }

    setFormData({ name: '', email: '', phone: '', note: '', followUpDate: '', status: 'Interested' });
    setErrors({});
    
    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (lead) => {
    setEditingLeadId(lead.id);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      note: lead.note || '',
      followUpDate: lead.followUpDate || '',
      status: lead.status || 'Interested'
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter(lead => lead.id !== id));
      if (editingLeadId === id) {
        setEditingLeadId(null);
        setFormData({ name: '', email: '', phone: '', note: '', followUpDate: '', status: 'Interested' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const cancelEdit = () => {
    setEditingLeadId(null);
    setFormData({ name: '', email: '', phone: '', note: '', followUpDate: '', status: 'Interested' });
    setErrors({});
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
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <aside className="sidebar">
        <div className="card">
          <h2 className="card-title">
            <UserPlus size={20} /> {editingLeadId ? 'Update Lead' : 'Add New Lead'}
          </h2>
          
          {showSuccess && (
            <div className="success-message">
              <CheckCircle2 size={18} /> {editingLeadId ? 'Lead updated successfully!' : 'Lead added successfully!'}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'invalid' : ''} ${!errors.name && formData.name ? 'valid' : ''}`}
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
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'invalid' : ''} ${!errors.email && formData.email ? 'valid' : ''}`}
                placeholder="e.g. jane@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateField('email', e.target.value)}
              />
              {errors.email && (
                <span className="error-message">
                  <AlertCircle size={12} /> {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-input ${errors.phone ? 'invalid' : ''} ${!errors.phone && formData.phone ? 'valid' : ''}`}
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
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="followUpDate">Follow-up Date *</label>
              <input
                type="date"
                id="followUpDate"
                name="followUpDate"
                className={`form-input ${errors.followUpDate ? 'invalid' : ''} ${!errors.followUpDate && formData.followUpDate ? 'valid' : ''}`}
                value={formData.followUpDate}
                onChange={handleChange}
                onBlur={(e) => validateField('followUpDate', e.target.value)}
              />
              {errors.followUpDate && (
                <span className="error-message">
                  <AlertCircle size={12} /> {errors.followUpDate}
                </span>
              )}
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
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                className="btn"
                style={{ flex: 1 }}
                disabled={!isFormValid()}
              >
                {editingLeadId ? 'Update Lead' : 'Add Lead'}
              </button>
              
              {editingLeadId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ flex: 1, background: 'var(--item-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }}
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="lead-name">{lead.name}</div>
                      {lead.status && <span className={`badge-status status-${lead.status.replace(/\s+/g, '-').toLowerCase()}`}>{lead.status}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="badge today">
                        <Calendar size={12} /> Today
                      </div>
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(lead)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(lead.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="lead-phone">
                    <Phone size={14} /> {lead.phone}
                  </div>
                  {lead.email && (
                    <div className="lead-phone" style={{ marginTop: '-4px' }}>
                      <Mail size={14} /> {lead.email}
                    </div>
                  )}
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
            <span className="badge">{otherLeads.length}</span>
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
                  <div key={lead.id} className={`lead-item ${past ? 'row-overdue' : ''}`}>
                    <div className="lead-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="lead-name">{lead.name}</div>
                        {lead.status && <span className={`badge-status status-${lead.status.replace(/\s+/g, '-').toLowerCase()}`}>{lead.status}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lead.followUpDate && (
                          <div className={`badge ${past ? 'past' : 'upcoming'}`}>
                            <Calendar size={12} /> {formatDate(lead.followUpDate)}
                          </div>
                        )}
                        <button className="icon-btn edit-btn" onClick={() => handleEdit(lead)} title="Edit"><Edit2 size={16} /></button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(lead.id)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="lead-phone">
                      <Phone size={14} /> {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="lead-phone" style={{ marginTop: '-4px' }}>
                        <Mail size={14} /> {lead.email}
                      </div>
                    )}
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
