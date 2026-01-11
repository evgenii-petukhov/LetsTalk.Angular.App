import 'zone.js';
import 'zone.js/testing';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
);

// Mock browser APIs that are not available in jsdom
Object.defineProperty(window, 'Notification', {
    value: class MockNotification {
        static permission = 'granted';
        static requestPermission = vi.fn().mockResolvedValue('granted');
        constructor(_title: string, _options?: NotificationOptions) {
            // Mock notification constructor
        }
    },
    writable: true,
});

Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [],
            getVideoTracks: () => [],
            getAudioTracks: () => [],
        }),
    },
    writable: true,
});

// Enhanced RTCPeerConnection mock for better test compatibility
Object.defineProperty(window, 'RTCPeerConnection', {
    value: class MockRTCPeerConnection {
        localDescription = null;
        remoteDescription = null;
        signalingState = 'stable';
        connectionState = 'new';

        setConfiguration = vi.fn();
        createOffer = vi.fn().mockResolvedValue({});
        createAnswer = vi.fn().mockResolvedValue({});
        setLocalDescription = vi.fn().mockResolvedValue(undefined);
        setRemoteDescription = vi.fn().mockResolvedValue(undefined);
        addIceCandidate = vi.fn().mockResolvedValue(undefined);
        addTrack = vi.fn();
        close = vi.fn();

        onicecandidate = null;
        ontrack = null;
        onconnectionstatechange = null;

        addEventListener = vi.fn();
        removeEventListener = vi.fn();

        constructor() {
            // Mock constructor
        }

        static generateCertificate = vi.fn();
    },
    writable: true,
});

// Also set it as a global for direct access
global.RTCPeerConnection = window.RTCPeerConnection;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    },
    writable: true,
});

// Mock Blob with arrayBuffer method and proper _buffer property
global.Blob = class MockBlob {
    _buffer: ArrayBuffer;

    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        // Create a proper ArrayBuffer for the mock
        this._buffer = new ArrayBuffer(8);
        if (parts && parts.length > 0) {
            // Simulate content based on parts
            const totalLength = parts.reduce((acc, part) => {
                if (typeof part === 'string') return acc + part.length;
                if (part instanceof ArrayBuffer) return acc + part.byteLength;
                return acc + 8; // default size
            }, 0);
            this._buffer = new ArrayBuffer(totalLength);
        }
    }

    arrayBuffer(): Promise<ArrayBuffer> {
        return Promise.resolve(this._buffer);
    }

    slice(): Blob {
        return new MockBlob();
    }

    stream(): ReadableStream {
        return new ReadableStream();
    }

    text(): Promise<string> {
        return Promise.resolve('');
    }
} as any;

// Mock File with arrayBuffer method
global.File = class MockFile extends global.Blob {
    name: string;
    lastModified: number;

    constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
        super(parts, options);
        this.name = name;
        this.lastModified = Date.now();
    }
} as any;

// Mock Image constructor to prevent infinite recursion
Object.defineProperty(window, 'Image', {
    value: class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 0;
        height = 0;

        constructor() {
            // Prevent infinite recursion by not calling new Image() here
            setTimeout(() => {
                if (this.onload) this.onload();
            }, 0);
        }

        addEventListener(event: string, handler: () => void) {
            if (event === 'load') {
                this.onload = handler;
                // Trigger load event asynchronously
                setTimeout(() => handler(), 0);
            }
        }

        dispatchEvent(event: Event) {
            if (event.type === 'load' && this.onload) {
                this.onload();
            }
            return true;
        }
    },
    writable: true,
});

// Mock URL constructor and static methods
Object.defineProperty(window, 'URL', {
    value: class MockURL {
        href: string;

        constructor(url: string, base?: string) {
            this.href = url;
        }

        static createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
        static revokeObjectURL = vi.fn();
    },
    writable: true,
});

// Also set the static methods directly on the constructor
(window.URL as any).createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
(window.URL as any).revokeObjectURL = vi.fn();

// Enhanced DOM element mocking
const createMockElement = (tagName: string) => {
    const element = {
        tagName: tagName.toUpperCase(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        hasAttribute: vi.fn().mockReturnValue(false),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn().mockReturnValue([]),
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn().mockReturnValue(false),
            toggle: vi.fn(),
        },
        parentNode: null,
        children: [],
        childNodes: [],
        firstChild: null,
        lastChild: null,
        nextSibling: null,
        previousSibling: null,
        ownerDocument: document,
        nodeType: 1,
        nodeName: tagName.toUpperCase(),
    };

    // Add specific properties for different element types
    if (tagName === 'img') {
        Object.assign(element, {
            width: 300,
            height: 200,
            src: '',
            onload: null,
            onerror: null,
            addEventListener: vi.fn((event: string, handler: () => void) => {
                if (event === 'load') {
                    setTimeout(() => handler(), 0);
                }
            }),
        });
    }

    return element;
};

// Mock document.createElement for all elements
const originalCreateElement = document.createElement;
document.createElement = function (tagName: string) {
    try {
        const element = originalCreateElement.call(this, tagName);

        // Ensure setAttribute exists on all elements
        if (!element.setAttribute) {
            element.setAttribute = vi.fn();
        }
        if (!element.getAttribute) {
            element.getAttribute = vi.fn();
        }
        if (!element.removeAttribute) {
            element.removeAttribute = vi.fn();
        }

        return element;
    } catch (error) {
        // Fallback to mock element if native creation fails
        return createMockElement(tagName) as any;
    }
};
