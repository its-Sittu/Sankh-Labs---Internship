import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Calendar, ClipboardList, CalendarClock, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newLead = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    setLeads([...leads, newLead]);
    setFormData({ name: '', phone: '', note: '', followUpDate: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    // Need to handle timezone accurately so it compares correctly
    const date = new Date(dateString);
    // When date is created from "YYYY-MM-DD" it's UTC time. We can just extract the components
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
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="e.g. +1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
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
            
            <button type="submit" className="btn">
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
