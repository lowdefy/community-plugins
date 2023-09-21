import { nunjucksFunction } from '@lowdefy/nunjucks';

const defaultTemplate = `
Click to sign in to {{ templateVariables.appName or host }}
[{{ url }}]

If you did not request this email you can safely ignore it.

Made with Lowdefy[https://lowdefy.com]`;

function text({ host, template, templateVariables, theme, url }) {
  return nunjucksFunction(defaultTemplate ?? template)({
    host,
    templateVariables,
    theme,
    url,
  });
}

export default text;
