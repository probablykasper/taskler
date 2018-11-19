// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"icons/safari-pinned-tab.svg":[function(require,module,exports) {
module.exports = `<svg version="1.0" width="1333.333" height="1333.333" viewBox="0 0 1000 1000"><path d="M893.9 66.3c-1.4 2.9-11.2 22-29.4 57.2-4 7.7-12.3 23.9-18.5 36-6.2 12.1-14.8 28.9-19.1 37.2-4.4 8.4-11.5 22.4-16 31-4.5 8.7-8.5 16.2-8.9 16.7-.5.4-52.2.9-115.1 1l-114.2.1-1.7 3c-.9 1.6-3.9 7.3-6.7 12.5-2.7 5.2-7.2 13.5-9.8 18.5-2.6 4.9-6.8 12.8-9.3 17.5-2.4 4.7-5.7 10.7-7.2 13.5-1.5 2.7-5.6 10.4-9 17-3.4 6.6-6.5 12.4-7 13-.4.5-4.2 7.7-8.5 16-4.3 8.2-9.5 18.1-11.7 21.8-2.1 3.8-3.8 7.1-3.8 7.3 0 .3-2.9 5.8-6.3 12.2-3.5 6.4-9 16.6-12.2 22.7-3.2 6-7.2 13.7-9 17-1.8 3.3-5.6 10.5-8.5 16-2.9 5.5-6.5 12.2-8 15-1.5 2.7-5.1 9.5-8 15-2.9 5.5-6.5 12.2-8 15-1.5 2.7-5.3 9.9-8.5 16-3.2 6-8.8 16.6-12.5 23.5-3.7 6.9-9.3 17.4-12.5 23.5-3.2 6-7 13.2-8.5 16-1.5 2.7-5.3 9.9-8.5 16-3.2 6-7 13.2-8.5 16-1.5 2.7-5.6 10.4-9.1 17s-7.8 14.7-9.5 18c-1.8 3.3-5.4 10-7.9 15-2.6 4.9-6 11.2-7.5 14-3.9 7.3-9.5 17.7-20 37.5-5.2 9.6-10.1 18.8-11 20.5l-1.7 3-136.4.2c-75 .1-137.2.2-138.3.3-1.3 0-1.6.3-.9 1.2.6.7 7.7 14.3 15.8 30.3 8.1 15.9 17.8 34.8 21.5 42 3.7 7.1 12 23.3 18.5 36 15 29.4 27.3 53.4 38.8 75.7l9.2 17.8h271.2l1.4-2.8c.7-1.5 2.3-4.3 3.5-6.2 1.1-1.9 3.9-6.9 6.1-11 4.2-7.7 19.1-35 23.5-43 2.2-4 20.3-37 28.5-52 1.7-3 4.1-7.5 5.5-10 1.4-2.5 4.1-7.4 6-11 1.9-3.6 4.6-8.5 6-11 1.4-2.5 5.4-9.7 8.8-16 3.5-6.3 7.5-13.5 9-16s2.7-4.8 2.8-5.3c.1-.4.7-1.5 1.2-2.5 1.6-2.6 52.5-95.4 57.7-105.2 2.5-4.7 8.6-15.6 13.4-24.3 4.9-8.7 8.9-15.9 8.9-16.2 0-.2 1.5-3 3.4-6.2 1.8-3.2 4.9-8.8 7-12.5 2-3.8 5.2-9.8 7.2-13.5 2.1-3.8 4-7.3 4.4-7.8.5-.6 2.8-4.8 5.2-9.5 2.5-4.7 5.4-10.1 6.5-12 1.1-1.9 3.7-6.7 5.8-10.5 2-3.9 4.7-8.8 6-11 1.2-2.2 3.7-6.7 5.5-10 13.4-24.8 31.3-57.2 32-57.9.5-.5 49.8-.9 115-.9h114l1.9-3.1c1-1.7 7.4-13.9 14.1-27.1 6.8-13.2 15.8-30.8 20-39 4.3-8.3 11.9-23.1 17-33 21.7-42.2 29.6-57.7 35.3-68.5l5.9-11.5-3-6c-1.6-3.3-8.1-16.1-14.3-28.5-6.1-12.4-11.7-23.4-12.2-24.5-.6-1.1-1.3-2.7-1.7-3.5-1.7-3.6-44.1-88.2-46.1-92l-13.5-27c-6.9-14-12.9-25.8-13.3-26.2-.4-.5-1.4.7-2.2 2.5zM.5 250.9c-.2.2 3.9 8.7 9.2 19 11.7 22.8 24.9 48.6 37.5 73.1 5.3 10.2 15 29.1 21.6 42 6.6 12.9 17.2 33.6 23.5 46l11.5 22.5 44.5.1 44.5.1 3.5-7.1c2-3.9 8-16.3 13.5-27.6s13.8-28.4 18.5-38c4.7-9.6 12.8-26.3 18-37 5.2-10.7 15-30.8 21.7-44.5 15.7-32 23-47.4 23-48.3 0-.7-289.8-1-290.5-.3z"/></svg>`
},{}]},{},["icons/safari-pinned-tab.svg"], null)