'use strict';

const Builder = require('systemjs-builder');

let builder = new Builder({
  paths: {
    'npm:': 'node_modules/'
  },
  map: {
    lib: 'lib',
    eventemitter3: 'npm:eventemitter3/index.js',
    'es6-error': 'npm:es6-error/lib/index.js'
  },
  meta: {
    lib: {
      format: 'esm',
    },
    eventemitter3: {
      format: 'cjs'
    },
    'es6-error': {
      format: 'cjs'
    }
  },
  packages: {
    lib: {
      defaultExtension: 'js'
    }
  }
});

builder
  .buildStatic('index.js', 'dist/flux-lite.umd.js', {
    globalName: 'FluxLite'
  })
  .then(() => console.log('Build complete'))
  .catch(err => console.error(err));

builder
  .buildStatic('index.js', 'dist/flux-lite.umd.min.js', {
    globalName: 'FluxLite',
    minify: true
  })
  .then(() => console.log('Minified build complete'))
  .catch(err => console.error(err));
