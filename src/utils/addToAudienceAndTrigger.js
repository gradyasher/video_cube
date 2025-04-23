// utils/addToAudienceAndTrigger.js
export async function addToAudienceAndTrigger(email, journeyUrl) {
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  const apiKey = process.env.MAILCHIMP_API_KEY;

  // Add to audience
  const addRes = await fetch(`https://us12.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });

  if (!addRes.ok) {
    const err = await addRes.json();
    throw new Error(`❌ Failed to add contact to audience: ${JSON.stringify(err)}`);
  }

  // Trigger journey
  const triggerRes = await fetch(journeyUrl, {
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (!triggerRes.ok) {
    const err = await triggerRes.json();
    throw new Error(`❌ Failed to trigger journey: ${JSON.stringify(err)}`);
  }

  return true;
}
