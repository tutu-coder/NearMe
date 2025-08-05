'use client';

import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

export default function EmailPopup({
  providerEmail,
  isOpen,
  onClose,
}: {
  providerEmail: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

  useEffect(() => {
    if (!PUBLIC_KEY) {
      console.error('❌ Missing PUBLIC_KEY! Please check your .env.local file.');
    } else {
      emailjs.init(PUBLIC_KEY);
      console.log('✅ EmailJS initialized with public key:', PUBLIC_KEY);
    }
  }, [PUBLIC_KEY]);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.current) return setError('Form not found.');

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      return setError('Missing EmailJS config. Check environment variables.');
    }

    console.log('📤 Sending email:', { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY });

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      .then(() => {
        setSuccess(true);
        form.current?.reset();
      })
      .catch((err) => {
        console.error('❌ Email send error:', err);
        setError('Failed to send email. Please try again.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Contact Provider</h2>
        <form ref={form} onSubmit={sendEmail} className="space-y-4">
          <input type="hidden" name="to_email" value={providerEmail} />

          <div>
            <label className="block text-sm">Your Name</label>
            <input
              name="from_name"
              type="text"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Your Email</label>
            <input
              name="reply_to"
              type="email"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Message</label>
            <textarea
              name="message"
              rows={4}
              required
              defaultValue={`Hi, I saw your services on our platform and I'd like help with...`}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
          {success && <p className="text-green-600 text-sm mt-2">Email sent successfully!</p>}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
