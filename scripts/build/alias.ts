import path from 'path';

const alias = ['lib', 'common'];

export function getEsbuildAlias() {
  return alias.reduce((acc, cur) => {
    acc[`@${cur}`] = `./${cur}`;
    return acc;
  }, {});
}

export function getViteAlias() {
  const outDir = alias.reduce((acc, cur) => {
    acc[`@@${cur}`] = path.resolve(__dirname, `../../${cur}`);
    return acc;
  }, {});
  const inner = {
    '@/': './src',
  };
  return {
    ...outDir,
    ...inner,
  };
}
