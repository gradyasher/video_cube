// api/mailchimp.js

// /api/mailchimp.js
export async function triggerMailchimpJourney(email, journeyUrl) {
  const apiKey = process.env.MAILCHIMP_API_KEY;

  const response = await _fetch(journeyUrl, {
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Mailchimp journey failed: ${JSON.stringify(data)}`);
  }

  return data;
}
