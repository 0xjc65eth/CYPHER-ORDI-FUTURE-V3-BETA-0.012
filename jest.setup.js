import '@testing-library/jest-dom'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:4444'

// Mock global objects
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this)
  }
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = () => null

// Mock crypto for BigInt operations
global.crypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  },
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1
    setTimeout(() => {
      if (this.onopen) this.onopen()
    }, 100)
  }
  send() {}
  close() {}
}

// Mock speech recognition
global.webkitSpeechRecognition = class SpeechRecognition {
  constructor() {
    this.continuous = false
    this.interimResults = false
    this.lang = 'en-US'
  }
  start() {}
  stop() {}
  abort() {}
}

// Suppress console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  const warningText = args[0]
  // Suppress specific warnings
  if (
    typeof warningText === 'string' &&
    (warningText.includes('Warning: ReactDOM.render') ||
     warningText.includes('Warning: componentWillReceiveProps') ||
     warningText.includes('BigInt serialization'))
  ) {
    return
  }
  originalWarn(...args)
}

// BigInt serialization fix for tests
global.BigInt.prototype.toJSON = function() {
  return this.toString()
}