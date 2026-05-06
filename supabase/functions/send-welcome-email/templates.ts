export const COMPETITION_DATE = 'August 22, 2026';
export const COMPETITION_LOCATION = 'Seaside Convention Center — 415 1st Ave, Seaside, OR 97138';

export function buildWelcomeHtml(greeting: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TOPAZ 2.0</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 0; color: #222; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1F4E78, #2E75B6); padding: 48px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 32px; letter-spacing: 1px; font-weight: 800; }
    .header p { color: #cfe3f5; margin: 10px 0 0; font-size: 15px; }
    .body { padding: 36px 40px; line-height: 1.65; font-size: 15px; }
    .highlight { background: #eff6ff; border-left: 4px solid #2E75B6; padding: 18px 22px; border-radius: 6px; margin: 24px 0; }
    .highlight h3 { margin: 0 0 6px; color: #1F4E78; font-size: 16px; }
    .footer { background: #f9fafb; padding: 22px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #2E75B6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Welcome to TOPAZ 2.0 🎉</h1>
      <p>You're officially on the list</p>
    </div>
    <div class="body">
      <p style="font-size:16px"><strong>${greeting}</strong></p>
      <p>Thank you for joining the <strong>TOPAZ 2.0</strong> family. We're thrilled to have you with us on the journey back to the stage.</p>

      <div class="highlight">
        <h3>The Return of TOPAZ 2.0</h3>
        <p style="margin:0"><strong>Date:</strong> ${COMPETITION_DATE}<br/>
        <strong>Location:</strong> ${COMPETITION_LOCATION}</p>
      </div>

      <p>As a subscriber, you'll be the first to hear about:</p>
      <ul>
        <li>Registration openings and important deadlines</li>
        <li>Competition announcements &amp; schedule updates</li>
        <li>New merch drops and exclusive news</li>
        <li>Stories and highlights from the TOPAZ community</li>
      </ul>

      <p>We can't wait to see you — whether on stage, in the crowd, or right here in your inbox.</p>

      <p style="margin-top:32px;">Until next time,<br/><strong>The TOPAZ 2.0 Team</strong></p>
    </div>
    <div class="footer">
      &copy; 2026 TOPAZ 2.0 LLC &bull; <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a>
    </div>
  </div>
</body>
</html>`;
}

export function buildWelcomeText(greeting: string): string {
  return `Welcome to TOPAZ 2.0!

${greeting}

Thank you for joining the TOPAZ 2.0 family. You're officially on the list.

The Return of TOPAZ 2.0
Date: ${COMPETITION_DATE}
Location: ${COMPETITION_LOCATION}

As a subscriber you'll be the first to hear about registration openings, competition announcements, new merch, and stories from the TOPAZ community.

We can't wait to see you.

— The TOPAZ 2.0 Team
topaz2.0@yahoo.com`;
}
