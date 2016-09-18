'use strict';

const Builder = require('systemjs-builder');

let builder = new Builder({
  paths: {
    'npm:': 'node_modules/'
  },
  map: {
    fbemitter: 'npm:fbemitter',
    fbjs: 'npm:fbjs',
    lib: 'lib'
  },
  packages: {
    fbemitter: {
      main: 'index.js',
      defaultExtension: 'js'
    },
    fbjs: {
      main: 'index.js',
      defaultExtension: 'js'
    },
    lib: {
      defaultExtension: 'js'
    }
  }
});

builder
  .buildStatic('lib/*.js', 'dist/flux-lite.js', {
    runtime: false,
    globalName: 'fluxLite'
  })
  .then(() => console.log('Build complete'))
  .catch(err => console.error(err));

builder
  .buildStatic('lib/*.js', 'dist/flux-lite.min.js', {
    runtime: false,
    globalName: 'fluxLite',
    minify: true
  })
  .then(() => console.log('Minified build complete'))
  .catch(err => console.error(err));
