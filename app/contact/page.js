'use client'
import { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
  const [status, setStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const action = form.action;
    
    try {
      const response = await fetch(action, {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        form.reset();
      } else {
        setStatus('Failed to send message.');
      }
    } catch (error) {
      setStatus('Error: ' + error.message);
    }

    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.contactHeading}>Contact Us</h1>
      <form id="contact-form" className={styles.form} method="POST" action="https://script.google.com/macros/s/AKfycbxYUYMxHivlqLivrgOc2PTnYbdsoBQqxxLdO1H52_enrNgij8gnhtHmle-3Js6J5k_Aww/exec" onSubmit={handleSubmit}>
        <input name="Email" className={styles.input} type="email" placeholder="Email" required />
        <input name="Name" className={styles.input} type="text" placeholder="Name" required />
        <textarea name="Message" className={styles.textarea} placeholder="Message" required></textarea>
        <button type="submit" className={styles.button}>Send</button>
      </form>

      {showPopup && (
        <div className={styles.popupOverlay} onClick={handleClosePopup}>
          <div className={styles.popup} style={{ width: '80%', maxWidth: '400px' }}>
            <span className={styles.close} onClick={handleClosePopup}>
              &times;
            </span>
            <p style={{ textAlign: 'center', fontSize: '1rem', padding: '0.1rem' }}>{status}</p>
          </div>
        </div>  
      )}
    </main>
  );
}

export default Contact;
