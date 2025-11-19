
export const rewardMap = {
  "free sticker with purchase!": {
    redirect: "/shop",
    message: "redirecting you to the shop...",
    isEmailReward: false,
  },
  "10% off code": {
    code: "10OFFDGENR8", // or generate dynamically if desired
    message: "here's your exclusive discount code 💸",
    isEmailReward: false,
    // no redirect
  },
  /*
  "glitch reading": {
    redirect: "/glitch-reading",
    message: "redirecting you to your glitch reading...",
    isEmailReward: false,
  },*/
  "unreleased track": {
    message: "check your inbox for your exclusive track 💌",
    isEmailReward: true,
  },
  /*
  "glitch zine pdf": {
    message: "check your inbox for the zine 💌",
    isEmailReward: true,
    extra: "tag @dgenrnation with your favorite page to get another reward 🌱",
  },

  "private livestream access": {
    message: "check your inbox for your access code 💌",
    isEmailReward: true,
  },*/
};

export const rewardMessages = {
  /**
   * @param {{ trackUrl: string }} p
   */
  "unreleased track": ({ trackUrl }) => ({
    subject: "Here's your exclusive track 🎶",
    text: `Hey! Thanks for spinning the DGENR8 reward wheel. Your exclusive track is here:

🎧 ${trackUrl}

Enjoy!`,
    html: `
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Unreleased Track Reward</title>
      </head>
      <body style="margin:0;padding:0;background-color:#000;color:#00cfff;font-family:Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;">
          <tr>
            <td align="center" style="padding:2rem;">
              <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;text-align:center;">
                <tr><td style="padding-bottom:2rem;">
                  <h1 style="font-size:24px;text-shadow:0 0 10px #00cfff;margin-bottom:1.5rem;">
                    you’ve unlocked an unreleased track! 🎶
                  </h1>
                  <p style="font-size:16px;margin-bottom:2rem;">click the button below to download your reward:</p>
                  <a href="${trackUrl}" style="display:inline-block;padding:0.75rem 2rem;border:1px solid #00cfff;color:#00cfff;text-decoration:none;border-radius:6px;font-size:16px;text-shadow:0 0 6px #00cfff;">
                    🎁 download unreleased track →
                  </a>
                  <p style="font-size:14px;margin-top:2rem;color:#00cfff;text-shadow:0 0 10px #00cfff;">thank you for supporting.</p>
                  <img src="https://res.cloudinary.com/dtg5hfwbs/image/upload/v1751644062/soundbath_opo25h.png" alt="soundbath." width="100" style="margin:2rem auto 1rem;display:block;"/>
                  <p style="font-size:12px;opacity:0.6;margin-top:1rem;">follow us on socials for more surprises ✨</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  }),

  /**
   * @param {{ zineUrl: string }} p
   */
  "glitch zine pdf": ({ zineUrl }) => ({
    subject: "Your glitch zine PDF 📕",
    text: `Hey! Thanks for claiming your glitch zine.

🌀 Download it here: ${zineUrl}

Bonus: tag @dgenrnation on Instagram with your favorite page to get another reward!`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;background:#f9f9f9;color:#0f0f0f;padding:20px;text-align:center;">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background:#0f0f0f !important; color:#f9f9f9 !important; }
            a { background:#fff !important; color:#000 !important; }
          }
        </style>
        <h1 style="font-size:28px;margin-bottom:10px;">your glitch zine 📕</h1>
        <p style="font-size:16px;">you've unlocked a pocket universe of glitch wisdom.</p>
        <p style="font-size:18px;margin:20px 0;">
          <a href="${zineUrl}" style="background:#000;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;">🌀 download the zine</a>
        </p>
        <p style="font-size:14px;">bonus: tag <strong>@dgenrnation</strong> with your favorite page and unlock another reward 🌱</p>
      </div>
    `,
  }),

  /**
   * @param {{ streamLink: string }} p
   */
  "private livestream access": ({ streamLink }) => ({
    subject: "Access to the private livestream 🎥",
    text: `You're in! Join the upcoming private livestream with this link or code:

🔐 ${streamLink}

We'll see you there.`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;background:#f9f9f9;color:#0f0f0f;padding:20px;text-align:center;">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background:#0f0f0f !important; color:#f9f9f9 !important; }
            a { background:#fff !important; color:#000 !important; }
          }
        </style>
        <h1 style="font-size:28px;margin-bottom:10px;">you're invited 🎥</h1>
        <p style="font-size:16px;">your access to the private livestream has been granted.</p>
        <p style="font-size:18px;margin:20px 0;">
          <a href="${streamLink}" style="background:#000;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;">🔐 join the stream</a>
        </p>
        <p style="font-size:14px;">see you in the glitch dimension,<br/>dgenr8. & soundbath.</p>
      </div>
    `,
  }),
};
