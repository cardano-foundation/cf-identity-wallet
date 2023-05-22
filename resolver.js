// Jest Resolver

module.exports = (path, options) => {
  // Required to get cardano-js-sdk to run with Jest as Nanoid is ESM-only (Jest doesn't support ESM yet).
  return options.defaultResolver(path, {
    ...options,
    packageFilter: pkg => {
      if (pkg.name === "nanoid") {
          delete pkg["exports"];
          delete pkg["module"];
      }
      return pkg;
    },
  });
};
