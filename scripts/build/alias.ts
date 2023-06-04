import path from 'path';

const alias = ['lib', 'common'];

export function getEsbuildAlias() {
  return alias.reduce((acc, cur) => {
    acc[`@${cur}`] = `./${cur}`;
    return acc;
  }, {});
}

export function getViteAlias() {
  return alias.reduce((acc, cur) => {
    acc[`@@${cur}`] = path.resolve(__dirname, `../../${cur}`);
    return acc;
  }, {});
}
