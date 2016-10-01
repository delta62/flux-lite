'use strict';

const Builder = require('systemjs-builder');

let builder = new Builder({
  transpiler: "typescript",
  map: {
    lib: 'lib'
  },
  meta: {
    lib: {
      format: 'esm',
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
    globalName: 'FluxLite',
    globalDeps: {
      eventemitter3: 'EventEmitter'
    },
    deps: [ 'eventemitter3' ]
  })
  .then(() => console.log('Build complete'))
  .catch(err => console.error(err));

builder
  .buildStatic('index.js', 'dist/flux-lite.umd.min.js', {
    globalName: 'FluxLite',
    globalDeps: {
      eventemitter3: 'EventEmitter'
    },
    deps: [ 'eventemitter3' ],
    minify: true
  })
  .then(() => console.log('Minified build complete'))
  .catch(err => console.error(err));
