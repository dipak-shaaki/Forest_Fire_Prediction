import React, { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [report, setReport] = useState({
    name: '',
    email: '',
    province: '',
    district: '',
    location_details: '',
    fire_date: '',
    description: ''
  });

  const [sent, setSent] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [error, setError] = useState('');

  const handleContactChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReportChange = (e) => {
    setReport({ ...report, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/contact', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Failed to send message.');
    }
  };

  const handleReportSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/reports', report);
      setReportSent(true);
      setReport({
        name: '',
        email: '',
        province: '',
        district: '',
        location_details: '',
        fire_date: '',
        description: ''
      });
    } catch {
      setError('Failed to submit fire report.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Contact Us</h2>

      {sent && <p style={{ color: 'green' }}>Your message has been sent.</p>}
      <input name="name" value={form.name} onChange={handleContactChange} placeholder="Your Name" /><br />
      <input name="email" value={form.email} onChange={handleContactChange} placeholder="Email" /><br />
      <input name="subject" value={form.subject} onChange={handleContactChange} placeholder="Subject" /><br />
      <textarea
        name="message"
        value={form.message}
        onChange={handleContactChange}
        placeholder="Message"
      ></textarea><br />
      <button onClick={handleContactSubmit}>Send Message</button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Report a Wildfire Incident</h2>
      {reportSent && <p style={{ color: 'green' }}>🔥 Fire report has been submitted.</p>}

      <input name="name" value={report.name} onChange={handleReportChange} placeholder="Your Name" /><br />
      <input name="email" value={report.email} onChange={handleReportChange} placeholder="Email" /><br />
      <input name="province" value={report.province} onChange={handleReportChange} placeholder="Province" /><br />
      <input name="district" value={report.district} onChange={handleReportChange} placeholder="District" /><br />
      <input
        name="location_details"
        value={report.location_details}
        onChange={handleReportChange}
        placeholder="Exact Location Details"
      /><br />
      <input
        name="fire_date"
        type="date"
        value={report.fire_date}
        onChange={handleReportChange}
      /><br />
      <textarea
        name="description"
        rows={4}
        placeholder="Describe the fire situation"
        value={report.description}
        onChange={handleReportChange}
      /><br />
      <button onClick={handleReportSubmit}>Submit Fire Report</button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
