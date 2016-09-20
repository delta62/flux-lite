'use strict';

const Builder = require('systemjs-builder');

let builder = new Builder({
  paths: {
    'npm:': 'node_modules/'
  },
  map: {
    lib: 'lib',
    eventemitter3: 'npm:eventemitter3'
  },
  meta: {
    lib: {
      format: 'cjs',
      deps: [ 'eventemitter3' ]
    },
    eventemitter3: {
      format: 'cjs'
    }
  },
  packages: {
    lib: {
      defaultExtension: 'js'
    },
    eventemitter3: {
      main: 'index.js',
      defaultExtension: 'js'
    }
  }
});

builder
  .buildStatic('index.js', 'dist/flux-lite.umd.js', {
    globalName: 'fluxLite'
  })
  .then(() => console.log('Build complete'))
  .catch(err => console.error(err));

builder
  .buildStatic('index.js', 'dist/flux-lite.umd.min.js', {
    globalName: 'fluxLite',
    minify: true
  })
  .then(() => console.log('Minified build complete'))
  .catch(err => console.error(err));
