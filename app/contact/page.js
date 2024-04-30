// app/contact/page.js

import styles from './Contact.module.css';

function Contact() {
    return (
      <main className={styles.main}>
        <h1 className={styles.contactHeading}>Contact Us</h1>
        <form className={styles.form} action="/api/contact" method="post">
          <label htmlFor="email">Your Email Address:</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="message">What would you like to reach us about?</label>
          <textarea id="message" name="message" className={styles.textarea} required></textarea>

          <button type="submit" className={styles.button}>Send Message</button>
        </form>
      </main>
    );
}

export default Contact;
