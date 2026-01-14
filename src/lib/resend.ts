import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set in environment variables');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  from = 'onboarding@resend.dev' // Default Resend test email
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!resend) {
    console.error('Resend is not initialized. Please set RESEND_API_KEY.');
    return { error: 'Resend not initialized' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Catch: Error sending email:', error);
    return { error };
  }
}

