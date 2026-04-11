'use server';

import { db } from '@/db';
import { contactMessages } from '@/db/schema';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(data: ContactFormData) {
  const { name, email, subject, message } = data;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return { success: false, error: 'All fields are required.' };
  }

  if (name.length > 255 || email.length > 255 || subject.length > 255) {
    return { success: false, error: 'Input too long.' };
  }

  if (message.length > 5000) {
    return { success: false, error: 'Message must be under 5000 characters.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong. Please try again later.' };
  }
}
