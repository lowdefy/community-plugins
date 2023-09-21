import { nunjucksFunction } from '@lowdefy/nunjucks';

const defaultTemplate = 'Sign in to {{ templateVariables.appName or host }}';

function subject({ host, template, templateVariables, theme }) {
  return nunjucksFunction(defaultTemplate ?? template)({
    host,
    templateVariables,
    theme,
  });
}

export default subject;
