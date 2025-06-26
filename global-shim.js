// Fix for "self is not defined" error in SSR builds
if (typeof self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof document === 'undefined') {
  global.document = {};
}

module.exports = {};