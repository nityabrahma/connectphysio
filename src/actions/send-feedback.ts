
'use server';

export async function sendFeedbackEmail(formData: FormData) {
  const message = formData.get('feedback') as string;
  const page = formData.get('page') as string;
  const userEmail = formData.get('userEmail') as string;
  const apiKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  if (!apiKey) {
    console.error('Web3Forms API key is not configured in environment variables.');
    return { error: 'The server is not configured to send emails. Please contact support.' };
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: apiKey,
      subject: `New Feedback from ${userEmail}`,
      from_name: "ConnectPhysio Feedback",
      page: page,
      email: userEmail,
      message: message,
    }),
  });

  const result = await response.json();

  if (result.success) {
    return { success: true };
  } else {
    console.error('Failed to send feedback email:', result.message);
    return { error: 'There was an issue sending your feedback. Please try again later.' };
  }
}
