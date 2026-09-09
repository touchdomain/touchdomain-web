import { CUSTOMER_CONTACT_EMAIL } from '../lib/mailer';

// Canonical host. The apex (touchdomain.co.za) 308-redirects to www, and
// many email clients — Gmail's image proxy in particular — do NOT follow
// redirects on <img src>, so an apex image URL renders as broken / alt
// text only. Everything here uses the www host directly.
const SITE = 'https://www.touchdomain.co.za';

export const generateBrandedEmail = (title: string, content: string) => {
  const currentYear = new Date().getFullYear();

  // Email clients need an absolute, publicly reachable URL (no local/relative
  // paths), and the header band is dark purple so the logo must be white.
  // If APP_LOGO_URL is set it must also be a www / non-redirecting URL.
  const logoUrl = process.env.APP_LOGO_URL || `${SITE}/branding/touch-domain-logo-white.png`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f7; padding: 40px 0;">
          <tr>
              <td align="center">
                  <!-- Main Email Container -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

                      <!-- ─── HEADER ─── -->
                      <tr>
                          <td align="center" style="background-color: #452c63; padding: 30px 20px;">
                              <a href="${SITE}" target="_blank" style="text-decoration: none;">
                                  <img src="${logoUrl}" alt="Touch Domain" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
                              </a>
                          </td>
                      </tr>

                      <!-- ─── BODY CONTENT ─── -->
                      <tr>
                          <td style="padding: 40px 40px 30px 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                              <h2 style="color: #452c63; margin-top: 0; font-size: 24px; font-weight: bold;">${title}</h2>
                              ${content}
                          </td>
                      </tr>

                      <!-- ─── FOOTER / SIGNATURE ─── -->
                      <tr>
                          <td style="background-color: #ffffff; padding: 28px 40px 32px 40px; border-top: 1px solid #eeeeee;">
                              <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">
                                <tr>
                                  <td style="padding-right:16px;border-right:2px solid #9972ab;" valign="middle" width="56">
                                    <img src="${SITE}/branding/email/signature-mark.png" width="40" height="43" alt="Touch Domain" style="display:block;border:0;">
                                  </td>
                                  <td style="padding-left:16px;" valign="middle">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#452c63;padding-bottom:2px;">Your Helper</td></tr>
                                      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:#2a1b3d;line-height:1.7;">
                                        <a href="tel:+27813276153" style="color:#2a1b3d;text-decoration:none;">+27 81 327 6153</a><br>
                                        <a href="mailto:${CUSTOMER_CONTACT_EMAIL}" style="color:#2a1b3d;text-decoration:none;">${CUSTOMER_CONTACT_EMAIL}</a><br>
                                        <a href="${SITE}" style="color:#9972ab;text-decoration:none;">www.touchdomain.co.za</a>
                                      </td></tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="padding-top:14px;">
                                    <a href="${SITE}/quote" style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;font-weight:bold;letter-spacing:.03em;color:#ffffff;background-color:#452c63;padding:8px 16px;border-radius:4px;text-decoration:none;display:inline-block;">GET A FREE QUOTE &rarr;</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="padding-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:10.5px;letter-spacing:.05em;">
                                    <a href="https://web.facebook.com/profile.php?id=61592261381746" style="color:#9972ab;text-decoration:none;">FACEBOOK</a>
                                    <span style="color:#d9d0e3;">&nbsp;&middot;&nbsp;</span>
                                    <a href="https://www.instagram.com/touchdomain/" style="color:#9972ab;text-decoration:none;">INSTAGRAM</a>
                                    <span style="color:#d9d0e3;">&nbsp;&middot;&nbsp;</span>
                                    <a href="https://www.linkedin.com/company/touchdomain/" style="color:#9972ab;text-decoration:none;">LINKEDIN</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#b8adc6;">
                                    &copy; ${currentYear} TOUCHDOMAIN (Pty) Ltd &nbsp;&middot;&nbsp; 96 Makgathe Street, Ipelegeng, Schweizer-Reneke, 2780
                                  </td>
                                </tr>
                              </table>
                          </td>
                      </tr>

                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};
