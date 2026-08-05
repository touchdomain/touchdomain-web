export const generateBrandedEmail = (title: string, content: string) => {
  const currentYear = new Date().getFullYear();
  
  // Falls back to the live deployed logo if APP_LOGO_URL isn't set — email clients
  // need an absolute, publicly reachable URL (they can't load local/relative paths).
  const logoUrl = process.env.APP_LOGO_URL || 'https://touchdomain.co.za/branding/logo-nav.png';

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
                              <a href="https://touchdomain.co.za" target="_blank" style="text-decoration: none;">
                                  <img src="${logoUrl}" alt="Touch Domain Logo" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
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

                      <!-- ─── FOOTER ─── -->
                      <tr>
                          <td style="background-color: #f9f9f9; padding: 30px 40px; border-top: 1px solid #eeeeee; text-align: center;">
                              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                                  Touch Domain
                              </p>
                              <p style="margin: 0 0 15px 0; font-size: 13px; color: #9972ab;">
                                  Crafting Brands. Engineering Digital Experiences.
                              </p>
                              <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
                                  <a href="https://touchdomain.co.za" style="color: #9972ab; text-decoration: none;">touchdomain.co.za</a> 
                                  &nbsp;|&nbsp; 
                                  <a href="mailto:helper@touchdomain.co.za" style="color: #9972ab; text-decoration: none;">helper@touchdomain.co.za</a>
                              </p>
                              <p style="margin: 15px 0 0 0; font-size: 11px; color: #cccccc;">
                                  &copy; ${currentYear} Touch Domain. All rights reserved.
                              </p>
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