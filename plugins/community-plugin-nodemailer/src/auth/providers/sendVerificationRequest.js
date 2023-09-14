import { createTransport } from 'nodemailer';

import html from './templates/html.js';
import subject from './templates/subject.js';
import text from './templates/text.js';

async function sendVerificationRequest({ identifier, url, provider, theme }) {
  let returnUrl = url;
  const parsedUrl = new URL(url);
  const { host } = parsedUrl;
  if (provider.returnPageId) {
    parsedUrl.pathname = `/${provider.returnPageId}`;
    returnUrl = parsedUrl.href;
  }

  const transport = createTransport(provider.server);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: subject({
      template: provider?.templates?.subject,
      host,
      theme,
      templateVariables: provider?.templateVariables ?? {},
    }),
    text: text({
      template: provider?.templates?.text,
      url: returnUrl,
      host,
      theme,
      templateVariables: provider?.templateVariables ?? {},
    }),
    html: html({
      template: provider?.templates?.html,
      url: returnUrl,
      host,
      theme,
      templateVariables: provider?.templateVariables ?? {},
    }),
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
  }
}

export default sendVerificationRequest;
