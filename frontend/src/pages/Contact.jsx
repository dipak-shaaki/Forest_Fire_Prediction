import React, { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });



  const [sent, setSent] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [error, setError] = useState('');

  const handleContactChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
