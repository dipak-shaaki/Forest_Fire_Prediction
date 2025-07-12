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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/contact', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      alert('Failed to send message');
    }
  };

  return (
    <div>
      <h2>Contact Us</h2>
      {sent && <p style={{ color: 'green' }}>Your message has been sent.</p>}
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" /><br/>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" /><br/>
      <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" /><br/>
      <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message"></textarea><br/>
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
