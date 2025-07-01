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
  "glitch reading": {
    redirect: "/glitch-reading",
    message: "redirecting you to your glitch reading...",
    isEmailReward: false,
  },
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
  "unreleased track": {
    subject: "Here's your exclusive track 🎶",
    text: `Hey! Thanks for spinning the DGENR8 reward wheel. Your exclusive track is here:\n\n🎧 [LINK TO TRACK]\n\nEnjoy, and keep creating!`,
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background: #f9f9f9; color: #0f0f0f; padding: 20px; text-align: center;">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background: #0f0f0f !important; color: #f9f9f9 !important; }
            a { background: white !important; color: black !important; }
          }
        </style>
        <h1 style="font-size: 28px; margin-bottom: 10px;">your track is ready 🎶</h1>
        <p style="font-size: 16px;">thanks for spinning the <strong>dgenr8</strong> reward wheel.</p>
        <p style="font-size: 18px; margin: 20px 0;">
          <a href="[LINK TO TRACK]" style="background: black; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px;">🎧 listen now</a>
        </p>
        <p style="font-size: 14px;">keep glitching,<br>dgenr8. & soundbath.</p>
      </div>
    `,
  },

  "glitch zine pdf": {
    subject: "Your glitch zine PDF 📕",
    text: `Hey! Thanks for claiming your glitch zine.\n\n🌀 Download it here: [LINK TO ZINE PDF]\n\nBonus: tag @dgenrnation on Instagram with your favorite page to get another reward!`,
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background: #f9f9f9; color: #0f0f0f; padding: 20px; text-align: center;">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background: #0f0f0f !important; color: #f9f9f9 !important; }
            a { background: white !important; color: black !important; }
          }
        </style>
        <h1 style="font-size: 28px; margin-bottom: 10px;">your glitch zine 📕</h1>
        <p style="font-size: 16px;">you've unlocked a pocket universe of glitch wisdom.</p>
        <p style="font-size: 18px; margin: 20px 0;">
          <a href="[LINK TO ZINE PDF]" style="background: black; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px;">🌀 download the zine</a>
        </p>
        <p style="font-size: 14px;">bonus: tag <strong>@dgenrnation</strong> with your favorite page and unlock another reward 🌱</p>
      </div>
    `,
  },

  "private livestream access": {
    subject: "Access to the private livestream 🎥",
    text: `You're in! Join the upcoming private livestream with this link or code:\n\n🔐 [LINK or CODE HERE]\n\nWe'll see you there.`,
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background: #f9f9f9; color: #0f0f0f; padding: 20px; text-align: center;">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background: #0f0f0f !important; color: #f9f9f9 !important; }
            a { background: white !important; color: black !important; }
          }
        </style>
        <h1 style="font-size: 28px; margin-bottom: 10px;">you're invited 🎥</h1>
        <p style="font-size: 16px;">your access to the private livestream has been granted.</p>
        <p style="font-size: 18px; margin: 20px 0;">
          <a href="[LINK or CODE HERE]" style="background: black; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px;">🔐 join the stream</a>
        </p>
        <p style="font-size: 14px;">see you in the glitch dimension,<br>dgenr8. & soundbath.</p>
      </div>
    `,
  },
};
