/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "ZUp1");
/******/ })
/************************************************************************/
/******/ ({

/***/ "URDS":
/***/ (function(module, exports, __webpack_require__) {

/*!
Copyright (c) 2014 Taylor Hakes
Copyright (c) 2014 Forbes Lindesay
 */
(function (global, factory) {
	 true ? factory() :
		undefined;
}(this, (function () {
	'use strict';

	/**
	 * @this {Promise}
	 */
	function finallyConstructor(callback) {
		var constructor = this.constructor;
		return this.then(
			function (value) {
				return constructor.resolve(callback()).then(function () {
					return value;
				});
			},
			function (reason) {
				return constructor.resolve(callback()).then(function () {
					return constructor.reject(reason);
				});
			}
		);
	}

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function noop() { }

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function () {
			fn.apply(thisArg, arguments);
		};
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	function Promise(fn) {
		if (!(this instanceof Promise))
			throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		/** @type {!number} */
		this._state = 0;
		/** @type {!boolean} */
		this._handled = false;
		/** @type {Promise|undefined} */
		this._value = undefined;
		/** @type {!Array<!Function>} */
		this._deferreds = [];

		doResolve(fn, this);
	}

	function handle(self, deferred) {
		while (self._state === 3) {
			self = self._value;
		}
		if (self._state === 0) {
			self._deferreds.push(deferred);
			return;
		}
		self._handled = true;
		Promise._immediateFn(function () {
			var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
			if (cb === null) {
				(self._state === 1 ? resolve : reject)(deferred.promise, self._value);
				return;
			}
			var ret;
			try {
				ret = cb(self._value);
			} catch (e) {
				reject(deferred.promise, e);
				return;
			}
			resolve(deferred.promise, ret);
		});
	}

	function resolve(self, newValue) {
		try {
			// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === self)
				throw new TypeError('A promise cannot be resolved with itself.');
			if (
				newValue &&
				(typeof newValue === 'object' || typeof newValue === 'function')
			) {
				var then = newValue.then;
				if (newValue instanceof Promise) {
					self._state = 3;
					self._value = newValue;
					finale(self);
					return;
				} else if (typeof then === 'function') {
					doResolve(bind(then, newValue), self);
					return;
				}
			}
			self._state = 1;
			self._value = newValue;
			finale(self);
		} catch (e) {
			reject(self, e);
		}
	}

	function reject(self, newValue) {
		self._state = 2;
		self._value = newValue;
		finale(self);
	}

	function finale(self) {
		if (self._state === 2 && self._deferreds.length === 0) {
			Promise._immediateFn(function () {
				if (!self._handled) {
					Promise._unhandledRejectionFn(self._value);
				}
			});
		}

		for (var i = 0, len = self._deferreds.length; i < len; i++) {
			handle(self, self._deferreds[i]);
		}
		self._deferreds = null;
	}

	/**
	 * @constructor
	 */
	function Handler(onFulfilled, onRejected, promise) {
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
		var done = false;
		try {
			fn(
				function (value) {
					if (done) return;
					done = true;
					resolve(self, value);
				},
				function (reason) {
					if (done) return;
					done = true;
					reject(self, reason);
				}
			);
		} catch (ex) {
			if (done) return;
			done = true;
			reject(self, ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function (onFulfilled, onRejected) {
		// @ts-ignore
		var prom = new this.constructor(noop);

		handle(this, new Handler(onFulfilled, onRejected, prom));
		return prom;
	};

	Promise.prototype['finally'] = finallyConstructor;

	Promise.all = function (arr) {
		return new Promise(function (resolve, reject) {
			if (!arr || typeof arr.length === 'undefined')
				throw new TypeError('Promise.all accepts an array');
			var args = Array.prototype.slice.call(arr);
			if (args.length === 0) return resolve([]);
			var remaining = args.length;

			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(
								val,
								function (val) {
									res(i, val);
								},
								reject
							);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}

			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for (var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	// Use polyfill for setImmediate for performance gains
	Promise._immediateFn =
		(typeof setImmediate === 'function' &&
			function (fn) {
				setImmediate(fn);
			}) ||
		function (fn) {
			setTimeoutFunc(fn, 0);
		};

	Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
		if (typeof console !== 'undefined' && console) {
			console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
		}
	};

	/** @suppress {undefinedVars} */
	var globalNS = (function () {
		// the only reliable means to get the global object is
		// `Function('return this')()`
		// However, this causes CSP violations in Chrome apps.
		if (typeof self !== 'undefined') {
			return self;
		}
		if (typeof window !== 'undefined') {
			return window;
		}
		if (typeof global !== 'undefined') {
			return global;
		}
		throw new Error('unable to locate global object');
	})();

	if (!('Promise' in globalNS)) {
		globalNS['Promise'] = Promise;
	} else if (!globalNS.Promise.prototype['finally']) {
		globalNS.Promise.prototype['finally'] = finallyConstructor;
	}

})));


/***/ }),

/***/ "ZUp1":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/errors.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
        this.listeners = [];
        this.unexpectedErrorHandler = function (e) {
            setTimeout(function () {
                if (e.stack) {
                    throw new Error(e.message + '\n\n' + e.stack);
                }
                throw e;
            }, 0);
        };
    }
    ErrorHandler.prototype.emit = function (e) {
        this.listeners.forEach(function (listener) {
            listener(e);
        });
    };
    ErrorHandler.prototype.onUnexpectedError = function (e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
    };
    // For external errors, we don't want the listeners to be called
    ErrorHandler.prototype.onUnexpectedExternalError = function (e) {
        this.unexpectedErrorHandler(e);
    };
    return ErrorHandler;
}());

var errorHandler = new ErrorHandler();
function onUnexpectedError(e) {
    // ignore errors from cancelled promises
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}
function onUnexpectedExternalError(e) {
    // ignore errors from cancelled promises
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedExternalError(e);
    }
    return undefined;
}
function transformErrorForSerialization(error) {
    if (error instanceof Error) {
        var name_1 = error.name, message = error.message;
        var stack = error.stacktrace || error.stack;
        return {
            $isError: true,
            name: name_1,
            message: message,
            stack: stack
        };
    }
    // return as is
    return error;
}
var canceledName = 'Canceled';
/**
 * Checks if the given error is a promise in canceled state
 */
function isPromiseCanceledError(error) {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
/**
 * Returns an error that signals cancellation.
 */
function canceled() {
    var error = new Error(canceledName);
    error.name = error.message;
    return error;
}
function illegalArgument(name) {
    if (name) {
        return new Error("Illegal argument: " + name);
    }
    else {
        return new Error('Illegal argument');
    }
}
function illegalState(name) {
    if (name) {
        return new Error("Illegal state: " + name);
    }
    else {
        return new Error('Illegal state');
    }
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/lifecycle.js
function isDisposable(thing) {
    return typeof thing.dispose === 'function'
        && thing.dispose.length === 0;
}
function lifecycle_dispose(first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    if (Array.isArray(first)) {
        first.forEach(function (d) { return d && d.dispose(); });
        return [];
    }
    else if (rest.length === 0) {
        if (first) {
            first.dispose();
            return first;
        }
        return undefined;
    }
    else {
        lifecycle_dispose(first);
        lifecycle_dispose(rest);
        return [];
    }
}
function combinedDisposable(disposables) {
    return { dispose: function () { return lifecycle_dispose(disposables); } };
}
function toDisposable(fn) {
    return { dispose: function () { fn(); } };
}
var Disposable = /** @class */ (function () {
    function Disposable() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    Disposable.prototype.dispose = function () {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = lifecycle_dispose(this._toDispose);
    };
    Disposable.prototype._register = function (t) {
        if (this._lifecycle_disposable_isDisposed) {
            console.warn('Registering disposable on object that has already been disposed.');
            t.dispose();
        }
        else {
            this._toDispose.push(t);
        }
        return t;
    };
    Disposable.None = Object.freeze({ dispose: function () { } });
    return Disposable;
}());

var ImmortalReference = /** @class */ (function () {
    function ImmortalReference(object) {
        this.object = object;
    }
    ImmortalReference.prototype.dispose = function () { };
    return ImmortalReference;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/platform.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var LANGUAGE_DEFAULT = 'en';
var _isWindows = false;
var _isMacintosh = false;
var _isLinux = false;
var _isNative = false;
var _isWeb = false;
var _locale = undefined;
var _language = LANGUAGE_DEFAULT;
var _translationsConfigFile = undefined;
var isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');
// OS detection
if (typeof navigator === 'object' && !isElectronRenderer) {
    var userAgent = navigator.userAgent;
    _isWindows = userAgent.indexOf('Windows') >= 0;
    _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
    _isLinux = userAgent.indexOf('Linux') >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
}
else if (typeof process === 'object') {
    _isWindows = (process.platform === 'win32');
    _isMacintosh = (process.platform === 'darwin');
    _isLinux = (process.platform === 'linux');
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    var rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            var nlsConfig = JSON.parse(rawNlsConfig);
            var resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            // VSCode's default language is 'en'
            _language = resolved ? resolved : LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig._translationsConfigFile;
        }
        catch (e) {
        }
    }
    _isNative = true;
}
var _platform = 0 /* Web */;
if (_isNative) {
    if (_isMacintosh) {
        _platform = 1 /* Mac */;
    }
    else if (_isWindows) {
        _platform = 3 /* Windows */;
    }
    else if (_isLinux) {
        _platform = 2 /* Linux */;
    }
}
var isWindows = _isWindows;
var isMacintosh = _isMacintosh;
var isLinux = _isLinux;
var isNative = _isNative;
var isWeb = _isWeb;
var _globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
var globals = _globals;
var _setImmediate = null;
function setImmediate(callback) {
    if (_setImmediate === null) {
        if (globals.setImmediate) {
            _setImmediate = globals.setImmediate.bind(globals);
        }
        else if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
            _setImmediate = process.nextTick.bind(process);
        }
        else {
            _setImmediate = globals.setTimeout.bind(globals);
        }
    }
    return _setImmediate(callback);
}
var OS = (_isMacintosh ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/types.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var _typeof = {
    number: 'number',
    string: 'string',
    undefined: 'undefined',
    object: 'object',
    function: 'function'
};
/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
function isArray(array) {
    if (Array.isArray) {
        return Array.isArray(array);
    }
    if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
        return true;
    }
    return false;
}
/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
function isString(str) {
    if (typeof (str) === _typeof.string || str instanceof String) {
        return true;
    }
    return false;
}
/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
function isObject(obj) {
    // The method can't do a type cast since there are type (like strings) which
    // are subclasses of any put not positvely matched by the function. Hence type
    // narrowing results in wrong results.
    return typeof obj === _typeof.object
        && obj !== null
        && !Array.isArray(obj)
        && !(obj instanceof RegExp)
        && !(obj instanceof Date);
}
/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
function isNumber(obj) {
    if ((typeof (obj) === _typeof.number || obj instanceof Number) && !isNaN(obj)) {
        return true;
    }
    return false;
}
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
function isBoolean(obj) {
    return obj === true || obj === false;
}
/**
 * @returns whether the provided parameter is undefined.
 */
function isUndefined(obj) {
    return typeof (obj) === _typeof.undefined;
}
/**
 * @returns whether the provided parameter is undefined or null.
 */
function isUndefinedOrNull(obj) {
    return isUndefined(obj) || obj === null;
}
var types_hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * @returns whether the provided parameter is an empty JavaScript Object or not.
 */
function isEmptyObject(obj) {
    if (!isObject(obj)) {
        return false;
    }
    for (var key in obj) {
        if (types_hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
/**
 * @returns whether the provided parameter is a JavaScript Function or not.
 */
function isFunction(obj) {
    return typeof obj === _typeof.function;
}
function validateConstraints(args, constraints) {
    var len = Math.min(args.length, constraints.length);
    for (var i = 0; i < len; i++) {
        validateConstraint(args[i], constraints[i]);
    }
}
function validateConstraint(arg, constraint) {
    if (isString(constraint)) {
        if (typeof arg !== constraint) {
            throw new Error("argument does not match constraint: typeof " + constraint);
        }
    }
    else if (isFunction(constraint)) {
        try {
            if (arg instanceof constraint) {
                return;
            }
        }
        catch (_a) {
            // ignore
        }
        if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
            return;
        }
        if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
            return;
        }
        throw new Error("argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true");
    }
}
function getAllPropertyNames(obj) {
    var res = [];
    var proto = Object.getPrototypeOf(obj);
    while (Object.prototype !== proto) {
        res = res.concat(Object.getOwnPropertyNames(proto));
        proto = Object.getPrototypeOf(proto);
    }
    return res;
}
/**
 * Converts null to undefined, passes all other values through.
 */
function withNullAsUndefined(x) {
    return x === null ? undefined : x;
}
/**
 * Converts undefined to null, passes all other values through.
 */
function withUndefinedAsNull(x) {
    return typeof x === 'undefined' ? null : x;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/worker/simpleWorker.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var INITIALIZE = '$initialize';
var webWorkerWarningLogged = false;
function logOnceWebWorkerWarning(err) {
    if (!isWeb) {
        // running tests
        return;
    }
    if (!webWorkerWarningLogged) {
        webWorkerWarningLogged = true;
        console.warn('Could not create web worker(s). Falling back to loading web worker code in main thread, which might cause UI freezes. Please see https://github.com/Microsoft/monaco-editor#faq');
    }
    console.warn(err.message);
}
var simpleWorker_SimpleWorkerProtocol = /** @class */ (function () {
    function SimpleWorkerProtocol(handler) {
        this._workerId = -1;
        this._handler = handler;
        this._lastSentReq = 0;
        this._pendingReplies = Object.create(null);
    }
    SimpleWorkerProtocol.prototype.setWorkerId = function (workerId) {
        this._workerId = workerId;
    };
    SimpleWorkerProtocol.prototype.sendMessage = function (method, args) {
        var _this = this;
        var req = String(++this._lastSentReq);
        return new Promise(function (resolve, reject) {
            _this._pendingReplies[req] = {
                resolve: resolve,
                reject: reject
            };
            _this._send({
                vsWorker: _this._workerId,
                req: req,
                method: method,
                args: args
            });
        });
    };
    SimpleWorkerProtocol.prototype.handleMessage = function (serializedMessage) {
        var message;
        try {
            message = JSON.parse(serializedMessage);
        }
        catch (e) {
            // nothing
            return;
        }
        if (!message || !message.vsWorker) {
            return;
        }
        if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
            return;
        }
        this._handleMessage(message);
    };
    SimpleWorkerProtocol.prototype._handleMessage = function (msg) {
        var _this = this;
        if (msg.seq) {
            var replyMessage = msg;
            if (!this._pendingReplies[replyMessage.seq]) {
                console.warn('Got reply to unknown seq');
                return;
            }
            var reply = this._pendingReplies[replyMessage.seq];
            delete this._pendingReplies[replyMessage.seq];
            if (replyMessage.err) {
                var err = replyMessage.err;
                if (replyMessage.err.$isError) {
                    err = new Error();
                    err.name = replyMessage.err.name;
                    err.message = replyMessage.err.message;
                    err.stack = replyMessage.err.stack;
                }
                reply.reject(err);
                return;
            }
            reply.resolve(replyMessage.res);
            return;
        }
        var requestMessage = msg;
        var req = requestMessage.req;
        var result = this._handler.handleMessage(requestMessage.method, requestMessage.args);
        result.then(function (r) {
            _this._send({
                vsWorker: _this._workerId,
                seq: req,
                res: r,
                err: undefined
            });
        }, function (e) {
            if (e.detail instanceof Error) {
                // Loading errors have a detail property that points to the actual error
                e.detail = transformErrorForSerialization(e.detail);
            }
            _this._send({
                vsWorker: _this._workerId,
                seq: req,
                res: undefined,
                err: transformErrorForSerialization(e)
            });
        });
    };
    SimpleWorkerProtocol.prototype._send = function (msg) {
        var strMsg = JSON.stringify(msg);
        // console.log('SENDING: ' + strMsg);
        this._handler.sendMessage(strMsg);
    };
    return SimpleWorkerProtocol;
}());
/**
 * Main thread side
 */
var SimpleWorkerClient = /** @class */ (function (_super) {
    __extends(SimpleWorkerClient, _super);
    function SimpleWorkerClient(workerFactory, moduleId) {
        var _this = _super.call(this) || this;
        var lazyProxyReject = null;
        _this._worker = _this._register(workerFactory.create('vs/base/common/worker/simpleWorker', function (msg) {
            _this._protocol.handleMessage(msg);
        }, function (err) {
            // in Firefox, web workers fail lazily :(
            // we will reject the proxy
            if (lazyProxyReject) {
                lazyProxyReject(err);
            }
        }));
        _this._protocol = new simpleWorker_SimpleWorkerProtocol({
            sendMessage: function (msg) {
                _this._worker.postMessage(msg);
            },
            handleMessage: function (method, args) {
                // Intentionally not supporting worker -> main requests
                return Promise.resolve(null);
            }
        });
        _this._protocol.setWorkerId(_this._worker.getId());
        // Gather loader configuration
        var loaderConfiguration = null;
        if (typeof self.require !== 'undefined' && typeof self.require.getConfig === 'function') {
            // Get the configuration from the Monaco AMD Loader
            loaderConfiguration = self.require.getConfig();
        }
        else if (typeof self.requirejs !== 'undefined') {
            // Get the configuration from requirejs
            loaderConfiguration = self.requirejs.s.contexts._.config;
        }
        // Send initialize message
        _this._onModuleLoaded = _this._protocol.sendMessage(INITIALIZE, [
            _this._worker.getId(),
            moduleId,
            loaderConfiguration
        ]);
        _this._lazyProxy = new Promise(function (resolve, reject) {
            lazyProxyReject = reject;
            _this._onModuleLoaded.then(function (availableMethods) {
                var proxy = {};
                for (var _i = 0, availableMethods_1 = availableMethods; _i < availableMethods_1.length; _i++) {
                    var methodName = availableMethods_1[_i];
                    proxy[methodName] = createProxyMethod(methodName, proxyMethodRequest);
                }
                resolve(proxy);
            }, function (e) {
                reject(e);
                _this._onError('Worker failed to load ' + moduleId, e);
            });
        });
        // Create proxy to loaded code
        var proxyMethodRequest = function (method, args) {
            return _this._request(method, args);
        };
        var createProxyMethod = function (method, proxyMethodRequest) {
            return function () {
                var args = Array.prototype.slice.call(arguments, 0);
                return proxyMethodRequest(method, args);
            };
        };
        return _this;
    }
    SimpleWorkerClient.prototype.getProxyObject = function () {
        return this._lazyProxy;
    };
    SimpleWorkerClient.prototype._request = function (method, args) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._onModuleLoaded.then(function () {
                _this._protocol.sendMessage(method, args).then(resolve, reject);
            }, reject);
        });
    };
    SimpleWorkerClient.prototype._onError = function (message, error) {
        console.error(message);
        console.info(error);
    };
    return SimpleWorkerClient;
}(Disposable));

/**
 * Worker side
 */
var simpleWorker_SimpleWorkerServer = /** @class */ (function () {
    function SimpleWorkerServer(postSerializedMessage, requestHandler) {
        var _this = this;
        this._requestHandler = requestHandler;
        this._protocol = new simpleWorker_SimpleWorkerProtocol({
            sendMessage: function (msg) {
                postSerializedMessage(msg);
            },
            handleMessage: function (method, args) { return _this._handleMessage(method, args); }
        });
    }
    SimpleWorkerServer.prototype.onmessage = function (msg) {
        this._protocol.handleMessage(msg);
    };
    SimpleWorkerServer.prototype._handleMessage = function (method, args) {
        if (method === INITIALIZE) {
            return this.initialize(args[0], args[1], args[2]);
        }
        if (!this._requestHandler || typeof this._requestHandler[method] !== 'function') {
            return Promise.reject(new Error('Missing requestHandler or method: ' + method));
        }
        try {
            return Promise.resolve(this._requestHandler[method].apply(this._requestHandler, args));
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
    SimpleWorkerServer.prototype.initialize = function (workerId, moduleId, loaderConfig) {
        var _this = this;
        this._protocol.setWorkerId(workerId);
        if (this._requestHandler) {
            // static request handler
            var methods = [];
            for (var _i = 0, _a = getAllPropertyNames(this._requestHandler); _i < _a.length; _i++) {
                var prop = _a[_i];
                if (typeof this._requestHandler[prop] === 'function') {
                    methods.push(prop);
                }
            }
            return Promise.resolve(methods);
        }
        if (loaderConfig) {
            // Remove 'baseUrl', handling it is beyond scope for now
            if (typeof loaderConfig.baseUrl !== 'undefined') {
                delete loaderConfig['baseUrl'];
            }
            if (typeof loaderConfig.paths !== 'undefined') {
                if (typeof loaderConfig.paths.vs !== 'undefined') {
                    delete loaderConfig.paths['vs'];
                }
            }
            // Since this is in a web worker, enable catching errors
            loaderConfig.catchError = true;
            self.require.config(loaderConfig);
        }
        return new Promise(function (resolve, reject) {
            // Use the global require to be sure to get the global config
            self.require([moduleId], function () {
                var result = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    result[_i] = arguments[_i];
                }
                var handlerModule = result[0];
                _this._requestHandler = handlerModule.create();
                if (!_this._requestHandler) {
                    reject(new Error("No RequestHandler!"));
                    return;
                }
                var methods = [];
                for (var _a = 0, _b = getAllPropertyNames(_this._requestHandler); _a < _b.length; _a++) {
                    var prop = _b[_a];
                    if (typeof _this._requestHandler[prop] === 'function') {
                        methods.push(prop);
                    }
                }
                resolve(methods);
            }, reject);
        });
    };
    return SimpleWorkerServer;
}());

/**
 * Called on the worker side
 */
function create(postMessage) {
    return new simpleWorker_SimpleWorkerServer(postMessage, null);
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/arrays.js
/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
function tail(array, n) {
    if (n === void 0) { n = 0; }
    return array[array.length - (1 + n)];
}
function tail2(arr) {
    if (arr.length === 0) {
        throw new Error('Invalid tail call');
    }
    return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}
function equals(one, other, itemEquals) {
    if (itemEquals === void 0) { itemEquals = function (a, b) { return a === b; }; }
    if (one === other) {
        return true;
    }
    if (!one || !other) {
        return false;
    }
    if (one.length !== other.length) {
        return false;
    }
    for (var i = 0, len = one.length; i < len; i++) {
        if (!itemEquals(one[i], other[i])) {
            return false;
        }
    }
    return true;
}
function binarySearch(array, key, comparator) {
    var low = 0, high = array.length - 1;
    while (low <= high) {
        var mid = ((low + high) / 2) | 0;
        var comp = comparator(array[mid], key);
        if (comp < 0) {
            low = mid + 1;
        }
        else if (comp > 0) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }
    return -(low + 1);
}
/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
function findFirstInSorted(array, p) {
    var low = 0, high = array.length;
    if (high === 0) {
        return 0; // no children
    }
    while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (p(array[mid])) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    return low;
}
/**
 * Like `Array#sort` but always stable. Usually runs a little slower `than Array#sort`
 * so only use this when actually needing stable sort.
 */
function mergeSort(data, compare) {
    _sort(data, compare, 0, data.length - 1, []);
    return data;
}
function _merge(a, compare, lo, mid, hi, aux) {
    var leftIdx = lo, rightIdx = mid + 1;
    for (var i = lo; i <= hi; i++) {
        aux[i] = a[i];
    }
    for (var i = lo; i <= hi; i++) {
        if (leftIdx > mid) {
            // left side consumed
            a[i] = aux[rightIdx++];
        }
        else if (rightIdx > hi) {
            // right side consumed
            a[i] = aux[leftIdx++];
        }
        else if (compare(aux[rightIdx], aux[leftIdx]) < 0) {
            // right element is less -> comes first
            a[i] = aux[rightIdx++];
        }
        else {
            // left element comes first (less or equal)
            a[i] = aux[leftIdx++];
        }
    }
}
function _sort(a, compare, lo, hi, aux) {
    if (hi <= lo) {
        return;
    }
    var mid = lo + ((hi - lo) / 2) | 0;
    _sort(a, compare, lo, mid, aux);
    _sort(a, compare, mid + 1, hi, aux);
    if (compare(a[mid], a[mid + 1]) <= 0) {
        // left and right are sorted and if the last-left element is less
        // or equals than the first-right element there is nothing else
        // to do
        return;
    }
    _merge(a, compare, lo, mid, hi, aux);
}
function groupBy(data, compare) {
    var result = [];
    var currentGroup = undefined;
    for (var _i = 0, _a = mergeSort(data.slice(0), compare); _i < _a.length; _i++) {
        var element = _a[_i];
        if (!currentGroup || compare(currentGroup[0], element) !== 0) {
            currentGroup = [element];
            result.push(currentGroup);
        }
        else {
            currentGroup.push(element);
        }
    }
    return result;
}
/**
 * @returns a new array with all falsy values removed. The original array IS NOT modified.
 */
function coalesce(array) {
    if (!array) {
        return array;
    }
    return array.filter(function (e) { return !!e; });
}
/**
 * @returns false if the provided object is an array and not empty.
 */
function isFalsyOrEmpty(obj) {
    return !Array.isArray(obj) || obj.length === 0;
}
/**
 * @returns True if the provided object is an array and has at least one element.
 */
function isNonEmptyArray(obj) {
    return Array.isArray(obj) && obj.length > 0;
}
/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equalness by returning a unique string for each.
 */
function distinct(array, keyFn) {
    if (!keyFn) {
        return array.filter(function (element, position) {
            return array.indexOf(element) === position;
        });
    }
    var seen = Object.create(null);
    return array.filter(function (elem) {
        var key = keyFn(elem);
        if (seen[key]) {
            return false;
        }
        seen[key] = true;
        return true;
    });
}
function distinctES6(array) {
    var seen = new Set();
    return array.filter(function (element) {
        if (seen.has(element)) {
            return false;
        }
        seen.add(element);
        return true;
    });
}
function firstIndex(array, fn) {
    for (var i = 0; i < array.length; i++) {
        var element = array[i];
        if (fn(element)) {
            return i;
        }
    }
    return -1;
}
function first(array, fn, notFoundValue) {
    if (notFoundValue === void 0) { notFoundValue = undefined; }
    var index = firstIndex(array, fn);
    return index < 0 ? notFoundValue : array[index];
}
function flatten(arr) {
    var _a;
    return (_a = []).concat.apply(_a, arr);
}
function arrays_range(arg, to) {
    var from = typeof to === 'number' ? arg : 0;
    if (typeof to === 'number') {
        from = arg;
    }
    else {
        from = 0;
        to = arg;
    }
    var result = [];
    if (from <= to) {
        for (var i = from; i < to; i++) {
            result.push(i);
        }
    }
    else {
        for (var i = from; i > to; i--) {
            result.push(i);
        }
    }
    return result;
}
/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
function arrayInsert(target, insertIndex, insertArr) {
    var before = target.slice(0, insertIndex);
    var after = target.slice(insertIndex);
    return before.concat(insertArr, after);
}
/**
 * Pushes an element to the start of the array, if found.
 */
function pushToStart(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.unshift(value);
    }
}
/**
 * Pushes an element to the end of the array, if found.
 */
function pushToEnd(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.push(value);
    }
}
function asArray(x) {
    return Array.isArray(x) ? x : [x];
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/diff/diffChange.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Represents information about a specific difference between two sequences.
 */
var DiffChange = /** @class */ (function () {
    /**
     * Constructs a new DiffChange with the given sequence information
     * and content.
     */
    function DiffChange(originalStart, originalLength, modifiedStart, modifiedLength) {
        //Debug.Assert(originalLength > 0 || modifiedLength > 0, "originalLength and modifiedLength cannot both be <= 0");
        this.originalStart = originalStart;
        this.originalLength = originalLength;
        this.modifiedStart = modifiedStart;
        this.modifiedLength = modifiedLength;
    }
    /**
     * The end point (exclusive) of the change in the original sequence.
     */
    DiffChange.prototype.getOriginalEnd = function () {
        return this.originalStart + this.originalLength;
    };
    /**
     * The end point (exclusive) of the change in the modified sequence.
     */
    DiffChange.prototype.getModifiedEnd = function () {
        return this.modifiedStart + this.modifiedLength;
    };
    return DiffChange;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/diff/diff.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

function createStringSequence(a) {
    return {
        getLength: function () { return a.length; },
        getElementAtIndex: function (pos) { return a.charCodeAt(pos); }
    };
}
function stringDiff(original, modified, pretty) {
    return new diff_LcsDiff(createStringSequence(original), createStringSequence(modified)).ComputeDiff(pretty);
}
//
// The code below has been ported from a C# implementation in VS
//
var Debug = /** @class */ (function () {
    function Debug() {
    }
    Debug.Assert = function (condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    };
    return Debug;
}());

var MyArray = /** @class */ (function () {
    function MyArray() {
    }
    /**
     * Copies a range of elements from an Array starting at the specified source index and pastes
     * them to another Array starting at the specified destination index. The length and the indexes
     * are specified as 64-bit integers.
     * sourceArray:
     *		The Array that contains the data to copy.
     * sourceIndex:
     *		A 64-bit integer that represents the index in the sourceArray at which copying begins.
     * destinationArray:
     *		The Array that receives the data.
     * destinationIndex:
     *		A 64-bit integer that represents the index in the destinationArray at which storing begins.
     * length:
     *		A 64-bit integer that represents the number of elements to copy.
     */
    MyArray.Copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (var i = 0; i < length; i++) {
            destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
    };
    return MyArray;
}());

//*****************************************************************************
// LcsDiff.cs
//
// An implementation of the difference algorithm described in
// "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
//
// Copyright (C) 2008 Microsoft Corporation @minifier_do_not_preserve
//*****************************************************************************
// Our total memory usage for storing history is (worst-case):
// 2 * [(MaxDifferencesHistory + 1) * (MaxDifferencesHistory + 1) - 1] * sizeof(int)
// 2 * [1448*1448 - 1] * 4 = 16773624 = 16MB
var MaxDifferencesHistory = 1447;
//let MaxDifferencesHistory = 100;
/**
 * A utility class which helps to create the set of DiffChanges from
 * a difference operation. This class accepts original DiffElements and
 * modified DiffElements that are involved in a particular change. The
 * MarktNextChange() method can be called to mark the separation between
 * distinct changes. At the end, the Changes property can be called to retrieve
 * the constructed changes.
 */
var diff_DiffChangeHelper = /** @class */ (function () {
    /**
     * Constructs a new DiffChangeHelper for the given DiffSequences.
     */
    function DiffChangeHelper() {
        this.m_changes = [];
        this.m_originalStart = Number.MAX_VALUE;
        this.m_modifiedStart = Number.MAX_VALUE;
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
    }
    /**
     * Marks the beginning of the next change in the set of differences.
     */
    DiffChangeHelper.prototype.MarkNextChange = function () {
        // Only add to the list if there is something to add
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Add the new change to our list
            this.m_changes.push(new DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
        }
        // Reset for the next change
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
        this.m_originalStart = Number.MAX_VALUE;
        this.m_modifiedStart = Number.MAX_VALUE;
    };
    /**
     * Adds the original element at the given position to the elements
     * affected by the current change. The modified index gives context
     * to the change position with respect to the original sequence.
     * @param originalIndex The index of the original element to add.
     * @param modifiedIndex The index of the modified element that provides corresponding position in the modified sequence.
     */
    DiffChangeHelper.prototype.AddOriginalElement = function (originalIndex, modifiedIndex) {
        // The 'true' start index is the smallest of the ones we've seen
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_originalCount++;
    };
    /**
     * Adds the modified element at the given position to the elements
     * affected by the current change. The original index gives context
     * to the change position with respect to the modified sequence.
     * @param originalIndex The index of the original element that provides corresponding position in the original sequence.
     * @param modifiedIndex The index of the modified element to add.
     */
    DiffChangeHelper.prototype.AddModifiedElement = function (originalIndex, modifiedIndex) {
        // The 'true' start index is the smallest of the ones we've seen
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_modifiedCount++;
    };
    /**
     * Retrieves all of the changes marked by the class.
     */
    DiffChangeHelper.prototype.getChanges = function () {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Finish up on whatever is left
            this.MarkNextChange();
        }
        return this.m_changes;
    };
    /**
     * Retrieves all of the changes marked by the class in the reverse order
     */
    DiffChangeHelper.prototype.getReverseChanges = function () {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Finish up on whatever is left
            this.MarkNextChange();
        }
        this.m_changes.reverse();
        return this.m_changes;
    };
    return DiffChangeHelper;
}());
/**
 * An implementation of the difference algorithm described in
 * "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
 */
var diff_LcsDiff = /** @class */ (function () {
    /**
     * Constructs the DiffFinder
     */
    function LcsDiff(originalSequence, newSequence, continueProcessingPredicate) {
        if (continueProcessingPredicate === void 0) { continueProcessingPredicate = null; }
        this.OriginalSequence = originalSequence;
        this.ModifiedSequence = newSequence;
        this.ContinueProcessingPredicate = continueProcessingPredicate;
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
    }
    LcsDiff.prototype.ElementsAreEqual = function (originalIndex, newIndex) {
        return (this.OriginalSequence.getElementAtIndex(originalIndex) === this.ModifiedSequence.getElementAtIndex(newIndex));
    };
    LcsDiff.prototype.OriginalElementsAreEqual = function (index1, index2) {
        return (this.OriginalSequence.getElementAtIndex(index1) === this.OriginalSequence.getElementAtIndex(index2));
    };
    LcsDiff.prototype.ModifiedElementsAreEqual = function (index1, index2) {
        return (this.ModifiedSequence.getElementAtIndex(index1) === this.ModifiedSequence.getElementAtIndex(index2));
    };
    LcsDiff.prototype.ComputeDiff = function (pretty) {
        return this._ComputeDiff(0, this.OriginalSequence.getLength() - 1, 0, this.ModifiedSequence.getLength() - 1, pretty);
    };
    /**
     * Computes the differences between the original and modified input
     * sequences on the bounded range.
     * @returns An array of the differences between the two input sequences.
     */
    LcsDiff.prototype._ComputeDiff = function (originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
        var quitEarlyArr = [false];
        var changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
        if (pretty) {
            // We have to clean up the computed diff to be more intuitive
            // but it turns out this cannot be done correctly until the entire set
            // of diffs have been computed
            return this.PrettifyChanges(changes);
        }
        return changes;
    };
    /**
     * Private helper method which computes the differences on the bounded range
     * recursively.
     * @returns An array of the differences between the two input sequences.
     */
    LcsDiff.prototype.ComputeDiffRecursive = function (originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
        quitEarlyArr[0] = false;
        // Find the start of the differences
        while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
            originalStart++;
            modifiedStart++;
        }
        // Find the end of the differences
        while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
            originalEnd--;
            modifiedEnd--;
        }
        // In the special case where we either have all insertions or all deletions or the sequences are identical
        if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
            var changes = void 0;
            if (modifiedStart <= modifiedEnd) {
                Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                // All insertions
                changes = [
                    new DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
                ];
            }
            else if (originalStart <= originalEnd) {
                Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                // All deletions
                changes = [
                    new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
                ];
            }
            else {
                Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                // Identical sequences - No differences
                changes = [];
            }
            return changes;
        }
        // This problem can be solved using the Divide-And-Conquer technique.
        var midOriginalArr = [0], midModifiedArr = [0];
        var result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
        var midOriginal = midOriginalArr[0];
        var midModified = midModifiedArr[0];
        if (result !== null) {
            // Result is not-null when there was enough memory to compute the changes while
            // searching for the recursion point
            return result;
        }
        else if (!quitEarlyArr[0]) {
            // We can break the problem down recursively by finding the changes in the
            // First Half:   (originalStart, modifiedStart) to (midOriginal, midModified)
            // Second Half:  (midOriginal + 1, minModified + 1) to (originalEnd, modifiedEnd)
            // NOTE: ComputeDiff() is inclusive, therefore the second range starts on the next point
            var leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
            var rightChanges = [];
            if (!quitEarlyArr[0]) {
                rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
            }
            else {
                // We did't have time to finish the first half, so we don't have time to compute this half.
                // Consider the entire rest of the sequence different.
                rightChanges = [
                    new DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
                ];
            }
            return this.ConcatenateChanges(leftChanges, rightChanges);
        }
        // If we hit here, we quit early, and so can't return anything meaningful
        return [
            new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
        ];
    };
    LcsDiff.prototype.WALKTRACE = function (diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
        var forwardChanges = null, reverseChanges = null;
        // First, walk backward through the forward diagonals history
        var changeHelper = new diff_DiffChangeHelper();
        var diagonalMin = diagonalForwardStart;
        var diagonalMax = diagonalForwardEnd;
        var diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalForwardOffset;
        var lastOriginalIndex = Number.MIN_VALUE;
        var historyIndex = this.m_forwardHistory.length - 1;
        var diagonal;
        do {
            // Get the diagonal index from the relative diagonal number
            diagonal = diagonalRelative + diagonalForwardBase;
            // Figure out where we came from
            if (diagonal === diagonalMin || (diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                // Vertical line (the element is an insert)
                originalIndex = forwardPoints[diagonal + 1];
                modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                if (originalIndex < lastOriginalIndex) {
                    changeHelper.MarkNextChange();
                }
                lastOriginalIndex = originalIndex;
                changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
                diagonalRelative = (diagonal + 1) - diagonalForwardBase; //Setup for the next iteration
            }
            else {
                // Horizontal line (the element is a deletion)
                originalIndex = forwardPoints[diagonal - 1] + 1;
                modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                if (originalIndex < lastOriginalIndex) {
                    changeHelper.MarkNextChange();
                }
                lastOriginalIndex = originalIndex - 1;
                changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
                diagonalRelative = (diagonal - 1) - diagonalForwardBase; //Setup for the next iteration
            }
            if (historyIndex >= 0) {
                forwardPoints = this.m_forwardHistory[historyIndex];
                diagonalForwardBase = forwardPoints[0]; //We stored this in the first spot
                diagonalMin = 1;
                diagonalMax = forwardPoints.length - 1;
            }
        } while (--historyIndex >= -1);
        // Ironically, we get the forward changes as the reverse of the
        // order we added them since we technically added them backwards
        forwardChanges = changeHelper.getReverseChanges();
        if (quitEarlyArr[0]) {
            // TODO: Calculate a partial from the reverse diagonals.
            //       For now, just assume everything after the midOriginal/midModified point is a diff
            var originalStartPoint = midOriginalArr[0] + 1;
            var modifiedStartPoint = midModifiedArr[0] + 1;
            if (forwardChanges !== null && forwardChanges.length > 0) {
                var lastForwardChange = forwardChanges[forwardChanges.length - 1];
                originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
                modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
            }
            reverseChanges = [
                new DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
            ];
        }
        else {
            // Now walk backward through the reverse diagonals history
            changeHelper = new diff_DiffChangeHelper();
            diagonalMin = diagonalReverseStart;
            diagonalMax = diagonalReverseEnd;
            diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalReverseOffset;
            lastOriginalIndex = Number.MAX_VALUE;
            historyIndex = (deltaIsEven) ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
            do {
                // Get the diagonal index from the relative diagonal number
                diagonal = diagonalRelative + diagonalReverseBase;
                // Figure out where we came from
                if (diagonal === diagonalMin || (diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                    // Horizontal line (the element is a deletion))
                    originalIndex = reversePoints[diagonal + 1] - 1;
                    modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                    if (originalIndex > lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex + 1;
                    changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
                    diagonalRelative = (diagonal + 1) - diagonalReverseBase; //Setup for the next iteration
                }
                else {
                    // Vertical line (the element is an insertion)
                    originalIndex = reversePoints[diagonal - 1];
                    modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                    if (originalIndex > lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex;
                    changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
                    diagonalRelative = (diagonal - 1) - diagonalReverseBase; //Setup for the next iteration
                }
                if (historyIndex >= 0) {
                    reversePoints = this.m_reverseHistory[historyIndex];
                    diagonalReverseBase = reversePoints[0]; //We stored this in the first spot
                    diagonalMin = 1;
                    diagonalMax = reversePoints.length - 1;
                }
            } while (--historyIndex >= -1);
            // There are cases where the reverse history will find diffs that
            // are correct, but not intuitive, so we need shift them.
            reverseChanges = changeHelper.getChanges();
        }
        return this.ConcatenateChanges(forwardChanges, reverseChanges);
    };
    /**
     * Given the range to compute the diff on, this method finds the point:
     * (midOriginal, midModified)
     * that exists in the middle of the LCS of the two sequences and
     * is the point at which the LCS problem may be broken down recursively.
     * This method will try to keep the LCS trace in memory. If the LCS recursion
     * point is calculated and the full trace is available in memory, then this method
     * will return the change list.
     * @param originalStart The start bound of the original sequence range
     * @param originalEnd The end bound of the original sequence range
     * @param modifiedStart The start bound of the modified sequence range
     * @param modifiedEnd The end bound of the modified sequence range
     * @param midOriginal The middle point of the original sequence range
     * @param midModified The middle point of the modified sequence range
     * @returns The diff changes, if available, otherwise null
     */
    LcsDiff.prototype.ComputeRecursionPoint = function (originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
        var originalIndex = 0, modifiedIndex = 0;
        var diagonalForwardStart = 0, diagonalForwardEnd = 0;
        var diagonalReverseStart = 0, diagonalReverseEnd = 0;
        var numDifferences;
        // To traverse the edit graph and produce the proper LCS, our actual
        // start position is just outside the given boundary
        originalStart--;
        modifiedStart--;
        // We set these up to make the compiler happy, but they will
        // be replaced before we return with the actual recursion point
        midOriginalArr[0] = 0;
        midModifiedArr[0] = 0;
        // Clear out the history
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
        // Each cell in the two arrays corresponds to a diagonal in the edit graph.
        // The integer value in the cell represents the originalIndex of the furthest
        // reaching point found so far that ends in that diagonal.
        // The modifiedIndex can be computed mathematically from the originalIndex and the diagonal number.
        var maxDifferences = (originalEnd - originalStart) + (modifiedEnd - modifiedStart);
        var numDiagonals = maxDifferences + 1;
        var forwardPoints = new Array(numDiagonals);
        var reversePoints = new Array(numDiagonals);
        // diagonalForwardBase: Index into forwardPoints of the diagonal which passes through (originalStart, modifiedStart)
        // diagonalReverseBase: Index into reversePoints of the diagonal which passes through (originalEnd, modifiedEnd)
        var diagonalForwardBase = (modifiedEnd - modifiedStart);
        var diagonalReverseBase = (originalEnd - originalStart);
        // diagonalForwardOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
        //    diagonal number (relative to diagonalForwardBase)
        // diagonalReverseOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
        //    diagonal number (relative to diagonalReverseBase)
        var diagonalForwardOffset = (originalStart - modifiedStart);
        var diagonalReverseOffset = (originalEnd - modifiedEnd);
        // delta: The difference between the end diagonal and the start diagonal. This is used to relate diagonal numbers
        //   relative to the start diagonal with diagonal numbers relative to the end diagonal.
        // The Even/Oddn-ness of this delta is important for determining when we should check for overlap
        var delta = diagonalReverseBase - diagonalForwardBase;
        var deltaIsEven = (delta % 2 === 0);
        // Here we set up the start and end points as the furthest points found so far
        // in both the forward and reverse directions, respectively
        forwardPoints[diagonalForwardBase] = originalStart;
        reversePoints[diagonalReverseBase] = originalEnd;
        // Remember if we quit early, and thus need to do a best-effort result instead of a real result.
        quitEarlyArr[0] = false;
        // A couple of points:
        // --With this method, we iterate on the number of differences between the two sequences.
        //   The more differences there actually are, the longer this will take.
        // --Also, as the number of differences increases, we have to search on diagonals further
        //   away from the reference diagonal (which is diagonalForwardBase for forward, diagonalReverseBase for reverse).
        // --We extend on even diagonals (relative to the reference diagonal) only when numDifferences
        //   is even and odd diagonals only when numDifferences is odd.
        var diagonal, tempOriginalIndex;
        for (numDifferences = 1; numDifferences <= (maxDifferences / 2) + 1; numDifferences++) {
            var furthestOriginalIndex = 0;
            var furthestModifiedIndex = 0;
            // Run the algorithm in the forward direction
            diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
            diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
            for (diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
                // STEP 1: We extend the furthest reaching point in the present diagonal
                // by looking at the diagonals above and below and picking the one whose point
                // is further away from the start point (originalStart, modifiedStart)
                if (diagonal === diagonalForwardStart || (diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                    originalIndex = forwardPoints[diagonal + 1];
                }
                else {
                    originalIndex = forwardPoints[diagonal - 1] + 1;
                }
                modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
                // Save the current originalIndex so we can test for false overlap in step 3
                tempOriginalIndex = originalIndex;
                // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                // so long as the elements are equal.
                while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
                    originalIndex++;
                    modifiedIndex++;
                }
                forwardPoints[diagonal] = originalIndex;
                if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
                    furthestOriginalIndex = originalIndex;
                    furthestModifiedIndex = modifiedIndex;
                }
                // STEP 3: If delta is odd (overlap first happens on forward when delta is odd)
                // and diagonal is in the range of reverse diagonals computed for numDifferences-1
                // (the previous iteration; we haven't computed reverse diagonals for numDifferences yet)
                // then check for overlap.
                if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= (numDifferences - 1)) {
                    if (originalIndex >= reversePoints[diagonal]) {
                        midOriginalArr[0] = originalIndex;
                        midModifiedArr[0] = modifiedIndex;
                        if (tempOriginalIndex <= reversePoints[diagonal] && MaxDifferencesHistory > 0 && numDifferences <= (MaxDifferencesHistory + 1)) {
                            // BINGO! We overlapped, and we have the full trace in memory!
                            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                        }
                        else {
                            // Either false overlap, or we didn't have enough memory for the full trace
                            // Just return the recursion point
                            return null;
                        }
                    }
                }
            }
            // Check to see if we should be quitting early, before moving on to the next iteration.
            var matchLengthOfLongest = ((furthestOriginalIndex - originalStart) + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
            if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, this.OriginalSequence, matchLengthOfLongest)) {
                // We can't finish, so skip ahead to generating a result from what we have.
                quitEarlyArr[0] = true;
                // Use the furthest distance we got in the forward direction.
                midOriginalArr[0] = furthestOriginalIndex;
                midModifiedArr[0] = furthestModifiedIndex;
                if (matchLengthOfLongest > 0 && MaxDifferencesHistory > 0 && numDifferences <= (MaxDifferencesHistory + 1)) {
                    // Enough of the history is in memory to walk it backwards
                    return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                }
                else {
                    // We didn't actually remember enough of the history.
                    //Since we are quiting the diff early, we need to shift back the originalStart and modified start
                    //back into the boundary limits since we decremented their value above beyond the boundary limit.
                    originalStart++;
                    modifiedStart++;
                    return [
                        new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
                    ];
                }
            }
            // Run the algorithm in the reverse direction
            diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
            diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
            for (diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
                // STEP 1: We extend the furthest reaching point in the present diagonal
                // by looking at the diagonals above and below and picking the one whose point
                // is further away from the start point (originalEnd, modifiedEnd)
                if (diagonal === diagonalReverseStart || (diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                    originalIndex = reversePoints[diagonal + 1] - 1;
                }
                else {
                    originalIndex = reversePoints[diagonal - 1];
                }
                modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
                // Save the current originalIndex so we can test for false overlap
                tempOriginalIndex = originalIndex;
                // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                // as long as the elements are equal.
                while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
                    originalIndex--;
                    modifiedIndex--;
                }
                reversePoints[diagonal] = originalIndex;
                // STEP 4: If delta is even (overlap first happens on reverse when delta is even)
                // and diagonal is in the range of forward diagonals computed for numDifferences
                // then check for overlap.
                if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
                    if (originalIndex <= forwardPoints[diagonal]) {
                        midOriginalArr[0] = originalIndex;
                        midModifiedArr[0] = modifiedIndex;
                        if (tempOriginalIndex >= forwardPoints[diagonal] && MaxDifferencesHistory > 0 && numDifferences <= (MaxDifferencesHistory + 1)) {
                            // BINGO! We overlapped, and we have the full trace in memory!
                            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                        }
                        else {
                            // Either false overlap, or we didn't have enough memory for the full trace
                            // Just return the recursion point
                            return null;
                        }
                    }
                }
            }
            // Save current vectors to history before the next iteration
            if (numDifferences <= MaxDifferencesHistory) {
                // We are allocating space for one extra int, which we fill with
                // the index of the diagonal base index
                var temp = new Array(diagonalForwardEnd - diagonalForwardStart + 2);
                temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
                MyArray.Copy(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
                this.m_forwardHistory.push(temp);
                temp = new Array(diagonalReverseEnd - diagonalReverseStart + 2);
                temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
                MyArray.Copy(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
                this.m_reverseHistory.push(temp);
            }
        }
        // If we got here, then we have the full trace in history. We just have to convert it to a change list
        // NOTE: This part is a bit messy
        return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
    };
    /**
     * Shifts the given changes to provide a more intuitive diff.
     * While the first element in a diff matches the first element after the diff,
     * we shift the diff down.
     *
     * @param changes The list of changes to shift
     * @returns The shifted changes
     */
    LcsDiff.prototype.PrettifyChanges = function (changes) {
        // Shift all the changes down first
        for (var i = 0; i < changes.length; i++) {
            var change = changes[i];
            var originalStop = (i < changes.length - 1) ? changes[i + 1].originalStart : this.OriginalSequence.getLength();
            var modifiedStop = (i < changes.length - 1) ? changes[i + 1].modifiedStart : this.ModifiedSequence.getLength();
            var checkOriginal = change.originalLength > 0;
            var checkModified = change.modifiedLength > 0;
            while (change.originalStart + change.originalLength < originalStop &&
                change.modifiedStart + change.modifiedLength < modifiedStop &&
                (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength)) &&
                (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
                change.originalStart++;
                change.modifiedStart++;
            }
            var mergedChangeArr = [null];
            if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
                changes[i] = mergedChangeArr[0];
                changes.splice(i + 1, 1);
                i--;
                continue;
            }
        }
        // Shift changes back up until we hit empty or whitespace-only lines
        for (var i = changes.length - 1; i >= 0; i--) {
            var change = changes[i];
            var originalStop = 0;
            var modifiedStop = 0;
            if (i > 0) {
                var prevChange = changes[i - 1];
                if (prevChange.originalLength > 0) {
                    originalStop = prevChange.originalStart + prevChange.originalLength;
                }
                if (prevChange.modifiedLength > 0) {
                    modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
                }
            }
            var checkOriginal = change.originalLength > 0;
            var checkModified = change.modifiedLength > 0;
            var bestDelta = 0;
            var bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
            for (var delta = 1;; delta++) {
                var originalStart = change.originalStart - delta;
                var modifiedStart = change.modifiedStart - delta;
                if (originalStart < originalStop || modifiedStart < modifiedStop) {
                    break;
                }
                if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
                    break;
                }
                if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
                    break;
                }
                var score = this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength);
                if (score > bestScore) {
                    bestScore = score;
                    bestDelta = delta;
                }
            }
            change.originalStart -= bestDelta;
            change.modifiedStart -= bestDelta;
        }
        return changes;
    };
    LcsDiff.prototype._OriginalIsBoundary = function (index) {
        if (index <= 0 || index >= this.OriginalSequence.getLength() - 1) {
            return true;
        }
        var element = this.OriginalSequence.getElementAtIndex(index);
        return (typeof element === 'string' && /^\s*$/.test(element));
    };
    LcsDiff.prototype._OriginalRegionIsBoundary = function (originalStart, originalLength) {
        if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
            return true;
        }
        if (originalLength > 0) {
            var originalEnd = originalStart + originalLength;
            if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
                return true;
            }
        }
        return false;
    };
    LcsDiff.prototype._ModifiedIsBoundary = function (index) {
        if (index <= 0 || index >= this.ModifiedSequence.getLength() - 1) {
            return true;
        }
        var element = this.ModifiedSequence.getElementAtIndex(index);
        return (typeof element === 'string' && /^\s*$/.test(element));
    };
    LcsDiff.prototype._ModifiedRegionIsBoundary = function (modifiedStart, modifiedLength) {
        if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
            return true;
        }
        if (modifiedLength > 0) {
            var modifiedEnd = modifiedStart + modifiedLength;
            if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
                return true;
            }
        }
        return false;
    };
    LcsDiff.prototype._boundaryScore = function (originalStart, originalLength, modifiedStart, modifiedLength) {
        var originalScore = (this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0);
        var modifiedScore = (this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0);
        return (originalScore + modifiedScore);
    };
    /**
     * Concatenates the two input DiffChange lists and returns the resulting
     * list.
     * @param The left changes
     * @param The right changes
     * @returns The concatenated list
     */
    LcsDiff.prototype.ConcatenateChanges = function (left, right) {
        var mergedChangeArr = [];
        if (left.length === 0 || right.length === 0) {
            return (right.length > 0) ? right : left;
        }
        else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
            // Since we break the problem down recursively, it is possible that we
            // might recurse in the middle of a change thereby splitting it into
            // two changes. Here in the combining stage, we detect and fuse those
            // changes back together
            var result = new Array(left.length + right.length - 1);
            MyArray.Copy(left, 0, result, 0, left.length - 1);
            result[left.length - 1] = mergedChangeArr[0];
            MyArray.Copy(right, 1, result, left.length, right.length - 1);
            return result;
        }
        else {
            var result = new Array(left.length + right.length);
            MyArray.Copy(left, 0, result, 0, left.length);
            MyArray.Copy(right, 0, result, left.length, right.length);
            return result;
        }
    };
    /**
     * Returns true if the two changes overlap and can be merged into a single
     * change
     * @param left The left change
     * @param right The right change
     * @param mergedChange The merged change if the two overlap, null otherwise
     * @returns True if the two changes overlap
     */
    LcsDiff.prototype.ChangesOverlap = function (left, right, mergedChangeArr) {
        Debug.Assert(left.originalStart <= right.originalStart, 'Left change is not less than or equal to right change');
        Debug.Assert(left.modifiedStart <= right.modifiedStart, 'Left change is not less than or equal to right change');
        if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
            var originalStart = left.originalStart;
            var originalLength = left.originalLength;
            var modifiedStart = left.modifiedStart;
            var modifiedLength = left.modifiedLength;
            if (left.originalStart + left.originalLength >= right.originalStart) {
                originalLength = right.originalStart + right.originalLength - left.originalStart;
            }
            if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
            }
            mergedChangeArr[0] = new DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
            return true;
        }
        else {
            mergedChangeArr[0] = null;
            return false;
        }
    };
    /**
     * Helper method used to clip a diagonal index to the range of valid
     * diagonals. This also decides whether or not the diagonal index,
     * if it exceeds the boundary, should be clipped to the boundary or clipped
     * one inside the boundary depending on the Even/Odd status of the boundary
     * and numDifferences.
     * @param diagonal The index of the diagonal to clip.
     * @param numDifferences The current number of differences being iterated upon.
     * @param diagonalBaseIndex The base reference diagonal.
     * @param numDiagonals The total number of diagonals.
     * @returns The clipped diagonal index.
     */
    LcsDiff.prototype.ClipDiagonalBound = function (diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
        if (diagonal >= 0 && diagonal < numDiagonals) {
            // Nothing to clip, its in range
            return diagonal;
        }
        // diagonalsBelow: The number of diagonals below the reference diagonal
        // diagonalsAbove: The number of diagonals above the reference diagonal
        var diagonalsBelow = diagonalBaseIndex;
        var diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
        var diffEven = (numDifferences % 2 === 0);
        if (diagonal < 0) {
            var lowerBoundEven = (diagonalsBelow % 2 === 0);
            return (diffEven === lowerBoundEven) ? 0 : 1;
        }
        else {
            var upperBoundEven = (diagonalsAbove % 2 === 0);
            return (diffEven === upperBoundEven) ? numDiagonals - 1 : numDiagonals - 2;
        }
    };
    return LcsDiff;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/iterator.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var iterator_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FIN = { done: true, value: undefined };
var Iterator;
(function (Iterator) {
    var _empty = {
        next: function () {
            return FIN;
        }
    };
    function empty() {
        return _empty;
    }
    Iterator.empty = empty;
    function fromArray(array, index, length) {
        if (index === void 0) { index = 0; }
        if (length === void 0) { length = array.length; }
        return {
            next: function () {
                if (index >= length) {
                    return FIN;
                }
                return { done: false, value: array[index++] };
            }
        };
    }
    Iterator.fromArray = fromArray;
    function from(elements) {
        if (!elements) {
            return Iterator.empty();
        }
        else if (Array.isArray(elements)) {
            return Iterator.fromArray(elements);
        }
        else {
            return elements;
        }
    }
    Iterator.from = from;
    function map(iterator, fn) {
        return {
            next: function () {
                var element = iterator.next();
                if (element.done) {
                    return FIN;
                }
                else {
                    return { done: false, value: fn(element.value) };
                }
            }
        };
    }
    Iterator.map = map;
    function filter(iterator, fn) {
        return {
            next: function () {
                while (true) {
                    var element = iterator.next();
                    if (element.done) {
                        return FIN;
                    }
                    if (fn(element.value)) {
                        return { done: false, value: element.value };
                    }
                }
            }
        };
    }
    Iterator.filter = filter;
    function forEach(iterator, fn) {
        for (var next = iterator.next(); !next.done; next = iterator.next()) {
            fn(next.value);
        }
    }
    Iterator.forEach = forEach;
    function collect(iterator) {
        var result = [];
        forEach(iterator, function (value) { return result.push(value); });
        return result;
    }
    Iterator.collect = collect;
})(Iterator || (Iterator = {}));
function getSequenceIterator(arg) {
    if (Array.isArray(arg)) {
        return Iterator.fromArray(arg);
    }
    else {
        return arg;
    }
}
var ArrayIterator = /** @class */ (function () {
    function ArrayIterator(items, start, end, index) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = items.length; }
        if (index === void 0) { index = start - 1; }
        this.items = items;
        this.start = start;
        this.end = end;
        this.index = index;
    }
    ArrayIterator.prototype.next = function () {
        this.index = Math.min(this.index + 1, this.end);
        return this.current();
    };
    ArrayIterator.prototype.current = function () {
        if (this.index === this.start - 1 || this.index === this.end) {
            return null;
        }
        return this.items[this.index];
    };
    return ArrayIterator;
}());

var ArrayNavigator = /** @class */ (function (_super) {
    iterator_extends(ArrayNavigator, _super);
    function ArrayNavigator(items, start, end, index) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = items.length; }
        if (index === void 0) { index = start - 1; }
        return _super.call(this, items, start, end, index) || this;
    }
    ArrayNavigator.prototype.current = function () {
        return _super.prototype.current.call(this);
    };
    ArrayNavigator.prototype.previous = function () {
        this.index = Math.max(this.index - 1, this.start - 1);
        return this.current();
    };
    ArrayNavigator.prototype.first = function () {
        this.index = this.start;
        return this.current();
    };
    ArrayNavigator.prototype.last = function () {
        this.index = this.end - 1;
        return this.current();
    };
    ArrayNavigator.prototype.parent = function () {
        return null;
    };
    return ArrayNavigator;
}(ArrayIterator));

var MappedIterator = /** @class */ (function () {
    function MappedIterator(iterator, fn) {
        this.iterator = iterator;
        this.fn = fn;
        // noop
    }
    MappedIterator.prototype.next = function () { return this.fn(this.iterator.next()); };
    return MappedIterator;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/uri.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var uri_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var uri_a;

var _schemePattern = /^\w[\w\d+.-]*$/;
var _singleSlashStart = /^\//;
var _doubleSlashStart = /^\/\//;
var _throwOnMissingSchema = true;
function _validateUri(ret, _strict) {
    // scheme, must be set
    if (!ret.scheme) {
        if (_strict || _throwOnMissingSchema) {
            throw new Error("[UriError]: Scheme is missing: {scheme: \"\", authority: \"" + ret.authority + "\", path: \"" + ret.path + "\", query: \"" + ret.query + "\", fragment: \"" + ret.fragment + "\"}");
        }
        else {
            console.warn("[UriError]: Scheme is missing: {scheme: \"\", authority: \"" + ret.authority + "\", path: \"" + ret.path + "\", query: \"" + ret.query + "\", fragment: \"" + ret.fragment + "\"}");
        }
    }
    // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
    // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    if (ret.scheme && !_schemePattern.test(ret.scheme)) {
        throw new Error('[UriError]: Scheme contains illegal characters.');
    }
    // path, http://tools.ietf.org/html/rfc3986#section-3.3
    // If a URI contains an authority component, then the path component
    // must either be empty or begin with a slash ("/") character.  If a URI
    // does not contain an authority component, then the path cannot begin
    // with two slash characters ("//").
    if (ret.path) {
        if (ret.authority) {
            if (!_singleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
            }
        }
        else {
            if (_doubleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
            }
        }
    }
}
// for a while we allowed uris *without* schemes and this is the migration
// for them, e.g. an uri without scheme and without strict-mode warns and falls
// back to the file-scheme. that should cause the least carnage and still be a
// clear warning
function _schemeFix(scheme, _strict) {
    if (_strict || _throwOnMissingSchema) {
        return scheme || _empty;
    }
    if (!scheme) {
        console.trace('BAD uri lacks scheme, falling back to file-scheme.');
        scheme = 'file';
    }
    return scheme;
}
// implements a bit of https://tools.ietf.org/html/rfc3986#section-5
function _referenceResolution(scheme, path) {
    // the slash-character is our 'default base' as we don't
    // support constructing URIs relative to other URIs. This
    // also means that we alter and potentially break paths.
    // see https://tools.ietf.org/html/rfc3986#section-5.1.4
    switch (scheme) {
        case 'https':
        case 'http':
        case 'file':
            if (!path) {
                path = _slash;
            }
            else if (path[0] !== _slash) {
                path = _slash + path;
            }
            break;
    }
    return path;
}
var _empty = '';
var _slash = '/';
var _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 */
var uri_URI = /** @class */ (function () {
    /**
     * @internal
     */
    function URI(schemeOrData, authority, path, query, fragment, _strict) {
        if (_strict === void 0) { _strict = false; }
        if (typeof schemeOrData === 'object') {
            this.scheme = schemeOrData.scheme || _empty;
            this.authority = schemeOrData.authority || _empty;
            this.path = schemeOrData.path || _empty;
            this.query = schemeOrData.query || _empty;
            this.fragment = schemeOrData.fragment || _empty;
            // no validation because it's this URI
            // that creates uri components.
            // _validateUri(this);
        }
        else {
            this.scheme = _schemeFix(schemeOrData, _strict);
            this.authority = authority || _empty;
            this.path = _referenceResolution(this.scheme, path || _empty);
            this.query = query || _empty;
            this.fragment = fragment || _empty;
            _validateUri(this, _strict);
        }
    }
    URI.isUri = function (thing) {
        if (thing instanceof URI) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return typeof thing.authority === 'string'
            && typeof thing.fragment === 'string'
            && typeof thing.path === 'string'
            && typeof thing.query === 'string'
            && typeof thing.scheme === 'string'
            && typeof thing.fsPath === 'function'
            && typeof thing.with === 'function'
            && typeof thing.toString === 'function';
    };
    Object.defineProperty(URI.prototype, "fsPath", {
        // ---- filesystem path -----------------------
        /**
         * Returns a string representing the corresponding file system path of this URI.
         * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
         * platform specific path separator.
         *
         * * Will *not* validate the path for invalid characters and semantics.
         * * Will *not* look at the scheme of this URI.
         * * The result shall *not* be used for display purposes but for accessing a file on disk.
         *
         *
         * The *difference* to `URI#path` is the use of the platform specific separator and the handling
         * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
         *
         * ```ts
            const u = URI.parse('file://server/c$/folder/file.txt')
            u.authority === 'server'
            u.path === '/shares/c$/file.txt'
            u.fsPath === '\\server\c$\folder\file.txt'
        ```
         *
         * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
         * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
         * with URIs that represent files on disk (`file` scheme).
         */
        get: function () {
            // if (this.scheme !== 'file') {
            // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
            // }
            return _makeFsPath(this);
        },
        enumerable: true,
        configurable: true
    });
    // ---- modify to new -------------------------
    URI.prototype.with = function (change) {
        if (!change) {
            return this;
        }
        var scheme = change.scheme, authority = change.authority, path = change.path, query = change.query, fragment = change.fragment;
        if (scheme === undefined) {
            scheme = this.scheme;
        }
        else if (scheme === null) {
            scheme = _empty;
        }
        if (authority === undefined) {
            authority = this.authority;
        }
        else if (authority === null) {
            authority = _empty;
        }
        if (path === undefined) {
            path = this.path;
        }
        else if (path === null) {
            path = _empty;
        }
        if (query === undefined) {
            query = this.query;
        }
        else if (query === null) {
            query = _empty;
        }
        if (fragment === undefined) {
            fragment = this.fragment;
        }
        else if (fragment === null) {
            fragment = _empty;
        }
        if (scheme === this.scheme
            && authority === this.authority
            && path === this.path
            && query === this.query
            && fragment === this.fragment) {
            return this;
        }
        return new _URI(scheme, authority, path, query, fragment);
    };
    // ---- parse & validate ------------------------
    /**
     * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @param value A string which represents an URI (see `URI#toString`).
     */
    URI.parse = function (value, _strict) {
        if (_strict === void 0) { _strict = false; }
        var match = _regexp.exec(value);
        if (!match) {
            return new _URI(_empty, _empty, _empty, _empty, _empty);
        }
        return new _URI(match[2] || _empty, decodeURIComponent(match[4] || _empty), decodeURIComponent(match[5] || _empty), decodeURIComponent(match[7] || _empty), decodeURIComponent(match[9] || _empty), _strict);
    };
    /**
     * Creates a new URI from a file system path, e.g. `c:\my\files`,
     * `/usr/home`, or `\\server\share\some\path`.
     *
     * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
     * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
     * `URI.parse('file://' + path)` because the path might contain characters that are
     * interpreted (# and ?). See the following sample:
     * ```ts
    const good = URI.file('/coding/c#/project1');
    good.scheme === 'file';
    good.path === '/coding/c#/project1';
    good.fragment === '';
    const bad = URI.parse('file://' + '/coding/c#/project1');
    bad.scheme === 'file';
    bad.path === '/coding/c'; // path is now broken
    bad.fragment === '/project1';
    ```
     *
     * @param path A file system path (see `URI#fsPath`)
     */
    URI.file = function (path) {
        var authority = _empty;
        // normalize to fwd-slashes on windows,
        // on other systems bwd-slashes are valid
        // filename character, eg /f\oo/ba\r.txt
        if (isWindows) {
            path = path.replace(/\\/g, _slash);
        }
        // check for authority as used in UNC shares
        // or use the path as given
        if (path[0] === _slash && path[1] === _slash) {
            var idx = path.indexOf(_slash, 2);
            if (idx === -1) {
                authority = path.substring(2);
                path = _slash;
            }
            else {
                authority = path.substring(2, idx);
                path = path.substring(idx) || _slash;
            }
        }
        return new _URI('file', authority, path, _empty, _empty);
    };
    URI.from = function (components) {
        return new _URI(components.scheme, components.authority, components.path, components.query, components.fragment);
    };
    // ---- printing/externalize ---------------------------
    /**
     * Creates a string representation for this URI. It's guaranteed that calling
     * `URI.parse` with the result of this function creates an URI which is equal
     * to this URI.
     *
     * * The result shall *not* be used for display purposes but for externalization or transport.
     * * The result will be encoded using the percentage encoding and encoding happens mostly
     * ignore the scheme-specific encoding rules.
     *
     * @param skipEncoding Do not encode the result, default is `false`
     */
    URI.prototype.toString = function (skipEncoding) {
        if (skipEncoding === void 0) { skipEncoding = false; }
        return _asFormatted(this, skipEncoding);
    };
    URI.prototype.toJSON = function () {
        return this;
    };
    URI.revive = function (data) {
        if (!data) {
            return data;
        }
        else if (data instanceof URI) {
            return data;
        }
        else {
            var result = new _URI(data);
            result._fsPath = data.fsPath;
            result._formatted = data.external;
            return result;
        }
    };
    return URI;
}());

// tslint:disable-next-line:class-name
var _URI = /** @class */ (function (_super) {
    uri_extends(_URI, _super);
    function _URI() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._formatted = null;
        _this._fsPath = null;
        return _this;
    }
    Object.defineProperty(_URI.prototype, "fsPath", {
        get: function () {
            if (!this._fsPath) {
                this._fsPath = _makeFsPath(this);
            }
            return this._fsPath;
        },
        enumerable: true,
        configurable: true
    });
    _URI.prototype.toString = function (skipEncoding) {
        if (skipEncoding === void 0) { skipEncoding = false; }
        if (!skipEncoding) {
            if (!this._formatted) {
                this._formatted = _asFormatted(this, false);
            }
            return this._formatted;
        }
        else {
            // we don't cache that
            return _asFormatted(this, true);
        }
    };
    _URI.prototype.toJSON = function () {
        var res = {
            $mid: 1
        };
        // cached state
        if (this._fsPath) {
            res.fsPath = this._fsPath;
        }
        if (this._formatted) {
            res.external = this._formatted;
        }
        // uri components
        if (this.path) {
            res.path = this.path;
        }
        if (this.scheme) {
            res.scheme = this.scheme;
        }
        if (this.authority) {
            res.authority = this.authority;
        }
        if (this.query) {
            res.query = this.query;
        }
        if (this.fragment) {
            res.fragment = this.fragment;
        }
        return res;
    };
    return _URI;
}(uri_URI));
// reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
var encodeTable = (uri_a = {},
    uri_a[58 /* Colon */] = '%3A',
    uri_a[47 /* Slash */] = '%2F',
    uri_a[63 /* QuestionMark */] = '%3F',
    uri_a[35 /* Hash */] = '%23',
    uri_a[91 /* OpenSquareBracket */] = '%5B',
    uri_a[93 /* CloseSquareBracket */] = '%5D',
    uri_a[64 /* AtSign */] = '%40',
    uri_a[33 /* ExclamationMark */] = '%21',
    uri_a[36 /* DollarSign */] = '%24',
    uri_a[38 /* Ampersand */] = '%26',
    uri_a[39 /* SingleQuote */] = '%27',
    uri_a[40 /* OpenParen */] = '%28',
    uri_a[41 /* CloseParen */] = '%29',
    uri_a[42 /* Asterisk */] = '%2A',
    uri_a[43 /* Plus */] = '%2B',
    uri_a[44 /* Comma */] = '%2C',
    uri_a[59 /* Semicolon */] = '%3B',
    uri_a[61 /* Equals */] = '%3D',
    uri_a[32 /* Space */] = '%20',
    uri_a);
function encodeURIComponentFast(uriComponent, allowSlash) {
    var res = undefined;
    var nativeEncodePos = -1;
    for (var pos = 0; pos < uriComponent.length; pos++) {
        var code = uriComponent.charCodeAt(pos);
        // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
        if ((code >= 97 /* a */ && code <= 122 /* z */)
            || (code >= 65 /* A */ && code <= 90 /* Z */)
            || (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */)
            || code === 45 /* Dash */
            || code === 46 /* Period */
            || code === 95 /* Underline */
            || code === 126 /* Tilde */
            || (allowSlash && code === 47 /* Slash */)) {
            // check if we are delaying native encode
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            // check if we write into a new string (by default we try to return the param)
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        }
        else {
            // encoding needed, we need to allocate a new string
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            // check with default table first
            var escaped = encodeTable[code];
            if (escaped !== undefined) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // append escaped variant to result
                res += escaped;
            }
            else if (nativeEncodePos === -1) {
                // use native encode only when needed
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function encodeURIComponentMinimal(path) {
    var res = undefined;
    for (var pos = 0; pos < path.length; pos++) {
        var code = path.charCodeAt(pos);
        if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += encodeTable[code];
        }
        else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
/**
 * Compute `fsPath` for the given uri
 */
function _makeFsPath(uri) {
    var value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
        // unc path: file://shares/c$/far/boo
        value = "//" + uri.authority + uri.path;
    }
    else if (uri.path.charCodeAt(0) === 47 /* Slash */
        && (uri.path.charCodeAt(1) >= 65 /* A */ && uri.path.charCodeAt(1) <= 90 /* Z */ || uri.path.charCodeAt(1) >= 97 /* a */ && uri.path.charCodeAt(1) <= 122 /* z */)
        && uri.path.charCodeAt(2) === 58 /* Colon */) {
        // windows drive letter: file:///c:/far/boo
        value = uri.path[1].toLowerCase() + uri.path.substr(2);
    }
    else {
        // other path
        value = uri.path;
    }
    if (isWindows) {
        value = value.replace(/\//g, '\\');
    }
    return value;
}
/**
 * Create the external version of a uri
 */
function _asFormatted(uri, skipEncoding) {
    var encoder = !skipEncoding
        ? encodeURIComponentFast
        : encodeURIComponentMinimal;
    var res = '';
    var scheme = uri.scheme, authority = uri.authority, path = uri.path, query = uri.query, fragment = uri.fragment;
    if (scheme) {
        res += scheme;
        res += ':';
    }
    if (authority || scheme === 'file') {
        res += _slash;
        res += _slash;
    }
    if (authority) {
        var idx = authority.indexOf('@');
        if (idx !== -1) {
            // <user>@<auth>
            var userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.indexOf(':');
            if (idx === -1) {
                res += encoder(userinfo, false);
            }
            else {
                // <user>:<pass>@<auth>
                res += encoder(userinfo.substr(0, idx), false);
                res += ':';
                res += encoder(userinfo.substr(idx + 1), false);
            }
            res += '@';
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(':');
        if (idx === -1) {
            res += encoder(authority, false);
        }
        else {
            // <auth>:<port>
            res += encoder(authority.substr(0, idx), false);
            res += authority.substr(idx);
        }
    }
    if (path) {
        // lower-case windows drive letters in /C:/fff or C:/fff
        if (path.length >= 3 && path.charCodeAt(0) === 47 /* Slash */ && path.charCodeAt(2) === 58 /* Colon */) {
            var code = path.charCodeAt(1);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = "/" + String.fromCharCode(code + 32) + ":" + path.substr(3); // "/c:".length === 3
            }
        }
        else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
            var code = path.charCodeAt(0);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = String.fromCharCode(code + 32) + ":" + path.substr(2); // "/c:".length === 3
            }
        }
        // encode the rest of the path
        res += encoder(path, true);
    }
    if (query) {
        res += '?';
        res += encoder(query, false);
    }
    if (fragment) {
        res += '#';
        res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/position.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A position in the editor.
 */
var Position = /** @class */ (function () {
    function Position(lineNumber, column) {
        this.lineNumber = lineNumber;
        this.column = column;
    }
    /**
     * Create a new postion from this position.
     *
     * @param newLineNumber new line number
     * @param newColumn new column
     */
    Position.prototype.with = function (newLineNumber, newColumn) {
        if (newLineNumber === void 0) { newLineNumber = this.lineNumber; }
        if (newColumn === void 0) { newColumn = this.column; }
        if (newLineNumber === this.lineNumber && newColumn === this.column) {
            return this;
        }
        else {
            return new Position(newLineNumber, newColumn);
        }
    };
    /**
     * Derive a new position from this position.
     *
     * @param deltaLineNumber line number delta
     * @param deltaColumn column delta
     */
    Position.prototype.delta = function (deltaLineNumber, deltaColumn) {
        if (deltaLineNumber === void 0) { deltaLineNumber = 0; }
        if (deltaColumn === void 0) { deltaColumn = 0; }
        return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
    };
    /**
     * Test if this position equals other position
     */
    Position.prototype.equals = function (other) {
        return Position.equals(this, other);
    };
    /**
     * Test if position `a` equals position `b`
     */
    Position.equals = function (a, b) {
        if (!a && !b) {
            return true;
        }
        return (!!a &&
            !!b &&
            a.lineNumber === b.lineNumber &&
            a.column === b.column);
    };
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be false.
     */
    Position.prototype.isBefore = function (other) {
        return Position.isBefore(this, other);
    };
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be false.
     */
    Position.isBefore = function (a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column < b.column;
    };
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be true.
     */
    Position.prototype.isBeforeOrEqual = function (other) {
        return Position.isBeforeOrEqual(this, other);
    };
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be true.
     */
    Position.isBeforeOrEqual = function (a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column <= b.column;
    };
    /**
     * A function that compares positions, useful for sorting
     */
    Position.compare = function (a, b) {
        var aLineNumber = a.lineNumber | 0;
        var bLineNumber = b.lineNumber | 0;
        if (aLineNumber === bLineNumber) {
            var aColumn = a.column | 0;
            var bColumn = b.column | 0;
            return aColumn - bColumn;
        }
        return aLineNumber - bLineNumber;
    };
    /**
     * Clone this position.
     */
    Position.prototype.clone = function () {
        return new Position(this.lineNumber, this.column);
    };
    /**
     * Convert to a human-readable representation.
     */
    Position.prototype.toString = function () {
        return '(' + this.lineNumber + ',' + this.column + ')';
    };
    // ---
    /**
     * Create a `Position` from an `IPosition`.
     */
    Position.lift = function (pos) {
        return new Position(pos.lineNumber, pos.column);
    };
    /**
     * Test if `obj` is an `IPosition`.
     */
    Position.isIPosition = function (obj) {
        return (obj
            && (typeof obj.lineNumber === 'number')
            && (typeof obj.column === 'number'));
    };
    return Position;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/range.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * A range in the editor. (startLineNumber,startColumn) is <= (endLineNumber,endColumn)
 */
var range_Range = /** @class */ (function () {
    function Range(startLineNumber, startColumn, endLineNumber, endColumn) {
        if ((startLineNumber > endLineNumber) || (startLineNumber === endLineNumber && startColumn > endColumn)) {
            this.startLineNumber = endLineNumber;
            this.startColumn = endColumn;
            this.endLineNumber = startLineNumber;
            this.endColumn = startColumn;
        }
        else {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
    /**
     * Test if this range is empty.
     */
    Range.prototype.isEmpty = function () {
        return Range.isEmpty(this);
    };
    /**
     * Test if `range` is empty.
     */
    Range.isEmpty = function (range) {
        return (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn);
    };
    /**
     * Test if position is in this range. If the position is at the edges, will return true.
     */
    Range.prototype.containsPosition = function (position) {
        return Range.containsPosition(this, position);
    };
    /**
     * Test if `position` is in `range`. If the position is at the edges, will return true.
     */
    Range.containsPosition = function (range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
            return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
            return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
            return false;
        }
        return true;
    };
    /**
     * Test if range is in this range. If the range is equal to this range, will return true.
     */
    Range.prototype.containsRange = function (range) {
        return Range.containsRange(this, range);
    };
    /**
     * Test if `otherRange` is in `range`. If the ranges are equal, will return true.
     */
    Range.containsRange = function (range, otherRange) {
        if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
            return false;
        }
        if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
            return false;
        }
        return true;
    };
    /**
     * A reunion of the two ranges.
     * The smallest position will be used as the start point, and the largest one as the end point.
     */
    Range.prototype.plusRange = function (range) {
        return Range.plusRange(this, range);
    };
    /**
     * A reunion of the two ranges.
     * The smallest position will be used as the start point, and the largest one as the end point.
     */
    Range.plusRange = function (a, b) {
        var startLineNumber;
        var startColumn;
        var endLineNumber;
        var endColumn;
        if (b.startLineNumber < a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = b.startColumn;
        }
        else if (b.startLineNumber === a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = Math.min(b.startColumn, a.startColumn);
        }
        else {
            startLineNumber = a.startLineNumber;
            startColumn = a.startColumn;
        }
        if (b.endLineNumber > a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = b.endColumn;
        }
        else if (b.endLineNumber === a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = Math.max(b.endColumn, a.endColumn);
        }
        else {
            endLineNumber = a.endLineNumber;
            endColumn = a.endColumn;
        }
        return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    };
    /**
     * A intersection of the two ranges.
     */
    Range.prototype.intersectRanges = function (range) {
        return Range.intersectRanges(this, range);
    };
    /**
     * A intersection of the two ranges.
     */
    Range.intersectRanges = function (a, b) {
        var resultStartLineNumber = a.startLineNumber;
        var resultStartColumn = a.startColumn;
        var resultEndLineNumber = a.endLineNumber;
        var resultEndColumn = a.endColumn;
        var otherStartLineNumber = b.startLineNumber;
        var otherStartColumn = b.startColumn;
        var otherEndLineNumber = b.endLineNumber;
        var otherEndColumn = b.endColumn;
        if (resultStartLineNumber < otherStartLineNumber) {
            resultStartLineNumber = otherStartLineNumber;
            resultStartColumn = otherStartColumn;
        }
        else if (resultStartLineNumber === otherStartLineNumber) {
            resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
        }
        if (resultEndLineNumber > otherEndLineNumber) {
            resultEndLineNumber = otherEndLineNumber;
            resultEndColumn = otherEndColumn;
        }
        else if (resultEndLineNumber === otherEndLineNumber) {
            resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
        }
        // Check if selection is now empty
        if (resultStartLineNumber > resultEndLineNumber) {
            return null;
        }
        if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
            return null;
        }
        return new Range(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
    };
    /**
     * Test if this range equals other.
     */
    Range.prototype.equalsRange = function (other) {
        return Range.equalsRange(this, other);
    };
    /**
     * Test if range `a` equals `b`.
     */
    Range.equalsRange = function (a, b) {
        return (!!a &&
            !!b &&
            a.startLineNumber === b.startLineNumber &&
            a.startColumn === b.startColumn &&
            a.endLineNumber === b.endLineNumber &&
            a.endColumn === b.endColumn);
    };
    /**
     * Return the end position (which will be after or equal to the start position)
     */
    Range.prototype.getEndPosition = function () {
        return new Position(this.endLineNumber, this.endColumn);
    };
    /**
     * Return the start position (which will be before or equal to the end position)
     */
    Range.prototype.getStartPosition = function () {
        return new Position(this.startLineNumber, this.startColumn);
    };
    /**
     * Transform to a user presentable string representation.
     */
    Range.prototype.toString = function () {
        return '[' + this.startLineNumber + ',' + this.startColumn + ' -> ' + this.endLineNumber + ',' + this.endColumn + ']';
    };
    /**
     * Create a new range using this range's start position, and using endLineNumber and endColumn as the end position.
     */
    Range.prototype.setEndPosition = function (endLineNumber, endColumn) {
        return new Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
    };
    /**
     * Create a new range using this range's end position, and using startLineNumber and startColumn as the start position.
     */
    Range.prototype.setStartPosition = function (startLineNumber, startColumn) {
        return new Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
    };
    /**
     * Create a new empty range using this range's start position.
     */
    Range.prototype.collapseToStart = function () {
        return Range.collapseToStart(this);
    };
    /**
     * Create a new empty range using this range's start position.
     */
    Range.collapseToStart = function (range) {
        return new Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
    };
    // ---
    Range.fromPositions = function (start, end) {
        if (end === void 0) { end = start; }
        return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
    };
    Range.lift = function (range) {
        if (!range) {
            return null;
        }
        return new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    };
    /**
     * Test if `obj` is an `IRange`.
     */
    Range.isIRange = function (obj) {
        return (obj
            && (typeof obj.startLineNumber === 'number')
            && (typeof obj.startColumn === 'number')
            && (typeof obj.endLineNumber === 'number')
            && (typeof obj.endColumn === 'number'));
    };
    /**
     * Test if the two ranges are touching in any way.
     */
    Range.areIntersectingOrTouching = function (a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn)) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn)) {
            return false;
        }
        // These ranges must intersect
        return true;
    };
    /**
     * Test if the two ranges are intersecting. If the ranges are touching it returns true.
     */
    Range.areIntersecting = function (a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn)) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn)) {
            return false;
        }
        // These ranges must intersect
        return true;
    };
    /**
     * A function that compares ranges, useful for sorting ranges
     * It will first compare ranges on the startPosition and then on the endPosition
     */
    Range.compareRangesUsingStarts = function (a, b) {
        if (a && b) {
            var aStartLineNumber = a.startLineNumber | 0;
            var bStartLineNumber = b.startLineNumber | 0;
            if (aStartLineNumber === bStartLineNumber) {
                var aStartColumn = a.startColumn | 0;
                var bStartColumn = b.startColumn | 0;
                if (aStartColumn === bStartColumn) {
                    var aEndLineNumber = a.endLineNumber | 0;
                    var bEndLineNumber = b.endLineNumber | 0;
                    if (aEndLineNumber === bEndLineNumber) {
                        var aEndColumn = a.endColumn | 0;
                        var bEndColumn = b.endColumn | 0;
                        return aEndColumn - bEndColumn;
                    }
                    return aEndLineNumber - bEndLineNumber;
                }
                return aStartColumn - bStartColumn;
            }
            return aStartLineNumber - bStartLineNumber;
        }
        var aExists = (a ? 1 : 0);
        var bExists = (b ? 1 : 0);
        return aExists - bExists;
    };
    /**
     * A function that compares ranges, useful for sorting ranges
     * It will first compare ranges on the endPosition and then on the startPosition
     */
    Range.compareRangesUsingEnds = function (a, b) {
        if (a.endLineNumber === b.endLineNumber) {
            if (a.endColumn === b.endColumn) {
                if (a.startLineNumber === b.startLineNumber) {
                    return a.startColumn - b.startColumn;
                }
                return a.startLineNumber - b.startLineNumber;
            }
            return a.endColumn - b.endColumn;
        }
        return a.endLineNumber - b.endLineNumber;
    };
    /**
     * Test if the range spans multiple lines.
     */
    Range.spansMultipleLines = function (range) {
        return range.endLineNumber > range.startLineNumber;
    };
    return Range;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/strings.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * The empty string.
 */
var empty = '';
function isFalsyOrWhitespace(str) {
    if (!str || typeof str !== 'string') {
        return true;
    }
    return str.trim().length === 0;
}
/**
 * @returns the provided number with the given number of preceding zeros.
 */
function pad(n, l, char) {
    if (char === void 0) { char = '0'; }
    var str = '' + n;
    var r = [str];
    for (var i = str.length; i < l; i++) {
        r.push(char);
    }
    return r.reverse().join('');
}
var _formatRegexp = /{(\d+)}/g;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
function format(value) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (args.length === 0) {
        return value;
    }
    return value.replace(_formatRegexp, function (match, group) {
        var idx = parseInt(group, 10);
        return isNaN(idx) || idx < 0 || idx >= args.length ?
            match :
            args[idx];
    });
}
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
function strings_escape(html) {
    return html.replace(/[<>&]/g, function (match) {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            default: return match;
        }
    });
}
/**
 * Escapes regular expression characters in a given string
 */
function escapeRegExpCharacters(value) {
    return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}
/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
function trim(haystack, needle) {
    if (needle === void 0) { needle = ' '; }
    var trimmed = ltrim(haystack, needle);
    return rtrim(trimmed, needle);
}
/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function ltrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    var needleLen = needle.length;
    if (needleLen === 0 || haystack.length === 0) {
        return haystack;
    }
    var offset = 0;
    while (haystack.indexOf(needle, offset) === offset) {
        offset = offset + needleLen;
    }
    return haystack.substring(offset);
}
/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function rtrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    var needleLen = needle.length, haystackLen = haystack.length;
    if (needleLen === 0 || haystackLen === 0) {
        return haystack;
    }
    var offset = haystackLen, idx = -1;
    while (true) {
        idx = haystack.lastIndexOf(needle, offset - 1);
        if (idx === -1 || idx + needleLen !== offset) {
            break;
        }
        if (idx === 0) {
            return '';
        }
        offset = idx;
    }
    return haystack.substring(0, offset);
}
function convertSimple2RegExpPattern(pattern) {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}
/**
 * Determines if haystack starts with needle.
 */
function startsWith(haystack, needle) {
    if (haystack.length < needle.length) {
        return false;
    }
    if (haystack === needle) {
        return true;
    }
    for (var i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
            return false;
        }
    }
    return true;
}
/**
 * Determines if haystack ends with needle.
 */
function endsWith(haystack, needle) {
    var diff = haystack.length - needle.length;
    if (diff > 0) {
        return haystack.indexOf(needle, diff) === diff;
    }
    else if (diff === 0) {
        return haystack === needle;
    }
    else {
        return false;
    }
}
function createRegExp(searchString, isRegex, options) {
    if (options === void 0) { options = {}; }
    if (!searchString) {
        throw new Error('Cannot create regex from empty string');
    }
    if (!isRegex) {
        searchString = escapeRegExpCharacters(searchString);
    }
    if (options.wholeWord) {
        if (!/\B/.test(searchString.charAt(0))) {
            searchString = '\\b' + searchString;
        }
        if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
            searchString = searchString + '\\b';
        }
    }
    var modifiers = '';
    if (options.global) {
        modifiers += 'g';
    }
    if (!options.matchCase) {
        modifiers += 'i';
    }
    if (options.multiline) {
        modifiers += 'm';
    }
    if (options.unicode) {
        modifiers += 'u';
    }
    return new RegExp(searchString, modifiers);
}
function regExpLeadsToEndlessLoop(regexp) {
    // Exit early if it's one of these special cases which are meant to match
    // against an empty string
    if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
        return false;
    }
    // We check against an empty string. If the regular expression doesn't advance
    // (e.g. ends in an endless loop) it will match an empty string.
    var match = regexp.exec('');
    return !!(match && regexp.lastIndex === 0);
}
function regExpFlags(regexp) {
    return (regexp.global ? 'g' : '')
        + (regexp.ignoreCase ? 'i' : '')
        + (regexp.multiline ? 'm' : '')
        + (regexp.unicode ? 'u' : '');
}
/**
 * Returns first index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function firstNonWhitespaceIndex(str) {
    for (var i = 0, len = str.length; i < len; i++) {
        var chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return i;
        }
    }
    return -1;
}
/**
 * Returns the leading whitespace of the string.
 * If the string contains only whitespaces, returns entire string
 */
function getLeadingWhitespace(str, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = str.length; }
    for (var i = start; i < end; i++) {
        var chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return str.substring(start, i);
        }
    }
    return str.substring(start, end);
}
/**
 * Returns last index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function lastNonWhitespaceIndex(str, startIndex) {
    if (startIndex === void 0) { startIndex = str.length - 1; }
    for (var i = startIndex; i >= 0; i--) {
        var chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return i;
        }
    }
    return -1;
}
function compare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
}
function isLowerAsciiLetter(code) {
    return code >= 97 /* a */ && code <= 122 /* z */;
}
function isUpperAsciiLetter(code) {
    return code >= 65 /* A */ && code <= 90 /* Z */;
}
function isAsciiLetter(code) {
    return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
}
function equalsIgnoreCase(a, b) {
    var len1 = a ? a.length : 0;
    var len2 = b ? b.length : 0;
    if (len1 !== len2) {
        return false;
    }
    return doEqualsIgnoreCase(a, b);
}
function doEqualsIgnoreCase(a, b, stopAt) {
    if (stopAt === void 0) { stopAt = a.length; }
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    for (var i = 0; i < stopAt; i++) {
        var codeA = a.charCodeAt(i);
        var codeB = b.charCodeAt(i);
        if (codeA === codeB) {
            continue;
        }
        // a-z A-Z
        if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
            var diff = Math.abs(codeA - codeB);
            if (diff !== 0 && diff !== 32) {
                return false;
            }
        }
        // Any other charcode
        else {
            if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
                return false;
            }
        }
    }
    return true;
}
function startsWithIgnoreCase(str, candidate) {
    var candidateLength = candidate.length;
    if (candidate.length > str.length) {
        return false;
    }
    return doEqualsIgnoreCase(str, candidate, candidateLength);
}
/**
 * @returns the length of the common prefix of the two strings.
 */
function commonPrefixLength(a, b) {
    var i, len = Math.min(a.length, b.length);
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
            return i;
        }
    }
    return len;
}
/**
 * @returns the length of the common suffix of the two strings.
 */
function commonSuffixLength(a, b) {
    var i, len = Math.min(a.length, b.length);
    var aLastIndex = a.length - 1;
    var bLastIndex = b.length - 1;
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
            return i;
        }
    }
    return len;
}
// --- unicode
// http://en.wikipedia.org/wiki/Surrogate_pair
// Returns the code point starting at a specified index in a string
// Code points U+0000 to U+D7FF and U+E000 to U+FFFF are represented on a single character
// Code points U+10000 to U+10FFFF are represented on two consecutive characters
//export function getUnicodePoint(str:string, index:number, len:number):number {
//	const chrCode = str.charCodeAt(index);
//	if (0xD800 <= chrCode && chrCode <= 0xDBFF && index + 1 < len) {
//		const nextChrCode = str.charCodeAt(index + 1);
//		if (0xDC00 <= nextChrCode && nextChrCode <= 0xDFFF) {
//			return (chrCode - 0xD800) << 10 + (nextChrCode - 0xDC00) + 0x10000;
//		}
//	}
//	return chrCode;
//}
function isHighSurrogate(charCode) {
    return (0xD800 <= charCode && charCode <= 0xDBFF);
}
function isLowSurrogate(charCode) {
    return (0xDC00 <= charCode && charCode <= 0xDFFF);
}
/**
 * Generated using https://github.com/alexandrudima/unicode-utils/blob/master/generate-rtl-test.js
 */
var CONTAINS_RTL = /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u08BD\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE33\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDCFF]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD50-\uDFFF]|\uD83B[\uDC00-\uDEBB])/;
/**
 * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
 */
function containsRTL(str) {
    return CONTAINS_RTL.test(str);
}
/**
 * Generated using https://github.com/alexandrudima/unicode-utils/blob/master/generate-emoji-test.js
 */
var CONTAINS_EMOJI = /(?:[\u231A\u231B\u23F0\u23F3\u2600-\u27BF\u2B50\u2B55]|\uD83C[\uDDE6-\uDDFF\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEF8]|\uD83E[\uDD00-\uDDE6])/;
function containsEmoji(str) {
    return CONTAINS_EMOJI.test(str);
}
var IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
/**
 * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
 */
function isBasicASCII(str) {
    return IS_BASIC_ASCII.test(str);
}
function containsFullWidthCharacter(str) {
    for (var i = 0, len = str.length; i < len; i++) {
        if (isFullWidthCharacter(str.charCodeAt(i))) {
            return true;
        }
    }
    return false;
}
function isFullWidthCharacter(charCode) {
    // Do a cheap trick to better support wrapping of wide characters, treat them as 2 columns
    // http://jrgraphix.net/research/unicode_blocks.php
    //          2E80 — 2EFF   CJK Radicals Supplement
    //          2F00 — 2FDF   Kangxi Radicals
    //          2FF0 — 2FFF   Ideographic Description Characters
    //          3000 — 303F   CJK Symbols and Punctuation
    //          3040 — 309F   Hiragana
    //          30A0 — 30FF   Katakana
    //          3100 — 312F   Bopomofo
    //          3130 — 318F   Hangul Compatibility Jamo
    //          3190 — 319F   Kanbun
    //          31A0 — 31BF   Bopomofo Extended
    //          31F0 — 31FF   Katakana Phonetic Extensions
    //          3200 — 32FF   Enclosed CJK Letters and Months
    //          3300 — 33FF   CJK Compatibility
    //          3400 — 4DBF   CJK Unified Ideographs Extension A
    //          4DC0 — 4DFF   Yijing Hexagram Symbols
    //          4E00 — 9FFF   CJK Unified Ideographs
    //          A000 — A48F   Yi Syllables
    //          A490 — A4CF   Yi Radicals
    //          AC00 — D7AF   Hangul Syllables
    // [IGNORE] D800 — DB7F   High Surrogates
    // [IGNORE] DB80 — DBFF   High Private Use Surrogates
    // [IGNORE] DC00 — DFFF   Low Surrogates
    // [IGNORE] E000 — F8FF   Private Use Area
    //          F900 — FAFF   CJK Compatibility Ideographs
    // [IGNORE] FB00 — FB4F   Alphabetic Presentation Forms
    // [IGNORE] FB50 — FDFF   Arabic Presentation Forms-A
    // [IGNORE] FE00 — FE0F   Variation Selectors
    // [IGNORE] FE20 — FE2F   Combining Half Marks
    // [IGNORE] FE30 — FE4F   CJK Compatibility Forms
    // [IGNORE] FE50 — FE6F   Small Form Variants
    // [IGNORE] FE70 — FEFF   Arabic Presentation Forms-B
    //          FF00 — FFEF   Halfwidth and Fullwidth Forms
    //               [https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms]
    //               of which FF01 - FF5E fullwidth ASCII of 21 to 7E
    // [IGNORE]    and FF65 - FFDC halfwidth of Katakana and Hangul
    // [IGNORE] FFF0 — FFFF   Specials
    charCode = +charCode; // @perf
    return ((charCode >= 0x2E80 && charCode <= 0xD7AF)
        || (charCode >= 0xF900 && charCode <= 0xFAFF)
        || (charCode >= 0xFF01 && charCode <= 0xFF5E));
}
// -- UTF-8 BOM
var UTF8_BOM_CHARACTER = String.fromCharCode(65279 /* UTF8_BOM */);
function startsWithUTF8BOM(str) {
    return !!(str && str.length > 0 && str.charCodeAt(0) === 65279 /* UTF8_BOM */);
}
function safeBtoa(str) {
    return btoa(encodeURIComponent(str)); // we use encodeURIComponent because btoa fails for non Latin 1 values
}
function repeat(s, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += s;
    }
    return result;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/diff/diffComputer.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var MAXIMUM_RUN_TIME = 5000; // 5 seconds
var MINIMUM_MATCHING_CHARACTER_LENGTH = 3;
function computeDiff(originalSequence, modifiedSequence, continueProcessingPredicate, pretty) {
    var diffAlgo = new diff_LcsDiff(originalSequence, modifiedSequence, continueProcessingPredicate);
    return diffAlgo.ComputeDiff(pretty);
}
var diffComputer_LineMarkerSequence = /** @class */ (function () {
    function LineMarkerSequence(lines) {
        var startColumns = [];
        var endColumns = [];
        for (var i = 0, length_1 = lines.length; i < length_1; i++) {
            startColumns[i] = LineMarkerSequence._getFirstNonBlankColumn(lines[i], 1);
            endColumns[i] = LineMarkerSequence._getLastNonBlankColumn(lines[i], 1);
        }
        this._lines = lines;
        this._startColumns = startColumns;
        this._endColumns = endColumns;
    }
    LineMarkerSequence.prototype.getLength = function () {
        return this._lines.length;
    };
    LineMarkerSequence.prototype.getElementAtIndex = function (i) {
        return this._lines[i].substring(this._startColumns[i] - 1, this._endColumns[i] - 1);
    };
    LineMarkerSequence.prototype.getStartLineNumber = function (i) {
        return i + 1;
    };
    LineMarkerSequence.prototype.getEndLineNumber = function (i) {
        return i + 1;
    };
    LineMarkerSequence._getFirstNonBlankColumn = function (txt, defaultValue) {
        var r = firstNonWhitespaceIndex(txt);
        if (r === -1) {
            return defaultValue;
        }
        return r + 1;
    };
    LineMarkerSequence._getLastNonBlankColumn = function (txt, defaultValue) {
        var r = lastNonWhitespaceIndex(txt);
        if (r === -1) {
            return defaultValue;
        }
        return r + 2;
    };
    LineMarkerSequence.prototype.getCharSequence = function (shouldIgnoreTrimWhitespace, startIndex, endIndex) {
        var charCodes = [];
        var lineNumbers = [];
        var columns = [];
        var len = 0;
        for (var index = startIndex; index <= endIndex; index++) {
            var lineContent = this._lines[index];
            var startColumn = (shouldIgnoreTrimWhitespace ? this._startColumns[index] : 1);
            var endColumn = (shouldIgnoreTrimWhitespace ? this._endColumns[index] : lineContent.length + 1);
            for (var col = startColumn; col < endColumn; col++) {
                charCodes[len] = lineContent.charCodeAt(col - 1);
                lineNumbers[len] = index + 1;
                columns[len] = col;
                len++;
            }
        }
        return new CharSequence(charCodes, lineNumbers, columns);
    };
    return LineMarkerSequence;
}());
var CharSequence = /** @class */ (function () {
    function CharSequence(charCodes, lineNumbers, columns) {
        this._charCodes = charCodes;
        this._lineNumbers = lineNumbers;
        this._columns = columns;
    }
    CharSequence.prototype.getLength = function () {
        return this._charCodes.length;
    };
    CharSequence.prototype.getElementAtIndex = function (i) {
        return this._charCodes[i];
    };
    CharSequence.prototype.getStartLineNumber = function (i) {
        return this._lineNumbers[i];
    };
    CharSequence.prototype.getStartColumn = function (i) {
        return this._columns[i];
    };
    CharSequence.prototype.getEndLineNumber = function (i) {
        return this._lineNumbers[i];
    };
    CharSequence.prototype.getEndColumn = function (i) {
        return this._columns[i] + 1;
    };
    return CharSequence;
}());
var CharChange = /** @class */ (function () {
    function CharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
        this.originalStartLineNumber = originalStartLineNumber;
        this.originalStartColumn = originalStartColumn;
        this.originalEndLineNumber = originalEndLineNumber;
        this.originalEndColumn = originalEndColumn;
        this.modifiedStartLineNumber = modifiedStartLineNumber;
        this.modifiedStartColumn = modifiedStartColumn;
        this.modifiedEndLineNumber = modifiedEndLineNumber;
        this.modifiedEndColumn = modifiedEndColumn;
    }
    CharChange.createFromDiffChange = function (diffChange, originalCharSequence, modifiedCharSequence) {
        var originalStartLineNumber;
        var originalStartColumn;
        var originalEndLineNumber;
        var originalEndColumn;
        var modifiedStartLineNumber;
        var modifiedStartColumn;
        var modifiedEndLineNumber;
        var modifiedEndColumn;
        if (diffChange.originalLength === 0) {
            originalStartLineNumber = 0;
            originalStartColumn = 0;
            originalEndLineNumber = 0;
            originalEndColumn = 0;
        }
        else {
            originalStartLineNumber = originalCharSequence.getStartLineNumber(diffChange.originalStart);
            originalStartColumn = originalCharSequence.getStartColumn(diffChange.originalStart);
            originalEndLineNumber = originalCharSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
            originalEndColumn = originalCharSequence.getEndColumn(diffChange.originalStart + diffChange.originalLength - 1);
        }
        if (diffChange.modifiedLength === 0) {
            modifiedStartLineNumber = 0;
            modifiedStartColumn = 0;
            modifiedEndLineNumber = 0;
            modifiedEndColumn = 0;
        }
        else {
            modifiedStartLineNumber = modifiedCharSequence.getStartLineNumber(diffChange.modifiedStart);
            modifiedStartColumn = modifiedCharSequence.getStartColumn(diffChange.modifiedStart);
            modifiedEndLineNumber = modifiedCharSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
            modifiedEndColumn = modifiedCharSequence.getEndColumn(diffChange.modifiedStart + diffChange.modifiedLength - 1);
        }
        return new CharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn);
    };
    return CharChange;
}());
function postProcessCharChanges(rawChanges) {
    if (rawChanges.length <= 1) {
        return rawChanges;
    }
    var result = [rawChanges[0]];
    var prevChange = result[0];
    for (var i = 1, len = rawChanges.length; i < len; i++) {
        var currChange = rawChanges[i];
        var originalMatchingLength = currChange.originalStart - (prevChange.originalStart + prevChange.originalLength);
        var modifiedMatchingLength = currChange.modifiedStart - (prevChange.modifiedStart + prevChange.modifiedLength);
        // Both of the above should be equal, but the continueProcessingPredicate may prevent this from being true
        var matchingLength = Math.min(originalMatchingLength, modifiedMatchingLength);
        if (matchingLength < MINIMUM_MATCHING_CHARACTER_LENGTH) {
            // Merge the current change into the previous one
            prevChange.originalLength = (currChange.originalStart + currChange.originalLength) - prevChange.originalStart;
            prevChange.modifiedLength = (currChange.modifiedStart + currChange.modifiedLength) - prevChange.modifiedStart;
        }
        else {
            // Add the current change
            result.push(currChange);
            prevChange = currChange;
        }
    }
    return result;
}
var LineChange = /** @class */ (function () {
    function LineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
        this.originalStartLineNumber = originalStartLineNumber;
        this.originalEndLineNumber = originalEndLineNumber;
        this.modifiedStartLineNumber = modifiedStartLineNumber;
        this.modifiedEndLineNumber = modifiedEndLineNumber;
        this.charChanges = charChanges;
    }
    LineChange.createFromDiffResult = function (shouldIgnoreTrimWhitespace, diffChange, originalLineSequence, modifiedLineSequence, continueProcessingPredicate, shouldComputeCharChanges, shouldPostProcessCharChanges) {
        var originalStartLineNumber;
        var originalEndLineNumber;
        var modifiedStartLineNumber;
        var modifiedEndLineNumber;
        var charChanges = undefined;
        if (diffChange.originalLength === 0) {
            originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart) - 1;
            originalEndLineNumber = 0;
        }
        else {
            originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart);
            originalEndLineNumber = originalLineSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
        }
        if (diffChange.modifiedLength === 0) {
            modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart) - 1;
            modifiedEndLineNumber = 0;
        }
        else {
            modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart);
            modifiedEndLineNumber = modifiedLineSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
        }
        if (shouldComputeCharChanges && diffChange.originalLength !== 0 && diffChange.modifiedLength !== 0 && continueProcessingPredicate()) {
            var originalCharSequence = originalLineSequence.getCharSequence(shouldIgnoreTrimWhitespace, diffChange.originalStart, diffChange.originalStart + diffChange.originalLength - 1);
            var modifiedCharSequence = modifiedLineSequence.getCharSequence(shouldIgnoreTrimWhitespace, diffChange.modifiedStart, diffChange.modifiedStart + diffChange.modifiedLength - 1);
            var rawChanges = computeDiff(originalCharSequence, modifiedCharSequence, continueProcessingPredicate, true);
            if (shouldPostProcessCharChanges) {
                rawChanges = postProcessCharChanges(rawChanges);
            }
            charChanges = [];
            for (var i = 0, length_2 = rawChanges.length; i < length_2; i++) {
                charChanges.push(CharChange.createFromDiffChange(rawChanges[i], originalCharSequence, modifiedCharSequence));
            }
        }
        return new LineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges);
    };
    return LineChange;
}());
var DiffComputer = /** @class */ (function () {
    function DiffComputer(originalLines, modifiedLines, opts) {
        this.shouldComputeCharChanges = opts.shouldComputeCharChanges;
        this.shouldPostProcessCharChanges = opts.shouldPostProcessCharChanges;
        this.shouldIgnoreTrimWhitespace = opts.shouldIgnoreTrimWhitespace;
        this.shouldMakePrettyDiff = opts.shouldMakePrettyDiff;
        this.maximumRunTimeMs = MAXIMUM_RUN_TIME;
        this.originalLines = originalLines;
        this.modifiedLines = modifiedLines;
        this.original = new diffComputer_LineMarkerSequence(originalLines);
        this.modified = new diffComputer_LineMarkerSequence(modifiedLines);
    }
    DiffComputer.prototype.computeDiff = function () {
        if (this.original.getLength() === 1 && this.original.getElementAtIndex(0).length === 0) {
            // empty original => fast path
            return [{
                    originalStartLineNumber: 1,
                    originalEndLineNumber: 1,
                    modifiedStartLineNumber: 1,
                    modifiedEndLineNumber: this.modified.getLength(),
                    charChanges: [{
                            modifiedEndColumn: 0,
                            modifiedEndLineNumber: 0,
                            modifiedStartColumn: 0,
                            modifiedStartLineNumber: 0,
                            originalEndColumn: 0,
                            originalEndLineNumber: 0,
                            originalStartColumn: 0,
                            originalStartLineNumber: 0
                        }]
                }];
        }
        if (this.modified.getLength() === 1 && this.modified.getElementAtIndex(0).length === 0) {
            // empty modified => fast path
            return [{
                    originalStartLineNumber: 1,
                    originalEndLineNumber: this.original.getLength(),
                    modifiedStartLineNumber: 1,
                    modifiedEndLineNumber: 1,
                    charChanges: [{
                            modifiedEndColumn: 0,
                            modifiedEndLineNumber: 0,
                            modifiedStartColumn: 0,
                            modifiedStartLineNumber: 0,
                            originalEndColumn: 0,
                            originalEndLineNumber: 0,
                            originalStartColumn: 0,
                            originalStartLineNumber: 0
                        }]
                }];
        }
        this.computationStartTime = (new Date()).getTime();
        var rawChanges = computeDiff(this.original, this.modified, this._continueProcessingPredicate.bind(this), this.shouldMakePrettyDiff);
        // The diff is always computed with ignoring trim whitespace
        // This ensures we get the prettiest diff
        if (this.shouldIgnoreTrimWhitespace) {
            var lineChanges = [];
            for (var i = 0, length_3 = rawChanges.length; i < length_3; i++) {
                lineChanges.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, rawChanges[i], this.original, this.modified, this._continueProcessingPredicate.bind(this), this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
            }
            return lineChanges;
        }
        // Need to post-process and introduce changes where the trim whitespace is different
        // Note that we are looping starting at -1 to also cover the lines before the first change
        var result = [];
        var originalLineIndex = 0;
        var modifiedLineIndex = 0;
        for (var i = -1 /* !!!! */, len = rawChanges.length; i < len; i++) {
            var nextChange = (i + 1 < len ? rawChanges[i + 1] : null);
            var originalStop = (nextChange ? nextChange.originalStart : this.originalLines.length);
            var modifiedStop = (nextChange ? nextChange.modifiedStart : this.modifiedLines.length);
            while (originalLineIndex < originalStop && modifiedLineIndex < modifiedStop) {
                var originalLine = this.originalLines[originalLineIndex];
                var modifiedLine = this.modifiedLines[modifiedLineIndex];
                if (originalLine !== modifiedLine) {
                    // These lines differ only in trim whitespace
                    // Check the leading whitespace
                    {
                        var originalStartColumn = diffComputer_LineMarkerSequence._getFirstNonBlankColumn(originalLine, 1);
                        var modifiedStartColumn = diffComputer_LineMarkerSequence._getFirstNonBlankColumn(modifiedLine, 1);
                        while (originalStartColumn > 1 && modifiedStartColumn > 1) {
                            var originalChar = originalLine.charCodeAt(originalStartColumn - 2);
                            var modifiedChar = modifiedLine.charCodeAt(modifiedStartColumn - 2);
                            if (originalChar !== modifiedChar) {
                                break;
                            }
                            originalStartColumn--;
                            modifiedStartColumn--;
                        }
                        if (originalStartColumn > 1 || modifiedStartColumn > 1) {
                            this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, 1, originalStartColumn, modifiedLineIndex + 1, 1, modifiedStartColumn);
                        }
                    }
                    // Check the trailing whitespace
                    {
                        var originalEndColumn = diffComputer_LineMarkerSequence._getLastNonBlankColumn(originalLine, 1);
                        var modifiedEndColumn = diffComputer_LineMarkerSequence._getLastNonBlankColumn(modifiedLine, 1);
                        var originalMaxColumn = originalLine.length + 1;
                        var modifiedMaxColumn = modifiedLine.length + 1;
                        while (originalEndColumn < originalMaxColumn && modifiedEndColumn < modifiedMaxColumn) {
                            var originalChar = originalLine.charCodeAt(originalEndColumn - 1);
                            var modifiedChar = originalLine.charCodeAt(modifiedEndColumn - 1);
                            if (originalChar !== modifiedChar) {
                                break;
                            }
                            originalEndColumn++;
                            modifiedEndColumn++;
                        }
                        if (originalEndColumn < originalMaxColumn || modifiedEndColumn < modifiedMaxColumn) {
                            this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, originalEndColumn, originalMaxColumn, modifiedLineIndex + 1, modifiedEndColumn, modifiedMaxColumn);
                        }
                    }
                }
                originalLineIndex++;
                modifiedLineIndex++;
            }
            if (nextChange) {
                // Emit the actual change
                result.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, nextChange, this.original, this.modified, this._continueProcessingPredicate.bind(this), this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
                originalLineIndex += nextChange.originalLength;
                modifiedLineIndex += nextChange.modifiedLength;
            }
        }
        return result;
    };
    DiffComputer.prototype._pushTrimWhitespaceCharChange = function (result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
        if (this._mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn)) {
            // Merged into previous
            return;
        }
        var charChanges = undefined;
        if (this.shouldComputeCharChanges) {
            charChanges = [new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn)];
        }
        result.push(new LineChange(originalLineNumber, originalLineNumber, modifiedLineNumber, modifiedLineNumber, charChanges));
    };
    DiffComputer.prototype._mergeTrimWhitespaceCharChange = function (result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
        var len = result.length;
        if (len === 0) {
            return false;
        }
        var prevChange = result[len - 1];
        if (prevChange.originalEndLineNumber === 0 || prevChange.modifiedEndLineNumber === 0) {
            // Don't merge with inserts/deletes
            return false;
        }
        if (prevChange.originalEndLineNumber + 1 === originalLineNumber && prevChange.modifiedEndLineNumber + 1 === modifiedLineNumber) {
            prevChange.originalEndLineNumber = originalLineNumber;
            prevChange.modifiedEndLineNumber = modifiedLineNumber;
            if (this.shouldComputeCharChanges) {
                prevChange.charChanges.push(new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn));
            }
            return true;
        }
        return false;
    };
    DiffComputer.prototype._continueProcessingPredicate = function () {
        if (this.maximumRunTimeMs === 0) {
            return true;
        }
        var now = (new Date()).getTime();
        return now - this.computationStartTime < this.maximumRunTimeMs;
    };
    return DiffComputer;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/uint.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Uint8Matrix = /** @class */ (function () {
    function Uint8Matrix(rows, cols, defaultValue) {
        var data = new Uint8Array(rows * cols);
        for (var i = 0, len = rows * cols; i < len; i++) {
            data[i] = defaultValue;
        }
        this._data = data;
        this.rows = rows;
        this.cols = cols;
    }
    Uint8Matrix.prototype.get = function (row, col) {
        return this._data[row * this.cols + col];
    };
    Uint8Matrix.prototype.set = function (row, col, value) {
        this._data[row * this.cols + col] = value;
    };
    return Uint8Matrix;
}());

function toUint8(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 255 /* MAX_UINT_8 */) {
        return 255 /* MAX_UINT_8 */;
    }
    return v | 0;
}
function toUint32(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 4294967295 /* MAX_UINT_32 */) {
        return 4294967295 /* MAX_UINT_32 */;
    }
    return v | 0;
}
function toUint32Array(arr) {
    var len = arr.length;
    var r = new Uint32Array(len);
    for (var i = 0; i < len; i++) {
        r[i] = toUint32(arr[i]);
    }
    return r;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/viewModel/prefixSumComputer.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var PrefixSumIndexOfResult = /** @class */ (function () {
    function PrefixSumIndexOfResult(index, remainder) {
        this.index = index;
        this.remainder = remainder;
    }
    return PrefixSumIndexOfResult;
}());

var prefixSumComputer_PrefixSumComputer = /** @class */ (function () {
    function PrefixSumComputer(values) {
        this.values = values;
        this.prefixSum = new Uint32Array(values.length);
        this.prefixSumValidIndex = new Int32Array(1);
        this.prefixSumValidIndex[0] = -1;
    }
    PrefixSumComputer.prototype.getCount = function () {
        return this.values.length;
    };
    PrefixSumComputer.prototype.insertValues = function (insertIndex, insertValues) {
        insertIndex = toUint32(insertIndex);
        var oldValues = this.values;
        var oldPrefixSum = this.prefixSum;
        var insertValuesLen = insertValues.length;
        if (insertValuesLen === 0) {
            return false;
        }
        this.values = new Uint32Array(oldValues.length + insertValuesLen);
        this.values.set(oldValues.subarray(0, insertIndex), 0);
        this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
        this.values.set(insertValues, insertIndex);
        if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
            this.prefixSumValidIndex[0] = insertIndex - 1;
        }
        this.prefixSum = new Uint32Array(this.values.length);
        if (this.prefixSumValidIndex[0] >= 0) {
            this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
        }
        return true;
    };
    PrefixSumComputer.prototype.changeValue = function (index, value) {
        index = toUint32(index);
        value = toUint32(value);
        if (this.values[index] === value) {
            return false;
        }
        this.values[index] = value;
        if (index - 1 < this.prefixSumValidIndex[0]) {
            this.prefixSumValidIndex[0] = index - 1;
        }
        return true;
    };
    PrefixSumComputer.prototype.removeValues = function (startIndex, cnt) {
        startIndex = toUint32(startIndex);
        cnt = toUint32(cnt);
        var oldValues = this.values;
        var oldPrefixSum = this.prefixSum;
        if (startIndex >= oldValues.length) {
            return false;
        }
        var maxCnt = oldValues.length - startIndex;
        if (cnt >= maxCnt) {
            cnt = maxCnt;
        }
        if (cnt === 0) {
            return false;
        }
        this.values = new Uint32Array(oldValues.length - cnt);
        this.values.set(oldValues.subarray(0, startIndex), 0);
        this.values.set(oldValues.subarray(startIndex + cnt), startIndex);
        this.prefixSum = new Uint32Array(this.values.length);
        if (startIndex - 1 < this.prefixSumValidIndex[0]) {
            this.prefixSumValidIndex[0] = startIndex - 1;
        }
        if (this.prefixSumValidIndex[0] >= 0) {
            this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
        }
        return true;
    };
    PrefixSumComputer.prototype.getTotalValue = function () {
        if (this.values.length === 0) {
            return 0;
        }
        return this._getAccumulatedValue(this.values.length - 1);
    };
    PrefixSumComputer.prototype.getAccumulatedValue = function (index) {
        if (index < 0) {
            return 0;
        }
        index = toUint32(index);
        return this._getAccumulatedValue(index);
    };
    PrefixSumComputer.prototype._getAccumulatedValue = function (index) {
        if (index <= this.prefixSumValidIndex[0]) {
            return this.prefixSum[index];
        }
        var startIndex = this.prefixSumValidIndex[0] + 1;
        if (startIndex === 0) {
            this.prefixSum[0] = this.values[0];
            startIndex++;
        }
        if (index >= this.values.length) {
            index = this.values.length - 1;
        }
        for (var i = startIndex; i <= index; i++) {
            this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
        }
        this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
        return this.prefixSum[index];
    };
    PrefixSumComputer.prototype.getIndexOf = function (accumulatedValue) {
        accumulatedValue = Math.floor(accumulatedValue); //@perf
        // Compute all sums (to get a fully valid prefixSum)
        this.getTotalValue();
        var low = 0;
        var high = this.values.length - 1;
        var mid = 0;
        var midStop = 0;
        var midStart = 0;
        while (low <= high) {
            mid = low + ((high - low) / 2) | 0;
            midStop = this.prefixSum[mid];
            midStart = midStop - this.values[mid];
            if (accumulatedValue < midStart) {
                high = mid - 1;
            }
            else if (accumulatedValue >= midStop) {
                low = mid + 1;
            }
            else {
                break;
            }
        }
        return new PrefixSumIndexOfResult(mid, accumulatedValue - midStart);
    };
    return PrefixSumComputer;
}());

var PrefixSumComputerWithCache = /** @class */ (function () {
    function PrefixSumComputerWithCache(values) {
        this._cacheAccumulatedValueStart = 0;
        this._cache = null;
        this._actual = new prefixSumComputer_PrefixSumComputer(values);
        this._bustCache();
    }
    PrefixSumComputerWithCache.prototype._bustCache = function () {
        this._cacheAccumulatedValueStart = 0;
        this._cache = null;
    };
    PrefixSumComputerWithCache.prototype.insertValues = function (insertIndex, insertValues) {
        if (this._actual.insertValues(insertIndex, insertValues)) {
            this._bustCache();
        }
    };
    PrefixSumComputerWithCache.prototype.changeValue = function (index, value) {
        if (this._actual.changeValue(index, value)) {
            this._bustCache();
        }
    };
    PrefixSumComputerWithCache.prototype.removeValues = function (startIndex, cnt) {
        if (this._actual.removeValues(startIndex, cnt)) {
            this._bustCache();
        }
    };
    PrefixSumComputerWithCache.prototype.getTotalValue = function () {
        return this._actual.getTotalValue();
    };
    PrefixSumComputerWithCache.prototype.getAccumulatedValue = function (index) {
        return this._actual.getAccumulatedValue(index);
    };
    PrefixSumComputerWithCache.prototype.getIndexOf = function (accumulatedValue) {
        accumulatedValue = Math.floor(accumulatedValue); //@perf
        if (this._cache !== null) {
            var cacheIndex = accumulatedValue - this._cacheAccumulatedValueStart;
            if (cacheIndex >= 0 && cacheIndex < this._cache.length) {
                // Cache hit!
                return this._cache[cacheIndex];
            }
        }
        // Cache miss!
        return this._actual.getIndexOf(accumulatedValue);
    };
    /**
     * Gives a hint that a lot of requests are about to come in for these accumulated values.
     */
    PrefixSumComputerWithCache.prototype.warmUpCache = function (accumulatedValueStart, accumulatedValueEnd) {
        var newCache = [];
        for (var accumulatedValue = accumulatedValueStart; accumulatedValue <= accumulatedValueEnd; accumulatedValue++) {
            newCache[accumulatedValue - accumulatedValueStart] = this.getIndexOf(accumulatedValue);
        }
        this._cache = newCache;
        this._cacheAccumulatedValueStart = accumulatedValueStart;
    };
    return PrefixSumComputerWithCache;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/model/mirrorTextModel.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var mirrorTextModel_MirrorTextModel = /** @class */ (function () {
    function MirrorTextModel(uri, lines, eol, versionId) {
        this._uri = uri;
        this._lines = lines;
        this._eol = eol;
        this._versionId = versionId;
        this._lineStarts = null;
    }
    MirrorTextModel.prototype.dispose = function () {
        this._lines.length = 0;
    };
    MirrorTextModel.prototype.getText = function () {
        return this._lines.join(this._eol);
    };
    MirrorTextModel.prototype.onEvents = function (e) {
        if (e.eol && e.eol !== this._eol) {
            this._eol = e.eol;
            this._lineStarts = null;
        }
        // Update my lines
        var changes = e.changes;
        for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
            var change = changes_1[_i];
            this._acceptDeleteRange(change.range);
            this._acceptInsertText(new Position(change.range.startLineNumber, change.range.startColumn), change.text);
        }
        this._versionId = e.versionId;
    };
    MirrorTextModel.prototype._ensureLineStarts = function () {
        if (!this._lineStarts) {
            var eolLength = this._eol.length;
            var linesLength = this._lines.length;
            var lineStartValues = new Uint32Array(linesLength);
            for (var i = 0; i < linesLength; i++) {
                lineStartValues[i] = this._lines[i].length + eolLength;
            }
            this._lineStarts = new prefixSumComputer_PrefixSumComputer(lineStartValues);
        }
    };
    /**
     * All changes to a line's text go through this method
     */
    MirrorTextModel.prototype._setLineText = function (lineIndex, newValue) {
        this._lines[lineIndex] = newValue;
        if (this._lineStarts) {
            // update prefix sum
            this._lineStarts.changeValue(lineIndex, this._lines[lineIndex].length + this._eol.length);
        }
    };
    MirrorTextModel.prototype._acceptDeleteRange = function (range) {
        if (range.startLineNumber === range.endLineNumber) {
            if (range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            // Delete text on the affected line
            this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1)
                + this._lines[range.startLineNumber - 1].substring(range.endColumn - 1));
            return;
        }
        // Take remaining text on last line and append it to remaining text on first line
        this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1)
            + this._lines[range.endLineNumber - 1].substring(range.endColumn - 1));
        // Delete middle lines
        this._lines.splice(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        if (this._lineStarts) {
            // update prefix sum
            this._lineStarts.removeValues(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        }
    };
    MirrorTextModel.prototype._acceptInsertText = function (position, insertText) {
        if (insertText.length === 0) {
            // Nothing to insert
            return;
        }
        var insertLines = insertText.split(/\r\n|\r|\n/);
        if (insertLines.length === 1) {
            // Inserting text on one line
            this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1)
                + insertLines[0]
                + this._lines[position.lineNumber - 1].substring(position.column - 1));
            return;
        }
        // Append overflowing text from first line to the end of text to insert
        insertLines[insertLines.length - 1] += this._lines[position.lineNumber - 1].substring(position.column - 1);
        // Delete overflowing text from first line and insert text on first line
        this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1)
            + insertLines[0]);
        // Insert new lines & store lengths
        var newLengths = new Uint32Array(insertLines.length - 1);
        for (var i = 1; i < insertLines.length; i++) {
            this._lines.splice(position.lineNumber + i - 1, 0, insertLines[i]);
            newLengths[i - 1] = insertLines[i].length + this._eol.length;
        }
        if (this._lineStarts) {
            // update prefix sum
            this._lineStarts.insertValues(position.lineNumber, newLengths);
        }
    };
    return MirrorTextModel;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/model/wordHelper.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';
/**
 * Create a word definition regular expression based on default word separators.
 * Optionally provide allowed separators that should be included in words.
 *
 * The default would look like this:
 * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
 */
function createWordRegExp(allowInWords) {
    if (allowInWords === void 0) { allowInWords = ''; }
    var source = '(-?\\d*\\.\\d\\w*)|([^';
    for (var _i = 0, USUAL_WORD_SEPARATORS_1 = USUAL_WORD_SEPARATORS; _i < USUAL_WORD_SEPARATORS_1.length; _i++) {
        var sep = USUAL_WORD_SEPARATORS_1[_i];
        if (allowInWords.indexOf(sep) >= 0) {
            continue;
        }
        source += '\\' + sep;
    }
    source += '\\s]+)';
    return new RegExp(source, 'g');
}
// catches numbers (including floating numbers) in the first group, and alphanum in the second
var DEFAULT_WORD_REGEXP = createWordRegExp();
function ensureValidWordDefinition(wordDefinition) {
    var result = DEFAULT_WORD_REGEXP;
    if (wordDefinition && (wordDefinition instanceof RegExp)) {
        if (!wordDefinition.global) {
            var flags = 'g';
            if (wordDefinition.ignoreCase) {
                flags += 'i';
            }
            if (wordDefinition.multiline) {
                flags += 'm';
            }
            if (wordDefinition.unicode) {
                flags += 'u';
            }
            result = new RegExp(wordDefinition.source, flags);
        }
        else {
            result = wordDefinition;
        }
    }
    result.lastIndex = 0;
    return result;
}
function getWordAtPosFast(column, wordDefinition, text, textOffset) {
    // find whitespace enclosed text around column and match from there
    var pos = column - 1 - textOffset;
    var start = text.lastIndexOf(' ', pos - 1) + 1;
    wordDefinition.lastIndex = start;
    var match;
    while (match = wordDefinition.exec(text)) {
        var matchIndex = match.index || 0;
        if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
            return {
                word: match[0],
                startColumn: textOffset + 1 + matchIndex,
                endColumn: textOffset + 1 + wordDefinition.lastIndex
            };
        }
    }
    return null;
}
function getWordAtPosSlow(column, wordDefinition, text, textOffset) {
    // matches all words starting at the beginning
    // of the input until it finds a match that encloses
    // the desired column. slow but correct
    var pos = column - 1 - textOffset;
    wordDefinition.lastIndex = 0;
    var match;
    while (match = wordDefinition.exec(text)) {
        var matchIndex = match.index || 0;
        if (matchIndex > pos) {
            // |nW -> matched only after the pos
            return null;
        }
        else if (wordDefinition.lastIndex >= pos) {
            // W|W -> match encloses pos
            return {
                word: match[0],
                startColumn: textOffset + 1 + matchIndex,
                endColumn: textOffset + 1 + wordDefinition.lastIndex
            };
        }
    }
    return null;
}
function getWordAtText(column, wordDefinition, text, textOffset) {
    // if `words` can contain whitespace character we have to use the slow variant
    // otherwise we use the fast variant of finding a word
    wordDefinition.lastIndex = 0;
    var match = wordDefinition.exec(text);
    if (!match) {
        return null;
    }
    // todo@joh the `match` could already be the (first) word
    var ret = match[0].indexOf(' ') >= 0
        // did match a word which contains a space character -> use slow word find
        ? getWordAtPosSlow(column, wordDefinition, text, textOffset)
        // sane word definition -> use fast word find
        : getWordAtPosFast(column, wordDefinition, text, textOffset);
    // both (getWordAtPosFast and getWordAtPosSlow) leave the wordDefinition-RegExp
    // in an undefined state and to not confuse other users of the wordDefinition
    // we reset the lastIndex
    wordDefinition.lastIndex = 0;
    return ret;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/characterClassifier.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * A fast character classifier that uses a compact array for ASCII values.
 */
var characterClassifier_CharacterClassifier = /** @class */ (function () {
    function CharacterClassifier(_defaultValue) {
        var defaultValue = toUint8(_defaultValue);
        this._defaultValue = defaultValue;
        this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
        this._map = new Map();
    }
    CharacterClassifier._createAsciiMap = function (defaultValue) {
        var asciiMap = new Uint8Array(256);
        for (var i = 0; i < 256; i++) {
            asciiMap[i] = defaultValue;
        }
        return asciiMap;
    };
    CharacterClassifier.prototype.set = function (charCode, _value) {
        var value = toUint8(_value);
        if (charCode >= 0 && charCode < 256) {
            this._asciiMap[charCode] = value;
        }
        else {
            this._map.set(charCode, value);
        }
    };
    CharacterClassifier.prototype.get = function (charCode) {
        if (charCode >= 0 && charCode < 256) {
            return this._asciiMap[charCode];
        }
        else {
            return (this._map.get(charCode) || this._defaultValue);
        }
    };
    return CharacterClassifier;
}());

var CharacterSet = /** @class */ (function () {
    function CharacterSet() {
        this._actual = new characterClassifier_CharacterClassifier(0 /* False */);
    }
    CharacterSet.prototype.add = function (charCode) {
        this._actual.set(charCode, 1 /* True */);
    };
    CharacterSet.prototype.has = function (charCode) {
        return (this._actual.get(charCode) === 1 /* True */);
    };
    return CharacterSet;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/modes/linkComputer.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var linkComputer_StateMachine = /** @class */ (function () {
    function StateMachine(edges) {
        var maxCharCode = 0;
        var maxState = 0 /* Invalid */;
        for (var i = 0, len = edges.length; i < len; i++) {
            var _a = edges[i], from = _a[0], chCode = _a[1], to = _a[2];
            if (chCode > maxCharCode) {
                maxCharCode = chCode;
            }
            if (from > maxState) {
                maxState = from;
            }
            if (to > maxState) {
                maxState = to;
            }
        }
        maxCharCode++;
        maxState++;
        var states = new Uint8Matrix(maxState, maxCharCode, 0 /* Invalid */);
        for (var i = 0, len = edges.length; i < len; i++) {
            var _b = edges[i], from = _b[0], chCode = _b[1], to = _b[2];
            states.set(from, chCode, to);
        }
        this._states = states;
        this._maxCharCode = maxCharCode;
    }
    StateMachine.prototype.nextState = function (currentState, chCode) {
        if (chCode < 0 || chCode >= this._maxCharCode) {
            return 0 /* Invalid */;
        }
        return this._states.get(currentState, chCode);
    };
    return StateMachine;
}());

// State machine for http:// or https:// or file://
var _stateMachine = null;
function getStateMachine() {
    if (_stateMachine === null) {
        _stateMachine = new linkComputer_StateMachine([
            [1 /* Start */, 104 /* h */, 2 /* H */],
            [1 /* Start */, 72 /* H */, 2 /* H */],
            [1 /* Start */, 102 /* f */, 6 /* F */],
            [1 /* Start */, 70 /* F */, 6 /* F */],
            [2 /* H */, 116 /* t */, 3 /* HT */],
            [2 /* H */, 84 /* T */, 3 /* HT */],
            [3 /* HT */, 116 /* t */, 4 /* HTT */],
            [3 /* HT */, 84 /* T */, 4 /* HTT */],
            [4 /* HTT */, 112 /* p */, 5 /* HTTP */],
            [4 /* HTT */, 80 /* P */, 5 /* HTTP */],
            [5 /* HTTP */, 115 /* s */, 9 /* BeforeColon */],
            [5 /* HTTP */, 83 /* S */, 9 /* BeforeColon */],
            [5 /* HTTP */, 58 /* Colon */, 10 /* AfterColon */],
            [6 /* F */, 105 /* i */, 7 /* FI */],
            [6 /* F */, 73 /* I */, 7 /* FI */],
            [7 /* FI */, 108 /* l */, 8 /* FIL */],
            [7 /* FI */, 76 /* L */, 8 /* FIL */],
            [8 /* FIL */, 101 /* e */, 9 /* BeforeColon */],
            [8 /* FIL */, 69 /* E */, 9 /* BeforeColon */],
            [9 /* BeforeColon */, 58 /* Colon */, 10 /* AfterColon */],
            [10 /* AfterColon */, 47 /* Slash */, 11 /* AlmostThere */],
            [11 /* AlmostThere */, 47 /* Slash */, 12 /* End */],
        ]);
    }
    return _stateMachine;
}
var _classifier = null;
function getClassifier() {
    if (_classifier === null) {
        _classifier = new characterClassifier_CharacterClassifier(0 /* None */);
        var FORCE_TERMINATION_CHARACTERS = ' \t<>\'\"、。｡､，．：；？！＠＃＄％＆＊‘“〈《「『【〔（［｛｢｣｝］）〕】』」》〉”’｀～…';
        for (var i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
            _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1 /* ForceTermination */);
        }
        var CANNOT_END_WITH_CHARACTERS = '.,;';
        for (var i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
            _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2 /* CannotEndIn */);
        }
    }
    return _classifier;
}
var LinkComputer = /** @class */ (function () {
    function LinkComputer() {
    }
    LinkComputer._createLink = function (classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
        // Do not allow to end link in certain characters...
        var lastIncludedCharIndex = linkEndIndex - 1;
        do {
            var chCode = line.charCodeAt(lastIncludedCharIndex);
            var chClass = classifier.get(chCode);
            if (chClass !== 2 /* CannotEndIn */) {
                break;
            }
            lastIncludedCharIndex--;
        } while (lastIncludedCharIndex > linkBeginIndex);
        // Handle links enclosed in parens, square brackets and curlys.
        if (linkBeginIndex > 0) {
            var charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
            var lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
            if ((charCodeBeforeLink === 40 /* OpenParen */ && lastCharCodeInLink === 41 /* CloseParen */)
                || (charCodeBeforeLink === 91 /* OpenSquareBracket */ && lastCharCodeInLink === 93 /* CloseSquareBracket */)
                || (charCodeBeforeLink === 123 /* OpenCurlyBrace */ && lastCharCodeInLink === 125 /* CloseCurlyBrace */)) {
                // Do not end in ) if ( is before the link start
                // Do not end in ] if [ is before the link start
                // Do not end in } if { is before the link start
                lastIncludedCharIndex--;
            }
        }
        return {
            range: {
                startLineNumber: lineNumber,
                startColumn: linkBeginIndex + 1,
                endLineNumber: lineNumber,
                endColumn: lastIncludedCharIndex + 2
            },
            url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
        };
    };
    LinkComputer.computeLinks = function (model, stateMachine) {
        if (stateMachine === void 0) { stateMachine = getStateMachine(); }
        var classifier = getClassifier();
        var result = [];
        for (var i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
            var line = model.getLineContent(i);
            var len = line.length;
            var j = 0;
            var linkBeginIndex = 0;
            var linkBeginChCode = 0;
            var state = 1 /* Start */;
            var hasOpenParens = false;
            var hasOpenSquareBracket = false;
            var hasOpenCurlyBracket = false;
            while (j < len) {
                var resetStateMachine = false;
                var chCode = line.charCodeAt(j);
                if (state === 13 /* Accept */) {
                    var chClass = void 0;
                    switch (chCode) {
                        case 40 /* OpenParen */:
                            hasOpenParens = true;
                            chClass = 0 /* None */;
                            break;
                        case 41 /* CloseParen */:
                            chClass = (hasOpenParens ? 0 /* None */ : 1 /* ForceTermination */);
                            break;
                        case 91 /* OpenSquareBracket */:
                            hasOpenSquareBracket = true;
                            chClass = 0 /* None */;
                            break;
                        case 93 /* CloseSquareBracket */:
                            chClass = (hasOpenSquareBracket ? 0 /* None */ : 1 /* ForceTermination */);
                            break;
                        case 123 /* OpenCurlyBrace */:
                            hasOpenCurlyBracket = true;
                            chClass = 0 /* None */;
                            break;
                        case 125 /* CloseCurlyBrace */:
                            chClass = (hasOpenCurlyBracket ? 0 /* None */ : 1 /* ForceTermination */);
                            break;
                        /* The following three rules make it that ' or " or ` are allowed inside links if the link began with a different one */
                        case 39 /* SingleQuote */:
                            chClass = (linkBeginChCode === 34 /* DoubleQuote */ || linkBeginChCode === 96 /* BackTick */) ? 0 /* None */ : 1 /* ForceTermination */;
                            break;
                        case 34 /* DoubleQuote */:
                            chClass = (linkBeginChCode === 39 /* SingleQuote */ || linkBeginChCode === 96 /* BackTick */) ? 0 /* None */ : 1 /* ForceTermination */;
                            break;
                        case 96 /* BackTick */:
                            chClass = (linkBeginChCode === 39 /* SingleQuote */ || linkBeginChCode === 34 /* DoubleQuote */) ? 0 /* None */ : 1 /* ForceTermination */;
                            break;
                        default:
                            chClass = classifier.get(chCode);
                    }
                    // Check if character terminates link
                    if (chClass === 1 /* ForceTermination */) {
                        result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                        resetStateMachine = true;
                    }
                }
                else if (state === 12 /* End */) {
                    var chClass = void 0;
                    if (chCode === 91 /* OpenSquareBracket */) {
                        // Allow for the authority part to contain ipv6 addresses which contain [ and ]
                        hasOpenSquareBracket = true;
                        chClass = 0 /* None */;
                    }
                    else {
                        chClass = classifier.get(chCode);
                    }
                    // Check if character terminates link
                    if (chClass === 1 /* ForceTermination */) {
                        resetStateMachine = true;
                    }
                    else {
                        state = 13 /* Accept */;
                    }
                }
                else {
                    state = stateMachine.nextState(state, chCode);
                    if (state === 0 /* Invalid */) {
                        resetStateMachine = true;
                    }
                }
                if (resetStateMachine) {
                    state = 1 /* Start */;
                    hasOpenParens = false;
                    hasOpenSquareBracket = false;
                    hasOpenCurlyBracket = false;
                    // Record where the link started
                    linkBeginIndex = j + 1;
                    linkBeginChCode = chCode;
                }
                j++;
            }
            if (state === 13 /* Accept */) {
                result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
            }
        }
        return result;
    };
    return LinkComputer;
}());

/**
 * Returns an array of all links contains in the provided
 * document. *Note* that this operation is computational
 * expensive and should not run in the UI thread.
 */
function computeLinks(model) {
    if (!model || typeof model.getLineCount !== 'function' || typeof model.getLineContent !== 'function') {
        // Unknown caller!
        return [];
    }
    return LinkComputer.computeLinks(model);
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/modes/supports/inplaceReplaceSupport.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var BasicInplaceReplace = /** @class */ (function () {
    function BasicInplaceReplace() {
        this._defaultValueSet = [
            ['true', 'false'],
            ['True', 'False'],
            ['Private', 'Public', 'Friend', 'ReadOnly', 'Partial', 'Protected', 'WriteOnly'],
            ['public', 'protected', 'private'],
        ];
    }
    BasicInplaceReplace.prototype.navigateValueSet = function (range1, text1, range2, text2, up) {
        if (range1 && text1) {
            var result = this.doNavigateValueSet(text1, up);
            if (result) {
                return {
                    range: range1,
                    value: result
                };
            }
        }
        if (range2 && text2) {
            var result = this.doNavigateValueSet(text2, up);
            if (result) {
                return {
                    range: range2,
                    value: result
                };
            }
        }
        return null;
    };
    BasicInplaceReplace.prototype.doNavigateValueSet = function (text, up) {
        var numberResult = this.numberReplace(text, up);
        if (numberResult !== null) {
            return numberResult;
        }
        return this.textReplace(text, up);
    };
    BasicInplaceReplace.prototype.numberReplace = function (value, up) {
        var precision = Math.pow(10, value.length - (value.lastIndexOf('.') + 1));
        var n1 = Number(value);
        var n2 = parseFloat(value);
        if (!isNaN(n1) && !isNaN(n2) && n1 === n2) {
            if (n1 === 0 && !up) {
                return null; // don't do negative
                //			} else if(n1 === 9 && up) {
                //				return null; // don't insert 10 into a number
            }
            else {
                n1 = Math.floor(n1 * precision);
                n1 += up ? precision : -precision;
                return String(n1 / precision);
            }
        }
        return null;
    };
    BasicInplaceReplace.prototype.textReplace = function (value, up) {
        return this.valueSetsReplace(this._defaultValueSet, value, up);
    };
    BasicInplaceReplace.prototype.valueSetsReplace = function (valueSets, value, up) {
        var result = null;
        for (var i = 0, len = valueSets.length; result === null && i < len; i++) {
            result = this.valueSetReplace(valueSets[i], value, up);
        }
        return result;
    };
    BasicInplaceReplace.prototype.valueSetReplace = function (valueSet, value, up) {
        var idx = valueSet.indexOf(value);
        if (idx >= 0) {
            idx += up ? +1 : -1;
            if (idx < 0) {
                idx = valueSet.length - 1;
            }
            else {
                idx %= valueSet.length;
            }
            return valueSet[idx];
        }
        return null;
    };
    BasicInplaceReplace.INSTANCE = new BasicInplaceReplace();
    return BasicInplaceReplace;
}());


// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/standalone/promise-polyfill/polyfill.js
var polyfill = __webpack_require__("URDS");

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/functional.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function functional_once(fn) {
    var _this = this;
    var didCall = false;
    var result;
    return function () {
        if (didCall) {
            return result;
        }
        didCall = true;
        result = fn.apply(_this, arguments);
        return result;
    };
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/linkedList.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var linkedList_Node = /** @class */ (function () {
    function Node(element) {
        this.element = element;
        this.next = Node.Undefined;
        this.prev = Node.Undefined;
    }
    Node.Undefined = new Node(undefined);
    return Node;
}());
var linkedList_LinkedList = /** @class */ (function () {
    function LinkedList() {
        this._first = linkedList_Node.Undefined;
        this._last = linkedList_Node.Undefined;
        this._size = 0;
    }
    Object.defineProperty(LinkedList.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    LinkedList.prototype.isEmpty = function () {
        return this._first === linkedList_Node.Undefined;
    };
    LinkedList.prototype.clear = function () {
        this._first = linkedList_Node.Undefined;
        this._last = linkedList_Node.Undefined;
        this._size = 0;
    };
    LinkedList.prototype.unshift = function (element) {
        return this._insert(element, false);
    };
    LinkedList.prototype.push = function (element) {
        return this._insert(element, true);
    };
    LinkedList.prototype._insert = function (element, atTheEnd) {
        var _this = this;
        var newNode = new linkedList_Node(element);
        if (this._first === linkedList_Node.Undefined) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            // push
            var oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            // unshift
            var oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        this._size += 1;
        var didRemove = false;
        return function () {
            if (!didRemove) {
                didRemove = true;
                _this._remove(newNode);
            }
        };
    };
    LinkedList.prototype.shift = function () {
        if (this._first === linkedList_Node.Undefined) {
            return undefined;
        }
        else {
            var res = this._first.element;
            this._remove(this._first);
            return res;
        }
    };
    LinkedList.prototype._remove = function (node) {
        if (node.prev !== linkedList_Node.Undefined && node.next !== linkedList_Node.Undefined) {
            // middle
            var anchor = node.prev;
            anchor.next = node.next;
            node.next.prev = anchor;
        }
        else if (node.prev === linkedList_Node.Undefined && node.next === linkedList_Node.Undefined) {
            // only node
            this._first = linkedList_Node.Undefined;
            this._last = linkedList_Node.Undefined;
        }
        else if (node.next === linkedList_Node.Undefined) {
            // last
            this._last = this._last.prev;
            this._last.next = linkedList_Node.Undefined;
        }
        else if (node.prev === linkedList_Node.Undefined) {
            // first
            this._first = this._first.next;
            this._first.prev = linkedList_Node.Undefined;
        }
        // done
        this._size -= 1;
    };
    LinkedList.prototype.iterator = function () {
        var element;
        var node = this._first;
        return {
            next: function () {
                if (node === linkedList_Node.Undefined) {
                    return FIN;
                }
                if (!element) {
                    element = { done: false, value: node.element };
                }
                else {
                    element.value = node.element;
                }
                node = node.next;
                return element;
            }
        };
    };
    LinkedList.prototype.toArray = function () {
        var result = [];
        for (var node = this._first; node !== linkedList_Node.Undefined; node = node.next) {
            result.push(node.element);
        }
        return result;
    };
    return LinkedList;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/event.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var event_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var event_Event;
(function (Event) {
    var _disposable = { dispose: function () { } };
    Event.None = function () { return _disposable; };
    /**
     * Given an event, returns another event which only fires once.
     */
    function once(event) {
        return function (listener, thisArgs, disposables) {
            if (thisArgs === void 0) { thisArgs = null; }
            // we need this, in case the event fires during the listener call
            var didFire = false;
            var result;
            result = event(function (e) {
                if (didFire) {
                    return;
                }
                else if (result) {
                    result.dispose();
                }
                else {
                    didFire = true;
                }
                return listener.call(thisArgs, e);
            }, null, disposables);
            if (didFire) {
                result.dispose();
            }
            return result;
        };
    }
    Event.once = once;
    /**
     * Given an event and a `map` function, returns another event which maps each element
     * throught the mapping function.
     */
    function map(event, map) {
        return snapshot(function (listener, thisArgs, disposables) {
            if (thisArgs === void 0) { thisArgs = null; }
            return event(function (i) { return listener.call(thisArgs, map(i)); }, null, disposables);
        });
    }
    Event.map = map;
    /**
     * Given an event and an `each` function, returns another identical event and calls
     * the `each` function per each element.
     */
    function forEach(event, each) {
        return snapshot(function (listener, thisArgs, disposables) {
            if (thisArgs === void 0) { thisArgs = null; }
            return event(function (i) { each(i); listener.call(thisArgs, i); }, null, disposables);
        });
    }
    Event.forEach = forEach;
    function filter(event, filter) {
        return snapshot(function (listener, thisArgs, disposables) {
            if (thisArgs === void 0) { thisArgs = null; }
            return event(function (e) { return filter(e) && listener.call(thisArgs, e); }, null, disposables);
        });
    }
    Event.filter = filter;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal(event) {
        return event;
    }
    Event.signal = signal;
    /**
     * Given a collection of events, returns a single event which emits
     * whenever any of the provided events emit.
     */
    function any() {
        var events = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            events[_i] = arguments[_i];
        }
        return function (listener, thisArgs, disposables) {
            if (thisArgs === void 0) { thisArgs = null; }
            return combinedDisposable(events.map(function (event) { return event(function (e) { return listener.call(thisArgs, e); }, null, disposables); }));
        };
    }
    Event.any = any;
    /**
     * Given an event and a `merge` function, returns another event which maps each element
     * and the cummulative result throught the `merge` function. Similar to `map`, but with memory.
     */
    function reduce(event, merge, initial) {
        var output = initial;
        return map(event, function (e) {
            output = merge(output, e);
            return output;
        });
    }
    Event.reduce = reduce;
    /**
     * Given a chain of event processing functions (filter, map, etc), each
     * function will be invoked per event & per listener. Snapshotting an event
     * chain allows each function to be invoked just once per event.
     */
    function snapshot(event) {
        var listener;
        var emitter = new event_Emitter({
            onFirstListenerAdd: function () {
                listener = event(emitter.fire, emitter);
            },
            onLastListenerRemove: function () {
                listener.dispose();
            }
        });
        return emitter.event;
    }
    Event.snapshot = snapshot;
    function debounce(event, merge, delay, leading, leakWarningThreshold) {
        if (delay === void 0) { delay = 100; }
        if (leading === void 0) { leading = false; }
        var subscription;
        var output = undefined;
        var handle = undefined;
        var numDebouncedCalls = 0;
        var emitter = new event_Emitter({
            leakWarningThreshold: leakWarningThreshold,
            onFirstListenerAdd: function () {
                subscription = event(function (cur) {
                    numDebouncedCalls++;
                    output = merge(output, cur);
                    if (leading && !handle) {
                        emitter.fire(output);
                    }
                    clearTimeout(handle);
                    handle = setTimeout(function () {
                        var _output = output;
                        output = undefined;
                        handle = undefined;
                        if (!leading || numDebouncedCalls > 1) {
                            emitter.fire(_output);
                        }
                        numDebouncedCalls = 0;
                    }, delay);
                });
            },
            onLastListenerRemove: function () {
                subscription.dispose();
            }
        });
        return emitter.event;
    }
    Event.debounce = debounce;
    /**
     * Given an event, it returns another event which fires only once and as soon as
     * the input event emits. The event data is the number of millis it took for the
     * event to fire.
     */
    function stopwatch(event) {
        var start = new Date().getTime();
        return map(once(event), function (_) { return new Date().getTime() - start; });
    }
    Event.stopwatch = stopwatch;
    /**
     * Given an event, it returns another event which fires only when the event
     * element changes.
     */
    function latch(event) {
        var firstCall = true;
        var cache;
        return filter(event, function (value) {
            var shouldEmit = firstCall || value !== cache;
            firstCall = false;
            cache = value;
            return shouldEmit;
        });
    }
    Event.latch = latch;
    /**
     * Buffers the provided event until a first listener comes
     * along, at which point fire all the events at once and
     * pipe the event from then on.
     *
     * ```typescript
     * const emitter = new Emitter<number>();
     * const event = emitter.event;
     * const bufferedEvent = buffer(event);
     *
     * emitter.fire(1);
     * emitter.fire(2);
     * emitter.fire(3);
     * // nothing...
     *
     * const listener = bufferedEvent(num => console.log(num));
     * // 1, 2, 3
     *
     * emitter.fire(4);
     * // 4
     * ```
     */
    function buffer(event, nextTick, _buffer) {
        if (nextTick === void 0) { nextTick = false; }
        if (_buffer === void 0) { _buffer = []; }
        var buffer = _buffer.slice();
        var listener = event(function (e) {
            if (buffer) {
                buffer.push(e);
            }
            else {
                emitter.fire(e);
            }
        });
        var flush = function () {
            if (buffer) {
                buffer.forEach(function (e) { return emitter.fire(e); });
            }
            buffer = null;
        };
        var emitter = new event_Emitter({
            onFirstListenerAdd: function () {
                if (!listener) {
                    listener = event(function (e) { return emitter.fire(e); });
                }
            },
            onFirstListenerDidAdd: function () {
                if (buffer) {
                    if (nextTick) {
                        setTimeout(flush);
                    }
                    else {
                        flush();
                    }
                }
            },
            onLastListenerRemove: function () {
                if (listener) {
                    listener.dispose();
                }
                listener = null;
            }
        });
        return emitter.event;
    }
    Event.buffer = buffer;
    var ChainableEvent = /** @class */ (function () {
        function ChainableEvent(event) {
            this.event = event;
        }
        ChainableEvent.prototype.map = function (fn) {
            return new ChainableEvent(map(this.event, fn));
        };
        ChainableEvent.prototype.forEach = function (fn) {
            return new ChainableEvent(forEach(this.event, fn));
        };
        ChainableEvent.prototype.filter = function (fn) {
            return new ChainableEvent(filter(this.event, fn));
        };
        ChainableEvent.prototype.reduce = function (merge, initial) {
            return new ChainableEvent(reduce(this.event, merge, initial));
        };
        ChainableEvent.prototype.latch = function () {
            return new ChainableEvent(latch(this.event));
        };
        ChainableEvent.prototype.on = function (listener, thisArgs, disposables) {
            return this.event(listener, thisArgs, disposables);
        };
        ChainableEvent.prototype.once = function (listener, thisArgs, disposables) {
            return once(this.event)(listener, thisArgs, disposables);
        };
        return ChainableEvent;
    }());
    function chain(event) {
        return new ChainableEvent(event);
    }
    Event.chain = chain;
    function fromNodeEventEmitter(emitter, eventName, map) {
        if (map === void 0) { map = function (id) { return id; }; }
        var fn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return result.fire(map.apply(void 0, args));
        };
        var onFirstListenerAdd = function () { return emitter.on(eventName, fn); };
        var onLastListenerRemove = function () { return emitter.removeListener(eventName, fn); };
        var result = new event_Emitter({ onFirstListenerAdd: onFirstListenerAdd, onLastListenerRemove: onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        var emitter = new event_Emitter();
        var shouldEmit = false;
        promise
            .then(undefined, function () { return null; })
            .then(function () {
            if (!shouldEmit) {
                setTimeout(function () { return emitter.fire(undefined); }, 0);
            }
            else {
                emitter.fire(undefined);
            }
        });
        shouldEmit = true;
        return emitter.event;
    }
    Event.fromPromise = fromPromise;
    function toPromise(event) {
        return new Promise(function (c) { return once(event)(c); });
    }
    Event.toPromise = toPromise;
})(event_Event || (event_Event = {}));
var _globalLeakWarningThreshold = -1;
var LeakageMonitor = /** @class */ (function () {
    function LeakageMonitor(customThreshold, name) {
        if (name === void 0) { name = Math.random().toString(18).slice(2, 5); }
        this.customThreshold = customThreshold;
        this.name = name;
        this._warnCountdown = 0;
    }
    LeakageMonitor.prototype.dispose = function () {
        if (this._stacks) {
            this._stacks.clear();
        }
    };
    LeakageMonitor.prototype.check = function (listenerCount) {
        var _this = this;
        var threshold = _globalLeakWarningThreshold;
        if (typeof this.customThreshold === 'number') {
            threshold = this.customThreshold;
        }
        if (threshold <= 0 || listenerCount < threshold) {
            return undefined;
        }
        if (!this._stacks) {
            this._stacks = new Map();
        }
        var stack = new Error().stack.split('\n').slice(3).join('\n');
        var count = (this._stacks.get(stack) || 0);
        this._stacks.set(stack, count + 1);
        this._warnCountdown -= 1;
        if (this._warnCountdown <= 0) {
            // only warn on first exceed and then every time the limit
            // is exceeded by 50% again
            this._warnCountdown = threshold * 0.5;
            // find most frequent listener and print warning
            var topStack_1;
            var topCount_1 = 0;
            this._stacks.forEach(function (count, stack) {
                if (!topStack_1 || topCount_1 < count) {
                    topStack_1 = stack;
                    topCount_1 = count;
                }
            });
            console.warn("[" + this.name + "] potential listener LEAK detected, having " + listenerCount + " listeners already. MOST frequent listener (" + topCount_1 + "):");
            console.warn(topStack_1);
        }
        return function () {
            var count = (_this._stacks.get(stack) || 0);
            _this._stacks.set(stack, count - 1);
        };
    };
    return LeakageMonitor;
}());
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
var event_Emitter = /** @class */ (function () {
    function Emitter(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = _globalLeakWarningThreshold > 0
            ? new LeakageMonitor(this._options && this._options.leakWarningThreshold)
            : undefined;
    }
    Object.defineProperty(Emitter.prototype, "event", {
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get: function () {
            var _this = this;
            if (!this._event) {
                this._event = function (listener, thisArgs, disposables) {
                    if (!_this._listeners) {
                        _this._listeners = new linkedList_LinkedList();
                    }
                    var firstListener = _this._listeners.isEmpty();
                    if (firstListener && _this._options && _this._options.onFirstListenerAdd) {
                        _this._options.onFirstListenerAdd(_this);
                    }
                    var remove = _this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
                    if (firstListener && _this._options && _this._options.onFirstListenerDidAdd) {
                        _this._options.onFirstListenerDidAdd(_this);
                    }
                    if (_this._options && _this._options.onListenerDidAdd) {
                        _this._options.onListenerDidAdd(_this, listener, thisArgs);
                    }
                    // check and record this emitter for potential leakage
                    var removeMonitor;
                    if (_this._leakageMon) {
                        removeMonitor = _this._leakageMon.check(_this._listeners.size);
                    }
                    var result;
                    result = {
                        dispose: function () {
                            if (removeMonitor) {
                                removeMonitor();
                            }
                            result.dispose = Emitter._noop;
                            if (!_this._disposed) {
                                remove();
                                if (_this._options && _this._options.onLastListenerRemove) {
                                    var hasListeners = (_this._listeners && !_this._listeners.isEmpty());
                                    if (!hasListeners) {
                                        _this._options.onLastListenerRemove(_this);
                                    }
                                }
                            }
                        }
                    };
                    if (Array.isArray(disposables)) {
                        disposables.push(result);
                    }
                    return result;
                };
            }
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    Emitter.prototype.fire = function (event) {
        if (this._listeners) {
            // put all [listener,event]-pairs into delivery queue
            // then emit all event. an inner/nested event might be
            // the driver of this
            if (!this._deliveryQueue) {
                this._deliveryQueue = new linkedList_LinkedList();
            }
            for (var iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
                this._deliveryQueue.push([e.value, event]);
            }
            while (this._deliveryQueue.size > 0) {
                var _a = this._deliveryQueue.shift(), listener = _a[0], event_1 = _a[1];
                try {
                    if (typeof listener === 'function') {
                        listener.call(undefined, event_1);
                    }
                    else {
                        listener[0].call(listener[1], event_1);
                    }
                }
                catch (e) {
                    onUnexpectedError(e);
                }
            }
        }
    };
    Emitter.prototype.dispose = function () {
        if (this._listeners) {
            this._listeners.clear();
        }
        if (this._deliveryQueue) {
            this._deliveryQueue.clear();
        }
        if (this._leakageMon) {
            this._leakageMon.dispose();
        }
        this._disposed = true;
    };
    Emitter._noop = function () { };
    return Emitter;
}());

var event_PauseableEmitter = /** @class */ (function (_super) {
    event_extends(PauseableEmitter, _super);
    function PauseableEmitter(options) {
        var _this = _super.call(this, options) || this;
        _this._isPaused = 0;
        _this._eventQueue = new linkedList_LinkedList();
        _this._mergeFn = options && options.merge;
        return _this;
    }
    PauseableEmitter.prototype.pause = function () {
        this._isPaused++;
    };
    PauseableEmitter.prototype.resume = function () {
        if (this._isPaused !== 0 && --this._isPaused === 0) {
            if (this._mergeFn) {
                // use the merge function to create a single composite
                // event. make a copy in case firing pauses this emitter
                var events = this._eventQueue.toArray();
                this._eventQueue.clear();
                _super.prototype.fire.call(this, this._mergeFn(events));
            }
            else {
                // no merging, fire each event individually and test
                // that this emitter isn't paused halfway through
                while (!this._isPaused && this._eventQueue.size !== 0) {
                    _super.prototype.fire.call(this, this._eventQueue.shift());
                }
            }
        }
    };
    PauseableEmitter.prototype.fire = function (event) {
        if (this._listeners) {
            if (this._isPaused !== 0) {
                this._eventQueue.push(event);
            }
            else {
                _super.prototype.fire.call(this, event);
            }
        }
    };
    return PauseableEmitter;
}(event_Emitter));

var event_EventMultiplexer = /** @class */ (function () {
    function EventMultiplexer() {
        var _this = this;
        this.hasListeners = false;
        this.events = [];
        this.emitter = new event_Emitter({
            onFirstListenerAdd: function () { return _this.onFirstListenerAdd(); },
            onLastListenerRemove: function () { return _this.onLastListenerRemove(); }
        });
    }
    Object.defineProperty(EventMultiplexer.prototype, "event", {
        get: function () {
            return this.emitter.event;
        },
        enumerable: true,
        configurable: true
    });
    EventMultiplexer.prototype.add = function (event) {
        var _this = this;
        var e = { event: event, listener: null };
        this.events.push(e);
        if (this.hasListeners) {
            this.hook(e);
        }
        var dispose = function () {
            if (_this.hasListeners) {
                _this.unhook(e);
            }
            var idx = _this.events.indexOf(e);
            _this.events.splice(idx, 1);
        };
        return toDisposable(functional_once(dispose));
    };
    EventMultiplexer.prototype.onFirstListenerAdd = function () {
        var _this = this;
        this.hasListeners = true;
        this.events.forEach(function (e) { return _this.hook(e); });
    };
    EventMultiplexer.prototype.onLastListenerRemove = function () {
        var _this = this;
        this.hasListeners = false;
        this.events.forEach(function (e) { return _this.unhook(e); });
    };
    EventMultiplexer.prototype.hook = function (e) {
        var _this = this;
        e.listener = e.event(function (r) { return _this.emitter.fire(r); });
    };
    EventMultiplexer.prototype.unhook = function (e) {
        if (e.listener) {
            e.listener.dispose();
        }
        e.listener = null;
    };
    EventMultiplexer.prototype.dispose = function () {
        this.emitter.dispose();
    };
    return EventMultiplexer;
}());

/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
var EventBufferer = /** @class */ (function () {
    function EventBufferer() {
        this.buffers = [];
    }
    EventBufferer.prototype.wrapEvent = function (event) {
        var _this = this;
        return function (listener, thisArgs, disposables) {
            return event(function (i) {
                var buffer = _this.buffers[_this.buffers.length - 1];
                if (buffer) {
                    buffer.push(function () { return listener.call(thisArgs, i); });
                }
                else {
                    listener.call(thisArgs, i);
                }
            }, undefined, disposables);
        };
    };
    EventBufferer.prototype.bufferEvents = function (fn) {
        var buffer = [];
        this.buffers.push(buffer);
        var r = fn();
        this.buffers.pop();
        buffer.forEach(function (flush) { return flush(); });
        return r;
    };
    return EventBufferer;
}());

/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
var event_Relay = /** @class */ (function () {
    function Relay() {
        var _this = this;
        this.listening = false;
        this.inputEvent = event_Event.None;
        this.inputEventListener = Disposable.None;
        this.emitter = new event_Emitter({
            onFirstListenerDidAdd: function () {
                _this.listening = true;
                _this.inputEventListener = _this.inputEvent(_this.emitter.fire, _this.emitter);
            },
            onLastListenerRemove: function () {
                _this.listening = false;
                _this.inputEventListener.dispose();
            }
        });
        this.event = this.emitter.event;
    }
    Object.defineProperty(Relay.prototype, "input", {
        set: function (event) {
            this.inputEvent = event;
            if (this.listening) {
                this.inputEventListener.dispose();
                this.inputEventListener = event(this.emitter.fire, this.emitter);
            }
        },
        enumerable: true,
        configurable: true
    });
    Relay.prototype.dispose = function () {
        this.inputEventListener.dispose();
        this.emitter.dispose();
    };
    return Relay;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/cancellation.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var shortcutEvent = Object.freeze(function (callback, context) {
    var handle = setTimeout(callback.bind(context), 0);
    return { dispose: function () { clearTimeout(handle); } };
});
var cancellation_CancellationToken;
(function (CancellationToken) {
    function isCancellationToken(thing) {
        if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
            return true;
        }
        if (thing instanceof cancellation_MutableToken) {
            return true;
        }
        if (!thing || typeof thing !== 'object') {
            return false;
        }
        return typeof thing.isCancellationRequested === 'boolean'
            && typeof thing.onCancellationRequested === 'function';
    }
    CancellationToken.isCancellationToken = isCancellationToken;
    CancellationToken.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: event_Event.None
    });
    CancellationToken.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
    });
})(cancellation_CancellationToken || (cancellation_CancellationToken = {}));
var cancellation_MutableToken = /** @class */ (function () {
    function MutableToken() {
        this._isCancelled = false;
        this._emitter = null;
    }
    MutableToken.prototype.cancel = function () {
        if (!this._isCancelled) {
            this._isCancelled = true;
            if (this._emitter) {
                this._emitter.fire(undefined);
                this.dispose();
            }
        }
    };
    Object.defineProperty(MutableToken.prototype, "isCancellationRequested", {
        get: function () {
            return this._isCancelled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MutableToken.prototype, "onCancellationRequested", {
        get: function () {
            if (this._isCancelled) {
                return shortcutEvent;
            }
            if (!this._emitter) {
                this._emitter = new event_Emitter();
            }
            return this._emitter.event;
        },
        enumerable: true,
        configurable: true
    });
    MutableToken.prototype.dispose = function () {
        if (this._emitter) {
            this._emitter.dispose();
            this._emitter = null;
        }
    };
    return MutableToken;
}());
var CancellationTokenSource = /** @class */ (function () {
    function CancellationTokenSource(parent) {
        this._token = undefined;
        this._parentListener = undefined;
        this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
    }
    Object.defineProperty(CancellationTokenSource.prototype, "token", {
        get: function () {
            if (!this._token) {
                // be lazy and create the token only when
                // actually needed
                this._token = new cancellation_MutableToken();
            }
            return this._token;
        },
        enumerable: true,
        configurable: true
    });
    CancellationTokenSource.prototype.cancel = function () {
        if (!this._token) {
            // save an object by returning the default
            // cancelled token when cancellation happens
            // before someone asks for the token
            this._token = cancellation_CancellationToken.Cancelled;
        }
        else if (this._token instanceof cancellation_MutableToken) {
            // actually cancel
            this._token.cancel();
        }
    };
    CancellationTokenSource.prototype.dispose = function () {
        if (this._parentListener) {
            this._parentListener.dispose();
        }
        if (!this._token) {
            // ensure to initialize with an empty token if we had none
            this._token = cancellation_CancellationToken.None;
        }
        else if (this._token instanceof cancellation_MutableToken) {
            // actually dispose
            this._token.dispose();
        }
    };
    return CancellationTokenSource;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/base/common/keyCodes.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var KeyCodeStrMap = /** @class */ (function () {
    function KeyCodeStrMap() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
    }
    KeyCodeStrMap.prototype.define = function (keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    };
    KeyCodeStrMap.prototype.keyCodeToStr = function (keyCode) {
        return this._keyCodeToStr[keyCode];
    };
    KeyCodeStrMap.prototype.strToKeyCode = function (str) {
        return this._strToKeyCode[str.toLowerCase()] || 0 /* Unknown */;
    };
    return KeyCodeStrMap;
}());
var uiMap = new KeyCodeStrMap();
var userSettingsUSMap = new KeyCodeStrMap();
var userSettingsGeneralMap = new KeyCodeStrMap();
(function () {
    function define(keyCode, uiLabel, usUserSettingsLabel, generalUserSettingsLabel) {
        if (usUserSettingsLabel === void 0) { usUserSettingsLabel = uiLabel; }
        if (generalUserSettingsLabel === void 0) { generalUserSettingsLabel = usUserSettingsLabel; }
        uiMap.define(keyCode, uiLabel);
        userSettingsUSMap.define(keyCode, usUserSettingsLabel);
        userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
    }
    define(0 /* Unknown */, 'unknown');
    define(1 /* Backspace */, 'Backspace');
    define(2 /* Tab */, 'Tab');
    define(3 /* Enter */, 'Enter');
    define(4 /* Shift */, 'Shift');
    define(5 /* Ctrl */, 'Ctrl');
    define(6 /* Alt */, 'Alt');
    define(7 /* PauseBreak */, 'PauseBreak');
    define(8 /* CapsLock */, 'CapsLock');
    define(9 /* Escape */, 'Escape');
    define(10 /* Space */, 'Space');
    define(11 /* PageUp */, 'PageUp');
    define(12 /* PageDown */, 'PageDown');
    define(13 /* End */, 'End');
    define(14 /* Home */, 'Home');
    define(15 /* LeftArrow */, 'LeftArrow', 'Left');
    define(16 /* UpArrow */, 'UpArrow', 'Up');
    define(17 /* RightArrow */, 'RightArrow', 'Right');
    define(18 /* DownArrow */, 'DownArrow', 'Down');
    define(19 /* Insert */, 'Insert');
    define(20 /* Delete */, 'Delete');
    define(21 /* KEY_0 */, '0');
    define(22 /* KEY_1 */, '1');
    define(23 /* KEY_2 */, '2');
    define(24 /* KEY_3 */, '3');
    define(25 /* KEY_4 */, '4');
    define(26 /* KEY_5 */, '5');
    define(27 /* KEY_6 */, '6');
    define(28 /* KEY_7 */, '7');
    define(29 /* KEY_8 */, '8');
    define(30 /* KEY_9 */, '9');
    define(31 /* KEY_A */, 'A');
    define(32 /* KEY_B */, 'B');
    define(33 /* KEY_C */, 'C');
    define(34 /* KEY_D */, 'D');
    define(35 /* KEY_E */, 'E');
    define(36 /* KEY_F */, 'F');
    define(37 /* KEY_G */, 'G');
    define(38 /* KEY_H */, 'H');
    define(39 /* KEY_I */, 'I');
    define(40 /* KEY_J */, 'J');
    define(41 /* KEY_K */, 'K');
    define(42 /* KEY_L */, 'L');
    define(43 /* KEY_M */, 'M');
    define(44 /* KEY_N */, 'N');
    define(45 /* KEY_O */, 'O');
    define(46 /* KEY_P */, 'P');
    define(47 /* KEY_Q */, 'Q');
    define(48 /* KEY_R */, 'R');
    define(49 /* KEY_S */, 'S');
    define(50 /* KEY_T */, 'T');
    define(51 /* KEY_U */, 'U');
    define(52 /* KEY_V */, 'V');
    define(53 /* KEY_W */, 'W');
    define(54 /* KEY_X */, 'X');
    define(55 /* KEY_Y */, 'Y');
    define(56 /* KEY_Z */, 'Z');
    define(57 /* Meta */, 'Meta');
    define(58 /* ContextMenu */, 'ContextMenu');
    define(59 /* F1 */, 'F1');
    define(60 /* F2 */, 'F2');
    define(61 /* F3 */, 'F3');
    define(62 /* F4 */, 'F4');
    define(63 /* F5 */, 'F5');
    define(64 /* F6 */, 'F6');
    define(65 /* F7 */, 'F7');
    define(66 /* F8 */, 'F8');
    define(67 /* F9 */, 'F9');
    define(68 /* F10 */, 'F10');
    define(69 /* F11 */, 'F11');
    define(70 /* F12 */, 'F12');
    define(71 /* F13 */, 'F13');
    define(72 /* F14 */, 'F14');
    define(73 /* F15 */, 'F15');
    define(74 /* F16 */, 'F16');
    define(75 /* F17 */, 'F17');
    define(76 /* F18 */, 'F18');
    define(77 /* F19 */, 'F19');
    define(78 /* NumLock */, 'NumLock');
    define(79 /* ScrollLock */, 'ScrollLock');
    define(80 /* US_SEMICOLON */, ';', ';', 'OEM_1');
    define(81 /* US_EQUAL */, '=', '=', 'OEM_PLUS');
    define(82 /* US_COMMA */, ',', ',', 'OEM_COMMA');
    define(83 /* US_MINUS */, '-', '-', 'OEM_MINUS');
    define(84 /* US_DOT */, '.', '.', 'OEM_PERIOD');
    define(85 /* US_SLASH */, '/', '/', 'OEM_2');
    define(86 /* US_BACKTICK */, '`', '`', 'OEM_3');
    define(110 /* ABNT_C1 */, 'ABNT_C1');
    define(111 /* ABNT_C2 */, 'ABNT_C2');
    define(87 /* US_OPEN_SQUARE_BRACKET */, '[', '[', 'OEM_4');
    define(88 /* US_BACKSLASH */, '\\', '\\', 'OEM_5');
    define(89 /* US_CLOSE_SQUARE_BRACKET */, ']', ']', 'OEM_6');
    define(90 /* US_QUOTE */, '\'', '\'', 'OEM_7');
    define(91 /* OEM_8 */, 'OEM_8');
    define(92 /* OEM_102 */, 'OEM_102');
    define(93 /* NUMPAD_0 */, 'NumPad0');
    define(94 /* NUMPAD_1 */, 'NumPad1');
    define(95 /* NUMPAD_2 */, 'NumPad2');
    define(96 /* NUMPAD_3 */, 'NumPad3');
    define(97 /* NUMPAD_4 */, 'NumPad4');
    define(98 /* NUMPAD_5 */, 'NumPad5');
    define(99 /* NUMPAD_6 */, 'NumPad6');
    define(100 /* NUMPAD_7 */, 'NumPad7');
    define(101 /* NUMPAD_8 */, 'NumPad8');
    define(102 /* NUMPAD_9 */, 'NumPad9');
    define(103 /* NUMPAD_MULTIPLY */, 'NumPad_Multiply');
    define(104 /* NUMPAD_ADD */, 'NumPad_Add');
    define(105 /* NUMPAD_SEPARATOR */, 'NumPad_Separator');
    define(106 /* NUMPAD_SUBTRACT */, 'NumPad_Subtract');
    define(107 /* NUMPAD_DECIMAL */, 'NumPad_Decimal');
    define(108 /* NUMPAD_DIVIDE */, 'NumPad_Divide');
})();
var KeyCodeUtils;
(function (KeyCodeUtils) {
    function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toString = toString;
    function fromString(key) {
        return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromString = fromString;
    function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromUserSettings = fromUserSettings;
})(KeyCodeUtils || (KeyCodeUtils = {}));
function KeyChord(firstPart, secondPart) {
    var chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
    return (firstPart | chordPart) >>> 0;
}
function createKeybinding(keybinding, OS) {
    if (keybinding === 0) {
        return null;
    }
    var firstPart = (keybinding & 0x0000FFFF) >>> 0;
    var chordPart = (keybinding & 0xFFFF0000) >>> 16;
    if (chordPart !== 0) {
        return new keyCodes_ChordKeybinding([
            createSimpleKeybinding(firstPart, OS),
            createSimpleKeybinding(chordPart, OS)
        ]);
    }
    return new keyCodes_ChordKeybinding([createSimpleKeybinding(firstPart, OS)]);
}
function createSimpleKeybinding(keybinding, OS) {
    var ctrlCmd = (keybinding & 2048 /* CtrlCmd */ ? true : false);
    var winCtrl = (keybinding & 256 /* WinCtrl */ ? true : false);
    var ctrlKey = (OS === 2 /* Macintosh */ ? winCtrl : ctrlCmd);
    var shiftKey = (keybinding & 1024 /* Shift */ ? true : false);
    var altKey = (keybinding & 512 /* Alt */ ? true : false);
    var metaKey = (OS === 2 /* Macintosh */ ? ctrlCmd : winCtrl);
    var keyCode = (keybinding & 255 /* KeyCode */);
    return new SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
var SimpleKeybinding = /** @class */ (function () {
    function SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    SimpleKeybinding.prototype.equals = function (other) {
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.keyCode === other.keyCode);
    };
    SimpleKeybinding.prototype.isModifierKey = function () {
        return (this.keyCode === 0 /* Unknown */
            || this.keyCode === 5 /* Ctrl */
            || this.keyCode === 57 /* Meta */
            || this.keyCode === 6 /* Alt */
            || this.keyCode === 4 /* Shift */);
    };
    SimpleKeybinding.prototype.toChord = function () {
        return new keyCodes_ChordKeybinding([this]);
    };
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    SimpleKeybinding.prototype.isDuplicateModifierCase = function () {
        return ((this.ctrlKey && this.keyCode === 5 /* Ctrl */)
            || (this.shiftKey && this.keyCode === 4 /* Shift */)
            || (this.altKey && this.keyCode === 6 /* Alt */)
            || (this.metaKey && this.keyCode === 57 /* Meta */));
    };
    return SimpleKeybinding;
}());

var keyCodes_ChordKeybinding = /** @class */ (function () {
    function ChordKeybinding(parts) {
        if (parts.length === 0) {
            throw illegalArgument("parts");
        }
        this.parts = parts;
    }
    ChordKeybinding.prototype.equals = function (other) {
        if (other === null) {
            return false;
        }
        if (this.parts.length !== other.parts.length) {
            return false;
        }
        for (var i = 0; i < this.parts.length; i++) {
            if (!this.parts[i].equals(other.parts[i])) {
                return false;
            }
        }
        return true;
    };
    return ChordKeybinding;
}());

var ResolvedKeybindingPart = /** @class */ (function () {
    function ResolvedKeybindingPart(ctrlKey, shiftKey, altKey, metaKey, kbLabel, kbAriaLabel) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyLabel = kbLabel;
        this.keyAriaLabel = kbAriaLabel;
    }
    return ResolvedKeybindingPart;
}());

/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */
var ResolvedKeybinding = /** @class */ (function () {
    function ResolvedKeybinding() {
    }
    return ResolvedKeybinding;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/selection.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var selection_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


/**
 * A selection in the editor.
 * The selection is a range that has an orientation.
 */
var selection_Selection = /** @class */ (function (_super) {
    selection_extends(Selection, _super);
    function Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
        var _this = _super.call(this, selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) || this;
        _this.selectionStartLineNumber = selectionStartLineNumber;
        _this.selectionStartColumn = selectionStartColumn;
        _this.positionLineNumber = positionLineNumber;
        _this.positionColumn = positionColumn;
        return _this;
    }
    /**
     * Clone this selection.
     */
    Selection.prototype.clone = function () {
        return new Selection(this.selectionStartLineNumber, this.selectionStartColumn, this.positionLineNumber, this.positionColumn);
    };
    /**
     * Transform to a human-readable representation.
     */
    Selection.prototype.toString = function () {
        return '[' + this.selectionStartLineNumber + ',' + this.selectionStartColumn + ' -> ' + this.positionLineNumber + ',' + this.positionColumn + ']';
    };
    /**
     * Test if equals other selection.
     */
    Selection.prototype.equalsSelection = function (other) {
        return (Selection.selectionsEqual(this, other));
    };
    /**
     * Test if the two selections are equal.
     */
    Selection.selectionsEqual = function (a, b) {
        return (a.selectionStartLineNumber === b.selectionStartLineNumber &&
            a.selectionStartColumn === b.selectionStartColumn &&
            a.positionLineNumber === b.positionLineNumber &&
            a.positionColumn === b.positionColumn);
    };
    /**
     * Get directions (LTR or RTL).
     */
    Selection.prototype.getDirection = function () {
        if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
            return 0 /* LTR */;
        }
        return 1 /* RTL */;
    };
    /**
     * Create a new selection with a different `positionLineNumber` and `positionColumn`.
     */
    Selection.prototype.setEndPosition = function (endLineNumber, endColumn) {
        if (this.getDirection() === 0 /* LTR */) {
            return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
    };
    /**
     * Get the position at `positionLineNumber` and `positionColumn`.
     */
    Selection.prototype.getPosition = function () {
        return new Position(this.positionLineNumber, this.positionColumn);
    };
    /**
     * Create a new selection with a different `selectionStartLineNumber` and `selectionStartColumn`.
     */
    Selection.prototype.setStartPosition = function (startLineNumber, startColumn) {
        if (this.getDirection() === 0 /* LTR */) {
            return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
        }
        return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
    };
    // ----
    /**
     * Create a `Selection` from one or two positions
     */
    Selection.fromPositions = function (start, end) {
        if (end === void 0) { end = start; }
        return new Selection(start.lineNumber, start.column, end.lineNumber, end.column);
    };
    /**
     * Create a `Selection` from an `ISelection`.
     */
    Selection.liftSelection = function (sel) {
        return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
    };
    /**
     * `a` equals `b`.
     */
    Selection.selectionsArrEqual = function (a, b) {
        if (a && !b || !a && b) {
            return false;
        }
        if (!a && !b) {
            return true;
        }
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0, len = a.length; i < len; i++) {
            if (!this.selectionsEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Test if `obj` is an `ISelection`.
     */
    Selection.isISelection = function (obj) {
        return (obj
            && (typeof obj.selectionStartLineNumber === 'number')
            && (typeof obj.selectionStartColumn === 'number')
            && (typeof obj.positionLineNumber === 'number')
            && (typeof obj.positionColumn === 'number'));
    };
    /**
     * Create with a direction.
     */
    Selection.createWithDirection = function (startLineNumber, startColumn, endLineNumber, endColumn, direction) {
        if (direction === 0 /* LTR */) {
            return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
    };
    return Selection;
}(range_Range));


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/core/token.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Token = /** @class */ (function () {
    function Token(offset, type, language) {
        this.offset = offset | 0; // @perf
        this.type = type;
        this.language = language;
    }
    Token.prototype.toString = function () {
        return '(' + this.offset + ', ' + this.type + ')';
    };
    return Token;
}());

var TokenizationResult = /** @class */ (function () {
    function TokenizationResult(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
    return TokenizationResult;
}());

var TokenizationResult2 = /** @class */ (function () {
    function TokenizationResult2(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
    return TokenizationResult2;
}());


// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/standalone/standaloneEnums.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY.
var MarkerTag;
(function (MarkerTag) {
    MarkerTag[MarkerTag["Unnecessary"] = 1] = "Unnecessary";
})(MarkerTag || (MarkerTag = {}));
var MarkerSeverity;
(function (MarkerSeverity) {
    MarkerSeverity[MarkerSeverity["Hint"] = 1] = "Hint";
    MarkerSeverity[MarkerSeverity["Info"] = 2] = "Info";
    MarkerSeverity[MarkerSeverity["Warning"] = 4] = "Warning";
    MarkerSeverity[MarkerSeverity["Error"] = 8] = "Error";
})(MarkerSeverity || (MarkerSeverity = {}));
/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
var KeyCode;
(function (KeyCode) {
    /**
     * Placed first to cover the 0 value of the enum.
     */
    KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
    KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
    KeyCode[KeyCode["Tab"] = 2] = "Tab";
    KeyCode[KeyCode["Enter"] = 3] = "Enter";
    KeyCode[KeyCode["Shift"] = 4] = "Shift";
    KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
    KeyCode[KeyCode["Alt"] = 6] = "Alt";
    KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
    KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
    KeyCode[KeyCode["Escape"] = 9] = "Escape";
    KeyCode[KeyCode["Space"] = 10] = "Space";
    KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
    KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
    KeyCode[KeyCode["End"] = 13] = "End";
    KeyCode[KeyCode["Home"] = 14] = "Home";
    KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
    KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
    KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
    KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
    KeyCode[KeyCode["Insert"] = 19] = "Insert";
    KeyCode[KeyCode["Delete"] = 20] = "Delete";
    KeyCode[KeyCode["KEY_0"] = 21] = "KEY_0";
    KeyCode[KeyCode["KEY_1"] = 22] = "KEY_1";
    KeyCode[KeyCode["KEY_2"] = 23] = "KEY_2";
    KeyCode[KeyCode["KEY_3"] = 24] = "KEY_3";
    KeyCode[KeyCode["KEY_4"] = 25] = "KEY_4";
    KeyCode[KeyCode["KEY_5"] = 26] = "KEY_5";
    KeyCode[KeyCode["KEY_6"] = 27] = "KEY_6";
    KeyCode[KeyCode["KEY_7"] = 28] = "KEY_7";
    KeyCode[KeyCode["KEY_8"] = 29] = "KEY_8";
    KeyCode[KeyCode["KEY_9"] = 30] = "KEY_9";
    KeyCode[KeyCode["KEY_A"] = 31] = "KEY_A";
    KeyCode[KeyCode["KEY_B"] = 32] = "KEY_B";
    KeyCode[KeyCode["KEY_C"] = 33] = "KEY_C";
    KeyCode[KeyCode["KEY_D"] = 34] = "KEY_D";
    KeyCode[KeyCode["KEY_E"] = 35] = "KEY_E";
    KeyCode[KeyCode["KEY_F"] = 36] = "KEY_F";
    KeyCode[KeyCode["KEY_G"] = 37] = "KEY_G";
    KeyCode[KeyCode["KEY_H"] = 38] = "KEY_H";
    KeyCode[KeyCode["KEY_I"] = 39] = "KEY_I";
    KeyCode[KeyCode["KEY_J"] = 40] = "KEY_J";
    KeyCode[KeyCode["KEY_K"] = 41] = "KEY_K";
    KeyCode[KeyCode["KEY_L"] = 42] = "KEY_L";
    KeyCode[KeyCode["KEY_M"] = 43] = "KEY_M";
    KeyCode[KeyCode["KEY_N"] = 44] = "KEY_N";
    KeyCode[KeyCode["KEY_O"] = 45] = "KEY_O";
    KeyCode[KeyCode["KEY_P"] = 46] = "KEY_P";
    KeyCode[KeyCode["KEY_Q"] = 47] = "KEY_Q";
    KeyCode[KeyCode["KEY_R"] = 48] = "KEY_R";
    KeyCode[KeyCode["KEY_S"] = 49] = "KEY_S";
    KeyCode[KeyCode["KEY_T"] = 50] = "KEY_T";
    KeyCode[KeyCode["KEY_U"] = 51] = "KEY_U";
    KeyCode[KeyCode["KEY_V"] = 52] = "KEY_V";
    KeyCode[KeyCode["KEY_W"] = 53] = "KEY_W";
    KeyCode[KeyCode["KEY_X"] = 54] = "KEY_X";
    KeyCode[KeyCode["KEY_Y"] = 55] = "KEY_Y";
    KeyCode[KeyCode["KEY_Z"] = 56] = "KEY_Z";
    KeyCode[KeyCode["Meta"] = 57] = "Meta";
    KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
    KeyCode[KeyCode["F1"] = 59] = "F1";
    KeyCode[KeyCode["F2"] = 60] = "F2";
    KeyCode[KeyCode["F3"] = 61] = "F3";
    KeyCode[KeyCode["F4"] = 62] = "F4";
    KeyCode[KeyCode["F5"] = 63] = "F5";
    KeyCode[KeyCode["F6"] = 64] = "F6";
    KeyCode[KeyCode["F7"] = 65] = "F7";
    KeyCode[KeyCode["F8"] = 66] = "F8";
    KeyCode[KeyCode["F9"] = 67] = "F9";
    KeyCode[KeyCode["F10"] = 68] = "F10";
    KeyCode[KeyCode["F11"] = 69] = "F11";
    KeyCode[KeyCode["F12"] = 70] = "F12";
    KeyCode[KeyCode["F13"] = 71] = "F13";
    KeyCode[KeyCode["F14"] = 72] = "F14";
    KeyCode[KeyCode["F15"] = 73] = "F15";
    KeyCode[KeyCode["F16"] = 74] = "F16";
    KeyCode[KeyCode["F17"] = 75] = "F17";
    KeyCode[KeyCode["F18"] = 76] = "F18";
    KeyCode[KeyCode["F19"] = 77] = "F19";
    KeyCode[KeyCode["NumLock"] = 78] = "NumLock";
    KeyCode[KeyCode["ScrollLock"] = 79] = "ScrollLock";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    KeyCode[KeyCode["US_SEMICOLON"] = 80] = "US_SEMICOLON";
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    KeyCode[KeyCode["US_EQUAL"] = 81] = "US_EQUAL";
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    KeyCode[KeyCode["US_COMMA"] = 82] = "US_COMMA";
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    KeyCode[KeyCode["US_MINUS"] = 83] = "US_MINUS";
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    KeyCode[KeyCode["US_DOT"] = 84] = "US_DOT";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    KeyCode[KeyCode["US_SLASH"] = 85] = "US_SLASH";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    KeyCode[KeyCode["US_BACKTICK"] = 86] = "US_BACKTICK";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    KeyCode[KeyCode["US_OPEN_SQUARE_BRACKET"] = 87] = "US_OPEN_SQUARE_BRACKET";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    KeyCode[KeyCode["US_BACKSLASH"] = 88] = "US_BACKSLASH";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    KeyCode[KeyCode["US_CLOSE_SQUARE_BRACKET"] = 89] = "US_CLOSE_SQUARE_BRACKET";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    KeyCode[KeyCode["US_QUOTE"] = 90] = "US_QUOTE";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    KeyCode[KeyCode["OEM_8"] = 91] = "OEM_8";
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    KeyCode[KeyCode["OEM_102"] = 92] = "OEM_102";
    KeyCode[KeyCode["NUMPAD_0"] = 93] = "NUMPAD_0";
    KeyCode[KeyCode["NUMPAD_1"] = 94] = "NUMPAD_1";
    KeyCode[KeyCode["NUMPAD_2"] = 95] = "NUMPAD_2";
    KeyCode[KeyCode["NUMPAD_3"] = 96] = "NUMPAD_3";
    KeyCode[KeyCode["NUMPAD_4"] = 97] = "NUMPAD_4";
    KeyCode[KeyCode["NUMPAD_5"] = 98] = "NUMPAD_5";
    KeyCode[KeyCode["NUMPAD_6"] = 99] = "NUMPAD_6";
    KeyCode[KeyCode["NUMPAD_7"] = 100] = "NUMPAD_7";
    KeyCode[KeyCode["NUMPAD_8"] = 101] = "NUMPAD_8";
    KeyCode[KeyCode["NUMPAD_9"] = 102] = "NUMPAD_9";
    KeyCode[KeyCode["NUMPAD_MULTIPLY"] = 103] = "NUMPAD_MULTIPLY";
    KeyCode[KeyCode["NUMPAD_ADD"] = 104] = "NUMPAD_ADD";
    KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 105] = "NUMPAD_SEPARATOR";
    KeyCode[KeyCode["NUMPAD_SUBTRACT"] = 106] = "NUMPAD_SUBTRACT";
    KeyCode[KeyCode["NUMPAD_DECIMAL"] = 107] = "NUMPAD_DECIMAL";
    KeyCode[KeyCode["NUMPAD_DIVIDE"] = 108] = "NUMPAD_DIVIDE";
    /**
     * Cover all key codes when IME is processing input.
     */
    KeyCode[KeyCode["KEY_IN_COMPOSITION"] = 109] = "KEY_IN_COMPOSITION";
    KeyCode[KeyCode["ABNT_C1"] = 110] = "ABNT_C1";
    KeyCode[KeyCode["ABNT_C2"] = 111] = "ABNT_C2";
    /**
     * Placed last to cover the length of the enum.
     * Please do not depend on this value!
     */
    KeyCode[KeyCode["MAX_VALUE"] = 112] = "MAX_VALUE";
})(KeyCode || (KeyCode = {}));
/**
 * The direction of a selection.
 */
var SelectionDirection;
(function (SelectionDirection) {
    /**
     * The selection starts above where it ends.
     */
    SelectionDirection[SelectionDirection["LTR"] = 0] = "LTR";
    /**
     * The selection starts below where it ends.
     */
    SelectionDirection[SelectionDirection["RTL"] = 1] = "RTL";
})(SelectionDirection || (SelectionDirection = {}));
var ScrollbarVisibility;
(function (ScrollbarVisibility) {
    ScrollbarVisibility[ScrollbarVisibility["Auto"] = 1] = "Auto";
    ScrollbarVisibility[ScrollbarVisibility["Hidden"] = 2] = "Hidden";
    ScrollbarVisibility[ScrollbarVisibility["Visible"] = 3] = "Visible";
})(ScrollbarVisibility || (ScrollbarVisibility = {}));
/**
 * Vertical Lane in the overview ruler of the editor.
 */
var OverviewRulerLane;
(function (OverviewRulerLane) {
    OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
    OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
    OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
    OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
})(OverviewRulerLane || (OverviewRulerLane = {}));
/**
 * End of line character preference.
 */
var EndOfLinePreference;
(function (EndOfLinePreference) {
    /**
     * Use the end of line character identified in the text buffer.
     */
    EndOfLinePreference[EndOfLinePreference["TextDefined"] = 0] = "TextDefined";
    /**
     * Use line feed (\n) as the end of line character.
     */
    EndOfLinePreference[EndOfLinePreference["LF"] = 1] = "LF";
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    EndOfLinePreference[EndOfLinePreference["CRLF"] = 2] = "CRLF";
})(EndOfLinePreference || (EndOfLinePreference = {}));
/**
 * The default end of line to use when instantiating models.
 */
var DefaultEndOfLine;
(function (DefaultEndOfLine) {
    /**
     * Use line feed (\n) as the end of line character.
     */
    DefaultEndOfLine[DefaultEndOfLine["LF"] = 1] = "LF";
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    DefaultEndOfLine[DefaultEndOfLine["CRLF"] = 2] = "CRLF";
})(DefaultEndOfLine || (DefaultEndOfLine = {}));
/**
 * End of line character preference.
 */
var EndOfLineSequence;
(function (EndOfLineSequence) {
    /**
     * Use line feed (\n) as the end of line character.
     */
    EndOfLineSequence[EndOfLineSequence["LF"] = 0] = "LF";
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    EndOfLineSequence[EndOfLineSequence["CRLF"] = 1] = "CRLF";
})(EndOfLineSequence || (EndOfLineSequence = {}));
/**
 * Describes the behavior of decorations when typing/editing near their edges.
 * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
 */
var TrackedRangeStickiness;
(function (TrackedRangeStickiness) {
    TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
    TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
    TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
    TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
})(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
var ScrollType;
(function (ScrollType) {
    ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
    ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
})(ScrollType || (ScrollType = {}));
/**
 * Describes the reason the cursor has changed its position.
 */
var CursorChangeReason;
(function (CursorChangeReason) {
    /**
     * Unknown or not set.
     */
    CursorChangeReason[CursorChangeReason["NotSet"] = 0] = "NotSet";
    /**
     * A `model.setValue()` was called.
     */
    CursorChangeReason[CursorChangeReason["ContentFlush"] = 1] = "ContentFlush";
    /**
     * The `model` has been changed outside of this cursor and the cursor recovers its position from associated markers.
     */
    CursorChangeReason[CursorChangeReason["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
    /**
     * There was an explicit user gesture.
     */
    CursorChangeReason[CursorChangeReason["Explicit"] = 3] = "Explicit";
    /**
     * There was a Paste.
     */
    CursorChangeReason[CursorChangeReason["Paste"] = 4] = "Paste";
    /**
     * There was an Undo.
     */
    CursorChangeReason[CursorChangeReason["Undo"] = 5] = "Undo";
    /**
     * There was a Redo.
     */
    CursorChangeReason[CursorChangeReason["Redo"] = 6] = "Redo";
})(CursorChangeReason || (CursorChangeReason = {}));
var RenderMinimap;
(function (RenderMinimap) {
    RenderMinimap[RenderMinimap["None"] = 0] = "None";
    RenderMinimap[RenderMinimap["Small"] = 1] = "Small";
    RenderMinimap[RenderMinimap["Large"] = 2] = "Large";
    RenderMinimap[RenderMinimap["SmallBlocks"] = 3] = "SmallBlocks";
    RenderMinimap[RenderMinimap["LargeBlocks"] = 4] = "LargeBlocks";
})(RenderMinimap || (RenderMinimap = {}));
/**
 * Describes how to indent wrapped lines.
 */
var WrappingIndent;
(function (WrappingIndent) {
    /**
     * No indentation => wrapped lines begin at column 1.
     */
    WrappingIndent[WrappingIndent["None"] = 0] = "None";
    /**
     * Same => wrapped lines get the same indentation as the parent.
     */
    WrappingIndent[WrappingIndent["Same"] = 1] = "Same";
    /**
     * Indent => wrapped lines get +1 indentation toward the parent.
     */
    WrappingIndent[WrappingIndent["Indent"] = 2] = "Indent";
    /**
     * DeepIndent => wrapped lines get +2 indentation toward the parent.
     */
    WrappingIndent[WrappingIndent["DeepIndent"] = 3] = "DeepIndent";
})(WrappingIndent || (WrappingIndent = {}));
/**
 * The kind of animation in which the editor's cursor should be rendered.
 */
var TextEditorCursorBlinkingStyle;
(function (TextEditorCursorBlinkingStyle) {
    /**
     * Hidden
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Hidden"] = 0] = "Hidden";
    /**
     * Blinking
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Blink"] = 1] = "Blink";
    /**
     * Blinking with smooth fading
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Smooth"] = 2] = "Smooth";
    /**
     * Blinking with prolonged filled state and smooth fading
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Phase"] = 3] = "Phase";
    /**
     * Expand collapse animation on the y axis
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Expand"] = 4] = "Expand";
    /**
     * No-Blinking
     */
    TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Solid"] = 5] = "Solid";
})(TextEditorCursorBlinkingStyle || (TextEditorCursorBlinkingStyle = {}));
/**
 * The style in which the editor's cursor should be rendered.
 */
var TextEditorCursorStyle;
(function (TextEditorCursorStyle) {
    /**
     * As a vertical line (sitting between two characters).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
    /**
     * As a block (sitting on top of a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
    /**
     * As a horizontal line (sitting under a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
    /**
     * As a thin vertical line (sitting between two characters).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
    /**
     * As an outlined block (sitting on top of a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
    /**
     * As a thin horizontal line (sitting under a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
})(TextEditorCursorStyle || (TextEditorCursorStyle = {}));
var RenderLineNumbersType;
(function (RenderLineNumbersType) {
    RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
    RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
    RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
    RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
    RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
})(RenderLineNumbersType || (RenderLineNumbersType = {}));
/**
 * A positioning preference for rendering content widgets.
 */
var ContentWidgetPositionPreference;
(function (ContentWidgetPositionPreference) {
    /**
     * Place the content widget exactly at a position
     */
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["EXACT"] = 0] = "EXACT";
    /**
     * Place the content widget above a position
     */
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["ABOVE"] = 1] = "ABOVE";
    /**
     * Place the content widget below a position
     */
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["BELOW"] = 2] = "BELOW";
})(ContentWidgetPositionPreference || (ContentWidgetPositionPreference = {}));
/**
 * A positioning preference for rendering overlay widgets.
 */
var OverlayWidgetPositionPreference;
(function (OverlayWidgetPositionPreference) {
    /**
     * Position the overlay widget in the top right corner
     */
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
    /**
     * Position the overlay widget in the bottom right corner
     */
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
    /**
     * Position the overlay widget in the top center
     */
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_CENTER"] = 2] = "TOP_CENTER";
})(OverlayWidgetPositionPreference || (OverlayWidgetPositionPreference = {}));
/**
 * Type of hit element with the mouse in the editor.
 */
var MouseTargetType;
(function (MouseTargetType) {
    /**
     * Mouse is on top of an unknown element.
     */
    MouseTargetType[MouseTargetType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * Mouse is on top of the textarea used for input.
     */
    MouseTargetType[MouseTargetType["TEXTAREA"] = 1] = "TEXTAREA";
    /**
     * Mouse is on top of the glyph margin
     */
    MouseTargetType[MouseTargetType["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
    /**
     * Mouse is on top of the line numbers
     */
    MouseTargetType[MouseTargetType["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
    /**
     * Mouse is on top of the line decorations
     */
    MouseTargetType[MouseTargetType["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
    /**
     * Mouse is on top of the whitespace left in the gutter by a view zone.
     */
    MouseTargetType[MouseTargetType["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
    /**
     * Mouse is on top of text in the content.
     */
    MouseTargetType[MouseTargetType["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
    /**
     * Mouse is on top of empty space in the content (e.g. after line text or below last line)
     */
    MouseTargetType[MouseTargetType["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
    /**
     * Mouse is on top of a view zone in the content.
     */
    MouseTargetType[MouseTargetType["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
    /**
     * Mouse is on top of a content widget.
     */
    MouseTargetType[MouseTargetType["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
    /**
     * Mouse is on top of the decorations overview ruler.
     */
    MouseTargetType[MouseTargetType["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
    /**
     * Mouse is on top of a scrollbar.
     */
    MouseTargetType[MouseTargetType["SCROLLBAR"] = 11] = "SCROLLBAR";
    /**
     * Mouse is on top of an overlay widget.
     */
    MouseTargetType[MouseTargetType["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
    /**
     * Mouse is outside of the editor.
     */
    MouseTargetType[MouseTargetType["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
})(MouseTargetType || (MouseTargetType = {}));
/**
 * Describes what to do with the indentation when pressing Enter.
 */
var IndentAction;
(function (IndentAction) {
    /**
     * Insert new line and copy the previous line's indentation.
     */
    IndentAction[IndentAction["None"] = 0] = "None";
    /**
     * Insert new line and indent once (relative to the previous line's indentation).
     */
    IndentAction[IndentAction["Indent"] = 1] = "Indent";
    /**
     * Insert two new lines:
     *  - the first one indented which will hold the cursor
     *  - the second one at the same indentation level
     */
    IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
    /**
     * Insert new line and outdent once (relative to the previous line's indentation).
     */
    IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
})(IndentAction || (IndentAction = {}));
var CompletionItemKind;
(function (CompletionItemKind) {
    CompletionItemKind[CompletionItemKind["Method"] = 0] = "Method";
    CompletionItemKind[CompletionItemKind["Function"] = 1] = "Function";
    CompletionItemKind[CompletionItemKind["Constructor"] = 2] = "Constructor";
    CompletionItemKind[CompletionItemKind["Field"] = 3] = "Field";
    CompletionItemKind[CompletionItemKind["Variable"] = 4] = "Variable";
    CompletionItemKind[CompletionItemKind["Class"] = 5] = "Class";
    CompletionItemKind[CompletionItemKind["Struct"] = 6] = "Struct";
    CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
    CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
    CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
    CompletionItemKind[CompletionItemKind["Event"] = 10] = "Event";
    CompletionItemKind[CompletionItemKind["Operator"] = 11] = "Operator";
    CompletionItemKind[CompletionItemKind["Unit"] = 12] = "Unit";
    CompletionItemKind[CompletionItemKind["Value"] = 13] = "Value";
    CompletionItemKind[CompletionItemKind["Constant"] = 14] = "Constant";
    CompletionItemKind[CompletionItemKind["Enum"] = 15] = "Enum";
    CompletionItemKind[CompletionItemKind["EnumMember"] = 16] = "EnumMember";
    CompletionItemKind[CompletionItemKind["Keyword"] = 17] = "Keyword";
    CompletionItemKind[CompletionItemKind["Text"] = 18] = "Text";
    CompletionItemKind[CompletionItemKind["Color"] = 19] = "Color";
    CompletionItemKind[CompletionItemKind["File"] = 20] = "File";
    CompletionItemKind[CompletionItemKind["Reference"] = 21] = "Reference";
    CompletionItemKind[CompletionItemKind["Customcolor"] = 22] = "Customcolor";
    CompletionItemKind[CompletionItemKind["Folder"] = 23] = "Folder";
    CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
    CompletionItemKind[CompletionItemKind["Snippet"] = 25] = "Snippet";
})(CompletionItemKind || (CompletionItemKind = {}));
var CompletionItemInsertTextRule;
(function (CompletionItemInsertTextRule) {
    /**
     * Adjust whitespace/indentation of multiline insert texts to
     * match the current line indentation.
     */
    CompletionItemInsertTextRule[CompletionItemInsertTextRule["KeepWhitespace"] = 1] = "KeepWhitespace";
    /**
     * `insertText` is a snippet.
     */
    CompletionItemInsertTextRule[CompletionItemInsertTextRule["InsertAsSnippet"] = 4] = "InsertAsSnippet";
})(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
/**
 * How a suggest provider was triggered.
 */
var CompletionTriggerKind;
(function (CompletionTriggerKind) {
    CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
    CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
    CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
/**
 * A document highlight kind.
 */
var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    /**
     * A textual occurrence.
     */
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    /**
     * Read-access of a symbol, like reading a variable.
     */
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    /**
     * Write-access of a symbol, like writing to a variable.
     */
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
/**
 * A symbol kind.
 */
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["File"] = 0] = "File";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 3] = "Package";
    SymbolKind[SymbolKind["Class"] = 4] = "Class";
    SymbolKind[SymbolKind["Method"] = 5] = "Method";
    SymbolKind[SymbolKind["Property"] = 6] = "Property";
    SymbolKind[SymbolKind["Field"] = 7] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
    SymbolKind[SymbolKind["String"] = 14] = "String";
    SymbolKind[SymbolKind["Number"] = 15] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 17] = "Array";
    SymbolKind[SymbolKind["Object"] = 18] = "Object";
    SymbolKind[SymbolKind["Key"] = 19] = "Key";
    SymbolKind[SymbolKind["Null"] = 20] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
    SymbolKind[SymbolKind["Event"] = 23] = "Event";
    SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/standalone/standaloneBase.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/










var standaloneBase_KeyMod = /** @class */ (function () {
    function KeyMod() {
    }
    KeyMod.chord = function (firstPart, secondPart) {
        return KeyChord(firstPart, secondPart);
    };
    KeyMod.CtrlCmd = 2048 /* CtrlCmd */;
    KeyMod.Shift = 1024 /* Shift */;
    KeyMod.Alt = 512 /* Alt */;
    KeyMod.WinCtrl = 256 /* WinCtrl */;
    return KeyMod;
}());

function createMonacoBaseAPI() {
    return {
        editor: undefined,
        languages: undefined,
        CancellationTokenSource: CancellationTokenSource,
        Emitter: event_Emitter,
        KeyCode: KeyCode,
        KeyMod: standaloneBase_KeyMod,
        Position: Position,
        Range: range_Range,
        Selection: selection_Selection,
        SelectionDirection: SelectionDirection,
        MarkerSeverity: MarkerSeverity,
        MarkerTag: MarkerTag,
        Uri: uri_URI,
        Token: Token
    };
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/services/editorSimpleWorker.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var editorSimpleWorker_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();














/**
 * @internal
 */
var editorSimpleWorker_MirrorModel = /** @class */ (function (_super) {
    editorSimpleWorker_extends(MirrorModel, _super);
    function MirrorModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MirrorModel.prototype, "uri", {
        get: function () {
            return this._uri;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MirrorModel.prototype, "version", {
        get: function () {
            return this._versionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MirrorModel.prototype, "eol", {
        get: function () {
            return this._eol;
        },
        enumerable: true,
        configurable: true
    });
    MirrorModel.prototype.getValue = function () {
        return this.getText();
    };
    MirrorModel.prototype.getLinesContent = function () {
        return this._lines.slice(0);
    };
    MirrorModel.prototype.getLineCount = function () {
        return this._lines.length;
    };
    MirrorModel.prototype.getLineContent = function (lineNumber) {
        return this._lines[lineNumber - 1];
    };
    MirrorModel.prototype.getWordAtPosition = function (position, wordDefinition) {
        var wordAtText = getWordAtText(position.column, ensureValidWordDefinition(wordDefinition), this._lines[position.lineNumber - 1], 0);
        if (wordAtText) {
            return new range_Range(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
        }
        return null;
    };
    MirrorModel.prototype.getWordUntilPosition = function (position, wordDefinition) {
        var wordAtPosition = this.getWordAtPosition(position, wordDefinition);
        if (!wordAtPosition) {
            return {
                word: '',
                startColumn: position.column,
                endColumn: position.column
            };
        }
        return {
            word: this._lines[position.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position.column - 1),
            startColumn: wordAtPosition.startColumn,
            endColumn: position.column
        };
    };
    MirrorModel.prototype.createWordIterator = function (wordDefinition) {
        var _this = this;
        var obj;
        var lineNumber = 0;
        var lineText;
        var wordRangesIdx = 0;
        var wordRanges = [];
        var next = function () {
            if (wordRangesIdx < wordRanges.length) {
                var value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
                wordRangesIdx += 1;
                if (!obj) {
                    obj = { done: false, value: value };
                }
                else {
                    obj.value = value;
                }
                return obj;
            }
            else if (lineNumber >= _this._lines.length) {
                return FIN;
            }
            else {
                lineText = _this._lines[lineNumber];
                wordRanges = _this._wordenize(lineText, wordDefinition);
                wordRangesIdx = 0;
                lineNumber += 1;
                return next();
            }
        };
        return { next: next };
    };
    MirrorModel.prototype.getLineWords = function (lineNumber, wordDefinition) {
        var content = this._lines[lineNumber - 1];
        var ranges = this._wordenize(content, wordDefinition);
        var words = [];
        for (var _i = 0, ranges_1 = ranges; _i < ranges_1.length; _i++) {
            var range = ranges_1[_i];
            words.push({
                word: content.substring(range.start, range.end),
                startColumn: range.start + 1,
                endColumn: range.end + 1
            });
        }
        return words;
    };
    MirrorModel.prototype._wordenize = function (content, wordDefinition) {
        var result = [];
        var match;
        wordDefinition.lastIndex = 0; // reset lastIndex just to be sure
        while (match = wordDefinition.exec(content)) {
            if (match[0].length === 0) {
                // it did match the empty string
                break;
            }
            result.push({ start: match.index, end: match.index + match[0].length });
        }
        return result;
    };
    MirrorModel.prototype.getValueInRange = function (range) {
        range = this._validateRange(range);
        if (range.startLineNumber === range.endLineNumber) {
            return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
        }
        var lineEnding = this._eol;
        var startLineIndex = range.startLineNumber - 1;
        var endLineIndex = range.endLineNumber - 1;
        var resultLines = [];
        resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
        for (var i = startLineIndex + 1; i < endLineIndex; i++) {
            resultLines.push(this._lines[i]);
        }
        resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
        return resultLines.join(lineEnding);
    };
    MirrorModel.prototype.offsetAt = function (position) {
        position = this._validatePosition(position);
        this._ensureLineStarts();
        return this._lineStarts.getAccumulatedValue(position.lineNumber - 2) + (position.column - 1);
    };
    MirrorModel.prototype.positionAt = function (offset) {
        offset = Math.floor(offset);
        offset = Math.max(0, offset);
        this._ensureLineStarts();
        var out = this._lineStarts.getIndexOf(offset);
        var lineLength = this._lines[out.index].length;
        // Ensure we return a valid position
        return {
            lineNumber: 1 + out.index,
            column: 1 + Math.min(out.remainder, lineLength)
        };
    };
    MirrorModel.prototype._validateRange = function (range) {
        var start = this._validatePosition({ lineNumber: range.startLineNumber, column: range.startColumn });
        var end = this._validatePosition({ lineNumber: range.endLineNumber, column: range.endColumn });
        if (start.lineNumber !== range.startLineNumber
            || start.column !== range.startColumn
            || end.lineNumber !== range.endLineNumber
            || end.column !== range.endColumn) {
            return {
                startLineNumber: start.lineNumber,
                startColumn: start.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column
            };
        }
        return range;
    };
    MirrorModel.prototype._validatePosition = function (position) {
        if (!Position.isIPosition(position)) {
            throw new Error('bad position');
        }
        var lineNumber = position.lineNumber, column = position.column;
        var hasChanged = false;
        if (lineNumber < 1) {
            lineNumber = 1;
            column = 1;
            hasChanged = true;
        }
        else if (lineNumber > this._lines.length) {
            lineNumber = this._lines.length;
            column = this._lines[lineNumber - 1].length + 1;
            hasChanged = true;
        }
        else {
            var maxCharacter = this._lines[lineNumber - 1].length + 1;
            if (column < 1) {
                column = 1;
                hasChanged = true;
            }
            else if (column > maxCharacter) {
                column = maxCharacter;
                hasChanged = true;
            }
        }
        if (!hasChanged) {
            return position;
        }
        else {
            return { lineNumber: lineNumber, column: column };
        }
    };
    return MirrorModel;
}(mirrorTextModel_MirrorTextModel));
/**
 * @internal
 */
var editorSimpleWorker_BaseEditorSimpleWorker = /** @class */ (function () {
    function BaseEditorSimpleWorker(foreignModuleFactory) {
        this._foreignModuleFactory = foreignModuleFactory;
        this._foreignModule = null;
    }
    // ---- BEGIN diff --------------------------------------------------------------------------
    BaseEditorSimpleWorker.prototype.computeDiff = function (originalUrl, modifiedUrl, ignoreTrimWhitespace) {
        var original = this._getModel(originalUrl);
        var modified = this._getModel(modifiedUrl);
        if (!original || !modified) {
            return Promise.resolve(null);
        }
        var originalLines = original.getLinesContent();
        var modifiedLines = modified.getLinesContent();
        var diffComputer = new DiffComputer(originalLines, modifiedLines, {
            shouldComputeCharChanges: true,
            shouldPostProcessCharChanges: true,
            shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
            shouldMakePrettyDiff: true
        });
        var changes = diffComputer.computeDiff();
        var identical = (changes.length > 0 ? false : this._modelsAreIdentical(original, modified));
        return Promise.resolve({
            identical: identical,
            changes: changes
        });
    };
    BaseEditorSimpleWorker.prototype._modelsAreIdentical = function (original, modified) {
        var originalLineCount = original.getLineCount();
        var modifiedLineCount = modified.getLineCount();
        if (originalLineCount !== modifiedLineCount) {
            return false;
        }
        for (var line = 1; line <= originalLineCount; line++) {
            var originalLine = original.getLineContent(line);
            var modifiedLine = modified.getLineContent(line);
            if (originalLine !== modifiedLine) {
                return false;
            }
        }
        return true;
    };
    BaseEditorSimpleWorker.prototype.computeMoreMinimalEdits = function (modelUrl, edits) {
        var model = this._getModel(modelUrl);
        if (!model) {
            return Promise.resolve(edits);
        }
        var result = [];
        var lastEol = undefined;
        edits = mergeSort(edits, function (a, b) {
            if (a.range && b.range) {
                return range_Range.compareRangesUsingStarts(a.range, b.range);
            }
            // eol only changes should go to the end
            var aRng = a.range ? 0 : 1;
            var bRng = b.range ? 0 : 1;
            return aRng - bRng;
        });
        for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
            var _a = edits_1[_i], range = _a.range, text = _a.text, eol = _a.eol;
            if (typeof eol === 'number') {
                lastEol = eol;
            }
            if (range_Range.isEmpty(range) && !text) {
                // empty change
                continue;
            }
            var original = model.getValueInRange(range);
            text = text.replace(/\r\n|\n|\r/g, model.eol);
            if (original === text) {
                // noop
                continue;
            }
            // make sure diff won't take too long
            if (Math.max(text.length, original.length) > BaseEditorSimpleWorker._diffLimit) {
                result.push({ range: range, text: text });
                continue;
            }
            // compute diff between original and edit.text
            var changes = stringDiff(original, text, false);
            var editOffset = model.offsetAt(range_Range.lift(range).getStartPosition());
            for (var _b = 0, changes_1 = changes; _b < changes_1.length; _b++) {
                var change = changes_1[_b];
                var start = model.positionAt(editOffset + change.originalStart);
                var end = model.positionAt(editOffset + change.originalStart + change.originalLength);
                var newEdit = {
                    text: text.substr(change.modifiedStart, change.modifiedLength),
                    range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
                };
                if (model.getValueInRange(newEdit.range) !== newEdit.text) {
                    result.push(newEdit);
                }
            }
        }
        if (typeof lastEol === 'number') {
            result.push({ eol: lastEol, text: '', range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
        }
        return Promise.resolve(result);
    };
    // ---- END minimal edits ---------------------------------------------------------------
    BaseEditorSimpleWorker.prototype.computeLinks = function (modelUrl) {
        var model = this._getModel(modelUrl);
        if (!model) {
            return Promise.resolve(null);
        }
        return Promise.resolve(computeLinks(model));
    };
    BaseEditorSimpleWorker.prototype.textualSuggest = function (modelUrl, position, wordDef, wordDefFlags) {
        var model = this._getModel(modelUrl);
        if (!model) {
            return Promise.resolve(null);
        }
        var seen = Object.create(null);
        var suggestions = [];
        var wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        var wordUntil = model.getWordUntilPosition(position, wordDefRegExp);
        var wordAt = model.getWordAtPosition(position, wordDefRegExp);
        if (wordAt) {
            seen[model.getValueInRange(wordAt)] = true;
        }
        for (var iter = model.createWordIterator(wordDefRegExp), e = iter.next(); !e.done && suggestions.length <= BaseEditorSimpleWorker._suggestionsLimit; e = iter.next()) {
            var word = e.value;
            if (seen[word]) {
                continue;
            }
            seen[word] = true;
            if (!isNaN(Number(word))) {
                continue;
            }
            suggestions.push({
                kind: 18 /* Text */,
                label: word,
                insertText: word,
                range: { startLineNumber: position.lineNumber, startColumn: wordUntil.startColumn, endLineNumber: position.lineNumber, endColumn: wordUntil.endColumn }
            });
        }
        return Promise.resolve({ suggestions: suggestions });
    };
    // ---- END suggest --------------------------------------------------------------------------
    //#region -- word ranges --
    BaseEditorSimpleWorker.prototype.computeWordRanges = function (modelUrl, range, wordDef, wordDefFlags) {
        var model = this._getModel(modelUrl);
        if (!model) {
            return Promise.resolve(Object.create(null));
        }
        var wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        var result = Object.create(null);
        for (var line = range.startLineNumber; line < range.endLineNumber; line++) {
            var words = model.getLineWords(line, wordDefRegExp);
            for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                var word = words_1[_i];
                if (!isNaN(Number(word.word))) {
                    continue;
                }
                var array = result[word.word];
                if (!array) {
                    array = [];
                    result[word.word] = array;
                }
                array.push({
                    startLineNumber: line,
                    startColumn: word.startColumn,
                    endLineNumber: line,
                    endColumn: word.endColumn
                });
            }
        }
        return Promise.resolve(result);
    };
    //#endregion
    BaseEditorSimpleWorker.prototype.navigateValueSet = function (modelUrl, range, up, wordDef, wordDefFlags) {
        var model = this._getModel(modelUrl);
        if (!model) {
            return Promise.resolve(null);
        }
        var wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        if (range.startColumn === range.endColumn) {
            range = {
                startLineNumber: range.startLineNumber,
                startColumn: range.startColumn,
                endLineNumber: range.endLineNumber,
                endColumn: range.endColumn + 1
            };
        }
        var selectionText = model.getValueInRange(range);
        var wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
        if (!wordRange) {
            return Promise.resolve(null);
        }
        var word = model.getValueInRange(wordRange);
        var result = BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
        return Promise.resolve(result);
    };
    // ---- BEGIN foreign module support --------------------------------------------------------------------------
    BaseEditorSimpleWorker.prototype.loadForeignModule = function (moduleId, createData) {
        var _this = this;
        var ctx = {
            getMirrorModels: function () {
                return _this._getModels();
            }
        };
        if (this._foreignModuleFactory) {
            this._foreignModule = this._foreignModuleFactory(ctx, createData);
            // static foreing module
            var methods = [];
            for (var _i = 0, _a = getAllPropertyNames(this._foreignModule); _i < _a.length; _i++) {
                var prop = _a[_i];
                if (typeof this._foreignModule[prop] === 'function') {
                    methods.push(prop);
                }
            }
            return Promise.resolve(methods);
        }
        // ESM-comment-begin
        // 		return new Promise<any>((resolve, reject) => {
        // 			require([moduleId], (foreignModule: { create: IForeignModuleFactory }) => {
        // 				this._foreignModule = foreignModule.create(ctx, createData);
        // 
        // 				let methods: string[] = [];
        // 				for (const prop of getAllPropertyNames(this._foreignModule)) {
        // 					if (typeof this._foreignModule[prop] === 'function') {
        // 						methods.push(prop);
        // 					}
        // 				}
        // 
        // 				resolve(methods);
        // 
        // 			}, reject);
        // 		});
        // ESM-comment-end
        // ESM-uncomment-begin
        return Promise.reject(new Error("Unexpected usage"));
        // ESM-uncomment-end
    };
    // foreign method request
    BaseEditorSimpleWorker.prototype.fmr = function (method, args) {
        if (!this._foreignModule || typeof this._foreignModule[method] !== 'function') {
            return Promise.reject(new Error('Missing requestHandler or method: ' + method));
        }
        try {
            return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args));
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
    // ---- END diff --------------------------------------------------------------------------
    // ---- BEGIN minimal edits ---------------------------------------------------------------
    BaseEditorSimpleWorker._diffLimit = 100000;
    // ---- BEGIN suggest --------------------------------------------------------------------------
    BaseEditorSimpleWorker._suggestionsLimit = 10000;
    return BaseEditorSimpleWorker;
}());

/**
 * @internal
 */
var editorSimpleWorker_EditorSimpleWorkerImpl = /** @class */ (function (_super) {
    editorSimpleWorker_extends(EditorSimpleWorkerImpl, _super);
    function EditorSimpleWorkerImpl(foreignModuleFactory) {
        var _this = _super.call(this, foreignModuleFactory) || this;
        _this._models = Object.create(null);
        return _this;
    }
    EditorSimpleWorkerImpl.prototype.dispose = function () {
        this._models = Object.create(null);
    };
    EditorSimpleWorkerImpl.prototype._getModel = function (uri) {
        return this._models[uri];
    };
    EditorSimpleWorkerImpl.prototype._getModels = function () {
        var _this = this;
        var all = [];
        Object.keys(this._models).forEach(function (key) { return all.push(_this._models[key]); });
        return all;
    };
    EditorSimpleWorkerImpl.prototype.acceptNewModel = function (data) {
        this._models[data.url] = new editorSimpleWorker_MirrorModel(uri_URI.parse(data.url), data.lines, data.EOL, data.versionId);
    };
    EditorSimpleWorkerImpl.prototype.acceptModelChanged = function (strURL, e) {
        if (!this._models[strURL]) {
            return;
        }
        var model = this._models[strURL];
        model.onEvents(e);
    };
    EditorSimpleWorkerImpl.prototype.acceptRemovedModel = function (strURL) {
        if (!this._models[strURL]) {
            return;
        }
        delete this._models[strURL];
    };
    return EditorSimpleWorkerImpl;
}(editorSimpleWorker_BaseEditorSimpleWorker));

/**
 * Called on the worker side
 * @internal
 */
function editorSimpleWorker_create() {
    return new editorSimpleWorker_EditorSimpleWorkerImpl(null);
}
if (typeof importScripts === 'function') {
    // Running in a web worker
    globals.monaco = createMonacoBaseAPI();
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/editor/editor.worker.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var initialized = false;
function initialize(foreignModule) {
    if (initialized) {
        return;
    }
    initialized = true;
    var editorWorker = new editorSimpleWorker_EditorSimpleWorkerImpl(foreignModule);
    var simpleWorker = new simpleWorker_SimpleWorkerServer(function (msg) {
        self.postMessage(msg);
    }, editorWorker);
    self.onmessage = function (e) {
        simpleWorker.onmessage(e.data);
    };
}
self.onmessage = function (e) {
    // Ignore first message in this case and initialize if not yet initialized
    if (!initialized) {
        initialize(null);
    }
};

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/fillers/vscode-nls.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function vscode_nls_format(message, args) {
    var result;
    if (args.length === 0) {
        result = message;
    }
    else {
        result = message.replace(/\{(\d+)\}/g, function (match, rest) {
            var index = rest[0];
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }
    return result;
}
function localize(key, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return vscode_nls_format(message, args);
}
function loadMessageBundle(file) {
    return localize;
}
function config(opt) {
    return loadMessageBundle;
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/htmlLanguageTypes.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// #region Proposed types, remove once added to vscode-languageserver-types
/**
 * Enum of known selection range kinds
 */
var SelectionRangeKind;
(function (SelectionRangeKind) {
    /**
     * Empty Kind.
     */
    SelectionRangeKind["Empty"] = "";
    /**
     * The statment kind, its value is `statement`, possible extensions can be
     * `statement.if` etc
     */
    SelectionRangeKind["Statement"] = "statement";
    /**
     * The declaration kind, its value is `declaration`, possible extensions can be
     * `declaration.function`, `declaration.class` etc.
     */
    SelectionRangeKind["Declaration"] = "declaration";
})(SelectionRangeKind || (SelectionRangeKind = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["StartCommentTag"] = 0] = "StartCommentTag";
    TokenType[TokenType["Comment"] = 1] = "Comment";
    TokenType[TokenType["EndCommentTag"] = 2] = "EndCommentTag";
    TokenType[TokenType["StartTagOpen"] = 3] = "StartTagOpen";
    TokenType[TokenType["StartTagClose"] = 4] = "StartTagClose";
    TokenType[TokenType["StartTagSelfClose"] = 5] = "StartTagSelfClose";
    TokenType[TokenType["StartTag"] = 6] = "StartTag";
    TokenType[TokenType["EndTagOpen"] = 7] = "EndTagOpen";
    TokenType[TokenType["EndTagClose"] = 8] = "EndTagClose";
    TokenType[TokenType["EndTag"] = 9] = "EndTag";
    TokenType[TokenType["DelimiterAssign"] = 10] = "DelimiterAssign";
    TokenType[TokenType["AttributeName"] = 11] = "AttributeName";
    TokenType[TokenType["AttributeValue"] = 12] = "AttributeValue";
    TokenType[TokenType["StartDoctypeTag"] = 13] = "StartDoctypeTag";
    TokenType[TokenType["Doctype"] = 14] = "Doctype";
    TokenType[TokenType["EndDoctypeTag"] = 15] = "EndDoctypeTag";
    TokenType[TokenType["Content"] = 16] = "Content";
    TokenType[TokenType["Whitespace"] = 17] = "Whitespace";
    TokenType[TokenType["Unknown"] = 18] = "Unknown";
    TokenType[TokenType["Script"] = 19] = "Script";
    TokenType[TokenType["Styles"] = 20] = "Styles";
    TokenType[TokenType["EOS"] = 21] = "EOS";
})(TokenType || (TokenType = {}));
var ScannerState;
(function (ScannerState) {
    ScannerState[ScannerState["WithinContent"] = 0] = "WithinContent";
    ScannerState[ScannerState["AfterOpeningStartTag"] = 1] = "AfterOpeningStartTag";
    ScannerState[ScannerState["AfterOpeningEndTag"] = 2] = "AfterOpeningEndTag";
    ScannerState[ScannerState["WithinDoctype"] = 3] = "WithinDoctype";
    ScannerState[ScannerState["WithinTag"] = 4] = "WithinTag";
    ScannerState[ScannerState["WithinEndTag"] = 5] = "WithinEndTag";
    ScannerState[ScannerState["WithinComment"] = 6] = "WithinComment";
    ScannerState[ScannerState["WithinScriptContent"] = 7] = "WithinScriptContent";
    ScannerState[ScannerState["WithinStyleContent"] = 8] = "WithinStyleContent";
    ScannerState[ScannerState["AfterAttributeName"] = 9] = "AfterAttributeName";
    ScannerState[ScannerState["BeforeAttributeValue"] = 10] = "BeforeAttributeValue";
})(ScannerState || (ScannerState = {}));
//# sourceMappingURL=htmlLanguageTypes.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/parser/htmlScanner.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var htmlScanner_localize = loadMessageBundle();
var MultiLineStream = /** @class */ (function () {
    function MultiLineStream(source, position) {
        this.source = source;
        this.len = source.length;
        this.position = position;
    }
    MultiLineStream.prototype.eos = function () {
        return this.len <= this.position;
    };
    MultiLineStream.prototype.getSource = function () {
        return this.source;
    };
    MultiLineStream.prototype.pos = function () {
        return this.position;
    };
    MultiLineStream.prototype.goBackTo = function (pos) {
        this.position = pos;
    };
    MultiLineStream.prototype.goBack = function (n) {
        this.position -= n;
    };
    MultiLineStream.prototype.advance = function (n) {
        this.position += n;
    };
    MultiLineStream.prototype.goToEnd = function () {
        this.position = this.source.length;
    };
    MultiLineStream.prototype.nextChar = function () {
        return this.source.charCodeAt(this.position++) || 0;
    };
    MultiLineStream.prototype.peekChar = function (n) {
        if (n === void 0) { n = 0; }
        return this.source.charCodeAt(this.position + n) || 0;
    };
    MultiLineStream.prototype.advanceIfChar = function (ch) {
        if (ch === this.source.charCodeAt(this.position)) {
            this.position++;
            return true;
        }
        return false;
    };
    MultiLineStream.prototype.advanceIfChars = function (ch) {
        var i;
        if (this.position + ch.length > this.source.length) {
            return false;
        }
        for (i = 0; i < ch.length; i++) {
            if (this.source.charCodeAt(this.position + i) !== ch[i]) {
                return false;
            }
        }
        this.advance(i);
        return true;
    };
    MultiLineStream.prototype.advanceIfRegExp = function (regex) {
        var str = this.source.substr(this.position);
        var match = str.match(regex);
        if (match) {
            this.position = this.position + match.index + match[0].length;
            return match[0];
        }
        return '';
    };
    MultiLineStream.prototype.advanceUntilRegExp = function (regex) {
        var str = this.source.substr(this.position);
        var match = str.match(regex);
        if (match) {
            this.position = this.position + match.index;
            return match[0];
        }
        else {
            this.goToEnd();
        }
        return '';
    };
    MultiLineStream.prototype.advanceUntilChar = function (ch) {
        while (this.position < this.source.length) {
            if (this.source.charCodeAt(this.position) === ch) {
                return true;
            }
            this.advance(1);
        }
        return false;
    };
    MultiLineStream.prototype.advanceUntilChars = function (ch) {
        while (this.position + ch.length <= this.source.length) {
            var i = 0;
            for (; i < ch.length && this.source.charCodeAt(this.position + i) === ch[i]; i++) {
            }
            if (i === ch.length) {
                return true;
            }
            this.advance(1);
        }
        this.goToEnd();
        return false;
    };
    MultiLineStream.prototype.skipWhitespace = function () {
        var n = this.advanceWhileChar(function (ch) {
            return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;
        });
        return n > 0;
    };
    MultiLineStream.prototype.advanceWhileChar = function (condition) {
        var posNow = this.position;
        while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
            this.position++;
        }
        return this.position - posNow;
    };
    return MultiLineStream;
}());
var _BNG = '!'.charCodeAt(0);
var _MIN = '-'.charCodeAt(0);
var _LAN = '<'.charCodeAt(0);
var _RAN = '>'.charCodeAt(0);
var _FSL = '/'.charCodeAt(0);
var _EQS = '='.charCodeAt(0);
var _DQO = '"'.charCodeAt(0);
var _SQO = '\''.charCodeAt(0);
var _NWL = '\n'.charCodeAt(0);
var _CAR = '\r'.charCodeAt(0);
var _LFD = '\f'.charCodeAt(0);
var _WSP = ' '.charCodeAt(0);
var _TAB = '\t'.charCodeAt(0);
var htmlScriptContents = {
    'text/x-handlebars-template': true
};
function createScanner(input, initialOffset, initialState) {
    if (initialOffset === void 0) { initialOffset = 0; }
    if (initialState === void 0) { initialState = ScannerState.WithinContent; }
    var stream = new MultiLineStream(input, initialOffset);
    var state = initialState;
    var tokenOffset = 0;
    var tokenType = TokenType.Unknown;
    var tokenError;
    var hasSpaceAfterTag;
    var lastTag;
    var lastAttributeName;
    var lastTypeValue;
    function nextElementName() {
        return stream.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/).toLowerCase();
    }
    function nextAttributeName() {
        return stream.advanceIfRegExp(/^[^\s"'>/=\x00-\x0F\x7F\x80-\x9F]*/).toLowerCase();
    }
    function finishToken(offset, type, errorMessage) {
        tokenType = type;
        tokenOffset = offset;
        tokenError = errorMessage;
        return type;
    }
    function scan() {
        var offset = stream.pos();
        var oldState = state;
        var token = internalScan();
        if (token !== TokenType.EOS && offset === stream.pos()) {
            console.log('Scanner.scan has not advanced at offset ' + offset + ', state before: ' + oldState + ' after: ' + state);
            stream.advance(1);
            return finishToken(offset, TokenType.Unknown);
        }
        return token;
    }
    function internalScan() {
        var offset = stream.pos();
        if (stream.eos()) {
            return finishToken(offset, TokenType.EOS);
        }
        var errorMessage;
        switch (state) {
            case ScannerState.WithinComment:
                if (stream.advanceIfChars([_MIN, _MIN, _RAN])) { // -->
                    state = ScannerState.WithinContent;
                    return finishToken(offset, TokenType.EndCommentTag);
                }
                stream.advanceUntilChars([_MIN, _MIN, _RAN]); // -->
                return finishToken(offset, TokenType.Comment);
            case ScannerState.WithinDoctype:
                if (stream.advanceIfChar(_RAN)) {
                    state = ScannerState.WithinContent;
                    return finishToken(offset, TokenType.EndDoctypeTag);
                }
                stream.advanceUntilChar(_RAN); // >
                return finishToken(offset, TokenType.Doctype);
            case ScannerState.WithinContent:
                if (stream.advanceIfChar(_LAN)) { // <
                    if (!stream.eos() && stream.peekChar() === _BNG) { // !
                        if (stream.advanceIfChars([_BNG, _MIN, _MIN])) { // <!--
                            state = ScannerState.WithinComment;
                            return finishToken(offset, TokenType.StartCommentTag);
                        }
                        if (stream.advanceIfRegExp(/^!doctype/i)) {
                            state = ScannerState.WithinDoctype;
                            return finishToken(offset, TokenType.StartDoctypeTag);
                        }
                    }
                    if (stream.advanceIfChar(_FSL)) { // /
                        state = ScannerState.AfterOpeningEndTag;
                        return finishToken(offset, TokenType.EndTagOpen);
                    }
                    state = ScannerState.AfterOpeningStartTag;
                    return finishToken(offset, TokenType.StartTagOpen);
                }
                stream.advanceUntilChar(_LAN);
                return finishToken(offset, TokenType.Content);
            case ScannerState.AfterOpeningEndTag:
                var tagName = nextElementName();
                if (tagName.length > 0) {
                    state = ScannerState.WithinEndTag;
                    return finishToken(offset, TokenType.EndTag);
                }
                if (stream.skipWhitespace()) { // white space is not valid here
                    return finishToken(offset, TokenType.Whitespace, htmlScanner_localize('error.unexpectedWhitespace', 'Tag name must directly follow the open bracket.'));
                }
                state = ScannerState.WithinEndTag;
                stream.advanceUntilChar(_RAN);
                if (offset < stream.pos()) {
                    return finishToken(offset, TokenType.Unknown, htmlScanner_localize('error.endTagNameExpected', 'End tag name expected.'));
                }
                return internalScan();
            case ScannerState.WithinEndTag:
                if (stream.skipWhitespace()) { // white space is valid here
                    return finishToken(offset, TokenType.Whitespace);
                }
                if (stream.advanceIfChar(_RAN)) { // >
                    state = ScannerState.WithinContent;
                    return finishToken(offset, TokenType.EndTagClose);
                }
                errorMessage = htmlScanner_localize('error.tagNameExpected', 'Closing bracket expected.');
                break;
            case ScannerState.AfterOpeningStartTag:
                lastTag = nextElementName();
                lastTypeValue = void 0;
                lastAttributeName = void 0;
                if (lastTag.length > 0) {
                    hasSpaceAfterTag = false;
                    state = ScannerState.WithinTag;
                    return finishToken(offset, TokenType.StartTag);
                }
                if (stream.skipWhitespace()) { // white space is not valid here
                    return finishToken(offset, TokenType.Whitespace, htmlScanner_localize('error.unexpectedWhitespace', 'Tag name must directly follow the open bracket.'));
                }
                state = ScannerState.WithinTag;
                stream.advanceUntilChar(_RAN);
                if (offset < stream.pos()) {
                    return finishToken(offset, TokenType.Unknown, htmlScanner_localize('error.startTagNameExpected', 'Start tag name expected.'));
                }
                return internalScan();
            case ScannerState.WithinTag:
                if (stream.skipWhitespace()) {
                    hasSpaceAfterTag = true; // remember that we have seen a whitespace
                    return finishToken(offset, TokenType.Whitespace);
                }
                if (hasSpaceAfterTag) {
                    lastAttributeName = nextAttributeName();
                    if (lastAttributeName.length > 0) {
                        state = ScannerState.AfterAttributeName;
                        hasSpaceAfterTag = false;
                        return finishToken(offset, TokenType.AttributeName);
                    }
                }
                if (stream.advanceIfChars([_FSL, _RAN])) { // />
                    state = ScannerState.WithinContent;
                    return finishToken(offset, TokenType.StartTagSelfClose);
                }
                if (stream.advanceIfChar(_RAN)) { // >
                    if (lastTag === 'script') {
                        if (lastTypeValue && htmlScriptContents[lastTypeValue]) {
                            // stay in html
                            state = ScannerState.WithinContent;
                        }
                        else {
                            state = ScannerState.WithinScriptContent;
                        }
                    }
                    else if (lastTag === 'style') {
                        state = ScannerState.WithinStyleContent;
                    }
                    else {
                        state = ScannerState.WithinContent;
                    }
                    return finishToken(offset, TokenType.StartTagClose);
                }
                stream.advance(1);
                return finishToken(offset, TokenType.Unknown, htmlScanner_localize('error.unexpectedCharacterInTag', 'Unexpected character in tag.'));
            case ScannerState.AfterAttributeName:
                if (stream.skipWhitespace()) {
                    hasSpaceAfterTag = true;
                    return finishToken(offset, TokenType.Whitespace);
                }
                if (stream.advanceIfChar(_EQS)) {
                    state = ScannerState.BeforeAttributeValue;
                    return finishToken(offset, TokenType.DelimiterAssign);
                }
                state = ScannerState.WithinTag;
                return internalScan(); // no advance yet - jump to WithinTag
            case ScannerState.BeforeAttributeValue:
                if (stream.skipWhitespace()) {
                    return finishToken(offset, TokenType.Whitespace);
                }
                var attributeValue = stream.advanceIfRegExp(/^[^\s"'`=<>\/]+/);
                if (attributeValue.length > 0) {
                    if (lastAttributeName === 'type') {
                        lastTypeValue = attributeValue;
                    }
                    state = ScannerState.WithinTag;
                    hasSpaceAfterTag = false;
                    return finishToken(offset, TokenType.AttributeValue);
                }
                var ch = stream.peekChar();
                if (ch === _SQO || ch === _DQO) {
                    stream.advance(1); // consume quote
                    if (stream.advanceUntilChar(ch)) {
                        stream.advance(1); // consume quote
                    }
                    if (lastAttributeName === 'type') {
                        lastTypeValue = stream.getSource().substring(offset + 1, stream.pos() - 1);
                    }
                    state = ScannerState.WithinTag;
                    hasSpaceAfterTag = false;
                    return finishToken(offset, TokenType.AttributeValue);
                }
                state = ScannerState.WithinTag;
                hasSpaceAfterTag = false;
                return internalScan(); // no advance yet - jump to WithinTag
            case ScannerState.WithinScriptContent:
                // see http://stackoverflow.com/questions/14574471/how-do-browsers-parse-a-script-tag-exactly
                var sciptState = 1;
                while (!stream.eos()) {
                    var match = stream.advanceIfRegExp(/<!--|-->|<\/?script\s*\/?>?/i);
                    if (match.length === 0) {
                        stream.goToEnd();
                        return finishToken(offset, TokenType.Script);
                    }
                    else if (match === '<!--') {
                        if (sciptState === 1) {
                            sciptState = 2;
                        }
                    }
                    else if (match === '-->') {
                        sciptState = 1;
                    }
                    else if (match[1] !== '/') { // <script
                        if (sciptState === 2) {
                            sciptState = 3;
                        }
                    }
                    else { // </script
                        if (sciptState === 3) {
                            sciptState = 2;
                        }
                        else {
                            stream.goBack(match.length); // to the beginning of the closing tag
                            break;
                        }
                    }
                }
                state = ScannerState.WithinContent;
                if (offset < stream.pos()) {
                    return finishToken(offset, TokenType.Script);
                }
                return internalScan(); // no advance yet - jump to content
            case ScannerState.WithinStyleContent:
                stream.advanceUntilRegExp(/<\/style/i);
                state = ScannerState.WithinContent;
                if (offset < stream.pos()) {
                    return finishToken(offset, TokenType.Styles);
                }
                return internalScan(); // no advance yet - jump to content
        }
        stream.advance(1);
        state = ScannerState.WithinContent;
        return finishToken(offset, TokenType.Unknown, errorMessage);
    }
    return {
        scan: scan,
        getTokenType: function () { return tokenType; },
        getTokenOffset: function () { return tokenOffset; },
        getTokenLength: function () { return stream.pos() - tokenOffset; },
        getTokenEnd: function () { return stream.pos(); },
        getTokenText: function () { return stream.getSource().substring(tokenOffset, stream.pos()); },
        getScannerState: function () { return state; },
        getTokenError: function () { return tokenError; }
    };
}
//# sourceMappingURL=htmlScanner.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/utils/arrays.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
function findFirst(array, p) {
    var low = 0, high = array.length;
    if (high === 0) {
        return 0; // no children
    }
    while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (p(array[mid])) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    return low;
}
function arrays_binarySearch(array, key, comparator) {
    var low = 0, high = array.length - 1;
    while (low <= high) {
        var mid = ((low + high) / 2) | 0;
        var comp = comparator(array[mid], key);
        if (comp < 0) {
            low = mid + 1;
        }
        else if (comp > 0) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }
    return -(low + 1);
}
//# sourceMappingURL=arrays.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/fact.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// As defined in https://www.w3.org/TR/html5/syntax.html#void-elements
var VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
function isVoidElement(e) {
    return !!e && arrays_binarySearch(VOID_ELEMENTS, e.toLowerCase(), function (s1, s2) { return s1.localeCompare(s2); }) >= 0;
}
//# sourceMappingURL=fact.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/parser/htmlParser.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/




var htmlParser_Node = /** @class */ (function () {
    function Node(start, end, children, parent) {
        this.start = start;
        this.end = end;
        this.children = children;
        this.parent = parent;
        this.closed = false;
    }
    Object.defineProperty(Node.prototype, "attributeNames", {
        get: function () { return this.attributes ? Object.keys(this.attributes) : []; },
        enumerable: true,
        configurable: true
    });
    Node.prototype.isSameTag = function (tagInLowerCase) {
        return this.tag && tagInLowerCase && this.tag.length === tagInLowerCase.length && this.tag.toLowerCase() === tagInLowerCase;
    };
    Object.defineProperty(Node.prototype, "firstChild", {
        get: function () { return this.children[0]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "lastChild", {
        get: function () { return this.children.length ? this.children[this.children.length - 1] : void 0; },
        enumerable: true,
        configurable: true
    });
    Node.prototype.findNodeBefore = function (offset) {
        var idx = findFirst(this.children, function (c) { return offset <= c.start; }) - 1;
        if (idx >= 0) {
            var child = this.children[idx];
            if (offset > child.start) {
                if (offset < child.end) {
                    return child.findNodeBefore(offset);
                }
                var lastChild = child.lastChild;
                if (lastChild && lastChild.end === child.end) {
                    return child.findNodeBefore(offset);
                }
                return child;
            }
        }
        return this;
    };
    Node.prototype.findNodeAt = function (offset) {
        var idx = findFirst(this.children, function (c) { return offset <= c.start; }) - 1;
        if (idx >= 0) {
            var child = this.children[idx];
            if (offset > child.start && offset <= child.end) {
                return child.findNodeAt(offset);
            }
        }
        return this;
    };
    return Node;
}());

function parse(text) {
    var scanner = createScanner(text);
    var htmlDocument = new htmlParser_Node(0, text.length, [], void 0);
    var curr = htmlDocument;
    var endTagStart = -1;
    var endTagName = null;
    var pendingAttribute = null;
    var token = scanner.scan();
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.StartTagOpen:
                var child = new htmlParser_Node(scanner.getTokenOffset(), text.length, [], curr);
                curr.children.push(child);
                curr = child;
                break;
            case TokenType.StartTag:
                curr.tag = scanner.getTokenText();
                break;
            case TokenType.StartTagClose:
                curr.end = scanner.getTokenEnd(); // might be later set to end tag position
                curr.startTagEnd = scanner.getTokenEnd();
                if (curr.tag && isVoidElement(curr.tag) && curr.parent) {
                    curr.closed = true;
                    curr = curr.parent;
                }
                break;
            case TokenType.StartTagSelfClose:
                if (curr.parent) {
                    curr.closed = true;
                    curr.end = scanner.getTokenEnd();
                    curr.startTagEnd = scanner.getTokenEnd();
                    curr = curr.parent;
                }
                break;
            case TokenType.EndTagOpen:
                endTagStart = scanner.getTokenOffset();
                endTagName = null;
                break;
            case TokenType.EndTag:
                endTagName = scanner.getTokenText().toLowerCase();
                break;
            case TokenType.EndTagClose:
                if (endTagName) {
                    var node = curr;
                    // see if we can find a matching tag
                    while (!node.isSameTag(endTagName) && node.parent) {
                        node = node.parent;
                    }
                    if (node.parent) {
                        while (curr !== node) {
                            curr.end = endTagStart;
                            curr.closed = false;
                            curr = curr.parent;
                        }
                        curr.closed = true;
                        curr.endTagStart = endTagStart;
                        curr.end = scanner.getTokenEnd();
                        curr = curr.parent;
                    }
                }
                break;
            case TokenType.AttributeName: {
                pendingAttribute = scanner.getTokenText();
                var attributes = curr.attributes;
                if (!attributes) {
                    curr.attributes = attributes = {};
                }
                attributes[pendingAttribute] = null; // Support valueless attributes such as 'checked'
                break;
            }
            case TokenType.AttributeValue: {
                var value = scanner.getTokenText();
                var attributes = curr.attributes;
                if (attributes && pendingAttribute) {
                    attributes[pendingAttribute] = value;
                    pendingAttribute = null;
                }
                break;
            }
        }
        token = scanner.scan();
    }
    while (curr.parent) {
        curr.end = text.length;
        curr.closed = false;
        curr = curr.parent;
    }
    return {
        roots: htmlDocument.children,
        findNodeBefore: htmlDocument.findNodeBefore.bind(htmlDocument),
        findNodeAt: htmlDocument.findNodeAt.bind(htmlDocument)
    };
}
//# sourceMappingURL=htmlParser.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-languageserver-types/main.js
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

/**
 * The Position namespace provides helper functions to work with
 * [Position](#Position) literals.
 */
var main_Position;
(function (Position) {
    /**
     * Creates a new Position literal from the given line and character.
     * @param line The position's line.
     * @param character The position's character.
     */
    function create(line, character) {
        return { line: line, character: character };
    }
    Position.create = create;
    /**
     * Checks whether the given liternal conforms to the [Position](#Position) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.number(candidate.line) && Is.number(candidate.character);
    }
    Position.is = is;
})(main_Position || (main_Position = {}));
/**
 * The Range namespace provides helper functions to work with
 * [Range](#Range) literals.
 */
var main_Range;
(function (Range) {
    function create(one, two, three, four) {
        if (Is.number(one) && Is.number(two) && Is.number(three) && Is.number(four)) {
            return { start: main_Position.create(one, two), end: main_Position.create(three, four) };
        }
        else if (main_Position.is(one) && main_Position.is(two)) {
            return { start: one, end: two };
        }
        else {
            throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
        }
    }
    Range.create = create;
    /**
     * Checks whether the given literal conforms to the [Range](#Range) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && main_Position.is(candidate.start) && main_Position.is(candidate.end);
    }
    Range.is = is;
})(main_Range || (main_Range = {}));
/**
 * The Location namespace provides helper functions to work with
 * [Location](#Location) literals.
 */
var Location;
(function (Location) {
    /**
     * Creates a Location literal.
     * @param uri The location's uri.
     * @param range The location's range.
     */
    function create(uri, range) {
        return { uri: uri, range: range };
    }
    Location.create = create;
    /**
     * Checks whether the given literal conforms to the [Location](#Location) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && main_Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
    }
    Location.is = is;
})(Location || (Location = {}));
/**
 * The LocationLink namespace provides helper functions to work with
 * [LocationLink](#LocationLink) literals.
 */
var LocationLink;
(function (LocationLink) {
    /**
     * Creates a LocationLink literal.
     * @param targetUri The definition's uri.
     * @param targetRange The full range of the definition.
     * @param targetSelectionRange The span of the symbol definition at the target.
     * @param originSelectionRange The span of the symbol being defined in the originating source file.
     */
    function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
        return { targetUri: targetUri, targetRange: targetRange, targetSelectionRange: targetSelectionRange, originSelectionRange: originSelectionRange };
    }
    LocationLink.create = create;
    /**
     * Checks whether the given literal conforms to the [LocationLink](#LocationLink) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && main_Range.is(candidate.targetRange) && Is.string(candidate.targetUri)
            && (main_Range.is(candidate.targetSelectionRange) || Is.undefined(candidate.targetSelectionRange))
            && (main_Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
    }
    LocationLink.is = is;
})(LocationLink || (LocationLink = {}));
/**
 * The Color namespace provides helper functions to work with
 * [Color](#Color) literals.
 */
var Color;
(function (Color) {
    /**
     * Creates a new Color literal.
     */
    function create(red, green, blue, alpha) {
        return {
            red: red,
            green: green,
            blue: blue,
            alpha: alpha,
        };
    }
    Color.create = create;
    /**
     * Checks whether the given literal conforms to the [Color](#Color) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.number(candidate.red)
            && Is.number(candidate.green)
            && Is.number(candidate.blue)
            && Is.number(candidate.alpha);
    }
    Color.is = is;
})(Color || (Color = {}));
/**
 * The ColorInformation namespace provides helper functions to work with
 * [ColorInformation](#ColorInformation) literals.
 */
var ColorInformation;
(function (ColorInformation) {
    /**
     * Creates a new ColorInformation literal.
     */
    function create(range, color) {
        return {
            range: range,
            color: color,
        };
    }
    ColorInformation.create = create;
    /**
     * Checks whether the given literal conforms to the [ColorInformation](#ColorInformation) interface.
     */
    function is(value) {
        var candidate = value;
        return main_Range.is(candidate.range) && Color.is(candidate.color);
    }
    ColorInformation.is = is;
})(ColorInformation || (ColorInformation = {}));
/**
 * The Color namespace provides helper functions to work with
 * [ColorPresentation](#ColorPresentation) literals.
 */
var ColorPresentation;
(function (ColorPresentation) {
    /**
     * Creates a new ColorInformation literal.
     */
    function create(label, textEdit, additionalTextEdits) {
        return {
            label: label,
            textEdit: textEdit,
            additionalTextEdits: additionalTextEdits,
        };
    }
    ColorPresentation.create = create;
    /**
     * Checks whether the given literal conforms to the [ColorInformation](#ColorInformation) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.string(candidate.label)
            && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate))
            && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
    }
    ColorPresentation.is = is;
})(ColorPresentation || (ColorPresentation = {}));
/**
 * Enum of known range kinds
 */
var FoldingRangeKind;
(function (FoldingRangeKind) {
    /**
     * Folding range for a comment
     */
    FoldingRangeKind["Comment"] = "comment";
    /**
     * Folding range for a imports or includes
     */
    FoldingRangeKind["Imports"] = "imports";
    /**
     * Folding range for a region (e.g. `#region`)
     */
    FoldingRangeKind["Region"] = "region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
/**
 * The folding range namespace provides helper functions to work with
 * [FoldingRange](#FoldingRange) literals.
 */
var FoldingRange;
(function (FoldingRange) {
    /**
     * Creates a new FoldingRange literal.
     */
    function create(startLine, endLine, startCharacter, endCharacter, kind) {
        var result = {
            startLine: startLine,
            endLine: endLine
        };
        if (Is.defined(startCharacter)) {
            result.startCharacter = startCharacter;
        }
        if (Is.defined(endCharacter)) {
            result.endCharacter = endCharacter;
        }
        if (Is.defined(kind)) {
            result.kind = kind;
        }
        return result;
    }
    FoldingRange.create = create;
    /**
     * Checks whether the given literal conforms to the [FoldingRange](#FoldingRange) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.number(candidate.startLine) && Is.number(candidate.startLine)
            && (Is.undefined(candidate.startCharacter) || Is.number(candidate.startCharacter))
            && (Is.undefined(candidate.endCharacter) || Is.number(candidate.endCharacter))
            && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
    }
    FoldingRange.is = is;
})(FoldingRange || (FoldingRange = {}));
/**
 * The DiagnosticRelatedInformation namespace provides helper functions to work with
 * [DiagnosticRelatedInformation](#DiagnosticRelatedInformation) literals.
 */
var DiagnosticRelatedInformation;
(function (DiagnosticRelatedInformation) {
    /**
     * Creates a new DiagnosticRelatedInformation literal.
     */
    function create(location, message) {
        return {
            location: location,
            message: message
        };
    }
    DiagnosticRelatedInformation.create = create;
    /**
     * Checks whether the given literal conforms to the [DiagnosticRelatedInformation](#DiagnosticRelatedInformation) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
    }
    DiagnosticRelatedInformation.is = is;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
/**
 * The diagnostic's severity.
 */
var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    /**
     * Reports an error.
     */
    DiagnosticSeverity.Error = 1;
    /**
     * Reports a warning.
     */
    DiagnosticSeverity.Warning = 2;
    /**
     * Reports an information.
     */
    DiagnosticSeverity.Information = 3;
    /**
     * Reports a hint.
     */
    DiagnosticSeverity.Hint = 4;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
/**
 * The Diagnostic namespace provides helper functions to work with
 * [Diagnostic](#Diagnostic) literals.
 */
var Diagnostic;
(function (Diagnostic) {
    /**
     * Creates a new Diagnostic literal.
     */
    function create(range, message, severity, code, source, relatedInformation) {
        var result = { range: range, message: message };
        if (Is.defined(severity)) {
            result.severity = severity;
        }
        if (Is.defined(code)) {
            result.code = code;
        }
        if (Is.defined(source)) {
            result.source = source;
        }
        if (Is.defined(relatedInformation)) {
            result.relatedInformation = relatedInformation;
        }
        return result;
    }
    Diagnostic.create = create;
    /**
     * Checks whether the given literal conforms to the [Diagnostic](#Diagnostic) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate)
            && main_Range.is(candidate.range)
            && Is.string(candidate.message)
            && (Is.number(candidate.severity) || Is.undefined(candidate.severity))
            && (Is.number(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code))
            && (Is.string(candidate.source) || Is.undefined(candidate.source))
            && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
    }
    Diagnostic.is = is;
})(Diagnostic || (Diagnostic = {}));
/**
 * The Command namespace provides helper functions to work with
 * [Command](#Command) literals.
 */
var Command;
(function (Command) {
    /**
     * Creates a new Command literal.
     */
    function create(title, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var result = { title: title, command: command };
        if (Is.defined(args) && args.length > 0) {
            result.arguments = args;
        }
        return result;
    }
    Command.create = create;
    /**
     * Checks whether the given literal conforms to the [Command](#Command) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
    }
    Command.is = is;
})(Command || (Command = {}));
/**
 * The TextEdit namespace provides helper function to create replace,
 * insert and delete edits more easily.
 */
var TextEdit;
(function (TextEdit) {
    /**
     * Creates a replace text edit.
     * @param range The range of text to be replaced.
     * @param newText The new text.
     */
    function replace(range, newText) {
        return { range: range, newText: newText };
    }
    TextEdit.replace = replace;
    /**
     * Creates a insert text edit.
     * @param position The position to insert the text at.
     * @param newText The text to be inserted.
     */
    function insert(position, newText) {
        return { range: { start: position, end: position }, newText: newText };
    }
    TextEdit.insert = insert;
    /**
     * Creates a delete text edit.
     * @param range The range of text to be deleted.
     */
    function del(range) {
        return { range: range, newText: '' };
    }
    TextEdit.del = del;
    function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate)
            && Is.string(candidate.newText)
            && main_Range.is(candidate.range);
    }
    TextEdit.is = is;
})(TextEdit || (TextEdit = {}));
/**
 * The TextDocumentEdit namespace provides helper function to create
 * an edit that manipulates a text document.
 */
var TextDocumentEdit;
(function (TextDocumentEdit) {
    /**
     * Creates a new `TextDocumentEdit`
     */
    function create(textDocument, edits) {
        return { textDocument: textDocument, edits: edits };
    }
    TextDocumentEdit.create = create;
    function is(value) {
        var candidate = value;
        return Is.defined(candidate)
            && VersionedTextDocumentIdentifier.is(candidate.textDocument)
            && Array.isArray(candidate.edits);
    }
    TextDocumentEdit.is = is;
})(TextDocumentEdit || (TextDocumentEdit = {}));
var CreateFile;
(function (CreateFile) {
    function create(uri, options) {
        var result = {
            kind: 'create',
            uri: uri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
        }
        return result;
    }
    CreateFile.create = create;
    function is(value) {
        var candidate = value;
        return candidate && candidate.kind === 'create' && Is.string(candidate.uri) &&
            (candidate.options === void 0 ||
                ((candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))));
    }
    CreateFile.is = is;
})(CreateFile || (CreateFile = {}));
var RenameFile;
(function (RenameFile) {
    function create(oldUri, newUri, options) {
        var result = {
            kind: 'rename',
            oldUri: oldUri,
            newUri: newUri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
        }
        return result;
    }
    RenameFile.create = create;
    function is(value) {
        var candidate = value;
        return candidate && candidate.kind === 'rename' && Is.string(candidate.oldUri) && Is.string(candidate.newUri) &&
            (candidate.options === void 0 ||
                ((candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))));
    }
    RenameFile.is = is;
})(RenameFile || (RenameFile = {}));
var DeleteFile;
(function (DeleteFile) {
    function create(uri, options) {
        var result = {
            kind: 'delete',
            uri: uri
        };
        if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
            result.options = options;
        }
        return result;
    }
    DeleteFile.create = create;
    function is(value) {
        var candidate = value;
        return candidate && candidate.kind === 'delete' && Is.string(candidate.uri) &&
            (candidate.options === void 0 ||
                ((candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))));
    }
    DeleteFile.is = is;
})(DeleteFile || (DeleteFile = {}));
var WorkspaceEdit;
(function (WorkspaceEdit) {
    function is(value) {
        var candidate = value;
        return candidate &&
            (candidate.changes !== void 0 || candidate.documentChanges !== void 0) &&
            (candidate.documentChanges === void 0 || candidate.documentChanges.every(function (change) {
                if (Is.string(change.kind)) {
                    return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
                }
                else {
                    return TextDocumentEdit.is(change);
                }
            }));
    }
    WorkspaceEdit.is = is;
})(WorkspaceEdit || (WorkspaceEdit = {}));
var TextEditChangeImpl = /** @class */ (function () {
    function TextEditChangeImpl(edits) {
        this.edits = edits;
    }
    TextEditChangeImpl.prototype.insert = function (position, newText) {
        this.edits.push(TextEdit.insert(position, newText));
    };
    TextEditChangeImpl.prototype.replace = function (range, newText) {
        this.edits.push(TextEdit.replace(range, newText));
    };
    TextEditChangeImpl.prototype.delete = function (range) {
        this.edits.push(TextEdit.del(range));
    };
    TextEditChangeImpl.prototype.add = function (edit) {
        this.edits.push(edit);
    };
    TextEditChangeImpl.prototype.all = function () {
        return this.edits;
    };
    TextEditChangeImpl.prototype.clear = function () {
        this.edits.splice(0, this.edits.length);
    };
    return TextEditChangeImpl;
}());
/**
 * A workspace change helps constructing changes to a workspace.
 */
var WorkspaceChange = /** @class */ (function () {
    function WorkspaceChange(workspaceEdit) {
        var _this = this;
        this._textEditChanges = Object.create(null);
        if (workspaceEdit) {
            this._workspaceEdit = workspaceEdit;
            if (workspaceEdit.documentChanges) {
                workspaceEdit.documentChanges.forEach(function (change) {
                    if (TextDocumentEdit.is(change)) {
                        var textEditChange = new TextEditChangeImpl(change.edits);
                        _this._textEditChanges[change.textDocument.uri] = textEditChange;
                    }
                });
            }
            else if (workspaceEdit.changes) {
                Object.keys(workspaceEdit.changes).forEach(function (key) {
                    var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                    _this._textEditChanges[key] = textEditChange;
                });
            }
        }
    }
    Object.defineProperty(WorkspaceChange.prototype, "edit", {
        /**
         * Returns the underlying [WorkspaceEdit](#WorkspaceEdit) literal
         * use to be returned from a workspace edit operation like rename.
         */
        get: function () {
            return this._workspaceEdit;
        },
        enumerable: true,
        configurable: true
    });
    WorkspaceChange.prototype.getTextEditChange = function (key) {
        if (VersionedTextDocumentIdentifier.is(key)) {
            if (!this._workspaceEdit) {
                this._workspaceEdit = {
                    documentChanges: []
                };
            }
            if (!this._workspaceEdit.documentChanges) {
                throw new Error('Workspace edit is not configured for document changes.');
            }
            var textDocument = key;
            var result = this._textEditChanges[textDocument.uri];
            if (!result) {
                var edits = [];
                var textDocumentEdit = {
                    textDocument: textDocument,
                    edits: edits
                };
                this._workspaceEdit.documentChanges.push(textDocumentEdit);
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[textDocument.uri] = result;
            }
            return result;
        }
        else {
            if (!this._workspaceEdit) {
                this._workspaceEdit = {
                    changes: Object.create(null)
                };
            }
            if (!this._workspaceEdit.changes) {
                throw new Error('Workspace edit is not configured for normal text edit changes.');
            }
            var result = this._textEditChanges[key];
            if (!result) {
                var edits = [];
                this._workspaceEdit.changes[key] = edits;
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[key] = result;
            }
            return result;
        }
    };
    WorkspaceChange.prototype.createFile = function (uri, options) {
        this.checkDocumentChanges();
        this._workspaceEdit.documentChanges.push(CreateFile.create(uri, options));
    };
    WorkspaceChange.prototype.renameFile = function (oldUri, newUri, options) {
        this.checkDocumentChanges();
        this._workspaceEdit.documentChanges.push(RenameFile.create(oldUri, newUri, options));
    };
    WorkspaceChange.prototype.deleteFile = function (uri, options) {
        this.checkDocumentChanges();
        this._workspaceEdit.documentChanges.push(DeleteFile.create(uri, options));
    };
    WorkspaceChange.prototype.checkDocumentChanges = function () {
        if (!this._workspaceEdit || !this._workspaceEdit.documentChanges) {
            throw new Error('Workspace edit is not configured for document changes.');
        }
    };
    return WorkspaceChange;
}());

/**
 * The TextDocumentIdentifier namespace provides helper functions to work with
 * [TextDocumentIdentifier](#TextDocumentIdentifier) literals.
 */
var TextDocumentIdentifier;
(function (TextDocumentIdentifier) {
    /**
     * Creates a new TextDocumentIdentifier literal.
     * @param uri The document's uri.
     */
    function create(uri) {
        return { uri: uri };
    }
    TextDocumentIdentifier.create = create;
    /**
     * Checks whether the given literal conforms to the [TextDocumentIdentifier](#TextDocumentIdentifier) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri);
    }
    TextDocumentIdentifier.is = is;
})(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
/**
 * The VersionedTextDocumentIdentifier namespace provides helper functions to work with
 * [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) literals.
 */
var VersionedTextDocumentIdentifier;
(function (VersionedTextDocumentIdentifier) {
    /**
     * Creates a new VersionedTextDocumentIdentifier literal.
     * @param uri The document's uri.
     * @param uri The document's text.
     */
    function create(uri, version) {
        return { uri: uri, version: version };
    }
    VersionedTextDocumentIdentifier.create = create;
    /**
     * Checks whether the given literal conforms to the [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.number(candidate.version));
    }
    VersionedTextDocumentIdentifier.is = is;
})(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
/**
 * The TextDocumentItem namespace provides helper functions to work with
 * [TextDocumentItem](#TextDocumentItem) literals.
 */
var TextDocumentItem;
(function (TextDocumentItem) {
    /**
     * Creates a new TextDocumentItem literal.
     * @param uri The document's uri.
     * @param languageId The document's language identifier.
     * @param version The document's version number.
     * @param text The document's text.
     */
    function create(uri, languageId, version, text) {
        return { uri: uri, languageId: languageId, version: version, text: text };
    }
    TextDocumentItem.create = create;
    /**
     * Checks whether the given literal conforms to the [TextDocumentItem](#TextDocumentItem) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.number(candidate.version) && Is.string(candidate.text);
    }
    TextDocumentItem.is = is;
})(TextDocumentItem || (TextDocumentItem = {}));
/**
 * Describes the content type that a client supports in various
 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
 *
 * Please note that `MarkupKinds` must not start with a `$`. This kinds
 * are reserved for internal usage.
 */
var MarkupKind;
(function (MarkupKind) {
    /**
     * Plain text is supported as a content format
     */
    MarkupKind.PlainText = 'plaintext';
    /**
     * Markdown is supported as a content format
     */
    MarkupKind.Markdown = 'markdown';
})(MarkupKind || (MarkupKind = {}));
(function (MarkupKind) {
    /**
     * Checks whether the given value is a value of the [MarkupKind](#MarkupKind) type.
     */
    function is(value) {
        var candidate = value;
        return candidate === MarkupKind.PlainText || candidate === MarkupKind.Markdown;
    }
    MarkupKind.is = is;
})(MarkupKind || (MarkupKind = {}));
var MarkupContent;
(function (MarkupContent) {
    /**
     * Checks whether the given value conforms to the [MarkupContent](#MarkupContent) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
    }
    MarkupContent.is = is;
})(MarkupContent || (MarkupContent = {}));
/**
 * The kind of a completion entry.
 */
var main_CompletionItemKind;
(function (CompletionItemKind) {
    CompletionItemKind.Text = 1;
    CompletionItemKind.Method = 2;
    CompletionItemKind.Function = 3;
    CompletionItemKind.Constructor = 4;
    CompletionItemKind.Field = 5;
    CompletionItemKind.Variable = 6;
    CompletionItemKind.Class = 7;
    CompletionItemKind.Interface = 8;
    CompletionItemKind.Module = 9;
    CompletionItemKind.Property = 10;
    CompletionItemKind.Unit = 11;
    CompletionItemKind.Value = 12;
    CompletionItemKind.Enum = 13;
    CompletionItemKind.Keyword = 14;
    CompletionItemKind.Snippet = 15;
    CompletionItemKind.Color = 16;
    CompletionItemKind.File = 17;
    CompletionItemKind.Reference = 18;
    CompletionItemKind.Folder = 19;
    CompletionItemKind.EnumMember = 20;
    CompletionItemKind.Constant = 21;
    CompletionItemKind.Struct = 22;
    CompletionItemKind.Event = 23;
    CompletionItemKind.Operator = 24;
    CompletionItemKind.TypeParameter = 25;
})(main_CompletionItemKind || (main_CompletionItemKind = {}));
/**
 * Defines whether the insert text in a completion item should be interpreted as
 * plain text or a snippet.
 */
var InsertTextFormat;
(function (InsertTextFormat) {
    /**
     * The primary text to be inserted is treated as a plain string.
     */
    InsertTextFormat.PlainText = 1;
    /**
     * The primary text to be inserted is treated as a snippet.
     *
     * A snippet can define tab stops and placeholders with `$1`, `$2`
     * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
     * the end of the snippet. Placeholders with equal identifiers are linked,
     * that is typing in one will update others too.
     *
     * See also: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/snippet/common/snippet.md
     */
    InsertTextFormat.Snippet = 2;
})(InsertTextFormat || (InsertTextFormat = {}));
/**
 * The CompletionItem namespace provides functions to deal with
 * completion items.
 */
var CompletionItem;
(function (CompletionItem) {
    /**
     * Create a completion item and seed it with a label.
     * @param label The completion item's label
     */
    function create(label) {
        return { label: label };
    }
    CompletionItem.create = create;
})(CompletionItem || (CompletionItem = {}));
/**
 * The CompletionList namespace provides functions to deal with
 * completion lists.
 */
var CompletionList;
(function (CompletionList) {
    /**
     * Creates a new completion list.
     *
     * @param items The completion items.
     * @param isIncomplete The list is not complete.
     */
    function create(items, isIncomplete) {
        return { items: items ? items : [], isIncomplete: !!isIncomplete };
    }
    CompletionList.create = create;
})(CompletionList || (CompletionList = {}));
var MarkedString;
(function (MarkedString) {
    /**
     * Creates a marked string from plain text.
     *
     * @param plainText The plain text.
     */
    function fromPlainText(plainText) {
        return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&"); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
    }
    MarkedString.fromPlainText = fromPlainText;
    /**
     * Checks whether the given value conforms to the [MarkedString](#MarkedString) type.
     */
    function is(value) {
        var candidate = value;
        return Is.string(candidate) || (Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value));
    }
    MarkedString.is = is;
})(MarkedString || (MarkedString = {}));
var Hover;
(function (Hover) {
    /**
     * Checks whether the given value conforms to the [Hover](#Hover) interface.
     */
    function is(value) {
        var candidate = value;
        return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) ||
            MarkedString.is(candidate.contents) ||
            Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || main_Range.is(value.range));
    }
    Hover.is = is;
})(Hover || (Hover = {}));
/**
 * The ParameterInformation namespace provides helper functions to work with
 * [ParameterInformation](#ParameterInformation) literals.
 */
var ParameterInformation;
(function (ParameterInformation) {
    /**
     * Creates a new parameter information literal.
     *
     * @param label A label string.
     * @param documentation A doc string.
     */
    function create(label, documentation) {
        return documentation ? { label: label, documentation: documentation } : { label: label };
    }
    ParameterInformation.create = create;
    ;
})(ParameterInformation || (ParameterInformation = {}));
/**
 * The SignatureInformation namespace provides helper functions to work with
 * [SignatureInformation](#SignatureInformation) literals.
 */
var SignatureInformation;
(function (SignatureInformation) {
    function create(label, documentation) {
        var parameters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            parameters[_i - 2] = arguments[_i];
        }
        var result = { label: label };
        if (Is.defined(documentation)) {
            result.documentation = documentation;
        }
        if (Is.defined(parameters)) {
            result.parameters = parameters;
        }
        else {
            result.parameters = [];
        }
        return result;
    }
    SignatureInformation.create = create;
})(SignatureInformation || (SignatureInformation = {}));
/**
 * A document highlight kind.
 */
var main_DocumentHighlightKind;
(function (DocumentHighlightKind) {
    /**
     * A textual occurrence.
     */
    DocumentHighlightKind.Text = 1;
    /**
     * Read-access of a symbol, like reading a variable.
     */
    DocumentHighlightKind.Read = 2;
    /**
     * Write-access of a symbol, like writing to a variable.
     */
    DocumentHighlightKind.Write = 3;
})(main_DocumentHighlightKind || (main_DocumentHighlightKind = {}));
/**
 * DocumentHighlight namespace to provide helper functions to work with
 * [DocumentHighlight](#DocumentHighlight) literals.
 */
var DocumentHighlight;
(function (DocumentHighlight) {
    /**
     * Create a DocumentHighlight object.
     * @param range The range the highlight applies to.
     */
    function create(range, kind) {
        var result = { range: range };
        if (Is.number(kind)) {
            result.kind = kind;
        }
        return result;
    }
    DocumentHighlight.create = create;
})(DocumentHighlight || (DocumentHighlight = {}));
/**
 * A symbol kind.
 */
var main_SymbolKind;
(function (SymbolKind) {
    SymbolKind.File = 1;
    SymbolKind.Module = 2;
    SymbolKind.Namespace = 3;
    SymbolKind.Package = 4;
    SymbolKind.Class = 5;
    SymbolKind.Method = 6;
    SymbolKind.Property = 7;
    SymbolKind.Field = 8;
    SymbolKind.Constructor = 9;
    SymbolKind.Enum = 10;
    SymbolKind.Interface = 11;
    SymbolKind.Function = 12;
    SymbolKind.Variable = 13;
    SymbolKind.Constant = 14;
    SymbolKind.String = 15;
    SymbolKind.Number = 16;
    SymbolKind.Boolean = 17;
    SymbolKind.Array = 18;
    SymbolKind.Object = 19;
    SymbolKind.Key = 20;
    SymbolKind.Null = 21;
    SymbolKind.EnumMember = 22;
    SymbolKind.Struct = 23;
    SymbolKind.Event = 24;
    SymbolKind.Operator = 25;
    SymbolKind.TypeParameter = 26;
})(main_SymbolKind || (main_SymbolKind = {}));
var SymbolInformation;
(function (SymbolInformation) {
    /**
     * Creates a new symbol information literal.
     *
     * @param name The name of the symbol.
     * @param kind The kind of the symbol.
     * @param range The range of the location of the symbol.
     * @param uri The resource of the location of symbol, defaults to the current document.
     * @param containerName The name of the symbol containing the symbol.
     */
    function create(name, kind, range, uri, containerName) {
        var result = {
            name: name,
            kind: kind,
            location: { uri: uri, range: range }
        };
        if (containerName) {
            result.containerName = containerName;
        }
        return result;
    }
    SymbolInformation.create = create;
})(SymbolInformation || (SymbolInformation = {}));
/**
 * Represents programming constructs like variables, classes, interfaces etc.
 * that appear in a document. Document symbols can be hierarchical and they
 * have two ranges: one that encloses its definition and one that points to
 * its most interesting range, e.g. the range of an identifier.
 */
var DocumentSymbol = /** @class */ (function () {
    function DocumentSymbol() {
    }
    return DocumentSymbol;
}());

(function (DocumentSymbol) {
    /**
     * Creates a new symbol information literal.
     *
     * @param name The name of the symbol.
     * @param detail The detail of the symbol.
     * @param kind The kind of the symbol.
     * @param range The range of the symbol.
     * @param selectionRange The selectionRange of the symbol.
     * @param children Children of the symbol.
     */
    function create(name, detail, kind, range, selectionRange, children) {
        var result = {
            name: name,
            detail: detail,
            kind: kind,
            range: range,
            selectionRange: selectionRange
        };
        if (children !== void 0) {
            result.children = children;
        }
        return result;
    }
    DocumentSymbol.create = create;
    /**
     * Checks whether the given literal conforms to the [DocumentSymbol](#DocumentSymbol) interface.
     */
    function is(value) {
        var candidate = value;
        return candidate &&
            Is.string(candidate.name) && Is.number(candidate.kind) &&
            main_Range.is(candidate.range) && main_Range.is(candidate.selectionRange) &&
            (candidate.detail === void 0 || Is.string(candidate.detail)) &&
            (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) &&
            (candidate.children === void 0 || Array.isArray(candidate.children));
    }
    DocumentSymbol.is = is;
})(DocumentSymbol || (DocumentSymbol = {}));
/**
 * A set of predefined code action kinds
 */
var CodeActionKind;
(function (CodeActionKind) {
    /**
     * Base kind for quickfix actions: 'quickfix'
     */
    CodeActionKind.QuickFix = 'quickfix';
    /**
     * Base kind for refactoring actions: 'refactor'
     */
    CodeActionKind.Refactor = 'refactor';
    /**
     * Base kind for refactoring extraction actions: 'refactor.extract'
     *
     * Example extract actions:
     *
     * - Extract method
     * - Extract function
     * - Extract variable
     * - Extract interface from class
     * - ...
     */
    CodeActionKind.RefactorExtract = 'refactor.extract';
    /**
     * Base kind for refactoring inline actions: 'refactor.inline'
     *
     * Example inline actions:
     *
     * - Inline function
     * - Inline variable
     * - Inline constant
     * - ...
     */
    CodeActionKind.RefactorInline = 'refactor.inline';
    /**
     * Base kind for refactoring rewrite actions: 'refactor.rewrite'
     *
     * Example rewrite actions:
     *
     * - Convert JavaScript function to class
     * - Add or remove parameter
     * - Encapsulate field
     * - Make method static
     * - Move method to base class
     * - ...
     */
    CodeActionKind.RefactorRewrite = 'refactor.rewrite';
    /**
     * Base kind for source actions: `source`
     *
     * Source code actions apply to the entire file.
     */
    CodeActionKind.Source = 'source';
    /**
     * Base kind for an organize imports source action: `source.organizeImports`
     */
    CodeActionKind.SourceOrganizeImports = 'source.organizeImports';
})(CodeActionKind || (CodeActionKind = {}));
/**
 * The CodeActionContext namespace provides helper functions to work with
 * [CodeActionContext](#CodeActionContext) literals.
 */
var CodeActionContext;
(function (CodeActionContext) {
    /**
     * Creates a new CodeActionContext literal.
     */
    function create(diagnostics, only) {
        var result = { diagnostics: diagnostics };
        if (only !== void 0 && only !== null) {
            result.only = only;
        }
        return result;
    }
    CodeActionContext.create = create;
    /**
     * Checks whether the given literal conforms to the [CodeActionContext](#CodeActionContext) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string));
    }
    CodeActionContext.is = is;
})(CodeActionContext || (CodeActionContext = {}));
var CodeAction;
(function (CodeAction) {
    function create(title, commandOrEdit, kind) {
        var result = { title: title };
        if (Command.is(commandOrEdit)) {
            result.command = commandOrEdit;
        }
        else {
            result.edit = commandOrEdit;
        }
        if (kind !== void null) {
            result.kind = kind;
        }
        return result;
    }
    CodeAction.create = create;
    function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.title) &&
            (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) &&
            (candidate.kind === void 0 || Is.string(candidate.kind)) &&
            (candidate.edit !== void 0 || candidate.command !== void 0) &&
            (candidate.command === void 0 || Command.is(candidate.command)) &&
            (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
    }
    CodeAction.is = is;
})(CodeAction || (CodeAction = {}));
/**
 * The CodeLens namespace provides helper functions to work with
 * [CodeLens](#CodeLens) literals.
 */
var CodeLens;
(function (CodeLens) {
    /**
     * Creates a new CodeLens literal.
     */
    function create(range, data) {
        var result = { range: range };
        if (Is.defined(data))
            result.data = data;
        return result;
    }
    CodeLens.create = create;
    /**
     * Checks whether the given literal conforms to the [CodeLens](#CodeLens) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && main_Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
    }
    CodeLens.is = is;
})(CodeLens || (CodeLens = {}));
/**
 * The FormattingOptions namespace provides helper functions to work with
 * [FormattingOptions](#FormattingOptions) literals.
 */
var FormattingOptions;
(function (FormattingOptions) {
    /**
     * Creates a new FormattingOptions literal.
     */
    function create(tabSize, insertSpaces) {
        return { tabSize: tabSize, insertSpaces: insertSpaces };
    }
    FormattingOptions.create = create;
    /**
     * Checks whether the given literal conforms to the [FormattingOptions](#FormattingOptions) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.number(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
    }
    FormattingOptions.is = is;
})(FormattingOptions || (FormattingOptions = {}));
/**
 * A document link is a range in a text document that links to an internal or external resource, like another
 * text document or a web site.
 */
var DocumentLink = /** @class */ (function () {
    function DocumentLink() {
    }
    return DocumentLink;
}());

/**
 * The DocumentLink namespace provides helper functions to work with
 * [DocumentLink](#DocumentLink) literals.
 */
(function (DocumentLink) {
    /**
     * Creates a new DocumentLink literal.
     */
    function create(range, target, data) {
        return { range: range, target: target, data: data };
    }
    DocumentLink.create = create;
    /**
     * Checks whether the given literal conforms to the [DocumentLink](#DocumentLink) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && main_Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
    }
    DocumentLink.is = is;
})(DocumentLink || (DocumentLink = {}));
var EOL = ['\n', '\r\n', '\r'];
var TextDocument;
(function (TextDocument) {
    /**
     * Creates a new ITextDocument literal from the given uri and content.
     * @param uri The document's uri.
     * @param languageId  The document's language Id.
     * @param content The document's content.
     */
    function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
    }
    TextDocument.create = create;
    /**
     * Checks whether the given literal conforms to the [ITextDocument](#ITextDocument) interface.
     */
    function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.number(candidate.lineCount)
            && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
    }
    TextDocument.is = is;
    function applyEdits(document, edits) {
        var text = document.getText();
        var sortedEdits = mergeSort(edits, function (a, b) {
            var diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
                return a.range.start.character - b.range.start.character;
            }
            return diff;
        });
        var lastModifiedOffset = text.length;
        for (var i = sortedEdits.length - 1; i >= 0; i--) {
            var e = sortedEdits[i];
            var startOffset = document.offsetAt(e.range.start);
            var endOffset = document.offsetAt(e.range.end);
            if (endOffset <= lastModifiedOffset) {
                text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
            }
            else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = startOffset;
        }
        return text;
    }
    TextDocument.applyEdits = applyEdits;
    function mergeSort(data, compare) {
        if (data.length <= 1) {
            // sorted
            return data;
        }
        var p = (data.length / 2) | 0;
        var left = data.slice(0, p);
        var right = data.slice(p);
        mergeSort(left, compare);
        mergeSort(right, compare);
        var leftIdx = 0;
        var rightIdx = 0;
        var i = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
            var ret = compare(left[leftIdx], right[rightIdx]);
            if (ret <= 0) {
                // smaller_equal -> take left to preserve order
                data[i++] = left[leftIdx++];
            }
            else {
                // greater -> take right
                data[i++] = right[rightIdx++];
            }
        }
        while (leftIdx < left.length) {
            data[i++] = left[leftIdx++];
        }
        while (rightIdx < right.length) {
            data[i++] = right[rightIdx++];
        }
        return data;
    }
})(TextDocument || (TextDocument = {}));
/**
 * Represents reasons why a text document is saved.
 */
var TextDocumentSaveReason;
(function (TextDocumentSaveReason) {
    /**
     * Manually triggered, e.g. by the user pressing save, by starting debugging,
     * or by an API call.
     */
    TextDocumentSaveReason.Manual = 1;
    /**
     * Automatic after a delay.
     */
    TextDocumentSaveReason.AfterDelay = 2;
    /**
     * When the editor lost focus.
     */
    TextDocumentSaveReason.FocusOut = 3;
})(TextDocumentSaveReason || (TextDocumentSaveReason = {}));
var FullTextDocument = /** @class */ (function () {
    function FullTextDocument(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = null;
    }
    Object.defineProperty(FullTextDocument.prototype, "uri", {
        get: function () {
            return this._uri;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FullTextDocument.prototype, "languageId", {
        get: function () {
            return this._languageId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FullTextDocument.prototype, "version", {
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    FullTextDocument.prototype.getText = function (range) {
        if (range) {
            var start = this.offsetAt(range.start);
            var end = this.offsetAt(range.end);
            return this._content.substring(start, end);
        }
        return this._content;
    };
    FullTextDocument.prototype.update = function (event, version) {
        this._content = event.text;
        this._version = version;
        this._lineOffsets = null;
    };
    FullTextDocument.prototype.getLineOffsets = function () {
        if (this._lineOffsets === null) {
            var lineOffsets = [];
            var text = this._content;
            var isLineStart = true;
            for (var i = 0; i < text.length; i++) {
                if (isLineStart) {
                    lineOffsets.push(i);
                    isLineStart = false;
                }
                var ch = text.charAt(i);
                isLineStart = (ch === '\r' || ch === '\n');
                if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
                    i++;
                }
            }
            if (isLineStart && text.length > 0) {
                lineOffsets.push(text.length);
            }
            this._lineOffsets = lineOffsets;
        }
        return this._lineOffsets;
    };
    FullTextDocument.prototype.positionAt = function (offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        var lineOffsets = this.getLineOffsets();
        var low = 0, high = lineOffsets.length;
        if (high === 0) {
            return main_Position.create(0, offset);
        }
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (lineOffsets[mid] > offset) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        // low is the least x for which the line offset is larger than the current offset
        // or array.length if no line offset is larger than the current offset
        var line = low - 1;
        return main_Position.create(line, offset - lineOffsets[line]);
    };
    FullTextDocument.prototype.offsetAt = function (position) {
        var lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
            return this._content.length;
        }
        else if (position.line < 0) {
            return 0;
        }
        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
    };
    Object.defineProperty(FullTextDocument.prototype, "lineCount", {
        get: function () {
            return this.getLineOffsets().length;
        },
        enumerable: true,
        configurable: true
    });
    return FullTextDocument;
}());
var Is;
(function (Is) {
    var toString = Object.prototype.toString;
    function defined(value) {
        return typeof value !== 'undefined';
    }
    Is.defined = defined;
    function undefined(value) {
        return typeof value === 'undefined';
    }
    Is.undefined = undefined;
    function boolean(value) {
        return value === true || value === false;
    }
    Is.boolean = boolean;
    function string(value) {
        return toString.call(value) === '[object String]';
    }
    Is.string = string;
    function number(value) {
        return toString.call(value) === '[object Number]';
    }
    Is.number = number;
    function func(value) {
        return toString.call(value) === '[object Function]';
    }
    Is.func = func;
    function objectLiteral(value) {
        // Strictly speaking class instances pass this check as well. Since the LSP
        // doesn't use classes we ignore this for now. If we do we need to add something
        // like this: `Object.getPrototypeOf(Object.getPrototypeOf(x)) === null`
        return value !== null && typeof value === 'object';
    }
    Is.objectLiteral = objectLiteral;
    function typedArray(value, check) {
        return Array.isArray(value) && value.every(check);
    }
    Is.typedArray = typedArray;
})(Is || (Is = {}));

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/parser/htmlEntities.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * HTML 5 character entities
 * https://www.w3.org/TR/html5/syntax.html#named-character-references
 */
var entities = {
    "Aacute;": "\u00C1",
    "Aacute": "\u00C1",
    "aacute;": "\u00E1",
    "aacute": "\u00E1",
    "Abreve;": "\u0102",
    "abreve;": "\u0103",
    "ac;": "\u223E",
    "acd;": "\u223F",
    "acE;": "\u223E\u0333",
    "Acirc;": "\u00C2",
    "Acirc": "\u00C2",
    "acirc;": "\u00E2",
    "acirc": "\u00E2",
    "acute;": "\u00B4",
    "acute": "\u00B4",
    "Acy;": "\u0410",
    "acy;": "\u0430",
    "AElig;": "\u00C6",
    "AElig": "\u00C6",
    "aelig;": "\u00E6",
    "aelig": "\u00E6",
    "af;": "\u2061",
    "Afr;": "\uD835\uDD04",
    "afr;": "\uD835\uDD1E",
    "Agrave;": "\u00C0",
    "Agrave": "\u00C0",
    "agrave;": "\u00E0",
    "agrave": "\u00E0",
    "alefsym;": "\u2135",
    "aleph;": "\u2135",
    "Alpha;": "\u0391",
    "alpha;": "\u03B1",
    "Amacr;": "\u0100",
    "amacr;": "\u0101",
    "amalg;": "\u2A3F",
    "AMP;": "\u0026",
    "AMP": "\u0026",
    "amp;": "\u0026",
    "amp": "\u0026",
    "And;": "\u2A53",
    "and;": "\u2227",
    "andand;": "\u2A55",
    "andd;": "\u2A5C",
    "andslope;": "\u2A58",
    "andv;": "\u2A5A",
    "ang;": "\u2220",
    "ange;": "\u29A4",
    "angle;": "\u2220",
    "angmsd;": "\u2221",
    "angmsdaa;": "\u29A8",
    "angmsdab;": "\u29A9",
    "angmsdac;": "\u29AA",
    "angmsdad;": "\u29AB",
    "angmsdae;": "\u29AC",
    "angmsdaf;": "\u29AD",
    "angmsdag;": "\u29AE",
    "angmsdah;": "\u29AF",
    "angrt;": "\u221F",
    "angrtvb;": "\u22BE",
    "angrtvbd;": "\u299D",
    "angsph;": "\u2222",
    "angst;": "\u00C5",
    "angzarr;": "\u237C",
    "Aogon;": "\u0104",
    "aogon;": "\u0105",
    "Aopf;": "\uD835\uDD38",
    "aopf;": "\uD835\uDD52",
    "ap;": "\u2248",
    "apacir;": "\u2A6F",
    "apE;": "\u2A70",
    "ape;": "\u224A",
    "apid;": "\u224B",
    "apos;": "\u0027",
    "ApplyFunction;": "\u2061",
    "approx;": "\u2248",
    "approxeq;": "\u224A",
    "Aring;": "\u00C5",
    "Aring": "\u00C5",
    "aring;": "\u00E5",
    "aring": "\u00E5",
    "Ascr;": "\uD835\uDC9C",
    "ascr;": "\uD835\uDCB6",
    "Assign;": "\u2254",
    "ast;": "\u002A",
    "asymp;": "\u2248",
    "asympeq;": "\u224D",
    "Atilde;": "\u00C3",
    "Atilde": "\u00C3",
    "atilde;": "\u00E3",
    "atilde": "\u00E3",
    "Auml;": "\u00C4",
    "Auml": "\u00C4",
    "auml;": "\u00E4",
    "auml": "\u00E4",
    "awconint;": "\u2233",
    "awint;": "\u2A11",
    "backcong;": "\u224C",
    "backepsilon;": "\u03F6",
    "backprime;": "\u2035",
    "backsim;": "\u223D",
    "backsimeq;": "\u22CD",
    "Backslash;": "\u2216",
    "Barv;": "\u2AE7",
    "barvee;": "\u22BD",
    "Barwed;": "\u2306",
    "barwed;": "\u2305",
    "barwedge;": "\u2305",
    "bbrk;": "\u23B5",
    "bbrktbrk;": "\u23B6",
    "bcong;": "\u224C",
    "Bcy;": "\u0411",
    "bcy;": "\u0431",
    "bdquo;": "\u201E",
    "becaus;": "\u2235",
    "Because;": "\u2235",
    "because;": "\u2235",
    "bemptyv;": "\u29B0",
    "bepsi;": "\u03F6",
    "bernou;": "\u212C",
    "Bernoullis;": "\u212C",
    "Beta;": "\u0392",
    "beta;": "\u03B2",
    "beth;": "\u2136",
    "between;": "\u226C",
    "Bfr;": "\uD835\uDD05",
    "bfr;": "\uD835\uDD1F",
    "bigcap;": "\u22C2",
    "bigcirc;": "\u25EF",
    "bigcup;": "\u22C3",
    "bigodot;": "\u2A00",
    "bigoplus;": "\u2A01",
    "bigotimes;": "\u2A02",
    "bigsqcup;": "\u2A06",
    "bigstar;": "\u2605",
    "bigtriangledown;": "\u25BD",
    "bigtriangleup;": "\u25B3",
    "biguplus;": "\u2A04",
    "bigvee;": "\u22C1",
    "bigwedge;": "\u22C0",
    "bkarow;": "\u290D",
    "blacklozenge;": "\u29EB",
    "blacksquare;": "\u25AA",
    "blacktriangle;": "\u25B4",
    "blacktriangledown;": "\u25BE",
    "blacktriangleleft;": "\u25C2",
    "blacktriangleright;": "\u25B8",
    "blank;": "\u2423",
    "blk12;": "\u2592",
    "blk14;": "\u2591",
    "blk34;": "\u2593",
    "block;": "\u2588",
    "bne;": "\u003D\u20E5",
    "bnequiv;": "\u2261\u20E5",
    "bNot;": "\u2AED",
    "bnot;": "\u2310",
    "Bopf;": "\uD835\uDD39",
    "bopf;": "\uD835\uDD53",
    "bot;": "\u22A5",
    "bottom;": "\u22A5",
    "bowtie;": "\u22C8",
    "boxbox;": "\u29C9",
    "boxDL;": "\u2557",
    "boxDl;": "\u2556",
    "boxdL;": "\u2555",
    "boxdl;": "\u2510",
    "boxDR;": "\u2554",
    "boxDr;": "\u2553",
    "boxdR;": "\u2552",
    "boxdr;": "\u250C",
    "boxH;": "\u2550",
    "boxh;": "\u2500",
    "boxHD;": "\u2566",
    "boxHd;": "\u2564",
    "boxhD;": "\u2565",
    "boxhd;": "\u252C",
    "boxHU;": "\u2569",
    "boxHu;": "\u2567",
    "boxhU;": "\u2568",
    "boxhu;": "\u2534",
    "boxminus;": "\u229F",
    "boxplus;": "\u229E",
    "boxtimes;": "\u22A0",
    "boxUL;": "\u255D",
    "boxUl;": "\u255C",
    "boxuL;": "\u255B",
    "boxul;": "\u2518",
    "boxUR;": "\u255A",
    "boxUr;": "\u2559",
    "boxuR;": "\u2558",
    "boxur;": "\u2514",
    "boxV;": "\u2551",
    "boxv;": "\u2502",
    "boxVH;": "\u256C",
    "boxVh;": "\u256B",
    "boxvH;": "\u256A",
    "boxvh;": "\u253C",
    "boxVL;": "\u2563",
    "boxVl;": "\u2562",
    "boxvL;": "\u2561",
    "boxvl;": "\u2524",
    "boxVR;": "\u2560",
    "boxVr;": "\u255F",
    "boxvR;": "\u255E",
    "boxvr;": "\u251C",
    "bprime;": "\u2035",
    "Breve;": "\u02D8",
    "breve;": "\u02D8",
    "brvbar;": "\u00A6",
    "brvbar": "\u00A6",
    "Bscr;": "\u212C",
    "bscr;": "\uD835\uDCB7",
    "bsemi;": "\u204F",
    "bsim;": "\u223D",
    "bsime;": "\u22CD",
    "bsol;": "\u005C",
    "bsolb;": "\u29C5",
    "bsolhsub;": "\u27C8",
    "bull;": "\u2022",
    "bullet;": "\u2022",
    "bump;": "\u224E",
    "bumpE;": "\u2AAE",
    "bumpe;": "\u224F",
    "Bumpeq;": "\u224E",
    "bumpeq;": "\u224F",
    "Cacute;": "\u0106",
    "cacute;": "\u0107",
    "Cap;": "\u22D2",
    "cap;": "\u2229",
    "capand;": "\u2A44",
    "capbrcup;": "\u2A49",
    "capcap;": "\u2A4B",
    "capcup;": "\u2A47",
    "capdot;": "\u2A40",
    "CapitalDifferentialD;": "\u2145",
    "caps;": "\u2229\uFE00",
    "caret;": "\u2041",
    "caron;": "\u02C7",
    "Cayleys;": "\u212D",
    "ccaps;": "\u2A4D",
    "Ccaron;": "\u010C",
    "ccaron;": "\u010D",
    "Ccedil;": "\u00C7",
    "Ccedil": "\u00C7",
    "ccedil;": "\u00E7",
    "ccedil": "\u00E7",
    "Ccirc;": "\u0108",
    "ccirc;": "\u0109",
    "Cconint;": "\u2230",
    "ccups;": "\u2A4C",
    "ccupssm;": "\u2A50",
    "Cdot;": "\u010A",
    "cdot;": "\u010B",
    "cedil;": "\u00B8",
    "cedil": "\u00B8",
    "Cedilla;": "\u00B8",
    "cemptyv;": "\u29B2",
    "cent;": "\u00A2",
    "cent": "\u00A2",
    "CenterDot;": "\u00B7",
    "centerdot;": "\u00B7",
    "Cfr;": "\u212D",
    "cfr;": "\uD835\uDD20",
    "CHcy;": "\u0427",
    "chcy;": "\u0447",
    "check;": "\u2713",
    "checkmark;": "\u2713",
    "Chi;": "\u03A7",
    "chi;": "\u03C7",
    "cir;": "\u25CB",
    "circ;": "\u02C6",
    "circeq;": "\u2257",
    "circlearrowleft;": "\u21BA",
    "circlearrowright;": "\u21BB",
    "circledast;": "\u229B",
    "circledcirc;": "\u229A",
    "circleddash;": "\u229D",
    "CircleDot;": "\u2299",
    "circledR;": "\u00AE",
    "circledS;": "\u24C8",
    "CircleMinus;": "\u2296",
    "CirclePlus;": "\u2295",
    "CircleTimes;": "\u2297",
    "cirE;": "\u29C3",
    "cire;": "\u2257",
    "cirfnint;": "\u2A10",
    "cirmid;": "\u2AEF",
    "cirscir;": "\u29C2",
    "ClockwiseContourIntegral;": "\u2232",
    "CloseCurlyDoubleQuote;": "\u201D",
    "CloseCurlyQuote;": "\u2019",
    "clubs;": "\u2663",
    "clubsuit;": "\u2663",
    "Colon;": "\u2237",
    "colon;": "\u003A",
    "Colone;": "\u2A74",
    "colone;": "\u2254",
    "coloneq;": "\u2254",
    "comma;": "\u002C",
    "commat;": "\u0040",
    "comp;": "\u2201",
    "compfn;": "\u2218",
    "complement;": "\u2201",
    "complexes;": "\u2102",
    "cong;": "\u2245",
    "congdot;": "\u2A6D",
    "Congruent;": "\u2261",
    "Conint;": "\u222F",
    "conint;": "\u222E",
    "ContourIntegral;": "\u222E",
    "Copf;": "\u2102",
    "copf;": "\uD835\uDD54",
    "coprod;": "\u2210",
    "Coproduct;": "\u2210",
    "COPY;": "\u00A9",
    "COPY": "\u00A9",
    "copy;": "\u00A9",
    "copy": "\u00A9",
    "copysr;": "\u2117",
    "CounterClockwiseContourIntegral;": "\u2233",
    "crarr;": "\u21B5",
    "Cross;": "\u2A2F",
    "cross;": "\u2717",
    "Cscr;": "\uD835\uDC9E",
    "cscr;": "\uD835\uDCB8",
    "csub;": "\u2ACF",
    "csube;": "\u2AD1",
    "csup;": "\u2AD0",
    "csupe;": "\u2AD2",
    "ctdot;": "\u22EF",
    "cudarrl;": "\u2938",
    "cudarrr;": "\u2935",
    "cuepr;": "\u22DE",
    "cuesc;": "\u22DF",
    "cularr;": "\u21B6",
    "cularrp;": "\u293D",
    "Cup;": "\u22D3",
    "cup;": "\u222A",
    "cupbrcap;": "\u2A48",
    "CupCap;": "\u224D",
    "cupcap;": "\u2A46",
    "cupcup;": "\u2A4A",
    "cupdot;": "\u228D",
    "cupor;": "\u2A45",
    "cups;": "\u222A\uFE00",
    "curarr;": "\u21B7",
    "curarrm;": "\u293C",
    "curlyeqprec;": "\u22DE",
    "curlyeqsucc;": "\u22DF",
    "curlyvee;": "\u22CE",
    "curlywedge;": "\u22CF",
    "curren;": "\u00A4",
    "curren": "\u00A4",
    "curvearrowleft;": "\u21B6",
    "curvearrowright;": "\u21B7",
    "cuvee;": "\u22CE",
    "cuwed;": "\u22CF",
    "cwconint;": "\u2232",
    "cwint;": "\u2231",
    "cylcty;": "\u232D",
    "Dagger;": "\u2021",
    "dagger;": "\u2020",
    "daleth;": "\u2138",
    "Darr;": "\u21A1",
    "dArr;": "\u21D3",
    "darr;": "\u2193",
    "dash;": "\u2010",
    "Dashv;": "\u2AE4",
    "dashv;": "\u22A3",
    "dbkarow;": "\u290F",
    "dblac;": "\u02DD",
    "Dcaron;": "\u010E",
    "dcaron;": "\u010F",
    "Dcy;": "\u0414",
    "dcy;": "\u0434",
    "DD;": "\u2145",
    "dd;": "\u2146",
    "ddagger;": "\u2021",
    "ddarr;": "\u21CA",
    "DDotrahd;": "\u2911",
    "ddotseq;": "\u2A77",
    "deg;": "\u00B0",
    "deg": "\u00B0",
    "Del;": "\u2207",
    "Delta;": "\u0394",
    "delta;": "\u03B4",
    "demptyv;": "\u29B1",
    "dfisht;": "\u297F",
    "Dfr;": "\uD835\uDD07",
    "dfr;": "\uD835\uDD21",
    "dHar;": "\u2965",
    "dharl;": "\u21C3",
    "dharr;": "\u21C2",
    "DiacriticalAcute;": "\u00B4",
    "DiacriticalDot;": "\u02D9",
    "DiacriticalDoubleAcute;": "\u02DD",
    "DiacriticalGrave;": "\u0060",
    "DiacriticalTilde;": "\u02DC",
    "diam;": "\u22C4",
    "Diamond;": "\u22C4",
    "diamond;": "\u22C4",
    "diamondsuit;": "\u2666",
    "diams;": "\u2666",
    "die;": "\u00A8",
    "DifferentialD;": "\u2146",
    "digamma;": "\u03DD",
    "disin;": "\u22F2",
    "div;": "\u00F7",
    "divide;": "\u00F7",
    "divide": "\u00F7",
    "divideontimes;": "\u22C7",
    "divonx;": "\u22C7",
    "DJcy;": "\u0402",
    "djcy;": "\u0452",
    "dlcorn;": "\u231E",
    "dlcrop;": "\u230D",
    "dollar;": "\u0024",
    "Dopf;": "\uD835\uDD3B",
    "dopf;": "\uD835\uDD55",
    "Dot;": "\u00A8",
    "dot;": "\u02D9",
    "DotDot;": "\u20DC",
    "doteq;": "\u2250",
    "doteqdot;": "\u2251",
    "DotEqual;": "\u2250",
    "dotminus;": "\u2238",
    "dotplus;": "\u2214",
    "dotsquare;": "\u22A1",
    "doublebarwedge;": "\u2306",
    "DoubleContourIntegral;": "\u222F",
    "DoubleDot;": "\u00A8",
    "DoubleDownArrow;": "\u21D3",
    "DoubleLeftArrow;": "\u21D0",
    "DoubleLeftRightArrow;": "\u21D4",
    "DoubleLeftTee;": "\u2AE4",
    "DoubleLongLeftArrow;": "\u27F8",
    "DoubleLongLeftRightArrow;": "\u27FA",
    "DoubleLongRightArrow;": "\u27F9",
    "DoubleRightArrow;": "\u21D2",
    "DoubleRightTee;": "\u22A8",
    "DoubleUpArrow;": "\u21D1",
    "DoubleUpDownArrow;": "\u21D5",
    "DoubleVerticalBar;": "\u2225",
    "DownArrow;": "\u2193",
    "Downarrow;": "\u21D3",
    "downarrow;": "\u2193",
    "DownArrowBar;": "\u2913",
    "DownArrowUpArrow;": "\u21F5",
    "DownBreve;": "\u0311",
    "downdownarrows;": "\u21CA",
    "downharpoonleft;": "\u21C3",
    "downharpoonright;": "\u21C2",
    "DownLeftRightVector;": "\u2950",
    "DownLeftTeeVector;": "\u295E",
    "DownLeftVector;": "\u21BD",
    "DownLeftVectorBar;": "\u2956",
    "DownRightTeeVector;": "\u295F",
    "DownRightVector;": "\u21C1",
    "DownRightVectorBar;": "\u2957",
    "DownTee;": "\u22A4",
    "DownTeeArrow;": "\u21A7",
    "drbkarow;": "\u2910",
    "drcorn;": "\u231F",
    "drcrop;": "\u230C",
    "Dscr;": "\uD835\uDC9F",
    "dscr;": "\uD835\uDCB9",
    "DScy;": "\u0405",
    "dscy;": "\u0455",
    "dsol;": "\u29F6",
    "Dstrok;": "\u0110",
    "dstrok;": "\u0111",
    "dtdot;": "\u22F1",
    "dtri;": "\u25BF",
    "dtrif;": "\u25BE",
    "duarr;": "\u21F5",
    "duhar;": "\u296F",
    "dwangle;": "\u29A6",
    "DZcy;": "\u040F",
    "dzcy;": "\u045F",
    "dzigrarr;": "\u27FF",
    "Eacute;": "\u00C9",
    "Eacute": "\u00C9",
    "eacute;": "\u00E9",
    "eacute": "\u00E9",
    "easter;": "\u2A6E",
    "Ecaron;": "\u011A",
    "ecaron;": "\u011B",
    "ecir;": "\u2256",
    "Ecirc;": "\u00CA",
    "Ecirc": "\u00CA",
    "ecirc;": "\u00EA",
    "ecirc": "\u00EA",
    "ecolon;": "\u2255",
    "Ecy;": "\u042D",
    "ecy;": "\u044D",
    "eDDot;": "\u2A77",
    "Edot;": "\u0116",
    "eDot;": "\u2251",
    "edot;": "\u0117",
    "ee;": "\u2147",
    "efDot;": "\u2252",
    "Efr;": "\uD835\uDD08",
    "efr;": "\uD835\uDD22",
    "eg;": "\u2A9A",
    "Egrave;": "\u00C8",
    "Egrave": "\u00C8",
    "egrave;": "\u00E8",
    "egrave": "\u00E8",
    "egs;": "\u2A96",
    "egsdot;": "\u2A98",
    "el;": "\u2A99",
    "Element;": "\u2208",
    "elinters;": "\u23E7",
    "ell;": "\u2113",
    "els;": "\u2A95",
    "elsdot;": "\u2A97",
    "Emacr;": "\u0112",
    "emacr;": "\u0113",
    "empty;": "\u2205",
    "emptyset;": "\u2205",
    "EmptySmallSquare;": "\u25FB",
    "emptyv;": "\u2205",
    "EmptyVerySmallSquare;": "\u25AB",
    "emsp;": "\u2003",
    "emsp13;": "\u2004",
    "emsp14;": "\u2005",
    "ENG;": "\u014A",
    "eng;": "\u014B",
    "ensp;": "\u2002",
    "Eogon;": "\u0118",
    "eogon;": "\u0119",
    "Eopf;": "\uD835\uDD3C",
    "eopf;": "\uD835\uDD56",
    "epar;": "\u22D5",
    "eparsl;": "\u29E3",
    "eplus;": "\u2A71",
    "epsi;": "\u03B5",
    "Epsilon;": "\u0395",
    "epsilon;": "\u03B5",
    "epsiv;": "\u03F5",
    "eqcirc;": "\u2256",
    "eqcolon;": "\u2255",
    "eqsim;": "\u2242",
    "eqslantgtr;": "\u2A96",
    "eqslantless;": "\u2A95",
    "Equal;": "\u2A75",
    "equals;": "\u003D",
    "EqualTilde;": "\u2242",
    "equest;": "\u225F",
    "Equilibrium;": "\u21CC",
    "equiv;": "\u2261",
    "equivDD;": "\u2A78",
    "eqvparsl;": "\u29E5",
    "erarr;": "\u2971",
    "erDot;": "\u2253",
    "Escr;": "\u2130",
    "escr;": "\u212F",
    "esdot;": "\u2250",
    "Esim;": "\u2A73",
    "esim;": "\u2242",
    "Eta;": "\u0397",
    "eta;": "\u03B7",
    "ETH;": "\u00D0",
    "ETH": "\u00D0",
    "eth;": "\u00F0",
    "eth": "\u00F0",
    "Euml;": "\u00CB",
    "Euml": "\u00CB",
    "euml;": "\u00EB",
    "euml": "\u00EB",
    "euro;": "\u20AC",
    "excl;": "\u0021",
    "exist;": "\u2203",
    "Exists;": "\u2203",
    "expectation;": "\u2130",
    "ExponentialE;": "\u2147",
    "exponentiale;": "\u2147",
    "fallingdotseq;": "\u2252",
    "Fcy;": "\u0424",
    "fcy;": "\u0444",
    "female;": "\u2640",
    "ffilig;": "\uFB03",
    "fflig;": "\uFB00",
    "ffllig;": "\uFB04",
    "Ffr;": "\uD835\uDD09",
    "ffr;": "\uD835\uDD23",
    "filig;": "\uFB01",
    "FilledSmallSquare;": "\u25FC",
    "FilledVerySmallSquare;": "\u25AA",
    "fjlig;": "\u0066\u006A",
    "flat;": "\u266D",
    "fllig;": "\uFB02",
    "fltns;": "\u25B1",
    "fnof;": "\u0192",
    "Fopf;": "\uD835\uDD3D",
    "fopf;": "\uD835\uDD57",
    "ForAll;": "\u2200",
    "forall;": "\u2200",
    "fork;": "\u22D4",
    "forkv;": "\u2AD9",
    "Fouriertrf;": "\u2131",
    "fpartint;": "\u2A0D",
    "frac12;": "\u00BD",
    "frac12": "\u00BD",
    "frac13;": "\u2153",
    "frac14;": "\u00BC",
    "frac14": "\u00BC",
    "frac15;": "\u2155",
    "frac16;": "\u2159",
    "frac18;": "\u215B",
    "frac23;": "\u2154",
    "frac25;": "\u2156",
    "frac34;": "\u00BE",
    "frac34": "\u00BE",
    "frac35;": "\u2157",
    "frac38;": "\u215C",
    "frac45;": "\u2158",
    "frac56;": "\u215A",
    "frac58;": "\u215D",
    "frac78;": "\u215E",
    "frasl;": "\u2044",
    "frown;": "\u2322",
    "Fscr;": "\u2131",
    "fscr;": "\uD835\uDCBB",
    "gacute;": "\u01F5",
    "Gamma;": "\u0393",
    "gamma;": "\u03B3",
    "Gammad;": "\u03DC",
    "gammad;": "\u03DD",
    "gap;": "\u2A86",
    "Gbreve;": "\u011E",
    "gbreve;": "\u011F",
    "Gcedil;": "\u0122",
    "Gcirc;": "\u011C",
    "gcirc;": "\u011D",
    "Gcy;": "\u0413",
    "gcy;": "\u0433",
    "Gdot;": "\u0120",
    "gdot;": "\u0121",
    "gE;": "\u2267",
    "ge;": "\u2265",
    "gEl;": "\u2A8C",
    "gel;": "\u22DB",
    "geq;": "\u2265",
    "geqq;": "\u2267",
    "geqslant;": "\u2A7E",
    "ges;": "\u2A7E",
    "gescc;": "\u2AA9",
    "gesdot;": "\u2A80",
    "gesdoto;": "\u2A82",
    "gesdotol;": "\u2A84",
    "gesl;": "\u22DB\uFE00",
    "gesles;": "\u2A94",
    "Gfr;": "\uD835\uDD0A",
    "gfr;": "\uD835\uDD24",
    "Gg;": "\u22D9",
    "gg;": "\u226B",
    "ggg;": "\u22D9",
    "gimel;": "\u2137",
    "GJcy;": "\u0403",
    "gjcy;": "\u0453",
    "gl;": "\u2277",
    "gla;": "\u2AA5",
    "glE;": "\u2A92",
    "glj;": "\u2AA4",
    "gnap;": "\u2A8A",
    "gnapprox;": "\u2A8A",
    "gnE;": "\u2269",
    "gne;": "\u2A88",
    "gneq;": "\u2A88",
    "gneqq;": "\u2269",
    "gnsim;": "\u22E7",
    "Gopf;": "\uD835\uDD3E",
    "gopf;": "\uD835\uDD58",
    "grave;": "\u0060",
    "GreaterEqual;": "\u2265",
    "GreaterEqualLess;": "\u22DB",
    "GreaterFullEqual;": "\u2267",
    "GreaterGreater;": "\u2AA2",
    "GreaterLess;": "\u2277",
    "GreaterSlantEqual;": "\u2A7E",
    "GreaterTilde;": "\u2273",
    "Gscr;": "\uD835\uDCA2",
    "gscr;": "\u210A",
    "gsim;": "\u2273",
    "gsime;": "\u2A8E",
    "gsiml;": "\u2A90",
    "GT;": "\u003E",
    "GT": "\u003E",
    "Gt;": "\u226B",
    "gt;": "\u003E",
    "gt": "\u003E",
    "gtcc;": "\u2AA7",
    "gtcir;": "\u2A7A",
    "gtdot;": "\u22D7",
    "gtlPar;": "\u2995",
    "gtquest;": "\u2A7C",
    "gtrapprox;": "\u2A86",
    "gtrarr;": "\u2978",
    "gtrdot;": "\u22D7",
    "gtreqless;": "\u22DB",
    "gtreqqless;": "\u2A8C",
    "gtrless;": "\u2277",
    "gtrsim;": "\u2273",
    "gvertneqq;": "\u2269\uFE00",
    "gvnE;": "\u2269\uFE00",
    "Hacek;": "\u02C7",
    "hairsp;": "\u200A",
    "half;": "\u00BD",
    "hamilt;": "\u210B",
    "HARDcy;": "\u042A",
    "hardcy;": "\u044A",
    "hArr;": "\u21D4",
    "harr;": "\u2194",
    "harrcir;": "\u2948",
    "harrw;": "\u21AD",
    "Hat;": "\u005E",
    "hbar;": "\u210F",
    "Hcirc;": "\u0124",
    "hcirc;": "\u0125",
    "hearts;": "\u2665",
    "heartsuit;": "\u2665",
    "hellip;": "\u2026",
    "hercon;": "\u22B9",
    "Hfr;": "\u210C",
    "hfr;": "\uD835\uDD25",
    "HilbertSpace;": "\u210B",
    "hksearow;": "\u2925",
    "hkswarow;": "\u2926",
    "hoarr;": "\u21FF",
    "homtht;": "\u223B",
    "hookleftarrow;": "\u21A9",
    "hookrightarrow;": "\u21AA",
    "Hopf;": "\u210D",
    "hopf;": "\uD835\uDD59",
    "horbar;": "\u2015",
    "HorizontalLine;": "\u2500",
    "Hscr;": "\u210B",
    "hscr;": "\uD835\uDCBD",
    "hslash;": "\u210F",
    "Hstrok;": "\u0126",
    "hstrok;": "\u0127",
    "HumpDownHump;": "\u224E",
    "HumpEqual;": "\u224F",
    "hybull;": "\u2043",
    "hyphen;": "\u2010",
    "Iacute;": "\u00CD",
    "Iacute": "\u00CD",
    "iacute;": "\u00ED",
    "iacute": "\u00ED",
    "ic;": "\u2063",
    "Icirc;": "\u00CE",
    "Icirc": "\u00CE",
    "icirc;": "\u00EE",
    "icirc": "\u00EE",
    "Icy;": "\u0418",
    "icy;": "\u0438",
    "Idot;": "\u0130",
    "IEcy;": "\u0415",
    "iecy;": "\u0435",
    "iexcl;": "\u00A1",
    "iexcl": "\u00A1",
    "iff;": "\u21D4",
    "Ifr;": "\u2111",
    "ifr;": "\uD835\uDD26",
    "Igrave;": "\u00CC",
    "Igrave": "\u00CC",
    "igrave;": "\u00EC",
    "igrave": "\u00EC",
    "ii;": "\u2148",
    "iiiint;": "\u2A0C",
    "iiint;": "\u222D",
    "iinfin;": "\u29DC",
    "iiota;": "\u2129",
    "IJlig;": "\u0132",
    "ijlig;": "\u0133",
    "Im;": "\u2111",
    "Imacr;": "\u012A",
    "imacr;": "\u012B",
    "image;": "\u2111",
    "ImaginaryI;": "\u2148",
    "imagline;": "\u2110",
    "imagpart;": "\u2111",
    "imath;": "\u0131",
    "imof;": "\u22B7",
    "imped;": "\u01B5",
    "Implies;": "\u21D2",
    "in;": "\u2208",
    "incare;": "\u2105",
    "infin;": "\u221E",
    "infintie;": "\u29DD",
    "inodot;": "\u0131",
    "Int;": "\u222C",
    "int;": "\u222B",
    "intcal;": "\u22BA",
    "integers;": "\u2124",
    "Integral;": "\u222B",
    "intercal;": "\u22BA",
    "Intersection;": "\u22C2",
    "intlarhk;": "\u2A17",
    "intprod;": "\u2A3C",
    "InvisibleComma;": "\u2063",
    "InvisibleTimes;": "\u2062",
    "IOcy;": "\u0401",
    "iocy;": "\u0451",
    "Iogon;": "\u012E",
    "iogon;": "\u012F",
    "Iopf;": "\uD835\uDD40",
    "iopf;": "\uD835\uDD5A",
    "Iota;": "\u0399",
    "iota;": "\u03B9",
    "iprod;": "\u2A3C",
    "iquest;": "\u00BF",
    "iquest": "\u00BF",
    "Iscr;": "\u2110",
    "iscr;": "\uD835\uDCBE",
    "isin;": "\u2208",
    "isindot;": "\u22F5",
    "isinE;": "\u22F9",
    "isins;": "\u22F4",
    "isinsv;": "\u22F3",
    "isinv;": "\u2208",
    "it;": "\u2062",
    "Itilde;": "\u0128",
    "itilde;": "\u0129",
    "Iukcy;": "\u0406",
    "iukcy;": "\u0456",
    "Iuml;": "\u00CF",
    "Iuml": "\u00CF",
    "iuml;": "\u00EF",
    "iuml": "\u00EF",
    "Jcirc;": "\u0134",
    "jcirc;": "\u0135",
    "Jcy;": "\u0419",
    "jcy;": "\u0439",
    "Jfr;": "\uD835\uDD0D",
    "jfr;": "\uD835\uDD27",
    "jmath;": "\u0237",
    "Jopf;": "\uD835\uDD41",
    "jopf;": "\uD835\uDD5B",
    "Jscr;": "\uD835\uDCA5",
    "jscr;": "\uD835\uDCBF",
    "Jsercy;": "\u0408",
    "jsercy;": "\u0458",
    "Jukcy;": "\u0404",
    "jukcy;": "\u0454",
    "Kappa;": "\u039A",
    "kappa;": "\u03BA",
    "kappav;": "\u03F0",
    "Kcedil;": "\u0136",
    "kcedil;": "\u0137",
    "Kcy;": "\u041A",
    "kcy;": "\u043A",
    "Kfr;": "\uD835\uDD0E",
    "kfr;": "\uD835\uDD28",
    "kgreen;": "\u0138",
    "KHcy;": "\u0425",
    "khcy;": "\u0445",
    "KJcy;": "\u040C",
    "kjcy;": "\u045C",
    "Kopf;": "\uD835\uDD42",
    "kopf;": "\uD835\uDD5C",
    "Kscr;": "\uD835\uDCA6",
    "kscr;": "\uD835\uDCC0",
    "lAarr;": "\u21DA",
    "Lacute;": "\u0139",
    "lacute;": "\u013A",
    "laemptyv;": "\u29B4",
    "lagran;": "\u2112",
    "Lambda;": "\u039B",
    "lambda;": "\u03BB",
    "Lang;": "\u27EA",
    "lang;": "\u27E8",
    "langd;": "\u2991",
    "langle;": "\u27E8",
    "lap;": "\u2A85",
    "Laplacetrf;": "\u2112",
    "laquo;": "\u00AB",
    "laquo": "\u00AB",
    "Larr;": "\u219E",
    "lArr;": "\u21D0",
    "larr;": "\u2190",
    "larrb;": "\u21E4",
    "larrbfs;": "\u291F",
    "larrfs;": "\u291D",
    "larrhk;": "\u21A9",
    "larrlp;": "\u21AB",
    "larrpl;": "\u2939",
    "larrsim;": "\u2973",
    "larrtl;": "\u21A2",
    "lat;": "\u2AAB",
    "lAtail;": "\u291B",
    "latail;": "\u2919",
    "late;": "\u2AAD",
    "lates;": "\u2AAD\uFE00",
    "lBarr;": "\u290E",
    "lbarr;": "\u290C",
    "lbbrk;": "\u2772",
    "lbrace;": "\u007B",
    "lbrack;": "\u005B",
    "lbrke;": "\u298B",
    "lbrksld;": "\u298F",
    "lbrkslu;": "\u298D",
    "Lcaron;": "\u013D",
    "lcaron;": "\u013E",
    "Lcedil;": "\u013B",
    "lcedil;": "\u013C",
    "lceil;": "\u2308",
    "lcub;": "\u007B",
    "Lcy;": "\u041B",
    "lcy;": "\u043B",
    "ldca;": "\u2936",
    "ldquo;": "\u201C",
    "ldquor;": "\u201E",
    "ldrdhar;": "\u2967",
    "ldrushar;": "\u294B",
    "ldsh;": "\u21B2",
    "lE;": "\u2266",
    "le;": "\u2264",
    "LeftAngleBracket;": "\u27E8",
    "LeftArrow;": "\u2190",
    "Leftarrow;": "\u21D0",
    "leftarrow;": "\u2190",
    "LeftArrowBar;": "\u21E4",
    "LeftArrowRightArrow;": "\u21C6",
    "leftarrowtail;": "\u21A2",
    "LeftCeiling;": "\u2308",
    "LeftDoubleBracket;": "\u27E6",
    "LeftDownTeeVector;": "\u2961",
    "LeftDownVector;": "\u21C3",
    "LeftDownVectorBar;": "\u2959",
    "LeftFloor;": "\u230A",
    "leftharpoondown;": "\u21BD",
    "leftharpoonup;": "\u21BC",
    "leftleftarrows;": "\u21C7",
    "LeftRightArrow;": "\u2194",
    "Leftrightarrow;": "\u21D4",
    "leftrightarrow;": "\u2194",
    "leftrightarrows;": "\u21C6",
    "leftrightharpoons;": "\u21CB",
    "leftrightsquigarrow;": "\u21AD",
    "LeftRightVector;": "\u294E",
    "LeftTee;": "\u22A3",
    "LeftTeeArrow;": "\u21A4",
    "LeftTeeVector;": "\u295A",
    "leftthreetimes;": "\u22CB",
    "LeftTriangle;": "\u22B2",
    "LeftTriangleBar;": "\u29CF",
    "LeftTriangleEqual;": "\u22B4",
    "LeftUpDownVector;": "\u2951",
    "LeftUpTeeVector;": "\u2960",
    "LeftUpVector;": "\u21BF",
    "LeftUpVectorBar;": "\u2958",
    "LeftVector;": "\u21BC",
    "LeftVectorBar;": "\u2952",
    "lEg;": "\u2A8B",
    "leg;": "\u22DA",
    "leq;": "\u2264",
    "leqq;": "\u2266",
    "leqslant;": "\u2A7D",
    "les;": "\u2A7D",
    "lescc;": "\u2AA8",
    "lesdot;": "\u2A7F",
    "lesdoto;": "\u2A81",
    "lesdotor;": "\u2A83",
    "lesg;": "\u22DA\uFE00",
    "lesges;": "\u2A93",
    "lessapprox;": "\u2A85",
    "lessdot;": "\u22D6",
    "lesseqgtr;": "\u22DA",
    "lesseqqgtr;": "\u2A8B",
    "LessEqualGreater;": "\u22DA",
    "LessFullEqual;": "\u2266",
    "LessGreater;": "\u2276",
    "lessgtr;": "\u2276",
    "LessLess;": "\u2AA1",
    "lesssim;": "\u2272",
    "LessSlantEqual;": "\u2A7D",
    "LessTilde;": "\u2272",
    "lfisht;": "\u297C",
    "lfloor;": "\u230A",
    "Lfr;": "\uD835\uDD0F",
    "lfr;": "\uD835\uDD29",
    "lg;": "\u2276",
    "lgE;": "\u2A91",
    "lHar;": "\u2962",
    "lhard;": "\u21BD",
    "lharu;": "\u21BC",
    "lharul;": "\u296A",
    "lhblk;": "\u2584",
    "LJcy;": "\u0409",
    "ljcy;": "\u0459",
    "Ll;": "\u22D8",
    "ll;": "\u226A",
    "llarr;": "\u21C7",
    "llcorner;": "\u231E",
    "Lleftarrow;": "\u21DA",
    "llhard;": "\u296B",
    "lltri;": "\u25FA",
    "Lmidot;": "\u013F",
    "lmidot;": "\u0140",
    "lmoust;": "\u23B0",
    "lmoustache;": "\u23B0",
    "lnap;": "\u2A89",
    "lnapprox;": "\u2A89",
    "lnE;": "\u2268",
    "lne;": "\u2A87",
    "lneq;": "\u2A87",
    "lneqq;": "\u2268",
    "lnsim;": "\u22E6",
    "loang;": "\u27EC",
    "loarr;": "\u21FD",
    "lobrk;": "\u27E6",
    "LongLeftArrow;": "\u27F5",
    "Longleftarrow;": "\u27F8",
    "longleftarrow;": "\u27F5",
    "LongLeftRightArrow;": "\u27F7",
    "Longleftrightarrow;": "\u27FA",
    "longleftrightarrow;": "\u27F7",
    "longmapsto;": "\u27FC",
    "LongRightArrow;": "\u27F6",
    "Longrightarrow;": "\u27F9",
    "longrightarrow;": "\u27F6",
    "looparrowleft;": "\u21AB",
    "looparrowright;": "\u21AC",
    "lopar;": "\u2985",
    "Lopf;": "\uD835\uDD43",
    "lopf;": "\uD835\uDD5D",
    "loplus;": "\u2A2D",
    "lotimes;": "\u2A34",
    "lowast;": "\u2217",
    "lowbar;": "\u005F",
    "LowerLeftArrow;": "\u2199",
    "LowerRightArrow;": "\u2198",
    "loz;": "\u25CA",
    "lozenge;": "\u25CA",
    "lozf;": "\u29EB",
    "lpar;": "\u0028",
    "lparlt;": "\u2993",
    "lrarr;": "\u21C6",
    "lrcorner;": "\u231F",
    "lrhar;": "\u21CB",
    "lrhard;": "\u296D",
    "lrm;": "\u200E",
    "lrtri;": "\u22BF",
    "lsaquo;": "\u2039",
    "Lscr;": "\u2112",
    "lscr;": "\uD835\uDCC1",
    "Lsh;": "\u21B0",
    "lsh;": "\u21B0",
    "lsim;": "\u2272",
    "lsime;": "\u2A8D",
    "lsimg;": "\u2A8F",
    "lsqb;": "\u005B",
    "lsquo;": "\u2018",
    "lsquor;": "\u201A",
    "Lstrok;": "\u0141",
    "lstrok;": "\u0142",
    "LT;": "\u003C",
    "LT": "\u003C",
    "Lt;": "\u226A",
    "lt;": "\u003C",
    "lt": "\u003C",
    "ltcc;": "\u2AA6",
    "ltcir;": "\u2A79",
    "ltdot;": "\u22D6",
    "lthree;": "\u22CB",
    "ltimes;": "\u22C9",
    "ltlarr;": "\u2976",
    "ltquest;": "\u2A7B",
    "ltri;": "\u25C3",
    "ltrie;": "\u22B4",
    "ltrif;": "\u25C2",
    "ltrPar;": "\u2996",
    "lurdshar;": "\u294A",
    "luruhar;": "\u2966",
    "lvertneqq;": "\u2268\uFE00",
    "lvnE;": "\u2268\uFE00",
    "macr;": "\u00AF",
    "macr": "\u00AF",
    "male;": "\u2642",
    "malt;": "\u2720",
    "maltese;": "\u2720",
    "Map;": "\u2905",
    "map;": "\u21A6",
    "mapsto;": "\u21A6",
    "mapstodown;": "\u21A7",
    "mapstoleft;": "\u21A4",
    "mapstoup;": "\u21A5",
    "marker;": "\u25AE",
    "mcomma;": "\u2A29",
    "Mcy;": "\u041C",
    "mcy;": "\u043C",
    "mdash;": "\u2014",
    "mDDot;": "\u223A",
    "measuredangle;": "\u2221",
    "MediumSpace;": "\u205F",
    "Mellintrf;": "\u2133",
    "Mfr;": "\uD835\uDD10",
    "mfr;": "\uD835\uDD2A",
    "mho;": "\u2127",
    "micro;": "\u00B5",
    "micro": "\u00B5",
    "mid;": "\u2223",
    "midast;": "\u002A",
    "midcir;": "\u2AF0",
    "middot;": "\u00B7",
    "middot": "\u00B7",
    "minus;": "\u2212",
    "minusb;": "\u229F",
    "minusd;": "\u2238",
    "minusdu;": "\u2A2A",
    "MinusPlus;": "\u2213",
    "mlcp;": "\u2ADB",
    "mldr;": "\u2026",
    "mnplus;": "\u2213",
    "models;": "\u22A7",
    "Mopf;": "\uD835\uDD44",
    "mopf;": "\uD835\uDD5E",
    "mp;": "\u2213",
    "Mscr;": "\u2133",
    "mscr;": "\uD835\uDCC2",
    "mstpos;": "\u223E",
    "Mu;": "\u039C",
    "mu;": "\u03BC",
    "multimap;": "\u22B8",
    "mumap;": "\u22B8",
    "nabla;": "\u2207",
    "Nacute;": "\u0143",
    "nacute;": "\u0144",
    "nang;": "\u2220\u20D2",
    "nap;": "\u2249",
    "napE;": "\u2A70\u0338",
    "napid;": "\u224B\u0338",
    "napos;": "\u0149",
    "napprox;": "\u2249",
    "natur;": "\u266E",
    "natural;": "\u266E",
    "naturals;": "\u2115",
    "nbsp;": "\u00A0",
    "nbsp": "\u00A0",
    "nbump;": "\u224E\u0338",
    "nbumpe;": "\u224F\u0338",
    "ncap;": "\u2A43",
    "Ncaron;": "\u0147",
    "ncaron;": "\u0148",
    "Ncedil;": "\u0145",
    "ncedil;": "\u0146",
    "ncong;": "\u2247",
    "ncongdot;": "\u2A6D\u0338",
    "ncup;": "\u2A42",
    "Ncy;": "\u041D",
    "ncy;": "\u043D",
    "ndash;": "\u2013",
    "ne;": "\u2260",
    "nearhk;": "\u2924",
    "neArr;": "\u21D7",
    "nearr;": "\u2197",
    "nearrow;": "\u2197",
    "nedot;": "\u2250\u0338",
    "NegativeMediumSpace;": "\u200B",
    "NegativeThickSpace;": "\u200B",
    "NegativeThinSpace;": "\u200B",
    "NegativeVeryThinSpace;": "\u200B",
    "nequiv;": "\u2262",
    "nesear;": "\u2928",
    "nesim;": "\u2242\u0338",
    "NestedGreaterGreater;": "\u226B",
    "NestedLessLess;": "\u226A",
    "NewLine;": "\u000A",
    "nexist;": "\u2204",
    "nexists;": "\u2204",
    "Nfr;": "\uD835\uDD11",
    "nfr;": "\uD835\uDD2B",
    "ngE;": "\u2267\u0338",
    "nge;": "\u2271",
    "ngeq;": "\u2271",
    "ngeqq;": "\u2267\u0338",
    "ngeqslant;": "\u2A7E\u0338",
    "nges;": "\u2A7E\u0338",
    "nGg;": "\u22D9\u0338",
    "ngsim;": "\u2275",
    "nGt;": "\u226B\u20D2",
    "ngt;": "\u226F",
    "ngtr;": "\u226F",
    "nGtv;": "\u226B\u0338",
    "nhArr;": "\u21CE",
    "nharr;": "\u21AE",
    "nhpar;": "\u2AF2",
    "ni;": "\u220B",
    "nis;": "\u22FC",
    "nisd;": "\u22FA",
    "niv;": "\u220B",
    "NJcy;": "\u040A",
    "njcy;": "\u045A",
    "nlArr;": "\u21CD",
    "nlarr;": "\u219A",
    "nldr;": "\u2025",
    "nlE;": "\u2266\u0338",
    "nle;": "\u2270",
    "nLeftarrow;": "\u21CD",
    "nleftarrow;": "\u219A",
    "nLeftrightarrow;": "\u21CE",
    "nleftrightarrow;": "\u21AE",
    "nleq;": "\u2270",
    "nleqq;": "\u2266\u0338",
    "nleqslant;": "\u2A7D\u0338",
    "nles;": "\u2A7D\u0338",
    "nless;": "\u226E",
    "nLl;": "\u22D8\u0338",
    "nlsim;": "\u2274",
    "nLt;": "\u226A\u20D2",
    "nlt;": "\u226E",
    "nltri;": "\u22EA",
    "nltrie;": "\u22EC",
    "nLtv;": "\u226A\u0338",
    "nmid;": "\u2224",
    "NoBreak;": "\u2060",
    "NonBreakingSpace;": "\u00A0",
    "Nopf;": "\u2115",
    "nopf;": "\uD835\uDD5F",
    "Not;": "\u2AEC",
    "not;": "\u00AC",
    "not": "\u00AC",
    "NotCongruent;": "\u2262",
    "NotCupCap;": "\u226D",
    "NotDoubleVerticalBar;": "\u2226",
    "NotElement;": "\u2209",
    "NotEqual;": "\u2260",
    "NotEqualTilde;": "\u2242\u0338",
    "NotExists;": "\u2204",
    "NotGreater;": "\u226F",
    "NotGreaterEqual;": "\u2271",
    "NotGreaterFullEqual;": "\u2267\u0338",
    "NotGreaterGreater;": "\u226B\u0338",
    "NotGreaterLess;": "\u2279",
    "NotGreaterSlantEqual;": "\u2A7E\u0338",
    "NotGreaterTilde;": "\u2275",
    "NotHumpDownHump;": "\u224E\u0338",
    "NotHumpEqual;": "\u224F\u0338",
    "notin;": "\u2209",
    "notindot;": "\u22F5\u0338",
    "notinE;": "\u22F9\u0338",
    "notinva;": "\u2209",
    "notinvb;": "\u22F7",
    "notinvc;": "\u22F6",
    "NotLeftTriangle;": "\u22EA",
    "NotLeftTriangleBar;": "\u29CF\u0338",
    "NotLeftTriangleEqual;": "\u22EC",
    "NotLess;": "\u226E",
    "NotLessEqual;": "\u2270",
    "NotLessGreater;": "\u2278",
    "NotLessLess;": "\u226A\u0338",
    "NotLessSlantEqual;": "\u2A7D\u0338",
    "NotLessTilde;": "\u2274",
    "NotNestedGreaterGreater;": "\u2AA2\u0338",
    "NotNestedLessLess;": "\u2AA1\u0338",
    "notni;": "\u220C",
    "notniva;": "\u220C",
    "notnivb;": "\u22FE",
    "notnivc;": "\u22FD",
    "NotPrecedes;": "\u2280",
    "NotPrecedesEqual;": "\u2AAF\u0338",
    "NotPrecedesSlantEqual;": "\u22E0",
    "NotReverseElement;": "\u220C",
    "NotRightTriangle;": "\u22EB",
    "NotRightTriangleBar;": "\u29D0\u0338",
    "NotRightTriangleEqual;": "\u22ED",
    "NotSquareSubset;": "\u228F\u0338",
    "NotSquareSubsetEqual;": "\u22E2",
    "NotSquareSuperset;": "\u2290\u0338",
    "NotSquareSupersetEqual;": "\u22E3",
    "NotSubset;": "\u2282\u20D2",
    "NotSubsetEqual;": "\u2288",
    "NotSucceeds;": "\u2281",
    "NotSucceedsEqual;": "\u2AB0\u0338",
    "NotSucceedsSlantEqual;": "\u22E1",
    "NotSucceedsTilde;": "\u227F\u0338",
    "NotSuperset;": "\u2283\u20D2",
    "NotSupersetEqual;": "\u2289",
    "NotTilde;": "\u2241",
    "NotTildeEqual;": "\u2244",
    "NotTildeFullEqual;": "\u2247",
    "NotTildeTilde;": "\u2249",
    "NotVerticalBar;": "\u2224",
    "npar;": "\u2226",
    "nparallel;": "\u2226",
    "nparsl;": "\u2AFD\u20E5",
    "npart;": "\u2202\u0338",
    "npolint;": "\u2A14",
    "npr;": "\u2280",
    "nprcue;": "\u22E0",
    "npre;": "\u2AAF\u0338",
    "nprec;": "\u2280",
    "npreceq;": "\u2AAF\u0338",
    "nrArr;": "\u21CF",
    "nrarr;": "\u219B",
    "nrarrc;": "\u2933\u0338",
    "nrarrw;": "\u219D\u0338",
    "nRightarrow;": "\u21CF",
    "nrightarrow;": "\u219B",
    "nrtri;": "\u22EB",
    "nrtrie;": "\u22ED",
    "nsc;": "\u2281",
    "nsccue;": "\u22E1",
    "nsce;": "\u2AB0\u0338",
    "Nscr;": "\uD835\uDCA9",
    "nscr;": "\uD835\uDCC3",
    "nshortmid;": "\u2224",
    "nshortparallel;": "\u2226",
    "nsim;": "\u2241",
    "nsime;": "\u2244",
    "nsimeq;": "\u2244",
    "nsmid;": "\u2224",
    "nspar;": "\u2226",
    "nsqsube;": "\u22E2",
    "nsqsupe;": "\u22E3",
    "nsub;": "\u2284",
    "nsubE;": "\u2AC5\u0338",
    "nsube;": "\u2288",
    "nsubset;": "\u2282\u20D2",
    "nsubseteq;": "\u2288",
    "nsubseteqq;": "\u2AC5\u0338",
    "nsucc;": "\u2281",
    "nsucceq;": "\u2AB0\u0338",
    "nsup;": "\u2285",
    "nsupE;": "\u2AC6\u0338",
    "nsupe;": "\u2289",
    "nsupset;": "\u2283\u20D2",
    "nsupseteq;": "\u2289",
    "nsupseteqq;": "\u2AC6\u0338",
    "ntgl;": "\u2279",
    "Ntilde;": "\u00D1",
    "Ntilde": "\u00D1",
    "ntilde;": "\u00F1",
    "ntilde": "\u00F1",
    "ntlg;": "\u2278",
    "ntriangleleft;": "\u22EA",
    "ntrianglelefteq;": "\u22EC",
    "ntriangleright;": "\u22EB",
    "ntrianglerighteq;": "\u22ED",
    "Nu;": "\u039D",
    "nu;": "\u03BD",
    "num;": "\u0023",
    "numero;": "\u2116",
    "numsp;": "\u2007",
    "nvap;": "\u224D\u20D2",
    "nVDash;": "\u22AF",
    "nVdash;": "\u22AE",
    "nvDash;": "\u22AD",
    "nvdash;": "\u22AC",
    "nvge;": "\u2265\u20D2",
    "nvgt;": "\u003E\u20D2",
    "nvHarr;": "\u2904",
    "nvinfin;": "\u29DE",
    "nvlArr;": "\u2902",
    "nvle;": "\u2264\u20D2",
    "nvlt;": "\u003C\u20D2",
    "nvltrie;": "\u22B4\u20D2",
    "nvrArr;": "\u2903",
    "nvrtrie;": "\u22B5\u20D2",
    "nvsim;": "\u223C\u20D2",
    "nwarhk;": "\u2923",
    "nwArr;": "\u21D6",
    "nwarr;": "\u2196",
    "nwarrow;": "\u2196",
    "nwnear;": "\u2927",
    "Oacute;": "\u00D3",
    "Oacute": "\u00D3",
    "oacute;": "\u00F3",
    "oacute": "\u00F3",
    "oast;": "\u229B",
    "ocir;": "\u229A",
    "Ocirc;": "\u00D4",
    "Ocirc": "\u00D4",
    "ocirc;": "\u00F4",
    "ocirc": "\u00F4",
    "Ocy;": "\u041E",
    "ocy;": "\u043E",
    "odash;": "\u229D",
    "Odblac;": "\u0150",
    "odblac;": "\u0151",
    "odiv;": "\u2A38",
    "odot;": "\u2299",
    "odsold;": "\u29BC",
    "OElig;": "\u0152",
    "oelig;": "\u0153",
    "ofcir;": "\u29BF",
    "Ofr;": "\uD835\uDD12",
    "ofr;": "\uD835\uDD2C",
    "ogon;": "\u02DB",
    "Ograve;": "\u00D2",
    "Ograve": "\u00D2",
    "ograve;": "\u00F2",
    "ograve": "\u00F2",
    "ogt;": "\u29C1",
    "ohbar;": "\u29B5",
    "ohm;": "\u03A9",
    "oint;": "\u222E",
    "olarr;": "\u21BA",
    "olcir;": "\u29BE",
    "olcross;": "\u29BB",
    "oline;": "\u203E",
    "olt;": "\u29C0",
    "Omacr;": "\u014C",
    "omacr;": "\u014D",
    "Omega;": "\u03A9",
    "omega;": "\u03C9",
    "Omicron;": "\u039F",
    "omicron;": "\u03BF",
    "omid;": "\u29B6",
    "ominus;": "\u2296",
    "Oopf;": "\uD835\uDD46",
    "oopf;": "\uD835\uDD60",
    "opar;": "\u29B7",
    "OpenCurlyDoubleQuote;": "\u201C",
    "OpenCurlyQuote;": "\u2018",
    "operp;": "\u29B9",
    "oplus;": "\u2295",
    "Or;": "\u2A54",
    "or;": "\u2228",
    "orarr;": "\u21BB",
    "ord;": "\u2A5D",
    "order;": "\u2134",
    "orderof;": "\u2134",
    "ordf;": "\u00AA",
    "ordf": "\u00AA",
    "ordm;": "\u00BA",
    "ordm": "\u00BA",
    "origof;": "\u22B6",
    "oror;": "\u2A56",
    "orslope;": "\u2A57",
    "orv;": "\u2A5B",
    "oS;": "\u24C8",
    "Oscr;": "\uD835\uDCAA",
    "oscr;": "\u2134",
    "Oslash;": "\u00D8",
    "Oslash": "\u00D8",
    "oslash;": "\u00F8",
    "oslash": "\u00F8",
    "osol;": "\u2298",
    "Otilde;": "\u00D5",
    "Otilde": "\u00D5",
    "otilde;": "\u00F5",
    "otilde": "\u00F5",
    "Otimes;": "\u2A37",
    "otimes;": "\u2297",
    "otimesas;": "\u2A36",
    "Ouml;": "\u00D6",
    "Ouml": "\u00D6",
    "ouml;": "\u00F6",
    "ouml": "\u00F6",
    "ovbar;": "\u233D",
    "OverBar;": "\u203E",
    "OverBrace;": "\u23DE",
    "OverBracket;": "\u23B4",
    "OverParenthesis;": "\u23DC",
    "par;": "\u2225",
    "para;": "\u00B6",
    "para": "\u00B6",
    "parallel;": "\u2225",
    "parsim;": "\u2AF3",
    "parsl;": "\u2AFD",
    "part;": "\u2202",
    "PartialD;": "\u2202",
    "Pcy;": "\u041F",
    "pcy;": "\u043F",
    "percnt;": "\u0025",
    "period;": "\u002E",
    "permil;": "\u2030",
    "perp;": "\u22A5",
    "pertenk;": "\u2031",
    "Pfr;": "\uD835\uDD13",
    "pfr;": "\uD835\uDD2D",
    "Phi;": "\u03A6",
    "phi;": "\u03C6",
    "phiv;": "\u03D5",
    "phmmat;": "\u2133",
    "phone;": "\u260E",
    "Pi;": "\u03A0",
    "pi;": "\u03C0",
    "pitchfork;": "\u22D4",
    "piv;": "\u03D6",
    "planck;": "\u210F",
    "planckh;": "\u210E",
    "plankv;": "\u210F",
    "plus;": "\u002B",
    "plusacir;": "\u2A23",
    "plusb;": "\u229E",
    "pluscir;": "\u2A22",
    "plusdo;": "\u2214",
    "plusdu;": "\u2A25",
    "pluse;": "\u2A72",
    "PlusMinus;": "\u00B1",
    "plusmn;": "\u00B1",
    "plusmn": "\u00B1",
    "plussim;": "\u2A26",
    "plustwo;": "\u2A27",
    "pm;": "\u00B1",
    "Poincareplane;": "\u210C",
    "pointint;": "\u2A15",
    "Popf;": "\u2119",
    "popf;": "\uD835\uDD61",
    "pound;": "\u00A3",
    "pound": "\u00A3",
    "Pr;": "\u2ABB",
    "pr;": "\u227A",
    "prap;": "\u2AB7",
    "prcue;": "\u227C",
    "prE;": "\u2AB3",
    "pre;": "\u2AAF",
    "prec;": "\u227A",
    "precapprox;": "\u2AB7",
    "preccurlyeq;": "\u227C",
    "Precedes;": "\u227A",
    "PrecedesEqual;": "\u2AAF",
    "PrecedesSlantEqual;": "\u227C",
    "PrecedesTilde;": "\u227E",
    "preceq;": "\u2AAF",
    "precnapprox;": "\u2AB9",
    "precneqq;": "\u2AB5",
    "precnsim;": "\u22E8",
    "precsim;": "\u227E",
    "Prime;": "\u2033",
    "prime;": "\u2032",
    "primes;": "\u2119",
    "prnap;": "\u2AB9",
    "prnE;": "\u2AB5",
    "prnsim;": "\u22E8",
    "prod;": "\u220F",
    "Product;": "\u220F",
    "profalar;": "\u232E",
    "profline;": "\u2312",
    "profsurf;": "\u2313",
    "prop;": "\u221D",
    "Proportion;": "\u2237",
    "Proportional;": "\u221D",
    "propto;": "\u221D",
    "prsim;": "\u227E",
    "prurel;": "\u22B0",
    "Pscr;": "\uD835\uDCAB",
    "pscr;": "\uD835\uDCC5",
    "Psi;": "\u03A8",
    "psi;": "\u03C8",
    "puncsp;": "\u2008",
    "Qfr;": "\uD835\uDD14",
    "qfr;": "\uD835\uDD2E",
    "qint;": "\u2A0C",
    "Qopf;": "\u211A",
    "qopf;": "\uD835\uDD62",
    "qprime;": "\u2057",
    "Qscr;": "\uD835\uDCAC",
    "qscr;": "\uD835\uDCC6",
    "quaternions;": "\u210D",
    "quatint;": "\u2A16",
    "quest;": "\u003F",
    "questeq;": "\u225F",
    "QUOT;": "\u0022",
    "QUOT": "\u0022",
    "quot;": "\u0022",
    "quot": "\u0022",
    "rAarr;": "\u21DB",
    "race;": "\u223D\u0331",
    "Racute;": "\u0154",
    "racute;": "\u0155",
    "radic;": "\u221A",
    "raemptyv;": "\u29B3",
    "Rang;": "\u27EB",
    "rang;": "\u27E9",
    "rangd;": "\u2992",
    "range;": "\u29A5",
    "rangle;": "\u27E9",
    "raquo;": "\u00BB",
    "raquo": "\u00BB",
    "Rarr;": "\u21A0",
    "rArr;": "\u21D2",
    "rarr;": "\u2192",
    "rarrap;": "\u2975",
    "rarrb;": "\u21E5",
    "rarrbfs;": "\u2920",
    "rarrc;": "\u2933",
    "rarrfs;": "\u291E",
    "rarrhk;": "\u21AA",
    "rarrlp;": "\u21AC",
    "rarrpl;": "\u2945",
    "rarrsim;": "\u2974",
    "Rarrtl;": "\u2916",
    "rarrtl;": "\u21A3",
    "rarrw;": "\u219D",
    "rAtail;": "\u291C",
    "ratail;": "\u291A",
    "ratio;": "\u2236",
    "rationals;": "\u211A",
    "RBarr;": "\u2910",
    "rBarr;": "\u290F",
    "rbarr;": "\u290D",
    "rbbrk;": "\u2773",
    "rbrace;": "\u007D",
    "rbrack;": "\u005D",
    "rbrke;": "\u298C",
    "rbrksld;": "\u298E",
    "rbrkslu;": "\u2990",
    "Rcaron;": "\u0158",
    "rcaron;": "\u0159",
    "Rcedil;": "\u0156",
    "rcedil;": "\u0157",
    "rceil;": "\u2309",
    "rcub;": "\u007D",
    "Rcy;": "\u0420",
    "rcy;": "\u0440",
    "rdca;": "\u2937",
    "rdldhar;": "\u2969",
    "rdquo;": "\u201D",
    "rdquor;": "\u201D",
    "rdsh;": "\u21B3",
    "Re;": "\u211C",
    "real;": "\u211C",
    "realine;": "\u211B",
    "realpart;": "\u211C",
    "reals;": "\u211D",
    "rect;": "\u25AD",
    "REG;": "\u00AE",
    "REG": "\u00AE",
    "reg;": "\u00AE",
    "reg": "\u00AE",
    "ReverseElement;": "\u220B",
    "ReverseEquilibrium;": "\u21CB",
    "ReverseUpEquilibrium;": "\u296F",
    "rfisht;": "\u297D",
    "rfloor;": "\u230B",
    "Rfr;": "\u211C",
    "rfr;": "\uD835\uDD2F",
    "rHar;": "\u2964",
    "rhard;": "\u21C1",
    "rharu;": "\u21C0",
    "rharul;": "\u296C",
    "Rho;": "\u03A1",
    "rho;": "\u03C1",
    "rhov;": "\u03F1",
    "RightAngleBracket;": "\u27E9",
    "RightArrow;": "\u2192",
    "Rightarrow;": "\u21D2",
    "rightarrow;": "\u2192",
    "RightArrowBar;": "\u21E5",
    "RightArrowLeftArrow;": "\u21C4",
    "rightarrowtail;": "\u21A3",
    "RightCeiling;": "\u2309",
    "RightDoubleBracket;": "\u27E7",
    "RightDownTeeVector;": "\u295D",
    "RightDownVector;": "\u21C2",
    "RightDownVectorBar;": "\u2955",
    "RightFloor;": "\u230B",
    "rightharpoondown;": "\u21C1",
    "rightharpoonup;": "\u21C0",
    "rightleftarrows;": "\u21C4",
    "rightleftharpoons;": "\u21CC",
    "rightrightarrows;": "\u21C9",
    "rightsquigarrow;": "\u219D",
    "RightTee;": "\u22A2",
    "RightTeeArrow;": "\u21A6",
    "RightTeeVector;": "\u295B",
    "rightthreetimes;": "\u22CC",
    "RightTriangle;": "\u22B3",
    "RightTriangleBar;": "\u29D0",
    "RightTriangleEqual;": "\u22B5",
    "RightUpDownVector;": "\u294F",
    "RightUpTeeVector;": "\u295C",
    "RightUpVector;": "\u21BE",
    "RightUpVectorBar;": "\u2954",
    "RightVector;": "\u21C0",
    "RightVectorBar;": "\u2953",
    "ring;": "\u02DA",
    "risingdotseq;": "\u2253",
    "rlarr;": "\u21C4",
    "rlhar;": "\u21CC",
    "rlm;": "\u200F",
    "rmoust;": "\u23B1",
    "rmoustache;": "\u23B1",
    "rnmid;": "\u2AEE",
    "roang;": "\u27ED",
    "roarr;": "\u21FE",
    "robrk;": "\u27E7",
    "ropar;": "\u2986",
    "Ropf;": "\u211D",
    "ropf;": "\uD835\uDD63",
    "roplus;": "\u2A2E",
    "rotimes;": "\u2A35",
    "RoundImplies;": "\u2970",
    "rpar;": "\u0029",
    "rpargt;": "\u2994",
    "rppolint;": "\u2A12",
    "rrarr;": "\u21C9",
    "Rrightarrow;": "\u21DB",
    "rsaquo;": "\u203A",
    "Rscr;": "\u211B",
    "rscr;": "\uD835\uDCC7",
    "Rsh;": "\u21B1",
    "rsh;": "\u21B1",
    "rsqb;": "\u005D",
    "rsquo;": "\u2019",
    "rsquor;": "\u2019",
    "rthree;": "\u22CC",
    "rtimes;": "\u22CA",
    "rtri;": "\u25B9",
    "rtrie;": "\u22B5",
    "rtrif;": "\u25B8",
    "rtriltri;": "\u29CE",
    "RuleDelayed;": "\u29F4",
    "ruluhar;": "\u2968",
    "rx;": "\u211E",
    "Sacute;": "\u015A",
    "sacute;": "\u015B",
    "sbquo;": "\u201A",
    "Sc;": "\u2ABC",
    "sc;": "\u227B",
    "scap;": "\u2AB8",
    "Scaron;": "\u0160",
    "scaron;": "\u0161",
    "sccue;": "\u227D",
    "scE;": "\u2AB4",
    "sce;": "\u2AB0",
    "Scedil;": "\u015E",
    "scedil;": "\u015F",
    "Scirc;": "\u015C",
    "scirc;": "\u015D",
    "scnap;": "\u2ABA",
    "scnE;": "\u2AB6",
    "scnsim;": "\u22E9",
    "scpolint;": "\u2A13",
    "scsim;": "\u227F",
    "Scy;": "\u0421",
    "scy;": "\u0441",
    "sdot;": "\u22C5",
    "sdotb;": "\u22A1",
    "sdote;": "\u2A66",
    "searhk;": "\u2925",
    "seArr;": "\u21D8",
    "searr;": "\u2198",
    "searrow;": "\u2198",
    "sect;": "\u00A7",
    "sect": "\u00A7",
    "semi;": "\u003B",
    "seswar;": "\u2929",
    "setminus;": "\u2216",
    "setmn;": "\u2216",
    "sext;": "\u2736",
    "Sfr;": "\uD835\uDD16",
    "sfr;": "\uD835\uDD30",
    "sfrown;": "\u2322",
    "sharp;": "\u266F",
    "SHCHcy;": "\u0429",
    "shchcy;": "\u0449",
    "SHcy;": "\u0428",
    "shcy;": "\u0448",
    "ShortDownArrow;": "\u2193",
    "ShortLeftArrow;": "\u2190",
    "shortmid;": "\u2223",
    "shortparallel;": "\u2225",
    "ShortRightArrow;": "\u2192",
    "ShortUpArrow;": "\u2191",
    "shy;": "\u00AD",
    "shy": "\u00AD",
    "Sigma;": "\u03A3",
    "sigma;": "\u03C3",
    "sigmaf;": "\u03C2",
    "sigmav;": "\u03C2",
    "sim;": "\u223C",
    "simdot;": "\u2A6A",
    "sime;": "\u2243",
    "simeq;": "\u2243",
    "simg;": "\u2A9E",
    "simgE;": "\u2AA0",
    "siml;": "\u2A9D",
    "simlE;": "\u2A9F",
    "simne;": "\u2246",
    "simplus;": "\u2A24",
    "simrarr;": "\u2972",
    "slarr;": "\u2190",
    "SmallCircle;": "\u2218",
    "smallsetminus;": "\u2216",
    "smashp;": "\u2A33",
    "smeparsl;": "\u29E4",
    "smid;": "\u2223",
    "smile;": "\u2323",
    "smt;": "\u2AAA",
    "smte;": "\u2AAC",
    "smtes;": "\u2AAC\uFE00",
    "SOFTcy;": "\u042C",
    "softcy;": "\u044C",
    "sol;": "\u002F",
    "solb;": "\u29C4",
    "solbar;": "\u233F",
    "Sopf;": "\uD835\uDD4A",
    "sopf;": "\uD835\uDD64",
    "spades;": "\u2660",
    "spadesuit;": "\u2660",
    "spar;": "\u2225",
    "sqcap;": "\u2293",
    "sqcaps;": "\u2293\uFE00",
    "sqcup;": "\u2294",
    "sqcups;": "\u2294\uFE00",
    "Sqrt;": "\u221A",
    "sqsub;": "\u228F",
    "sqsube;": "\u2291",
    "sqsubset;": "\u228F",
    "sqsubseteq;": "\u2291",
    "sqsup;": "\u2290",
    "sqsupe;": "\u2292",
    "sqsupset;": "\u2290",
    "sqsupseteq;": "\u2292",
    "squ;": "\u25A1",
    "Square;": "\u25A1",
    "square;": "\u25A1",
    "SquareIntersection;": "\u2293",
    "SquareSubset;": "\u228F",
    "SquareSubsetEqual;": "\u2291",
    "SquareSuperset;": "\u2290",
    "SquareSupersetEqual;": "\u2292",
    "SquareUnion;": "\u2294",
    "squarf;": "\u25AA",
    "squf;": "\u25AA",
    "srarr;": "\u2192",
    "Sscr;": "\uD835\uDCAE",
    "sscr;": "\uD835\uDCC8",
    "ssetmn;": "\u2216",
    "ssmile;": "\u2323",
    "sstarf;": "\u22C6",
    "Star;": "\u22C6",
    "star;": "\u2606",
    "starf;": "\u2605",
    "straightepsilon;": "\u03F5",
    "straightphi;": "\u03D5",
    "strns;": "\u00AF",
    "Sub;": "\u22D0",
    "sub;": "\u2282",
    "subdot;": "\u2ABD",
    "subE;": "\u2AC5",
    "sube;": "\u2286",
    "subedot;": "\u2AC3",
    "submult;": "\u2AC1",
    "subnE;": "\u2ACB",
    "subne;": "\u228A",
    "subplus;": "\u2ABF",
    "subrarr;": "\u2979",
    "Subset;": "\u22D0",
    "subset;": "\u2282",
    "subseteq;": "\u2286",
    "subseteqq;": "\u2AC5",
    "SubsetEqual;": "\u2286",
    "subsetneq;": "\u228A",
    "subsetneqq;": "\u2ACB",
    "subsim;": "\u2AC7",
    "subsub;": "\u2AD5",
    "subsup;": "\u2AD3",
    "succ;": "\u227B",
    "succapprox;": "\u2AB8",
    "succcurlyeq;": "\u227D",
    "Succeeds;": "\u227B",
    "SucceedsEqual;": "\u2AB0",
    "SucceedsSlantEqual;": "\u227D",
    "SucceedsTilde;": "\u227F",
    "succeq;": "\u2AB0",
    "succnapprox;": "\u2ABA",
    "succneqq;": "\u2AB6",
    "succnsim;": "\u22E9",
    "succsim;": "\u227F",
    "SuchThat;": "\u220B",
    "Sum;": "\u2211",
    "sum;": "\u2211",
    "sung;": "\u266A",
    "Sup;": "\u22D1",
    "sup;": "\u2283",
    "sup1;": "\u00B9",
    "sup1": "\u00B9",
    "sup2;": "\u00B2",
    "sup2": "\u00B2",
    "sup3;": "\u00B3",
    "sup3": "\u00B3",
    "supdot;": "\u2ABE",
    "supdsub;": "\u2AD8",
    "supE;": "\u2AC6",
    "supe;": "\u2287",
    "supedot;": "\u2AC4",
    "Superset;": "\u2283",
    "SupersetEqual;": "\u2287",
    "suphsol;": "\u27C9",
    "suphsub;": "\u2AD7",
    "suplarr;": "\u297B",
    "supmult;": "\u2AC2",
    "supnE;": "\u2ACC",
    "supne;": "\u228B",
    "supplus;": "\u2AC0",
    "Supset;": "\u22D1",
    "supset;": "\u2283",
    "supseteq;": "\u2287",
    "supseteqq;": "\u2AC6",
    "supsetneq;": "\u228B",
    "supsetneqq;": "\u2ACC",
    "supsim;": "\u2AC8",
    "supsub;": "\u2AD4",
    "supsup;": "\u2AD6",
    "swarhk;": "\u2926",
    "swArr;": "\u21D9",
    "swarr;": "\u2199",
    "swarrow;": "\u2199",
    "swnwar;": "\u292A",
    "szlig;": "\u00DF",
    "szlig": "\u00DF",
    "Tab;": "\u0009",
    "target;": "\u2316",
    "Tau;": "\u03A4",
    "tau;": "\u03C4",
    "tbrk;": "\u23B4",
    "Tcaron;": "\u0164",
    "tcaron;": "\u0165",
    "Tcedil;": "\u0162",
    "tcedil;": "\u0163",
    "Tcy;": "\u0422",
    "tcy;": "\u0442",
    "tdot;": "\u20DB",
    "telrec;": "\u2315",
    "Tfr;": "\uD835\uDD17",
    "tfr;": "\uD835\uDD31",
    "there4;": "\u2234",
    "Therefore;": "\u2234",
    "therefore;": "\u2234",
    "Theta;": "\u0398",
    "theta;": "\u03B8",
    "thetasym;": "\u03D1",
    "thetav;": "\u03D1",
    "thickapprox;": "\u2248",
    "thicksim;": "\u223C",
    "ThickSpace;": "\u205F\u200A",
    "thinsp;": "\u2009",
    "ThinSpace;": "\u2009",
    "thkap;": "\u2248",
    "thksim;": "\u223C",
    "THORN;": "\u00DE",
    "THORN": "\u00DE",
    "thorn;": "\u00FE",
    "thorn": "\u00FE",
    "Tilde;": "\u223C",
    "tilde;": "\u02DC",
    "TildeEqual;": "\u2243",
    "TildeFullEqual;": "\u2245",
    "TildeTilde;": "\u2248",
    "times;": "\u00D7",
    "times": "\u00D7",
    "timesb;": "\u22A0",
    "timesbar;": "\u2A31",
    "timesd;": "\u2A30",
    "tint;": "\u222D",
    "toea;": "\u2928",
    "top;": "\u22A4",
    "topbot;": "\u2336",
    "topcir;": "\u2AF1",
    "Topf;": "\uD835\uDD4B",
    "topf;": "\uD835\uDD65",
    "topfork;": "\u2ADA",
    "tosa;": "\u2929",
    "tprime;": "\u2034",
    "TRADE;": "\u2122",
    "trade;": "\u2122",
    "triangle;": "\u25B5",
    "triangledown;": "\u25BF",
    "triangleleft;": "\u25C3",
    "trianglelefteq;": "\u22B4",
    "triangleq;": "\u225C",
    "triangleright;": "\u25B9",
    "trianglerighteq;": "\u22B5",
    "tridot;": "\u25EC",
    "trie;": "\u225C",
    "triminus;": "\u2A3A",
    "TripleDot;": "\u20DB",
    "triplus;": "\u2A39",
    "trisb;": "\u29CD",
    "tritime;": "\u2A3B",
    "trpezium;": "\u23E2",
    "Tscr;": "\uD835\uDCAF",
    "tscr;": "\uD835\uDCC9",
    "TScy;": "\u0426",
    "tscy;": "\u0446",
    "TSHcy;": "\u040B",
    "tshcy;": "\u045B",
    "Tstrok;": "\u0166",
    "tstrok;": "\u0167",
    "twixt;": "\u226C",
    "twoheadleftarrow;": "\u219E",
    "twoheadrightarrow;": "\u21A0",
    "Uacute;": "\u00DA",
    "Uacute": "\u00DA",
    "uacute;": "\u00FA",
    "uacute": "\u00FA",
    "Uarr;": "\u219F",
    "uArr;": "\u21D1",
    "uarr;": "\u2191",
    "Uarrocir;": "\u2949",
    "Ubrcy;": "\u040E",
    "ubrcy;": "\u045E",
    "Ubreve;": "\u016C",
    "ubreve;": "\u016D",
    "Ucirc;": "\u00DB",
    "Ucirc": "\u00DB",
    "ucirc;": "\u00FB",
    "ucirc": "\u00FB",
    "Ucy;": "\u0423",
    "ucy;": "\u0443",
    "udarr;": "\u21C5",
    "Udblac;": "\u0170",
    "udblac;": "\u0171",
    "udhar;": "\u296E",
    "ufisht;": "\u297E",
    "Ufr;": "\uD835\uDD18",
    "ufr;": "\uD835\uDD32",
    "Ugrave;": "\u00D9",
    "Ugrave": "\u00D9",
    "ugrave;": "\u00F9",
    "ugrave": "\u00F9",
    "uHar;": "\u2963",
    "uharl;": "\u21BF",
    "uharr;": "\u21BE",
    "uhblk;": "\u2580",
    "ulcorn;": "\u231C",
    "ulcorner;": "\u231C",
    "ulcrop;": "\u230F",
    "ultri;": "\u25F8",
    "Umacr;": "\u016A",
    "umacr;": "\u016B",
    "uml;": "\u00A8",
    "uml": "\u00A8",
    "UnderBar;": "\u005F",
    "UnderBrace;": "\u23DF",
    "UnderBracket;": "\u23B5",
    "UnderParenthesis;": "\u23DD",
    "Union;": "\u22C3",
    "UnionPlus;": "\u228E",
    "Uogon;": "\u0172",
    "uogon;": "\u0173",
    "Uopf;": "\uD835\uDD4C",
    "uopf;": "\uD835\uDD66",
    "UpArrow;": "\u2191",
    "Uparrow;": "\u21D1",
    "uparrow;": "\u2191",
    "UpArrowBar;": "\u2912",
    "UpArrowDownArrow;": "\u21C5",
    "UpDownArrow;": "\u2195",
    "Updownarrow;": "\u21D5",
    "updownarrow;": "\u2195",
    "UpEquilibrium;": "\u296E",
    "upharpoonleft;": "\u21BF",
    "upharpoonright;": "\u21BE",
    "uplus;": "\u228E",
    "UpperLeftArrow;": "\u2196",
    "UpperRightArrow;": "\u2197",
    "Upsi;": "\u03D2",
    "upsi;": "\u03C5",
    "upsih;": "\u03D2",
    "Upsilon;": "\u03A5",
    "upsilon;": "\u03C5",
    "UpTee;": "\u22A5",
    "UpTeeArrow;": "\u21A5",
    "upuparrows;": "\u21C8",
    "urcorn;": "\u231D",
    "urcorner;": "\u231D",
    "urcrop;": "\u230E",
    "Uring;": "\u016E",
    "uring;": "\u016F",
    "urtri;": "\u25F9",
    "Uscr;": "\uD835\uDCB0",
    "uscr;": "\uD835\uDCCA",
    "utdot;": "\u22F0",
    "Utilde;": "\u0168",
    "utilde;": "\u0169",
    "utri;": "\u25B5",
    "utrif;": "\u25B4",
    "uuarr;": "\u21C8",
    "Uuml;": "\u00DC",
    "Uuml": "\u00DC",
    "uuml;": "\u00FC",
    "uuml": "\u00FC",
    "uwangle;": "\u29A7",
    "vangrt;": "\u299C",
    "varepsilon;": "\u03F5",
    "varkappa;": "\u03F0",
    "varnothing;": "\u2205",
    "varphi;": "\u03D5",
    "varpi;": "\u03D6",
    "varpropto;": "\u221D",
    "vArr;": "\u21D5",
    "varr;": "\u2195",
    "varrho;": "\u03F1",
    "varsigma;": "\u03C2",
    "varsubsetneq;": "\u228A\uFE00",
    "varsubsetneqq;": "\u2ACB\uFE00",
    "varsupsetneq;": "\u228B\uFE00",
    "varsupsetneqq;": "\u2ACC\uFE00",
    "vartheta;": "\u03D1",
    "vartriangleleft;": "\u22B2",
    "vartriangleright;": "\u22B3",
    "Vbar;": "\u2AEB",
    "vBar;": "\u2AE8",
    "vBarv;": "\u2AE9",
    "Vcy;": "\u0412",
    "vcy;": "\u0432",
    "VDash;": "\u22AB",
    "Vdash;": "\u22A9",
    "vDash;": "\u22A8",
    "vdash;": "\u22A2",
    "Vdashl;": "\u2AE6",
    "Vee;": "\u22C1",
    "vee;": "\u2228",
    "veebar;": "\u22BB",
    "veeeq;": "\u225A",
    "vellip;": "\u22EE",
    "Verbar;": "\u2016",
    "verbar;": "\u007C",
    "Vert;": "\u2016",
    "vert;": "\u007C",
    "VerticalBar;": "\u2223",
    "VerticalLine;": "\u007C",
    "VerticalSeparator;": "\u2758",
    "VerticalTilde;": "\u2240",
    "VeryThinSpace;": "\u200A",
    "Vfr;": "\uD835\uDD19",
    "vfr;": "\uD835\uDD33",
    "vltri;": "\u22B2",
    "vnsub;": "\u2282\u20D2",
    "vnsup;": "\u2283\u20D2",
    "Vopf;": "\uD835\uDD4D",
    "vopf;": "\uD835\uDD67",
    "vprop;": "\u221D",
    "vrtri;": "\u22B3",
    "Vscr;": "\uD835\uDCB1",
    "vscr;": "\uD835\uDCCB",
    "vsubnE;": "\u2ACB\uFE00",
    "vsubne;": "\u228A\uFE00",
    "vsupnE;": "\u2ACC\uFE00",
    "vsupne;": "\u228B\uFE00",
    "Vvdash;": "\u22AA",
    "vzigzag;": "\u299A",
    "Wcirc;": "\u0174",
    "wcirc;": "\u0175",
    "wedbar;": "\u2A5F",
    "Wedge;": "\u22C0",
    "wedge;": "\u2227",
    "wedgeq;": "\u2259",
    "weierp;": "\u2118",
    "Wfr;": "\uD835\uDD1A",
    "wfr;": "\uD835\uDD34",
    "Wopf;": "\uD835\uDD4E",
    "wopf;": "\uD835\uDD68",
    "wp;": "\u2118",
    "wr;": "\u2240",
    "wreath;": "\u2240",
    "Wscr;": "\uD835\uDCB2",
    "wscr;": "\uD835\uDCCC",
    "xcap;": "\u22C2",
    "xcirc;": "\u25EF",
    "xcup;": "\u22C3",
    "xdtri;": "\u25BD",
    "Xfr;": "\uD835\uDD1B",
    "xfr;": "\uD835\uDD35",
    "xhArr;": "\u27FA",
    "xharr;": "\u27F7",
    "Xi;": "\u039E",
    "xi;": "\u03BE",
    "xlArr;": "\u27F8",
    "xlarr;": "\u27F5",
    "xmap;": "\u27FC",
    "xnis;": "\u22FB",
    "xodot;": "\u2A00",
    "Xopf;": "\uD835\uDD4F",
    "xopf;": "\uD835\uDD69",
    "xoplus;": "\u2A01",
    "xotime;": "\u2A02",
    "xrArr;": "\u27F9",
    "xrarr;": "\u27F6",
    "Xscr;": "\uD835\uDCB3",
    "xscr;": "\uD835\uDCCD",
    "xsqcup;": "\u2A06",
    "xuplus;": "\u2A04",
    "xutri;": "\u25B3",
    "xvee;": "\u22C1",
    "xwedge;": "\u22C0",
    "Yacute;": "\u00DD",
    "Yacute": "\u00DD",
    "yacute;": "\u00FD",
    "yacute": "\u00FD",
    "YAcy;": "\u042F",
    "yacy;": "\u044F",
    "Ycirc;": "\u0176",
    "ycirc;": "\u0177",
    "Ycy;": "\u042B",
    "ycy;": "\u044B",
    "yen;": "\u00A5",
    "yen": "\u00A5",
    "Yfr;": "\uD835\uDD1C",
    "yfr;": "\uD835\uDD36",
    "YIcy;": "\u0407",
    "yicy;": "\u0457",
    "Yopf;": "\uD835\uDD50",
    "yopf;": "\uD835\uDD6A",
    "Yscr;": "\uD835\uDCB4",
    "yscr;": "\uD835\uDCCE",
    "YUcy;": "\u042E",
    "yucy;": "\u044E",
    "Yuml;": "\u0178",
    "yuml;": "\u00FF",
    "yuml": "\u00FF",
    "Zacute;": "\u0179",
    "zacute;": "\u017A",
    "Zcaron;": "\u017D",
    "zcaron;": "\u017E",
    "Zcy;": "\u0417",
    "zcy;": "\u0437",
    "Zdot;": "\u017B",
    "zdot;": "\u017C",
    "zeetrf;": "\u2128",
    "ZeroWidthSpace;": "\u200B",
    "Zeta;": "\u0396",
    "zeta;": "\u03B6",
    "Zfr;": "\u2128",
    "zfr;": "\uD835\uDD37",
    "ZHcy;": "\u0416",
    "zhcy;": "\u0436",
    "zigrarr;": "\u21DD",
    "Zopf;": "\u2124",
    "zopf;": "\uD835\uDD6B",
    "Zscr;": "\uD835\uDCB5",
    "zscr;": "\uD835\uDCCF",
    "zwj;": "\u200D",
    "zwnj;": "\u200C"
};
//# sourceMappingURL=htmlEntities.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/utils/strings.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function strings_startsWith(haystack, needle) {
    if (haystack.length < needle.length) {
        return false;
    }
    for (var i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
            return false;
        }
    }
    return true;
}
/**
 * Determines if haystack ends with needle.
 */
function strings_endsWith(haystack, needle) {
    var diff = haystack.length - needle.length;
    if (diff > 0) {
        return haystack.lastIndexOf(needle) === diff;
    }
    else if (diff === 0) {
        return haystack === needle;
    }
    else {
        return false;
    }
}
/**
 * @returns the length of the common prefix of the two strings.
 */
function strings_commonPrefixLength(a, b) {
    var i;
    var len = Math.min(a.length, b.length);
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
            return i;
        }
    }
    return len;
}
function strings_repeat(value, count) {
    var s = '';
    while (count > 0) {
        if ((count & 1) === 1) {
            s += value;
        }
        value += value;
        count = count >>> 1;
    }
    return s;
}
var strings_a = 'a'.charCodeAt(0);
var _z = 'z'.charCodeAt(0);
var _A = 'A'.charCodeAt(0);
var _Z = 'Z'.charCodeAt(0);
var _0 = '0'.charCodeAt(0);
var _9 = '9'.charCodeAt(0);
function isLetterOrDigit(text, index) {
    var c = text.charCodeAt(index);
    return (strings_a <= c && c <= _z) || (_A <= c && c <= _Z) || (_0 <= c && c <= _9);
}
//# sourceMappingURL=strings.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/dataProvider.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var HTMLDataProvider = /** @class */ (function () {
    /**
     * Currently, unversioned data uses the V1 implementation
     * In the future when the provider handles multiple versions of HTML custom data,
     * use the latest implementation for unversioned data
     */
    function HTMLDataProvider(id, customData) {
        var _this = this;
        this.id = id;
        this._tags = [];
        this._tagMap = {};
        this._attributeMap = {};
        this._valueSetMap = {};
        this._tags = customData.tags || [];
        this._globalAttributes = customData.globalAttributes || [];
        this._tags.forEach(function (t) {
            _this._tagMap[t.name] = t;
            if (t.attributes) {
                t.attributes.forEach(function (a) {
                    _this._attributeMap[a.name] = a;
                });
            }
        });
        this._globalAttributes.forEach(function (a) {
            _this._attributeMap[a.name] = a;
        });
        if (customData.valueSets) {
            customData.valueSets.forEach(function (vs) {
                _this._valueSetMap[vs.name] = vs.values;
            });
        }
    }
    HTMLDataProvider.prototype.isApplicable = function () {
        return true;
    };
    HTMLDataProvider.prototype.getId = function () {
        return this.id;
    };
    HTMLDataProvider.prototype.provideTags = function () {
        return this._tags;
    };
    HTMLDataProvider.prototype.provideAttributes = function (tag) {
        var attributes = [];
        var processAttribute = function (a) {
            attributes.push({
                name: a.name,
                description: a.description,
                valueSet: a.valueSet
            });
        };
        if (this._tagMap[tag]) {
            this._tagMap[tag].attributes.forEach(function (a) {
                processAttribute(a);
            });
        }
        this._globalAttributes.forEach(function (ga) {
            processAttribute(ga);
        });
        return attributes;
    };
    HTMLDataProvider.prototype.provideValues = function (tag, attribute) {
        var _this = this;
        var values = [];
        var processAttributes = function (attributes) {
            attributes.forEach(function (a) {
                if (a.name === attribute) {
                    if (a.values) {
                        a.values.forEach(function (v) {
                            values.push(v);
                        });
                    }
                    if (a.valueSet) {
                        if (_this._valueSetMap[a.valueSet]) {
                            _this._valueSetMap[a.valueSet].forEach(function (v) {
                                values.push(v);
                            });
                        }
                    }
                }
            });
        };
        if (!this._tagMap[tag]) {
            return [];
        }
        processAttributes(this._tagMap[tag].attributes);
        processAttributes(this._globalAttributes);
        return values;
    };
    return HTMLDataProvider;
}());

//# sourceMappingURL=dataProvider.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/data/html5Tags.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var HTML5_TAGS = [
    {
        "name": "html",
        "description": "The html element represents the root of an HTML document.",
        "attributes": [
            {
                "name": "manifest",
                "description": "Specifies the URI of a resource manifest indicating resources that should be cached locally. See [Using the application cache](/en-US/docs/Web/HTML/Using_the_application_cache) for details."
            },
            {
                "name": "version",
                "description": "Specifies the version of the HTML [Document Type Definition](/en-US/docs/Glossary/DTD \"Document Type Definition: In HTML, the doctype is the required \"<!DOCTYPE html>\" preamble found at the top of all documents. Its sole purpose is to prevent a browser from switching into so-called “quirks mode” when rendering a document; that is, the \"<!DOCTYPE html>\" doctype ensures that the browser makes a best-effort attempt at following the relevant specifications, rather than using a different rendering mode that is incompatible with some specifications.\") that governs the current document. This attribute is not needed, because it is redundant with the version information in the document type declaration."
            },
            {
                "name": "xmlns",
                "description": "Specifies the XML Namespace of the document. Default value is `\"http://www.w3.org/1999/xhtml\"`. This is required in documents parsed with XML parsers, and optional in text/html documents."
            }
        ]
    },
    {
        "name": "head",
        "description": "The head element represents a collection of metadata for the Document.",
        "attributes": [
            {
                "name": "profile",
                "description": "The URIs of one or more metadata profiles, separated by white space."
            }
        ]
    },
    {
        "name": "title",
        "description": "The title element represents the document's title or name. Authors should use titles that identify their documents even when they are used out of context, for example in a user's history or bookmarks, or in search results. The document's title is often different from its first heading, since the first heading does not have to stand alone when taken out of context.",
        "attributes": []
    },
    {
        "name": "base",
        "description": "The base element allows authors to specify the document base URL for the purposes of resolving relative URLs, and the name of the default browsing context for the purposes of following hyperlinks. The element does not represent any content beyond this information.",
        "attributes": [
            {
                "name": "href",
                "description": "The base URL to be used throughout the document for relative URL addresses. If this attribute is specified, this element must come before any other elements with attributes whose values are URLs. Absolute and relative URLs are allowed."
            },
            {
                "name": "target",
                "description": "A name or keyword indicating the default location to display the result when hyperlinks or forms cause navigation, for elements that do not have an explicit target reference. It is a name of, or keyword for, a _browsing context_ (for example: tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the result into the same browsing context as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the result into a new unnamed browsing context.\n*   `_parent`: Load the result into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: Load the result into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n\nIf this attribute is specified, this element must come before any other elements with attributes whose values are URLs."
            }
        ]
    },
    {
        "name": "link",
        "description": "The link element allows authors to link their document to other resources.",
        "attributes": [
            {
                "name": "href",
                "description": "This attribute specifies the [URL](/en-US/docs/Glossary/URL \"URL: Uniform Resource Locator (URL) is a text string specifying where a resource can be found on the Internet.\") of the linked resource. A URL can be absolute or relative."
            },
            {
                "name": "crossorigin",
                "valueSet": "xo",
                "description": "This enumerated attribute indicates whether [CORS](/en-US/docs/Glossary/CORS \"CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.\") must be used when fetching the resource. [CORS-enabled images](/en-US/docs/Web/HTML/CORS_Enabled_Image) can be reused in the [`<canvas>`](/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") element without being _tainted_. The allowed values are:\n\n`anonymous`\n\nA cross-origin request (i.e. with an [`Origin`](/en-US/docs/Web/HTTP/Headers/Origin \"The Origin request header indicates where a fetch originates from. It doesn't include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn't disclose the whole path.\") HTTP header) is performed, but no credential is sent (i.e. no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin \"The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.\") HTTP header) the image will be tainted and its usage restricted.\n\n`use-credentials`\n\nA cross-origin request (i.e. with an `Origin` HTTP header) is performed along with a credential sent (i.e. a cookie, certificate, and/or HTTP Basic authentication is performed). If the server does not give credentials to the origin site (through [`Access-Control-Allow-Credentials`](/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials \"The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is \"include\".\") HTTP header), the resource will be _tainted_ and its usage restricted.\n\nIf the attribute is not present, the resource is fetched without a [CORS](/en-US/docs/Glossary/CORS \"CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.\") request (i.e. without sending the `Origin` HTTP header), preventing its non-tainted usage. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](/en-US/docs/Web/HTML/CORS_settings_attributes) for additional information."
            },
            {
                "name": "rel",
                "description": "This attribute names a relationship of the linked document to the current document. The attribute must be a space-separated list of the [link types values](/en-US/docs/Web/HTML/Link_types)."
            },
            {
                "name": "media",
                "description": "This attribute specifies the media that the linked resource applies to. Its value must be a media type / [media query](/en-US/docs/Web/CSS/Media_queries). This attribute is mainly useful when linking to external stylesheets — it allows the user agent to pick the best adapted one for the device it runs on.\n\n**Notes:**\n\n*   In HTML 4, this can only be a simple white-space-separated list of media description literals, i.e., [media types and groups](/en-US/docs/Web/CSS/@media), where defined and allowed as values for this attribute, such as `print`, `screen`, `aural`, `braille`. HTML5 extended this to any kind of [media queries](/en-US/docs/Web/CSS/Media_queries), which are a superset of the allowed values of HTML 4.\n*   Browsers not supporting [CSS3 Media Queries](/en-US/docs/Web/CSS/Media_queries) won't necessarily recognize the adequate link; do not forget to set fallback links, the restricted set of media queries defined in HTML 4."
            },
            {
                "name": "hreflang",
                "description": "This attribute indicates the language of the linked resource. It is purely advisory. Allowed values are determined by [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt). Use this attribute only if the `[href](/en-US/docs/Web/HTML/Element/a#attr-href)` attribute is present."
            },
            {
                "name": "type",
                "description": "This attribute is used to define the type of the content linked to. The value of the attribute should be a MIME type such as **text/html**, **text/css**, and so on. The common use of this attribute is to define the type of stylesheet being referenced (such as **text/css**), but given that CSS is the only stylesheet language used on the web, not only is it possible to omit the `type` attribute, but is actually now recommended practice. It is also used on `rel=\"preload\"` link types, to make sure the browser only downloads file types that it supports."
            },
            {
                "name": "sizes",
                "description": "This attribute defines the sizes of the icons for visual media contained in the resource. It must be present only if the `[rel](/en-US/docs/Web/HTML/Element/link#attr-rel)` contains a value of `icon` or a non-standard type such as Apple's `apple-touch-icon`. It may have the following values:\n\n*   `any`, meaning that the icon can be scaled to any size as it is in a vector format, like `image/svg+xml`.\n*   a white-space separated list of sizes, each in the format `_<width in pixels>_x_<height in pixels>_` or `_<width in pixels>_X_<height in pixels>_`. Each of these sizes must be contained in the resource.\n\n**Note:** Most icon formats are only able to store one single icon; therefore most of the time the `[sizes](/en-US/docs/Web/HTML/Global_attributes#attr-sizes)` contains only one entry. MS's ICO format does, as well as Apple's ICNS. ICO is more ubiquitous; you should definitely use it."
            },
            {
                "name": "as",
                "description": "This attribute is only used when `rel=\"preload\"` or `rel=\"prefetch\"` has been set on the `<link>` element. It specifies the type of content being loaded by the `<link>`, which is necessary for content prioritization, request matching, application of correct [content security policy](/en-US/docs/Web/HTTP/CSP), and setting of correct [`Accept`](/en-US/docs/Web/HTTP/Headers/Accept \"The Accept request HTTP header advertises which content types, expressed as MIME types, the client is able to understand. Using content negotiation, the server then selects one of the proposals, uses it and informs the client of its choice with the Content-Type response header. Browsers set adequate values for this header depending on the context where the request is done: when fetching a CSS stylesheet a different value is set for the request than when fetching an image, video or a script.\") request header."
            },
            {
                "name": "importance",
                "description": "Indicates the relative importance of the resource. Priority hints are delegated using the values:"
            },
            {
                "name": "importance",
                "description": "**`auto`**: Indicates **no preference**. The browser may use its own heuristics to decide the priority of the resource.\n\n**`high`**: Indicates to the browser that the resource is of **high** priority.\n\n**`low`**: Indicates to the browser that the resource is of **low** priority.\n\n**Note:** The `importance` attribute may only be used for the `<link>` element if `rel=\"preload\"` or `rel=\"prefetch\"` is present."
            },
            {
                "name": "integrity",
                "description": "Contains inline metadata — a base64-encoded cryptographic hash of the resource (file) you’re telling the browser to fetch. The browser can use this to verify that the fetched resource has been delivered free of unexpected manipulation. See [Subresource Integrity](/en-US/docs/Web/Security/Subresource_Integrity)."
            },
            {
                "name": "referrerpolicy",
                "description": "A string indicating which referrer to use when fetching the resource:\n\n*   `no-referrer` means that the [`Referer`](/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade` means that no [`Referer`](/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior, if no policy is otherwise specified.\n*   `origin` means that the referrer will be the origin of the page, which is roughly the scheme, the host, and the port.\n*   `origin-when-cross-origin` means that navigating to other origins will be limited to the scheme, the host, and the port, while navigating on the same origin will include the referrer's path.\n*   `unsafe-url` means that the referrer will include the origin and the path (but not the fragment, password, or username). This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins."
            },
            {
                "name": "title",
                "description": "The `title` attribute has special semantics on the `<link>` element. When used on a `<link rel=\"stylesheet\">` it defines a [preferred or an alternate stylesheet](/en-US/docs/Web/CSS/Alternative_style_sheets). Incorrectly using it may [cause the stylesheet to be ignored](/en-US/docs/Correctly_Using_Titles_With_External_Stylesheets)."
            }
        ]
    },
    {
        "name": "meta",
        "description": "The meta element represents various kinds of metadata that cannot be expressed using the title, base, link, style, and script elements.",
        "attributes": [
            {
                "name": "name",
                "description": "This attribute defines the name of a piece of document-level metadata. It should not be set if one of the attributes `[itemprop](/en-US/docs/Web/HTML/Global_attributes#attr-itemprop)`, `[http-equiv](/en-US/docs/Web/HTML/Element/meta#attr-http-equiv)` or `[charset](/en-US/docs/Web/HTML/Element/meta#attr-charset)` is also set.\n\nThis metadata name is associated with the value contained by the `[content](/en-US/docs/Web/HTML/Element/meta#attr-content)` attribute. The possible values for the name attribute are:\n\n*   `application-name` which defines the name of the application running in the web page.\n    \n    **Note:**\n    \n    *   Browsers may use this to identify the application. It is different from the [`<title>`](/en-US/docs/Web/HTML/Element/title \"The HTML Title element (<title>) defines the document's title that is shown in a browser's title bar or a page's tab.\") element, which usually contain the application name, but may also contain information like the document name or a status.\n    *   Simple web pages shouldn't define an application-name.\n    \n*   `author` which defines the name of the document's author.\n*   `description` which contains a short and accurate summary of the content of the page. Several browsers, like Firefox and Opera, use this as the default description of bookmarked pages.\n*   `generator` which contains the identifier of the software that generated the page.\n*   `keywords` which contains words relevant to the page's content separated by commas.\n*   `referrer` which controls the [`Referer` HTTP header](/en-US/docs/Web/HTTP/Headers/Referer) attached to requests sent from the document:\n    \n    Values for the `content` attribute of `<meta name=\"referrer\">`\n    \n    `no-referrer`\n    \n    Do not send a HTTP `Referrer` header.\n    \n    `origin`\n    \n    Send the [origin](/en-US/docs/Glossary/Origin) of the document.\n    \n    `no-referrer-when-downgrade`\n    \n    Send the [origin](/en-US/docs/Glossary/Origin) as a referrer to URLs as secure as the current page, (https→https), but does not send a referrer to less secure URLs (https→http). This is the default behaviour.\n    \n    `origin-when-cross-origin`\n    \n    Send the full URL (stripped of parameters) for same-origin requests, but only send the [origin](/en-US/docs/Glossary/Origin) for other cases.\n    \n    `same-origin`\n    \n    A referrer will be sent for [same-site origins](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), but cross-origin requests will contain no referrer information.\n    \n    `strict-origin`\n    \n    Only send the origin of the document as the referrer to a-priori as-much-secure destination (HTTPS->HTTPS), but don't send it to a less secure destination (HTTPS->HTTP).\n    \n    `strict-origin-when-cross-origin`\n    \n    Send a full URL when performing a same-origin request, only send the origin of the document to a-priori as-much-secure destination (HTTPS->HTTPS), and send no header to a less secure destination (HTTPS->HTTP).\n    \n    `unsafe-URL`\n    \n    Send the full URL (stripped of parameters) for same-origin or cross-origin requests.\n    \n    **Notes:**\n    \n    *   Some browsers support the deprecated values of `always`, `default`, and `never` for referrer.\n    *   Dynamically inserting `<meta name=\"referrer\">` (with [`document.write`](/en-US/docs/Web/API/Document/write) or [`appendChild`](/en-US/docs/Web/API/Node/appendChild)) makes the referrer behaviour unpredictable.\n    *   When several conflicting policies are defined, the no-referrer policy is applied.\n    \n\nThis attribute may also have a value taken from the extended list defined on [WHATWG Wiki MetaExtensions page](https://wiki.whatwg.org/wiki/MetaExtensions). Although none have been formally accepted yet, a few commonly used names are:\n\n*   `creator` which defines the name of the creator of the document, such as an organization or institution. If there are more than one, several [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") elements should be used.\n*   `googlebot`, a synonym of `robots`, is only followed by Googlebot (the indexing crawler for Google).\n*   `publisher` which defines the name of the document's publisher.\n*   `robots` which defines the behaviour that cooperative crawlers, or \"robots\", should use with the page. It is a comma-separated list of the values below:\n    \n    Values for the content of `<meta name=\"robots\">`\n    \n    Value\n    \n    Description\n    \n    Used by\n    \n    `index`\n    \n    Allows the robot to index the page (default).\n    \n    All\n    \n    `noindex`\n    \n    Requests the robot to not index the page.\n    \n    All\n    \n    `follow`\n    \n    Allows the robot to follow the links on the page (default).\n    \n    All\n    \n    `nofollow`\n    \n    Requests the robot to not follow the links on the page.\n    \n    All\n    \n    `none`\n    \n    Equivalent to `noindex, nofollow`\n    \n    [Google](https://support.google.com/webmasters/answer/79812)\n    \n    `noodp`\n    \n    Prevents using the [Open Directory Project](https://www.dmoz.org/) description, if any, as the page description in search engine results.\n    \n    [Google](https://support.google.com/webmasters/answer/35624#nodmoz), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/meta-tags-robotstxt-yahoo-search-sln2213.html#cont5), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `noarchive`\n    \n    Requests the search engine not to cache the page content.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/SLN2213.html), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `nosnippet`\n    \n    Prevents displaying any description of the page in search engine results.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `noimageindex`\n    \n    Requests this page not to appear as the referring page of an indexed image.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives)\n    \n    `nocache`\n    \n    Synonym of `noarchive`.\n    \n    [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    **Notes:**\n    \n    *   Only cooperative robots follow these rules. Do not expect to prevent e-mail harvesters with them.\n    *   The robot still needs to access the page in order to read these rules. To prevent bandwidth consumption, use a _[robots.txt](/en-US/docs/Glossary/robots.txt \"robots.txt: Robots.txt is a file which is usually placed in the root of any website. It decides whether crawlers are permitted or forbidden access to the web site.\")_ file.\n    *   If you want to remove a page, `noindex` will work, but only after the robot visits the page again. Ensure that the `robots.txt` file is not preventing revisits.\n    *   Some values are mutually exclusive, like `index` and `noindex`, or `follow` and `nofollow`. In these cases the robot's behaviour is undefined and may vary between them.\n    *   Some crawler robots, like Google, Yahoo and Bing, support the same values for the HTTP header `X-Robots-Tag`; this allows non-HTML documents like images to use these rules.\n    \n*   `slurp`, is a synonym of `robots`, but only for Slurp - the crawler for Yahoo Search.\n*   `viewport`, which gives hints about the size of the initial size of the [viewport](/en-US/docs/Glossary/viewport \"viewport: A viewport represents a polygonal (normally rectangular) area in computer graphics that is currently being viewed. In web browser terms, it refers to the part of the document you're viewing which is currently visible in its window (or the screen, if the document is being viewed in full screen mode). Content outside the viewport is not visible onscreen until scrolled into view.\"). Used by mobile devices only.\n    \n    Values for the content of `<meta name=\"viewport\">`\n    \n    Value\n    \n    Possible subvalues\n    \n    Description\n    \n    `width`\n    \n    A positive integer number, or the text `device-width`\n    \n    Defines the pixel width of the viewport that you want the web site to be rendered at.\n    \n    `height`\n    \n    A positive integer, or the text `device-height`\n    \n    Defines the height of the viewport. Not used by any browser.\n    \n    `initial-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the ratio between the device width (`device-width` in portrait mode or `device-height` in landscape mode) and the viewport size.\n    \n    `maximum-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the maximum amount to zoom in. It must be greater or equal to the `minimum-scale` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.\n    \n    `minimum-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the minimum zoom level. It must be smaller or equal to the `maximum-scale` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.\n    \n    `user-scalable`\n    \n    `yes` or `no`\n    \n    If set to `no`, the user is not able to zoom in the webpage. The default is `yes`. Browser settings can ignore this rule, and iOS10+ ignores it by default.\n    \n    Specification\n    \n    Status\n    \n    Comment\n    \n    [CSS Device Adaptation  \n    The definition of '<meta name=\"viewport\">' in that specification.](https://drafts.csswg.org/css-device-adapt/#viewport-meta)\n    \n    Working Draft\n    \n    Non-normatively describes the Viewport META element\n    \n    See also: [`@viewport`](/en-US/docs/Web/CSS/@viewport \"The @viewport CSS at-rule lets you configure the viewport through which the document is viewed. It's primarily used for mobile devices, but is also used by desktop browsers that support features like \"snap to edge\" (such as Microsoft Edge).\")\n    \n    **Notes:**\n    \n    *   Though unstandardized, this declaration is respected by most mobile browsers due to de-facto dominance.\n    *   The default values may vary between devices and browsers.\n    *   To learn about this declaration in Firefox for Mobile, see [this article](/en-US/docs/Mobile/Viewport_meta_tag \"Mobile/Viewport meta tag\")."
            },
            {
                "name": "http-equiv",
                "description": "Defines a pragma directive. The attribute is named `**http-equiv**(alent)` because all the allowed values are names of particular HTTP headers:\n\n*   `\"content-language\"`  \n    Defines the default language of the page. It can be overridden by the [lang](/en-US/docs/Web/HTML/Global_attributes/lang) attribute on any element.\n    \n    **Warning:** Do not use this value, as it is obsolete. Prefer the `lang` attribute on the [`<html>`](/en-US/docs/Web/HTML/Element/html \"The HTML <html> element represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.\") element.\n    \n*   `\"content-security-policy\"`  \n    Allows page authors to define a [content policy](/en-US/docs/Web/Security/CSP/CSP_policy_directives) for the current page. Content policies mostly specify allowed server origins and script endpoints which help guard against cross-site scripting attacks.\n*   `\"content-type\"`  \n    Defines the [MIME type](/en-US/docs/Glossary/MIME_type) of the document, followed by its character encoding. It follows the same syntax as the HTTP `content-type` entity-header field, but as it is inside a HTML page, most values other than `text/html` are impossible. Therefore the valid syntax for its `content` is the string '`text/html`' followed by a character set with the following syntax: '`; charset=_IANAcharset_`', where `IANAcharset` is the _preferred MIME name_ for a character set as [defined by the IANA.](https://www.iana.org/assignments/character-sets)\n    \n    **Warning:** Do not use this value, as it is obsolete. Use the `[charset](/en-US/docs/Web/HTML/Element/meta#attr-charset)` attribute on the [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element.\n    \n    **Note:** As [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") can't change documents' types in XHTML or HTML5's XHTML serialization, never set the MIME type to an XHTML MIME type with `<meta>`.\n    \n*   `\"refresh\"`  \n    This instruction specifies:\n    *   The number of seconds until the page should be reloaded - only if the `[content](/en-US/docs/Web/HTML/Element/meta#attr-content)` attribute contains a positive integer.\n    *   The number of seconds until the page should redirect to another - only if the `[content](/en-US/docs/Web/HTML/Element/meta#attr-content)` attribute contains a positive integer followed by the string '`;url=`', and a valid URL.\n*   `\"set-cookie\"`  \n    Defines a [cookie](/en-US/docs/cookie) for the page. Its content must follow the syntax defined in the [IETF HTTP Cookie Specification](https://tools.ietf.org/html/draft-ietf-httpstate-cookie-14).\n    \n    **Warning:** Do not use this instruction, as it is obsolete. Use the HTTP header [`Set-Cookie`](/en-US/docs/Web/HTTP/Headers/Set-Cookie) instead."
            },
            {
                "name": "content",
                "description": "This attribute contains the value for the `[http-equiv](/en-US/docs/Web/HTML/Element/meta#attr-http-equiv)` or `[name](/en-US/docs/Web/HTML/Element/meta#attr-name)` attribute, depending on which is used."
            },
            {
                "name": "charset",
                "description": "This attribute declares the page's character encoding. It must contain a [standard IANA MIME name for character encodings](https://www.iana.org/assignments/character-sets). Although the standard doesn't request a specific encoding, it suggests:\n\n*   Authors are encouraged to use [`UTF-8`](/en-US/docs/Glossary/UTF-8).\n*   Authors should not use ASCII-incompatible encodings to avoid security risk: browsers not supporting them may interpret harmful content as HTML. This happens with the `JIS_C6226-1983`, `JIS_X0212-1990`, `HZ-GB-2312`, `JOHAB`, the ISO-2022 family and the EBCDIC family.\n\n**Note:** ASCII-incompatible encodings are those that don't map the 8-bit code points `0x20` to `0x7E` to the `0x0020` to `0x007E` Unicode code points)\n\n*   Authors **must not** use `CESU-8`, `UTF-7`, `BOCU-1` and/or `SCSU` as [cross-site scripting](/en-US/docs/Glossary/Cross-site_scripting) attacks with these encodings have been demonstrated.\n*   Authors should not use `UTF-32` because not all HTML5 encoding algorithms can distinguish it from `UTF-16`.\n\n**Notes:**\n\n*   The declared character encoding must match the one the page was saved with to avoid garbled characters and security holes.\n*   The [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element declaring the encoding must be inside the [`<head>`](/en-US/docs/Web/HTML/Element/head \"The HTML <head> element provides general information (metadata) about the document, including its title and links to its scripts and style sheets.\") element and **within the first 1024 bytes** of the HTML as some browsers only look at those bytes before choosing an encoding.\n*   This [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element is only one part of the [algorithm to determine a page's character set](https://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html#encoding-sniffing-algorithm \"Algorithm charset page\"). The [`Content-Type` header](/en-US/docs/Web/HTTP/Headers/Content-Type) and any [Byte-Order Marks](/en-US/docs/Glossary/Byte-Order_Mark \"The definition of that term (Byte-Order Marks) has not been written yet; please consider contributing it!\") override this element.\n*   It is strongly recommended to define the character encoding. If a page's encoding is undefined, cross-scripting techniques are possible, such as the [`UTF-7` fallback cross-scripting technique](https://code.google.com/p/doctype-mirror/wiki/ArticleUtf7).\n*   The [`<meta>`](/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element with a `charset` attribute is a synonym for the pre-HTML5 `<meta http-equiv=\"Content-Type\" content=\"text/html; charset=_IANAcharset_\">`, where _`IANAcharset`_ contains the value of the equivalent `[charset](/en-US/docs/Web/HTML/Element/meta#attr-charset)` attribute. This syntax is still allowed, although no longer recommended."
            },
            {
                "name": "scheme",
                "description": "This attribute defines the scheme in which metadata is described. A scheme is a context leading to the correct interpretations of the `[content](/en-US/docs/Web/HTML/Element/meta#attr-content)` value, like a format.\n\n**Warning:** Do not use this value, as it is obsolete. There is no replacement as there was no real usage for it."
            }
        ]
    },
    {
        "name": "style",
        "description": "The style element allows authors to embed style information in their documents. The style element is one of several inputs to the styling processing model. The element does not represent content for the user.",
        "attributes": [
            {
                "name": "media",
                "description": "This attribute defines which media the style should be applied to. Its value is a media query, which defaults to all if the attribute is missing.\n"
            },
            {
                "name": "nonce",
                "description": "A cryptographic nonce (number used once) used to whitelist inline styles in a style-src Content-Security-Policy. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource’s policy is otherwise trivial.\n"
            },
            {
                "name": "type",
                "description": "This attribute defines the styling language as a MIME type (charset should not be specified). This attribute is optional and defaults to text/css if it is not specified — there is very little reason to include this in modern web documents.\n"
            },
            {
                "name": "scoped",
                "valueSet": "v"
            },
            {
                "name": "title",
                "description": "This attribute specifies alternative style sheet sets.\n"
            }
        ]
    },
    {
        "name": "body",
        "description": "The body element represents the content of the document.",
        "attributes": [
            {
                "name": "onafterprint",
                "description": "Function to call after the user has printed the document."
            },
            {
                "name": "onbeforeprint",
                "description": "Function to call when the user requests printing of the document."
            },
            {
                "name": "onbeforeunload",
                "description": "Function to call when the document is about to be unloaded."
            },
            {
                "name": "onhashchange",
                "description": "Function to call when the fragment identifier part (starting with the hash (`'#'`) character) of the document's current address has changed."
            },
            {
                "name": "onlanguagechange",
                "description": "Function to call when the preferred languages changed."
            },
            {
                "name": "onmessage",
                "description": "Function to call when the document has received a message."
            },
            {
                "name": "onoffline",
                "description": "Function to call when network communication has failed."
            },
            {
                "name": "ononline",
                "description": "Function to call when network communication has been restored."
            },
            {
                "name": "onpagehide"
            },
            {
                "name": "onpageshow"
            },
            {
                "name": "onpopstate",
                "description": "Function to call when the user has navigated session history."
            },
            {
                "name": "onstorage",
                "description": "Function to call when the storage area has changed."
            },
            {
                "name": "onunload",
                "description": "Function to call when the document is going away."
            },
            {
                "name": "alink",
                "description": "Color of text for hyperlinks when selected. _This method is non-conforming, use CSS [`color`](/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:active`](/en-US/docs/Web/CSS/:active \"The :active CSS pseudo-class represents an element (such as a button) that is being activated by the user.\") pseudo-class instead._"
            },
            {
                "name": "background",
                "description": "URI of a image to use as a background. _This method is non-conforming, use CSS [`background`](/en-US/docs/Web/CSS/background \"The background shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.\") property on the element instead._"
            },
            {
                "name": "bgcolor",
                "description": "Background color for the document. _This method is non-conforming, use CSS [`background-color`](/en-US/docs/Web/CSS/background-color \"The background-color CSS property sets the background color of an element.\") property on the element instead._"
            },
            {
                "name": "bottommargin",
                "description": "The margin of the bottom of the body. _This method is non-conforming, use CSS [`margin-bottom`](/en-US/docs/Web/CSS/margin-bottom \"The margin-bottom CSS property sets the margin area on the bottom of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._"
            },
            {
                "name": "leftmargin",
                "description": "The margin of the left of the body. _This method is non-conforming, use CSS [`margin-left`](/en-US/docs/Web/CSS/margin-left \"The margin-left CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._"
            },
            {
                "name": "link",
                "description": "Color of text for unvisited hypertext links. _This method is non-conforming, use CSS [`color`](/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:link`](/en-US/docs/Web/CSS/:link \"The :link CSS pseudo-class represents an element that has not yet been visited. It matches every unvisited <a>, <area>, or <link> element that has an href attribute.\") pseudo-class instead._"
            },
            {
                "name": "onblur",
                "description": "Function to call when the document loses focus."
            },
            {
                "name": "onerror",
                "description": "Function to call when the document fails to load properly."
            },
            {
                "name": "onfocus",
                "description": "Function to call when the document receives focus."
            },
            {
                "name": "onload",
                "description": "Function to call when the document has finished loading."
            },
            {
                "name": "onredo",
                "description": "Function to call when the user has moved forward in undo transaction history."
            },
            {
                "name": "onresize",
                "description": "Function to call when the document has been resized."
            },
            {
                "name": "onundo",
                "description": "Function to call when the user has moved backward in undo transaction history."
            },
            {
                "name": "rightmargin",
                "description": "The margin of the right of the body. _This method is non-conforming, use CSS [`margin-right`](/en-US/docs/Web/CSS/margin-right \"The margin-right CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._"
            },
            {
                "name": "text",
                "description": "Foreground color of text. _This method is non-conforming, use CSS [`color`](/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property on the element instead._"
            },
            {
                "name": "topmargin",
                "description": "The margin of the top of the body. _This method is non-conforming, use CSS [`margin-top`](/en-US/docs/Web/CSS/margin-top \"The margin-top CSS property sets the margin area on the top of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._"
            },
            {
                "name": "vlink",
                "description": "Color of text for visited hypertext links. _This method is non-conforming, use CSS [`color`](/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:visited`](/en-US/docs/Web/CSS/:visited \"The :visited CSS pseudo-class represents links that the user has already visited. For privacy reasons, the styles that can be modified using this selector are very limited.\") pseudo-class instead._"
            }
        ]
    },
    {
        "name": "article",
        "description": "The article element represents a complete, or self-contained, composition in a document, page, application, or site and that is, in principle, independently distributable or reusable, e.g. in syndication. This could be a forum post, a magazine or newspaper article, a blog entry, a user-submitted comment, an interactive widget or gadget, or any other independent item of content. Each article should be identified, typically by including a heading (h1–h6 element) as a child of the article element.",
        "attributes": []
    },
    {
        "name": "section",
        "description": "The section element represents a generic section of a document or application. A section, in this context, is a thematic grouping of content. Each section should be identified, typically by including a heading ( h1- h6 element) as a child of the section element.",
        "attributes": []
    },
    {
        "name": "nav",
        "description": "The nav element represents a section of a page that links to other pages or to parts within the page: a section with navigation links.",
        "attributes": []
    },
    {
        "name": "aside",
        "description": "The aside element represents a section of a page that consists of content that is tangentially related to the content around the aside element, and which could be considered separate from that content. Such sections are often represented as sidebars in printed typography.",
        "attributes": []
    },
    {
        "name": "h1",
        "description": "The h1 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "h2",
        "description": "The h2 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "h3",
        "description": "The h3 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "h4",
        "description": "The h4 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "h5",
        "description": "The h5 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "h6",
        "description": "The h6 element represents a section heading.",
        "attributes": []
    },
    {
        "name": "header",
        "description": "The header element represents introductory content for its nearest ancestor sectioning content or sectioning root element. A header typically contains a group of introductory or navigational aids. When the nearest ancestor sectioning content or sectioning root element is the body element, then it applies to the whole page.",
        "attributes": []
    },
    {
        "name": "footer",
        "description": "The footer element represents a footer for its nearest ancestor sectioning content or sectioning root element. A footer typically contains information about its section such as who wrote it, links to related documents, copyright data, and the like.",
        "attributes": []
    },
    {
        "name": "address",
        "description": "The address element represents the contact information for its nearest article or body element ancestor. If that is the body element, then the contact information applies to the document as a whole.",
        "attributes": []
    },
    {
        "name": "p",
        "description": "The p element represents a paragraph.",
        "attributes": []
    },
    {
        "name": "hr",
        "description": "The hr element represents a paragraph-level thematic break, e.g. a scene change in a story, or a transition to another topic within a section of a reference book.",
        "attributes": [
            {
                "name": "align",
                "description": "Sets the alignment of the rule on the page. If no value is specified, the default value is left.\n"
            },
            {
                "name": "color",
                "description": "Sets the color of the rule through color name or hexadecimal value.\n"
            },
            {
                "name": "noshade",
                "description": "Sets the rule to have no shading.\n"
            },
            {
                "name": "size",
                "description": "Sets the height, in pixels, of the rule.\n"
            },
            {
                "name": "width",
                "description": "Sets the length of the rule on the page through a pixel or percentage value.\n"
            }
        ]
    },
    {
        "name": "pre",
        "description": "The pre element represents a block of preformatted text, in which structure is represented by typographic conventions rather than by elements.",
        "attributes": [
            {
                "name": "cols",
                "description": "Contains the preferred count of characters that a line should have. It was a non-standard synonym of \\[width](/en-US/docs/Web/HTML/Element/pre#attr-width). To achieve such an effect, use CSS width instead.\n"
            },
            {
                "name": "width",
                "description": "Contains the preferred count of characters that a line should have. Though technically still implemented, this attribute has no visual effect; to achieve such an effect, use CSS width instead.\n"
            },
            {
                "name": "wrap",
                "description": "Is a hint indicating how the overflow must happen. In modern browser this hint is ignored and no visual effect results in its present; to achieve such an effect, use CSS white-space instead.\n"
            }
        ]
    },
    {
        "name": "blockquote",
        "description": "The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a footer or cite element, and optionally with in-line changes such as annotations and abbreviations.",
        "attributes": [
            {
                "name": "cite",
                "description": "A URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote."
            }
        ]
    },
    {
        "name": "ol",
        "description": "The ol element represents a list of items, where the items have been intentionally ordered, such that changing the order would change the meaning of the document.",
        "attributes": [
            {
                "name": "reversed",
                "valueSet": "v",
                "description": "This Boolean attribute specifies that the items of the list are specified in reversed order."
            },
            {
                "name": "start",
                "description": "This integer attribute specifies the start value for numbering the individual list items. Although the ordering type of list elements might be Roman numerals, such as XXXI, or letters, the value of start is always represented as a number. To start numbering elements from the letter \"C\", use `<ol start=\"3\">`.\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5."
            },
            {
                "name": "type",
                "valueSet": "lt",
                "description": "Indicates the numbering type:\n\n*   `'a'` indicates lowercase letters,\n*   `'A'` indicates uppercase letters,\n*   `'i'` indicates lowercase Roman numerals,\n*   `'I'` indicates uppercase Roman numerals,\n*   and `'1'` indicates numbers (default).\n\nThe type set is used for the entire list unless a different `[type](/en-US/docs/Web/HTML/Element/li#attr-type)` attribute is used within an enclosed [`<li>`](/en-US/docs/Web/HTML/Element/li \"The HTML <li> element is used to represent an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.\") element.\n\n**Note:** This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\nUnless the value of the list number matters (e.g. in legal or technical documents where items are to be referenced by their number/letter), the CSS [`list-style-type`](/en-US/docs/Web/CSS/list-style-type \"The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.\") property should be used instead."
            },
            {
                "name": "compact",
                "description": "This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn't work in all browsers.\n\n**Warning:** Do not use this attribute, as it has been deprecated: the [`<ol>`](/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element should be styled using [CSS](/en-US/docs/CSS). To give an effect similar to the `compact` attribute, the [CSS](/en-US/docs/CSS) property [`line-height`](/en-US/docs/Web/CSS/line-height \"The line-height CSS property sets the amount of space used for lines, such as in text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.\") can be used with a value of `80%`."
            }
        ]
    },
    {
        "name": "ul",
        "description": "The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
        "attributes": [
            {
                "name": "compact",
                "description": "This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn't work in all browsers.\n\n**Usage note: **Do not use this attribute, as it has been deprecated: the [`<ul>`](/en-US/docs/Web/HTML/Element/ul \"The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.\") element should be styled using [CSS](/en-US/docs/CSS). To give a similar effect as the `compact` attribute, the [CSS](/en-US/docs/CSS) property [line-height](/en-US/docs/CSS/line-height) can be used with a value of `80%`."
            }
        ]
    },
    {
        "name": "li",
        "description": "The li element represents a list item. If its parent element is an ol, ul, or menu element, then the element is an item of the parent element's list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other li element.",
        "attributes": [
            {
                "name": "value",
                "description": "This integer attribute indicates the current ordinal value of the list item as defined by the [`<ol>`](/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element. The only allowed value for this attribute is a number, even if the list is displayed with Roman numerals or letters. List items that follow this one continue numbering from the value set. The **value** attribute has no meaning for unordered lists ([`<ul>`](/en-US/docs/Web/HTML/Element/ul \"The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.\")) or for menus ([`<menu>`](/en-US/docs/Web/HTML/Element/menu \"The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.\")).\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\n**Note:** Prior to Gecko 9.0, negative values were incorrectly converted to 0. Starting in Gecko 9.0 all integer values are correctly parsed."
            },
            {
                "name": "type",
                "description": "This character attribute indicates the numbering type:\n\n*   `a`: lowercase letters\n*   `A`: uppercase letters\n*   `i`: lowercase Roman numerals\n*   `I`: uppercase Roman numerals\n*   `1`: numbers\n\nThis type overrides the one used by its parent [`<ol>`](/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element, if any.\n\n**Usage note:** This attribute has been deprecated: use the CSS [`list-style-type`](/en-US/docs/Web/CSS/list-style-type \"The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.\") property instead."
            }
        ]
    },
    {
        "name": "dl",
        "description": "The dl element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements) followed by one or more values (dd elements), ignoring any nodes other than dt and dd elements. Within a single dl element, there should not be more than one dt element for each name.",
        "attributes": []
    },
    {
        "name": "dt",
        "description": "The dt element represents the term, or name, part of a term-description group in a description list (dl element).",
        "attributes": []
    },
    {
        "name": "dd",
        "description": "The dd element represents the description, definition, or value, part of a term-description group in a description list (dl element).",
        "attributes": [
            {
                "name": "nowrap",
                "description": "If the value of this attribute is set to yes, the definition text will not wrap. The default value is no.\n"
            }
        ]
    },
    {
        "name": "figure",
        "description": "The figure element represents some flow content, optionally with a caption, that is self-contained (like a complete sentence) and is typically referenced as a single unit from the main flow of the document.",
        "attributes": []
    },
    {
        "name": "figcaption",
        "description": "The figcaption element represents a caption or legend for the rest of the contents of the figcaption element's parent figure element, if any.",
        "attributes": []
    },
    {
        "name": "main",
        "description": "The main element represents the main content of the body of a document or application. The main content area consists of content that is directly related to or expands upon the central topic of a document or central functionality of an application.",
        "attributes": []
    },
    {
        "name": "div",
        "description": "The div element has no special meaning at all. It represents its children. It can be used with the class, lang, and title attributes to mark up semantics common to a group of consecutive elements.",
        "attributes": []
    },
    {
        "name": "a",
        "description": "If the a element has an href attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.",
        "attributes": [
            {
                "name": "href",
                "description": "Contains a URL or a URL fragment that the hyperlink points to.\n"
            },
            {
                "name": "target",
                "description": "Specifies where to display the linked URL. It is a name of, or keyword for, a browsing context: a tab, window, or &lt;iframe>. The following keywords have special meanings:\n\n\\_self: Load the URL into the same browsing context as the current one. This is the default behavior.\n\n\\_blank: Load the URL into a new browsing context. This is usually a tab, but users can configure browsers to use new windows instead.\n\n\\_parent: Load the URL into the parent browsing context of the current one. If there is no parent, this behaves the same way as \\_self.\n\n\\_top: Load the URL into the top-level browsing context (that is, the \"highest\" browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this behaves the same way as \\_self.\n\nNote: When using target, consider adding rel=\"noreferrer\" to avoid exploitation of the window.opener API.\n\nNote: Linking to another page using target=\"\\_blank\" will run the new page on the same process as your page. If the new page is executing expensive JS, your page's performance may suffer. To avoid this use rel=\"noopener\".\n"
            },
            {
                "name": "download",
                "description": "This attribute instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file. If the attribute has a value, it is used as the pre-filled file name in the Save prompt (the user can still change the file name if they want). There are no restrictions on allowed values, though / and \\\\ are converted to underscores. Most file systems limit some punctuation in file names, and browsers will adjust the suggested name accordingly.\n\nNotes:\n\nThis attribute only works for same-origin URLs.\n\nAlthough HTTP(s) URLs need to be in the same-origin, blob: URLs and data: URLs are allowed so that content generated by JavaScript, such as pictures created in an image-editor Web app, can be downloaded.\n\nIf the HTTP header Content-Disposition: gives a different filename than this attribute, the HTTP header takes priority over this attribute.\n\nIf Content-Disposition: is set to inline, Firefox prioritizes Content-Disposition, like the filename case, while Chrome prioritizes the download attribute.\n"
            },
            {
                "name": "ping",
                "description": "Contains a space-separated list of URLs to which, when the hyperlink is followed, POST requests with the body PING will be sent by the browser (in the background). Typically used for tracking.\n"
            },
            {
                "name": "rel",
                "description": "Specifies the relationship of the target object to the link object. The value is a space-separated list of link types.\n"
            },
            {
                "name": "hreflang",
                "description": "This attribute indicates the human language of the linked resource. It is purely advisory, with no built-in functionality. Allowed values are determined by BCP47.\n"
            },
            {
                "name": "type",
                "description": "Specifies the media type in the form of a MIME type is a string sent along with a file indicating the type of the file (describing the content format, for example, a sound file might be labeled audio/ogg, or an image file image/png).\") for the linked URL. It is purely advisory, with no built-in functionality.\n"
            },
            {
                "name": "referrerpolicy",
                "description": "Indicates which referrer to send when fetching the URL:\n\n'no-referrer' means the Referer: header will not be sent.\n\n'no-referrer-when-downgrade' means no Referer: header will be sent when navigating to an origin without HTTPS. This is the default behavior.\n\n'origin' means the referrer will be the origin of the page, not including information after the domain.\n\n'origin-when-cross-origin' meaning that navigations to other origins will be limited to the scheme, the host and the port, while navigations on the same origin will include the referrer's path.\n\n'strict-origin-when-cross-origin'\n\n'unsafe-url' means the referrer will include the origin and path, but not the fragment, password, or username. This is unsafe because it can leak data from secure URLs to insecure ones.\n"
            }
        ]
    },
    {
        "name": "em",
        "description": "The em element represents stress emphasis of its contents.",
        "attributes": []
    },
    {
        "name": "strong",
        "description": "The strong element represents strong importance, seriousness, or urgency for its contents.",
        "attributes": []
    },
    {
        "name": "small",
        "description": "The small element represents side comments such as small print.",
        "attributes": []
    },
    {
        "name": "s",
        "description": "The s element represents contents that are no longer accurate or no longer relevant.",
        "attributes": []
    },
    {
        "name": "cite",
        "description": "The cite element represents a reference to a creative work. It must include the title of the work or the name of the author(person, people or organization) or an URL reference, or a reference in abbreviated form as per the conventions used for the addition of citation metadata.",
        "attributes": []
    },
    {
        "name": "q",
        "description": "The q element represents some phrasing content quoted from another source.",
        "attributes": [
            {
                "name": "cite",
                "description": "The value of this attribute is a URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.\n"
            }
        ]
    },
    {
        "name": "dfn",
        "description": "The dfn element represents the defining instance of a term. The paragraph, description list group, or section that is the nearest ancestor of the dfn element must also contain the definition(s) for the term given by the dfn element.",
        "attributes": []
    },
    {
        "name": "abbr",
        "description": "The abbr element represents an abbreviation or acronym, optionally with its expansion. The title attribute may be used to provide an expansion of the abbreviation. The attribute, if specified, must contain an expansion of the abbreviation, and nothing else.",
        "attributes": []
    },
    {
        "name": "ruby",
        "description": "The ruby element allows one or more spans of phrasing content to be marked with ruby annotations. Ruby annotations are short runs of text presented alongside base text, primarily used in East Asian typography as a guide for pronunciation or to include other annotations. In Japanese, this form of typography is also known as furigana. Ruby text can appear on either side, and sometimes both sides, of the base text, and it is possible to control its position using CSS. A more complete introduction to ruby can be found in the Use Cases & Exploratory Approaches for Ruby Markup document as well as in CSS Ruby Module Level 1. [RUBY-UC] [CSSRUBY]",
        "attributes": []
    },
    {
        "name": "rb",
        "description": "The rb element marks the base text component of a ruby annotation. When it is the child of a ruby element, it doesn't represent anything itself, but its parent ruby element uses it as part of determining what it represents.",
        "attributes": []
    },
    {
        "name": "rt",
        "description": "The rt element marks the ruby text component of a ruby annotation. When it is the child of a ruby element or of an rtc element that is itself the child of a ruby element, it doesn't represent anything itself, but its ancestor ruby element uses it as part of determining what it represents.",
        "attributes": []
    },
    {
        "name": "rp",
        "description": "The rp element is used to provide fallback text to be shown by user agents that don't support ruby annotations. One widespread convention is to provide parentheses around the ruby text component of a ruby annotation.",
        "attributes": []
    },
    {
        "name": "time",
        "description": "The time element represents its contents, along with a machine-readable form of those contents in the datetime attribute. The kind of content is limited to various kinds of dates, times, time-zone offsets, and durations, as described below.",
        "attributes": [
            {
                "name": "datetime",
                "description": "This attribute indicates the time and/or date of the element and must be in one of the formats described below.\n"
            }
        ]
    },
    {
        "name": "code",
        "description": "The code element represents a fragment of computer code. This could be an XML element name, a file name, a computer program, or any other string that a computer would recognize.",
        "attributes": []
    },
    {
        "name": "var",
        "description": "The var element represents a variable. This could be an actual variable in a mathematical expression or programming context, an identifier representing a constant, a symbol identifying a physical quantity, a function parameter, or just be a term used as a placeholder in prose.",
        "attributes": []
    },
    {
        "name": "samp",
        "description": "The samp element represents sample or quoted output from another program or computing system.",
        "attributes": []
    },
    {
        "name": "kbd",
        "description": "The kbd element represents user input (typically keyboard input, although it may also be used to represent other input, such as voice commands).",
        "attributes": []
    },
    {
        "name": "sub",
        "description": "The sub element represents a subscript.",
        "attributes": []
    },
    {
        "name": "sup",
        "description": "The sup element represents a superscript.",
        "attributes": []
    },
    {
        "name": "i",
        "description": "The i element represents a span of text in an alternate voice or mood, or otherwise offset from the normal prose in a manner indicating a different quality of text, such as a taxonomic designation, a technical term, an idiomatic phrase from another language, transliteration, a thought, or a ship name in Western texts.",
        "attributes": []
    },
    {
        "name": "b",
        "description": "The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.",
        "attributes": []
    },
    {
        "name": "u",
        "description": "The u element represents a span of text with an unarticulated, though explicitly rendered, non-textual annotation, such as labeling the text as being a proper name in Chinese text (a Chinese proper name mark), or labeling the text as being misspelt.",
        "attributes": []
    },
    {
        "name": "mark",
        "description": "The mark element represents a run of text in one document marked or highlighted for reference purposes, due to its relevance in another context. When used in a quotation or other block of text referred to from the prose, it indicates a highlight that was not originally present but which has been added to bring the reader's attention to a part of the text that might not have been considered important by the original author when the block was originally written, but which is now under previously unexpected scrutiny. When used in the main prose of a document, it indicates a part of the document that has been highlighted due to its likely relevance to the user's current activity.",
        "attributes": []
    },
    {
        "name": "bdi",
        "description": "The bdi element represents a span of text that is to be isolated from its surroundings for the purposes of bidirectional text formatting. [BIDI]",
        "attributes": []
    },
    {
        "name": "bdo",
        "description": "The bdo element represents explicit text directionality formatting control for its children. It allows authors to override the Unicode bidirectional algorithm by explicitly specifying a direction override. [BIDI]",
        "attributes": [
            {
                "name": "dir",
                "description": "The direction in which text should be rendered in this element's contents. Possible values are:\n\nltr: Indicates that the text should go in a left-to-right direction.\n\nrtl: Indicates that the text should go in a right-to-left direction.\n"
            }
        ]
    },
    {
        "name": "span",
        "description": "The span element doesn't mean anything on its own, but can be useful when used together with the global attributes, e.g. class, lang, or dir. It represents its children.",
        "attributes": []
    },
    {
        "name": "br",
        "description": "The br element represents a line break.",
        "attributes": [
            {
                "name": "clear",
                "description": "Indicates where to begin the next line after the break."
            }
        ]
    },
    {
        "name": "wbr",
        "description": "The wbr element represents a line break opportunity.",
        "attributes": []
    },
    {
        "name": "ins",
        "description": "The ins element represents an addition to the document.",
        "attributes": [
            {
                "name": "cite",
                "description": "This attribute defines the URI of a resource that explains the change, such as a link to meeting minutes or a ticket in a troubleshooting system.\n"
            },
            {
                "name": "datetime",
                "description": "This attribute indicates the time and date of the change and must be a valid date with an optional time string. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see Format of a valid date string in Date and time formats used in HTML. The format of the string if it includes both date and time is covered in Format of a valid local date and time string in Date and time formats used in HTML.\n"
            }
        ]
    },
    {
        "name": "del",
        "description": "The del element represents a removal from the document.",
        "attributes": [
            {
                "name": "cite",
                "description": "A URI for a resource that explains the change (for example, meeting minutes).\n"
            },
            {
                "name": "datetime",
                "description": "This attribute indicates the time and date of the change and must be a valid date string with an optional time. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see Format of a valid date string in Date and time formats used in HTML. The format of the string if it includes both date and time is covered in Format of a valid local date and time string in Date and time formats used in HTML.\n"
            }
        ]
    },
    {
        "name": "picture",
        "description": "The picture element is a container which provides multiple sources to its contained img element to allow authors to declaratively control or give hints to the user agent about which image resource to use, based on the screen pixel density, viewport size, image format, and other factors. It represents its children.",
        "attributes": []
    },
    {
        "name": "img",
        "description": "An img element represents an image.",
        "attributes": [
            {
                "name": "alt",
                "description": "This attribute defines an alternative text description of the image.\n\nNote: Browsers do not always display the image referenced by the element. This is the case for non-graphical browsers (including those used by people with visual impairments), if the user chooses not to display images, or if the browser cannot display the image because it is invalid or an unsupported type. In these cases, the browser may replace the image with the text defined in this element's alt attribute. You should, for these reasons and others, provide a useful value for alt whenever possible.\n\nNote: Omitting this attribute altogether indicates that the image is a key part of the content, and no textual equivalent is available. Setting this attribute to an empty string (alt=\"\") indicates that this image is not a key part of the content (decorative), and that non-visual browsers may omit it from rendering.\n"
            },
            {
                "name": "src",
                "description": "The image URL. This attribute is mandatory for the &lt;img> element. On browsers supporting srcset, src is treated like a candidate image with a pixel density descriptor 1x unless an image with this pixel density descriptor is already defined in srcset, or unless srcset contains 'w' descriptors.\n"
            },
            {
                "name": "srcset",
                "description": "A list of one or more strings separated by commas indicating a set of possible image sources for the user agent to use. Each string is composed of:\n\na URL to an image,\n\noptionally, whitespace followed by one of:\n\nA width descriptor, or a positive integer directly followed by 'w'. The width descriptor is divided by the source size given in the sizes attribute to calculate the effective pixel density.\n\nA pixel density descriptor, which is a positive floating point number directly followed by 'x'.\n\nIf no descriptor is specified, the source is assigned the default descriptor: 1x.\n\nIt is incorrect to mix width descriptors and pixel density descriptors in the same srcset attribute. Duplicate descriptors (for instance, two sources in the same srcset which are both described with '2x') are also invalid.\n\nThe user agent selects any one of the available sources at its discretion. This provides them with significant leeway to tailor their selection based on things like user preferences or bandwidth conditions. See our Responsive images tutorial for an example.\n"
            },
            {
                "name": "crossorigin",
                "valueSet": "xo",
                "description": "This enumerated attribute indicates if the fetching of the related image must be done using CORS or not. CORS-enabled images can be reused in the &lt;canvas> element without being \"tainted.\" The allowed values are:\n"
            },
            {
                "name": "usemap",
                "description": "The partial URL (starting with '#') of an image map associated with the element.\n\nNote: You cannot use this attribute if the &lt;img> element is a descendant of an &lt;a> or &lt;button> element.\n"
            },
            {
                "name": "ismap",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the image is part of a server-side map. If so, the precise coordinates of a click are sent to the server.\n\nNote: This attribute is allowed only if the &lt;img> element is a descendant of an &lt;a> element with a valid \\[href](/en-US/docs/Web/HTML/Element/a#attr-href) attribute.\n"
            },
            {
                "name": "width",
                "description": "The intrinsic width of the image in pixels.\n"
            },
            {
                "name": "height",
                "description": "The intrinsic height of the image in pixels.\n"
            },
            {
                "name": "decoding",
                "description": "Provides an image decoding hint to the browser. The allowed values are:\n"
            },
            {
                "name": "decoding",
                "description": "sync\n\nDecode the image synchronously for atomic presentation with other content.\n\nasync\n\nDecode the image asynchronously to reduce delay in presenting other content.\n\nauto\n\nDefault mode, which indicates no preference for the decoding mode. The browser decides what is best for the user.\n"
            },
            {
                "name": "importance",
                "description": "Indicates the relative importance of the resource. Priority hints are delegated using the values:\n"
            },
            {
                "name": "importance",
                "description": "auto: Indicates no preference. The browser may use its own heuristics to decide the priority of the image.\n\nhigh: Indicates to the browser that the image is of high priority.\n\nlow: Indicates to the browser that the image is of low priority.\n"
            },
            {
                "name": "intrinsicsize",
                "description": "This attribute tells the browser to ignore the actual intrinsic size of the image and pretend it’s the size specified in the attribute. Specifically, the image would raster at these dimensions and naturalWidth/naturalHeight on images would return the values specified in this attribute. Explainer, examples\n"
            },
            {
                "name": "referrerpolicy",
                "description": "A string indicating which referrer to use when fetching the resource:\n\nno-referrer: The Referer header will not be sent.\n\nno-referrer-when-downgrade: No Referer header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior if no policy is otherwise specified.\n\norigin: The Referer header will include the page of origin's scheme, the host, and the port.\n\norigin-when-cross-origin: Navigating to other origins will limit the included referral data to the scheme, the host and the port, while navigating from the same origin will include the referrer's full path.\n\nunsafe-url: The Referer header will include the origin and the path, but not the fragment, password, or username. This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins.\n"
            },
            {
                "name": "sizes",
                "description": "A list of one or more strings separated by commas indicating a set of source sizes. Each source size consists of:\n\na media condition. This must be omitted for the last item.\n\na source size value.\n\nSource size values specify the intended display size of the image. User agents use the current source size to select one of the sources supplied by the srcset attribute, when those sources are described using width ('w') descriptors. The selected source size affects the intrinsic size of the image (the image’s display size if no CSS styling is applied). If the srcset attribute is absent, or contains no values with a width (w) descriptor, then the sizes attribute has no effect.\n"
            }
        ]
    },
    {
        "name": "iframe",
        "description": "The iframe element represents a nested browsing context.",
        "attributes": [
            {
                "name": "src",
                "description": "The URL of the page to embed. Use a value of about:blank to embed an empty page that conforms to the same-origin policy. Also note that programatically removing an &lt;iframe>'s src attribute (e.g. via Element.removeAttribute()) causes about:blank to be loaded in the frame in Firefox (from version 65), Chromium-based browsers, and Safari/iOS.\n"
            },
            {
                "name": "srcdoc",
                "description": "Inline HTML to embed, overriding the src attribute. If a browser does not support the srcdoc attribute, it will fall back to the URL in the src attribute.\n"
            },
            {
                "name": "name",
                "description": "A targetable name for the embedded browsing context. This can be used in the target attribute of the &lt;a>, &lt;form>, or &lt;base> elements; the formtarget attribute of the &lt;input> or &lt;button> elements; or the windowName parameter in the window.open() method.\n"
            },
            {
                "name": "sandbox",
                "valueSet": "sb",
                "description": "Applies extra restrictions to the content in the frame. The value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:\n\nallow-forms: Allows the resource to submit forms. If this keyword is not used, form submission is blocked.\n\nallow-modals: Lets the resource open modal windows.\n\nallow-orientation-lock: Lets the resource lock the screen orientation.\n\nallow-pointer-lock: Lets the resource use the Pointer Lock API.\n\nallow-popups: Allows popups (such as window.open(), target=\"\\_blank\", or showModalDialog()). If this keyword is not used, the popup will silently fail to open.\n\nallow-popups-to-escape-sandbox: Lets the sandboxed document open new windows without those windows inheriting the sandboxing. For example, this can safely sandbox an advertisement without forcing the same restrictions upon the page the ad links to.\n\nallow-presentation: Lets the resource start a presentation session.\n\nallow-same-origin: If this token is not used, the resource is treated as being from a special origin that always fails the same-origin policy.\n\nallow-scripts: Lets the resource run scripts (but not create popup windows).\n\nallow-storage-access-by-user-activation : Lets the resource request access to the parent's storage capabilities with the Storage Access API.\n\nallow-top-navigation: Lets the resource navigate the top-level browsing context (the one named \\_top).\n\nallow-top-navigation-by-user-activation: Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture.\n\nNotes about sandboxing:\n\nWhen the embedded document has the same origin as the embedding page, it is strongly discouraged to use both allow-scripts and allow-same-origin, as that lets the embedded document remove the sandbox attribute — making it no more secure than not using the sandbox attribute at all.\n\nSandboxing is useless if the attacker can display content outside a sandboxed iframe — such as if the viewer opens the frame in a new tab. Such content should be also served from a separate origin to limit potential damage.\n\nThe sandbox attribute is unsupported in Internet Explorer 9 and earlier.\n"
            },
            {
                "name": "seamless",
                "valueSet": "v"
            },
            {
                "name": "allowfullscreen",
                "valueSet": "v",
                "description": "Set to true if the &lt;iframe> can activate fullscreen mode by calling the requestFullscreen() method.\n"
            },
            {
                "name": "width",
                "description": "The width of the frame in CSS pixels. Default is 300.\n"
            },
            {
                "name": "height",
                "description": "The height of the frame in CSS pixels. Default is 150.\n"
            },
            {
                "name": "allow",
                "description": "Specifies a feature policy for the &lt;iframe>.\n"
            },
            {
                "name": "allowpaymentrequest",
                "description": "Set to true if a cross-origin &lt;iframe> should be allowed to invoke the Payment Request API.\n"
            },
            {
                "name": "allowpaymentrequest",
                "description": "This attribute is considered a legacy attribute and redefined as allow=\"payment\".\n"
            },
            {
                "name": "csp",
                "description": "A Content Security Policy enforced for the embedded resource. See HTMLIFrameElement.csp for details.\n"
            },
            {
                "name": "importance",
                "description": "The download priority of the resource in the &lt;iframe>'s src attribute. Allowed values:\n\nauto (default)\n\nNo preference. The browser uses its own heuristics to decide the priority of the resource.\n\nhigh\n\nThe resource should be downloaded before other lower-priority page resources.\n\nlow\n\nThe resource should be downloaded after other higher-priority page resources.\n"
            },
            {
                "name": "referrerpolicy",
                "description": "Indicates which referrer to send when fetching the frame's resource:\n\nno-referrer: The Referer header will not be sent.\n\nno-referrer-when-downgrade (default): The Referer header will not be sent to origins without TLS (HTTPS).\n\norigin: The sent referrer will be limited to the origin of the referring page: its scheme, host, and port.\n\norigin-when-cross-origin: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n\nsame-origin: A referrer will be sent for same origin, but cross-origin requests will contain no referrer information.\n\nstrict-origin: Only send the origin of the document as the referrer when the protocol security level stays the same (HTTPS→HTTPS), but don't send it to a less secure destination (HTTPS→HTTP).\n\nstrict-origin-when-cross-origin: Send a full URL when performing a same-origin request, only send the origin when the protocol security level stays the same (HTTPS→HTTPS), and send no header to a less secure destination (HTTPS→HTTP).\n\nunsafe-url: The referrer will include the origin and the path (but not the fragment, password, or username). This value is unsafe, because it leaks origins and paths from TLS-protected resources to insecure origins.\n"
            }
        ]
    },
    {
        "name": "embed",
        "description": "The embed element provides an integration point for an external (typically non-HTML) application or interactive content.",
        "attributes": [
            {
                "name": "src",
                "description": "The URL of the resource being embedded."
            },
            {
                "name": "type",
                "description": "The MIME type to use to select the plug-in to instantiate."
            },
            {
                "name": "width",
                "description": "The displayed width of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed."
            },
            {
                "name": "height",
                "description": "The displayed height of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed."
            }
        ]
    },
    {
        "name": "object",
        "description": "The object element can represent an external resource, which, depending on the type of the resource, will either be treated as an image, as a nested browsing context, or as an external resource to be processed by a plugin.",
        "attributes": [
            {
                "name": "data",
                "description": "The address of the resource as a valid URL. At least one of **data** and **type** must be defined."
            },
            {
                "name": "type",
                "description": "The [content type](/en-US/docs/Glossary/Content_type) of the resource specified by **data**. At least one of **data** and **type** must be defined."
            },
            {
                "name": "typemustmatch",
                "valueSet": "v",
                "description": "This Boolean attribute indicates if the **type** attribute and the actual [content type](/en-US/docs/Glossary/Content_type) of the resource must match to be used."
            },
            {
                "name": "name",
                "description": "The name of valid browsing context (HTML5), or the name of the control (HTML 4)."
            },
            {
                "name": "usemap",
                "description": "A hash-name reference to a [`<map>`](/en-US/docs/Web/HTML/Element/map \"The HTML <map> element is used with <area> elements to define an image map (a clickable link area).\") element; that is a '#' followed by the value of a `[name](/en-US/docs/Web/HTML/Element/map#attr-name)` of a map element."
            },
            {
                "name": "form",
                "description": "The form element, if any, that the object element is associated with (its _form owner_). The value of the attribute must be an ID of a [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element in the same document."
            },
            {
                "name": "width",
                "description": "The width of the display resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))"
            },
            {
                "name": "height",
                "description": "The height of the displayed resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))"
            },
            {
                "name": "archive",
                "description": "A space-separated list of URIs for archives of resources for the object."
            },
            {
                "name": "border",
                "description": "The width of a border around the control, in pixels."
            },
            {
                "name": "classid",
                "description": "The URI of the object's implementation. It can be used together with, or in place of, the **data** attribute."
            },
            {
                "name": "codebase",
                "description": "The base path used to resolve relative URIs specified by **classid**, **data**, or **archive**. If not specified, the default is the base URI of the current document."
            },
            {
                "name": "codetype",
                "description": "The content type of the data specified by **classid**."
            },
            {
                "name": "declare",
                "description": "The presence of this Boolean attribute makes this element a declaration only. The object must be instantiated by a subsequent `<object>` element. In HTML5, repeat the <object> element completely each that that the resource is reused."
            },
            {
                "name": "standby",
                "description": "A message that the browser can show while loading the object's implementation and data."
            },
            {
                "name": "tabindex",
                "description": "The position of the element in the tabbing navigation order for the current document."
            }
        ]
    },
    {
        "name": "param",
        "description": "The param element defines parameters for plugins invoked by object elements. It does not represent anything on its own.",
        "attributes": [
            {
                "name": "name",
                "description": "Name of the parameter."
            },
            {
                "name": "value",
                "description": "Specifies the value of the parameter."
            },
            {
                "name": "type",
                "description": "Only used if the `valuetype` is set to \"ref\". Specifies the MIME type of values found at the URI specified by value."
            },
            {
                "name": "valuetype",
                "description": "Specifies the type of the `value` attribute. Possible values are:\n\n*   data: Default value. The value is passed to the object's implementation as a string.\n*   ref: The value is a URI to a resource where run-time values are stored.\n*   object: An ID of another [`<object>`](/en-US/docs/Web/HTML/Element/object \"The HTML <object> element represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.\") in the same document."
            }
        ]
    },
    {
        "name": "video",
        "description": "A video element is used for playing videos or movies, and audio files with captions.",
        "attributes": [
            {
                "name": "src"
            },
            {
                "name": "crossorigin",
                "valueSet": "xo"
            },
            {
                "name": "poster"
            },
            {
                "name": "preload",
                "valueSet": "pl"
            },
            {
                "name": "autoplay",
                "valueSet": "v",
                "description": "A Boolean attribute; if specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data.\n"
            },
            {
                "name": "mediagroup"
            },
            {
                "name": "loop",
                "valueSet": "v"
            },
            {
                "name": "muted",
                "valueSet": "v"
            },
            {
                "name": "controls",
                "valueSet": "v"
            },
            {
                "name": "width"
            },
            {
                "name": "height"
            }
        ]
    },
    {
        "name": "audio",
        "description": "An audio element represents a sound or audio stream.",
        "attributes": [
            {
                "name": "src",
                "description": "The URL of the audio to embed. This is subject to HTTP access controls. This is optional; you may instead use the &lt;source> element within the audio block to specify the audio to embed.\n"
            },
            {
                "name": "crossorigin",
                "valueSet": "xo",
                "description": "This enumerated attribute indicates whether to use CORS to fetch the related image. CORS-enabled resources can be reused in the &lt;canvas> element without being tainted. The allowed values are:\n\nanonymous\n\nSends a cross-origin request without a credential. In other words, it sends the Origin: HTTP header without a cookie, X.509 certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (by not setting the Access-Control-Allow-Origin: HTTP header), the image will be tainted, and its usage restricted.\n\nuse-credentials\n\nSends a cross-origin request with a credential. In other words, it sends the Origin: HTTP header with a cookie, a certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (through Access-Control-Allow-Credentials: HTTP header), the image will be tainted and its usage restricted.\n\nWhen not present, the resource is fetched without a CORS request (i.e. without sending the Origin: HTTP header), preventing its non-tainted used in &lt;canvas> elements. If invalid, it is handled as if the enumerated keyword anonymous was used. See CORS settings attributes for additional information.\n"
            },
            {
                "name": "preload",
                "valueSet": "pl",
                "description": "This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience. It may have one of the following values:\n\nnone: Indicates that the audio should not be preloaded.\n\nmetadata: Indicates that only audio metadata (e.g. length) is fetched.\n\nauto: Indicates that the whole audio file can be downloaded, even if the user is not expected to use it.\n\nempty string: A synonym of the auto value.\n\nIf not set, preload's default value is browser-defined (i.e. each browser may have its own default value). The spec advises it to be set to metadata.\n\nUsage notes:\n\nThe autoplay attribute has precedence over preload. If autoplay is specified, the browser would obviously need to start downloading the audio for playback.\n\nThe browser is not forced by the specification to follow the value of this attribute; it is a mere hint.\n"
            },
            {
                "name": "autoplay",
                "valueSet": "v",
                "description": "A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so, without waiting for the entire audio file to finish downloading.\n\nNote: Sites that automatically play audio (or videos with an audio track) can be an unpleasant experience for users, so should be avoided when possible. If you must offer autoplay functionality, you should make it opt-in (requiring a user to specifically enable it). However, this can be useful when creating media elements whose source will be set at a later time, under user control.\n"
            },
            {
                "name": "mediagroup"
            },
            {
                "name": "loop",
                "valueSet": "v",
                "description": "A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio.\n"
            },
            {
                "name": "muted",
                "valueSet": "v",
                "description": "A Boolean attribute that indicates whether the audio will be initially silenced. Its default value is false.\n"
            },
            {
                "name": "controls",
                "valueSet": "v",
                "description": "If this attribute is present, the browser will offer controls to allow the user to control audio playback, including volume, seeking, and pause/resume playback.\n"
            }
        ]
    },
    {
        "name": "source",
        "description": "The source element allows authors to specify multiple alternative media resources for media elements. It does not represent anything on its own.",
        "attributes": [
            {
                "name": "src",
                "description": "Required for &lt;audio> and &lt;video>, address of the media resource. The value of this attribute is ignored when the &lt;source> element is placed inside a &lt;picture> element.\n"
            },
            {
                "name": "type",
                "description": "The MIME-type of the resource, optionally with a codecs parameter. See RFC 4281 for information about how to specify codecs.\n"
            },
            {
                "name": "sizes",
                "description": "Is a list of source sizes that describes the final rendered width of the image represented by the source. Each source size consists of a comma-separated list of media condition-length pairs. This information is used by the browser to determine, before laying the page out, which image defined in \\[srcset](/en-US/docs/Web/HTML/Element/source#attr-srcset) to use.\nThe sizes attribute has an effect only when the &lt;source> element is the direct child of a &lt;picture> element.\n"
            },
            {
                "name": "srcset",
                "description": "A list of one or more strings separated by commas indicating a set of possible images represented by the source for the browser to use. Each string is composed of:\n\none URL to an image,\n\na width descriptor, that is a positive integer directly followed by 'w'. The default value, if missing, is the infinity.\n\na pixel density descriptor, that is a positive floating number directly followed by 'x'. The default value, if missing, is 1x.\n\nEach string in the list must have at least a width descriptor or a pixel density descriptor to be valid. Among the list, there must be only one string containing the same tuple of width descriptor and pixel density descriptor.\nThe browser chooses the most adequate image to display at a given point of time.\nThe srcset attribute has an effect only when the &lt;source> element is the direct child of a &lt;picture> element.\n"
            },
            {
                "name": "media",
                "description": "Media query of the resource's intended media; this should be used only in a &lt;picture> element.\n"
            }
        ]
    },
    {
        "name": "track",
        "description": "The track element allows authors to specify explicit external timed text tracks for media elements. It does not represent anything on its own.",
        "attributes": [
            {
                "name": "default",
                "valueSet": "v",
                "description": "This attribute indicates that the track should be enabled unless the user's preferences indicate that another track is more appropriate. This may only be used on one `track` element per media element."
            },
            {
                "name": "kind",
                "valueSet": "tk",
                "description": "How the text track is meant to be used. If omitted the default kind is `subtitles`. If the attribute is not present, it will use the `subtitles`. If the attribute contains an invalid value, it will use `metadata`. (Versions of Chrome earlier than 52 treated an invalid value as `subtitles`.) The following keywords are allowed:\n\n*   `subtitles`\n    *   Subtitles provide translation of content that cannot be understood by the viewer. For example dialogue or text that is not English in an English language film.\n    *   Subtitles may contain additional content, usually extra background information. For example the text at the beginning of the Star Wars films, or the date, time, and location of a scene.\n*   `captions`\n    *   Closed captions provide a transcription and possibly a translation of audio.\n    *   It may include important non-verbal information such as music cues or sound effects. It may indicate the cue's source (e.g. music, text, character).\n    *   Suitable for users who are deaf or when the sound is muted.\n*   `descriptions`\n    *   Textual description of the video content.\n    *   Suitable for users who are blind or where the video cannot be seen.\n*   `chapters`\n    *   Chapter titles are intended to be used when the user is navigating the media resource.\n*   `metadata`\n    *   Tracks used by scripts. Not visible to the user."
            },
            {
                "name": "label",
                "description": "A user-readable title of the text track which is used by the browser when listing available text tracks."
            },
            {
                "name": "src",
                "description": "Address of the track (`.vtt` file). Must be a valid URL. This attribute must be specified and its URL value must have the same origin as the document — unless the [`<audio>`](/en-US/docs/Web/HTML/Element/audio \"The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the <source> element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.\") or [`<video>`](/en-US/docs/Web/HTML/Element/video \"The HTML Video element (<video>) embeds a media player which supports video playback into the document.\") parent element of the `track` element has a `[crossorigin](/en-US/docs/Web/HTML/CORS_settings_attributes)` attribute."
            },
            {
                "name": "srclang",
                "description": "Language of the track text data. It must be a valid [BCP 47](https://r12a.github.io/app-subtags/) language tag. If the `kind` attribute is set to `subtitles,` then `srclang` must be defined."
            }
        ]
    },
    {
        "name": "map",
        "description": "The map element, in conjunction with an img element and any area element descendants, defines an image map. The element represents its children.",
        "attributes": [
            {
                "name": "name",
                "description": "The name attribute gives the map a name so that it can be referenced. The attribute must be present and must have a non-empty value with no space characters. The value of the name attribute must not be a compatibility-caseless match for the value of the name attribute of another map element in the same document. If the id attribute is also specified, both attributes must have the same value."
            }
        ]
    },
    {
        "name": "area",
        "description": "The area element represents either a hyperlink with some text and a corresponding area on an image map, or a dead area on an image map.",
        "attributes": [
            {
                "name": "alt"
            },
            {
                "name": "coords"
            },
            {
                "name": "shape",
                "valueSet": "sh"
            },
            {
                "name": "href"
            },
            {
                "name": "target"
            },
            {
                "name": "download"
            },
            {
                "name": "ping"
            },
            {
                "name": "rel"
            },
            {
                "name": "hreflang"
            },
            {
                "name": "type"
            },
            {
                "name": "accesskey",
                "description": "Specifies a keyboard navigation accelerator for the element. Pressing ALT or a similar key in association with the specified character selects the form control correlated with that key sequence. Page designers are forewarned to avoid key sequences already bound to browsers. This attribute is global since HTML5."
            }
        ]
    },
    {
        "name": "table",
        "description": "The table element represents data with more than one dimension, in the form of a table.",
        "attributes": [
            {
                "name": "sortable",
                "valueSet": "v"
            },
            {
                "name": "border"
            },
            {
                "name": "align",
                "description": "This enumerated attribute indicates how the table must be aligned inside the containing document. It may have the following values:\n\nleft: the table is displayed on the left side of the document;\n\ncenter: the table is displayed in the center of the document;\n\nright: the table is displayed on the right side of the document.\n\nUsage Note\n\nDo not use this attribute, as it has been deprecated. The &lt;table> element should be styled using CSS. Set margin-left and margin-right to auto or margin to 0 auto to achieve an effect that is similar to the align attribute.\n\nPrior to Firefox 4, Firefox also supported the middle, absmiddle, and abscenter values as synonyms of center, in quirks mode only.\n"
            }
        ]
    },
    {
        "name": "caption",
        "description": "The caption element represents the title of the table that is its parent, if it has a parent and that is a table element.",
        "attributes": [
            {
                "name": "align",
                "description": "This enumerated attribute indicates how the caption must be aligned with respect to the table. It may have one of the following values:\n\nleft\n\nThe caption is displayed to the left of the table.\n\ntop\n\nThe caption is displayed above the table.\n\nright\n\nThe caption is displayed to the right of the table.\n\nbottom\n\nThe caption is displayed below the table.\n\nUsage note: Do not use this attribute, as it has been deprecated. The &lt;caption> element should be styled using the CSS properties caption-side and text-align.\n"
            }
        ]
    },
    {
        "name": "colgroup",
        "description": "The colgroup element represents a group of one or more columns in the table that is its parent, if it has a parent and that is a table element.",
        "attributes": [
            {
                "name": "span"
            },
            {
                "name": "align",
                "description": "This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the `[char](/en-US/docs/Web/HTML/Element/col#attr-char)` and `[charoff](/en-US/docs/Web/HTML/Element/col#attr-charoff)` attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed. The descendant [`<col>`](/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") elements may override this value using their own `[align](/en-US/docs/Web/HTML/Element/col#attr-align)` attribute.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on a selector giving a [`<colgroup>`](/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element. Because [`<td>`](/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") elements are not descendant of the [`<colgroup>`](/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element, they won't inherit it.\n    *   If the table doesn't use a `[colspan](/en-US/docs/Web/HTML/Element/td#attr-colspan)` attribute, use one `td:nth-child(an+b)` CSS selector per column, where a is the total number of the columns in the table and b is the ordinal position of this column in the table. Only after this selector the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property can be used.\n    *   If the table does use a `[colspan](/en-US/docs/Web/HTML/Element/td#attr-colspan)` attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the `[char](/en-US/docs/Web/HTML/Element/colgroup#attr-char)` as the value of the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented."
            }
        ]
    },
    {
        "name": "col",
        "description": "If a col element has a parent and that is a colgroup element that itself has a parent that is a table element, then the col element represents one or more columns in the column group represented by that colgroup.",
        "attributes": [
            {
                "name": "span"
            },
            {
                "name": "align",
                "description": "This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the `[char](/en-US/docs/Web/HTML/Element/col#attr-char)` and `[charoff](/en-US/docs/Web/HTML/Element/col#attr-charoff)` attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, its value is inherited from the `[align](/en-US/docs/Web/HTML/Element/colgroup#attr-align)` of the [`<colgroup>`](/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element this `<col>` element belongs too. If there are none, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on a selector giving a [`<col>`](/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") element. Because [`<td>`](/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") elements are not descendant of the [`<col>`](/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") element, they won't inherit it.\n    *   If the table doesn't use a `[colspan](/en-US/docs/Web/HTML/Element/td#attr-colspan)` attribute, use the `td:nth-child(an+b)` CSS selector. Set `a` to zero and `b` to the position of the column in the table, e.g. `td:nth-child(2) { text-align: right; }` to right-align the second column.\n    *   If the table does use a `[colspan](/en-US/docs/Web/HTML/Element/td#attr-colspan)` attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the `[char](/en-US/docs/Web/HTML/Element/col#attr-char)` as the value of the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented."
            }
        ]
    },
    {
        "name": "tbody",
        "description": "The tbody element represents a block of rows that consist of a body of data for the parent table element, if the tbody element has a parent and it is a table.",
        "attributes": [
            {
                "name": "align",
                "description": "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\nleft, aligning the content to the left of the cell\n\ncenter, centering the content in the cell\n\nright, aligning the content to the right of the cell\n\njustify, inserting spaces into the textual content so that the content is justified in the cell\n\nchar, aligning the textual content on a special character with a minimal offset, defined by the \\[char](/en-US/docs/Web/HTML/Element/tbody#attr-char) and \\[charoff](/en-US/docs/Web/HTML/Element/tbody#attr-charoff) attributes.\n\nIf this attribute is not set, the left value is assumed.\n\nNote: Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\nTo achieve the same effect as the left, center, right or justify values, use the CSS text-align property on it.\n\nTo achieve the same effect as the char value, in CSS3, you can use the value of the \\[char](/en-US/docs/Web/HTML/Element/tbody#attr-char) as the value of the text-align property Unimplemented.\n"
            }
        ]
    },
    {
        "name": "thead",
        "description": "The thead element represents the block of rows that consist of the column labels (headers) for the parent table element, if the thead element has a parent and it is a table.",
        "attributes": [
            {
                "name": "align",
                "description": "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the `[char](/en-US/docs/Web/HTML/Element/thead#attr-char)` and `[charoff](/en-US/docs/Web/HTML/Element/thead#attr-charoff)` attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the `[char](/en-US/docs/Web/HTML/Element/thead#attr-char)` as the value of the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented."
            }
        ]
    },
    {
        "name": "tfoot",
        "description": "The tfoot element represents the block of rows that consist of the column summaries (footers) for the parent table element, if the tfoot element has a parent and it is a table.",
        "attributes": [
            {
                "name": "align",
                "description": "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the `[char](/en-US/docs/Web/HTML/Element/tbody#attr-char)` and `[charoff](/en-US/docs/Web/HTML/Element/tbody#attr-charoff)` attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the `[char](/en-US/docs/Web/HTML/Element/tfoot#attr-char)` as the value of the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented."
            }
        ]
    },
    {
        "name": "tr",
        "description": "The tr element represents a row of cells in a table.",
        "attributes": [
            {
                "name": "align",
                "description": "A DOMString which specifies how the cell's context should be aligned horizontally within the cells in the row; this is shorthand for using align on every cell in the row individually. Possible values are:\n\nleft\n\nAlign the content of each cell at its left edge.\n\ncenter\n\nCenter the contents of each cell between their left and right edges.\n\nright\n\nAlign the content of each cell at its right edge.\n\njustify\n\nWiden whitespaces within the text of each cell so that the text fills the full width of each cell (full justification).\n\nchar\n\nAlign each cell in the row on a specific character (such that each row in the column that is configured this way will horizontally align its cells on that character). This uses the \\[char](/en-US/docs/Web/HTML/Element/tr#attr-char) and \\[charoff](/en-US/docs/Web/HTML/Element/tr#attr-charoff) to establish the alignment character (typically \".\" or \",\" when aligning numerical data) and the number of characters that should follow the alignment character. This alignment type was never widely supported.\n\nIf no value is expressly set for align, the parent node's value is inherited.\n\nInstead of using the obsolete align attribute, you should instead use the CSS text-align property to establish left, center, right, or justify alignment for the row's cells. To apply character-based alignment, set the CSS text-align property to the alignment character (such as \".\" or \",\").\n"
            }
        ]
    },
    {
        "name": "td",
        "description": "The td element represents a data cell in a table.",
        "attributes": [
            {
                "name": "colspan"
            },
            {
                "name": "rowspan"
            },
            {
                "name": "headers"
            },
            {
                "name": "abbr",
                "description": "This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard. Alternatively, you can put the abbreviated description inside the cell and place the long content in the **title** attribute."
            },
            {
                "name": "align",
                "description": "This enumerated attribute specifies how the cell content's horizontal alignment will be handled. Possible values are:\n\n*   `left`: The content is aligned to the left of the cell.\n*   `center`: The content is centered in the cell.\n*   `right`: The content is aligned to the right of the cell.\n*   `justify` (with text only): The content is stretched out inside the cell so that it covers its entire width.\n*   `char` (with text only): The content is aligned to a character inside the `<th>` element with minimal offset. This character is defined by the `[char](/en-US/docs/Web/HTML/Element/td#attr-char)` and `[charoff](/en-US/docs/Web/HTML/Element/td#attr-charoff)` attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nThe default value when this attribute is not specified is `left`.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, apply the CSS [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property to the element.\n*   To achieve the same effect as the `char` value, give the [`text-align`](/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property the same value you would use for the `[char](/en-US/docs/Web/HTML/Element/td#attr-char)`. Unimplemented in CSS3."
            },
            {
                "name": "axis",
                "description": "This attribute contains a list of space-separated strings. Each string is the `id` of a group of cells that this header applies to.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard."
            },
            {
                "name": "bgcolor",
                "description": "This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in [sRGB](https://www.w3.org/Graphics/Color/sRGB) and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:\n\n \n\n`black` = \"#000000\"\n\n \n\n`green` = \"#008000\"\n\n \n\n`silver` = \"#C0C0C0\"\n\n \n\n`lime` = \"#00FF00\"\n\n \n\n`gray` = \"#808080\"\n\n \n\n`olive` = \"#808000\"\n\n \n\n`white` = \"#FFFFFF\"\n\n \n\n`yellow` = \"#FFFF00\"\n\n \n\n`maroon` = \"#800000\"\n\n \n\n`navy` = \"#000080\"\n\n \n\n`red` = \"#FF0000\"\n\n \n\n`blue` = \"#0000FF\"\n\n \n\n`purple` = \"#800080\"\n\n \n\n`teal` = \"#008080\"\n\n \n\n`fuchsia` = \"#FF00FF\"\n\n \n\n`aqua` = \"#00FFFF\"\n\n**Note:** Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The [`<td>`](/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") element should be styled using [CSS](/en-US/docs/CSS). To create a similar effect use the [`background-color`](/en-US/docs/Web/CSS/background-color \"The background-color CSS property sets the background color of an element.\") property in [CSS](/en-US/docs/CSS) instead."
            }
        ]
    },
    {
        "name": "th",
        "description": "The th element represents a header cell in a table.",
        "attributes": [
            {
                "name": "colspan"
            },
            {
                "name": "rowspan"
            },
            {
                "name": "headers"
            },
            {
                "name": "scope",
                "valueSet": "s"
            },
            {
                "name": "sorted"
            },
            {
                "name": "abbr",
                "description": "This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.\n"
            },
            {
                "name": "align",
                "description": "This enumerated attribute specifies how the cell content's horizontal alignment will be handled. Possible values are:\n\nleft: The content is aligned to the left of the cell.\n\ncenter: The content is centered in the cell.\n\nright: The content is aligned to the right of the cell.\n\njustify (with text only): The content is stretched out inside the cell so that it covers its entire width.\n\nchar (with text only): The content is aligned to a character inside the &lt;th> element with minimal offset. This character is defined by the \\[char](/en-US/docs/Web/HTML/Element/th#attr-char) and \\[charoff](/en-US/docs/Web/HTML/Element/th#attr-charoff) attributes.\n\nThe default value when this attribute is not specified is left.\n\nNote: Do not use this attribute as it is obsolete in the latest standard.\n\nTo achieve the same effect as the left, center, right or justify values, apply the CSS text-align property to the element.\n\nTo achieve the same effect as the char value, give the text-align property the same value you would use for the \\[char](/en-US/docs/Web/HTML/Element/th#attr-char). Unimplemented in CSS3.\n"
            },
            {
                "name": "axis",
                "description": "This attribute contains a list of space-separated strings. Each string is the id of a group of cells that this header applies to.\n\nNote: Do not use this attribute as it is obsolete in the latest standard: use the \\[scope](/en-US/docs/Web/HTML/Element/th#attr-scope) attribute instead.\n"
            },
            {
                "name": "bgcolor",
                "description": "This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in sRGB and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:\n\nblack = \"#000000\"\n\ngreen = \"#008000\"\n\nsilver = \"#C0C0C0\"\n\nlime = \"#00FF00\"\n\ngray = \"#808080\"\n\nolive = \"#808000\"\n\nwhite = \"#FFFFFF\"\n\nyellow = \"#FFFF00\"\n\nmaroon = \"#800000\"\n\nnavy = \"#000080\"\n\nred = \"#FF0000\"\n\nblue = \"#0000FF\"\n\npurple = \"#800080\"\n\nteal = \"#008080\"\n\nfuchsia = \"#FF00FF\"\n\naqua = \"#00FFFF\"\n\nNote: Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The &lt;th> element should be styled using CSS. To create a similar effect use the background-color property in CSS instead.\n"
            }
        ]
    },
    {
        "name": "form",
        "description": "The form element represents a collection of form-associated elements, some of which can represent editable values that can be submitted to a server for processing.",
        "attributes": [
            {
                "name": "accept-charset",
                "description": "A space- or comma-delimited list of character encodings that the server accepts. The browser uses them in the order in which they are listed. The default value, the reserved string `\"UNKNOWN\"`, indicates the same encoding as that of the document containing the form element.  \nIn previous versions of HTML, the different character encodings could be delimited by spaces or commas. In HTML5, only spaces are allowed as delimiters."
            },
            {
                "name": "action",
                "description": "The URI of a program that processes the form information. This value can be overridden by a `[formaction](/en-US/docs/Web/HTML/Element/button#attr-formaction)` attribute on a [`<button>`](/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element."
            },
            {
                "name": "autocomplete",
                "valueSet": "o",
                "description": "Indicates whether input elements can by default have their values automatically completed by the browser. This setting can be overridden by an `autocomplete` attribute on an element belonging to the form. Possible values are:\n\n*   `off`: The user must explicitly enter a value into each field for every use, or the document provides its own auto-completion method; the browser does not automatically complete entries.\n*   `on`: The browser can automatically complete values based on values that the user has previously entered in the form.\n\nFor most modern browsers (including Firefox 38+, Google Chrome 34+, IE 11+) setting the autocomplete attribute will not prevent a browser's password manager from asking the user if they want to store login fields (username and password), if the user permits the storage the browser will autofill the login the next time the user visits the page. See [The autocomplete attribute and login fields](/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields)."
            },
            {
                "name": "enctype",
                "valueSet": "et",
                "description": "When the value of the `method` attribute is `post`, enctype is the [MIME type](https://en.wikipedia.org/wiki/Mime_type) of content that is used to submit the form to the server. Possible values are:\n\n*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified.\n*   `multipart/form-data`: The value used for an [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element with the `type` attribute set to \"file\".\n*   `text/plain`: (HTML5)\n\nThis value can be overridden by a `[formenctype](/en-US/docs/Web/HTML/Element/button#attr-formenctype)` attribute on a [`<button>`](/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element."
            },
            {
                "name": "method",
                "valueSet": "m",
                "description": "The [HTTP](/en-US/docs/Web/HTTP) method that the browser uses to submit the form. Possible values are:\n\n*   `post`: Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) ; form data are included in the body of the form and sent to the server.\n*   `get`: Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the `action` attribute URI with a '?' as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n*   `dialog`: Use when the form is inside a [`<dialog>`](/en-US/docs/Web/HTML/Element/dialog \"The HTML <dialog> element represents a dialog box or other interactive component, such as an inspector or window.\") element to close the dialog when submitted.\n\nThis value can be overridden by a `[formmethod](/en-US/docs/Web/HTML/Element/button#attr-formmethod)` attribute on a [`<button>`](/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element."
            },
            {
                "name": "name",
                "description": "The name of the form. In HTML 4, its use is deprecated (`id` should be used instead). It must be unique among the forms in a document and not just an empty string in HTML 5."
            },
            {
                "name": "novalidate",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the form is not to be validated when submitted. If this attribute is not specified (and therefore the form is validated), this default setting can be overridden by a `[formnovalidate](/en-US/docs/Web/HTML/Element/button#attr-formnovalidate)` attribute on a [`<button>`](/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element belonging to the form."
            },
            {
                "name": "target",
                "description": "A name or keyword indicating where to display the response that is received after submitting the form. In HTML 4, this is the name/keyword for a frame. In HTML5, it is a name/keyword for a _browsing context_ (for example, tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the response into the same HTML 4 frame (or HTML5 browsing context) as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the response into a new unnamed HTML 4 window or HTML5 browsing context.\n*   `_parent`: Load the response into the HTML 4 frameset parent of the current frame, or HTML5 parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: HTML 4: Load the response into the full original window, and cancel all other frames. HTML5: Load the response into the top-level browsing context (i.e., the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n*   _iframename_: The response is displayed in a named [`<iframe>`](/en-US/docs/Web/HTML/Element/iframe \"The HTML Inline Frame element (<iframe>) represents a nested browsing context, embedding another HTML page into the current one.\").\n\nHTML5: This value can be overridden by a `[formtarget](/en-US/docs/Web/HTML/Element/button#attr-formtarget)` attribute on a [`<button>`](/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element."
            },
            {
                "name": "accept",
                "description": "A comma-separated list of content types that the server accepts.\n\n**Usage note:** This attribute has been removed in HTML5 and should no longer be used. Instead, use the `[accept](/en-US/docs/Web/HTML/Element/input#attr-accept)` attribute of the specific [`<input>`](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element."
            },
            {
                "name": "autocapitalize",
                "description": "This is a nonstandard attribute used by iOS Safari Mobile which controls whether and how the text value for textual form control descendants should be automatically capitalized as it is entered/edited by the user. If the `autocapitalize` attribute is specified on an individual form control descendant, it trumps the form-wide `autocapitalize` setting. The non-deprecated values are available in iOS 5 and later. The default value is `sentences`. Possible values are:\n\n*   `none`: Completely disables automatic capitalization\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5."
            }
        ]
    },
    {
        "name": "label",
        "description": "The label element represents a caption in a user interface. The caption can be associated with a specific form control, known as the label element's labeled control, either using the for attribute, or by putting the form control inside the label element itself.",
        "attributes": [
            {
                "name": "form",
                "description": "The [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element with which the label is associated (its _form owner_). If specified, the value of the attribute is the `id` of a [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element in the same document. This lets you place label elements anywhere within a document, not just as descendants of their form elements."
            },
            {
                "name": "for",
                "description": "The `[id](/en-US/docs/Web/HTML/Global_attributes#attr-id)` of a [labelable](/en-US/docs/Web/Guide/HTML/Content_categories#Form_labelable) form-related element in the same document as the `<label>` element. The first element in the document with an `id` matching the value of the `for` attribute is the _labeled control_ for this label element, if it is a labelable element. If it is not labelable then the `for` attribute has no effect. If there are other elements which also match the `id` value, later in the document, they are not considered.\n\n**Note**: A `<label>` element can have both a `for` attribute and a contained control element, as long as the `for` attribute points to the contained control element."
            }
        ]
    },
    {
        "name": "input",
        "description": "The input element represents a typed data field, usually with a form control to allow the user to edit the data.",
        "attributes": [
            {
                "name": "accept"
            },
            {
                "name": "alt"
            },
            {
                "name": "autocomplete",
                "valueSet": "inputautocomplete"
            },
            {
                "name": "autofocus",
                "valueSet": "v"
            },
            {
                "name": "checked",
                "valueSet": "v"
            },
            {
                "name": "dirname"
            },
            {
                "name": "disabled",
                "valueSet": "v"
            },
            {
                "name": "form"
            },
            {
                "name": "formaction"
            },
            {
                "name": "formenctype",
                "valueSet": "et"
            },
            {
                "name": "formmethod",
                "valueSet": "fm"
            },
            {
                "name": "formnovalidate",
                "valueSet": "v"
            },
            {
                "name": "formtarget"
            },
            {
                "name": "height"
            },
            {
                "name": "inputmode",
                "valueSet": "im"
            },
            {
                "name": "list"
            },
            {
                "name": "max"
            },
            {
                "name": "maxlength"
            },
            {
                "name": "min"
            },
            {
                "name": "minlength"
            },
            {
                "name": "multiple",
                "valueSet": "v"
            },
            {
                "name": "name"
            },
            {
                "name": "pattern"
            },
            {
                "name": "placeholder"
            },
            {
                "name": "readonly",
                "valueSet": "v"
            },
            {
                "name": "required",
                "valueSet": "v"
            },
            {
                "name": "size"
            },
            {
                "name": "src"
            },
            {
                "name": "step"
            },
            {
                "name": "type",
                "valueSet": "t"
            },
            {
                "name": "value"
            },
            {
                "name": "width"
            }
        ]
    },
    {
        "name": "button",
        "description": "The button element represents a button labeled by its contents.",
        "attributes": [
            {
                "name": "autofocus",
                "valueSet": "v",
                "description": "This Boolean attribute lets you specify that the button should have input focus when the page loads, unless the user overrides it, for example by typing in a different control. Only one form-associated element in a document can have this attribute specified.\n"
            },
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the user cannot interact with the button. If this attribute is not specified, the button inherits its setting from the containing element, for example &lt;fieldset>; if there is no containing element with the disabled attribute set, then the button is enabled.\n\nFirefox will, unlike other browsers, by default, persist the dynamic disabled state of a &lt;button> across page loads. Use the \\[autocomplete](/en-US/docs/Web/HTML/Element/button#attr-autocomplete) attribute to control this feature.\n"
            },
            {
                "name": "form",
                "description": "The form element that the button is associated with (its form owner). The value of the attribute must be the id attribute of a &lt;form> element in the same document. If this attribute is not specified, the &lt;button> element will be associated to an ancestor &lt;form> element, if one exists. This attribute enables you to associate &lt;button> elements to &lt;form> elements anywhere within a document, not just as descendants of &lt;form> elements.\n"
            },
            {
                "name": "formaction",
                "description": "The URI of a program that processes the information submitted by the button. If specified, it overrides the \\[action](/en-US/docs/Web/HTML/Element/form#attr-action) attribute of the button's form owner.\n"
            },
            {
                "name": "formenctype",
                "valueSet": "et",
                "description": "If the button is a submit button, this attribute specifies the type of content that is used to submit the form to the server. Possible values are:\n\napplication/x-www-form-urlencoded: The default value if the attribute is not specified.\n\nmultipart/form-data: Use this value if you are using an &lt;input> element with the \\[type](/en-US/docs/Web/HTML/Element/input#attr-type) attribute set to file.\n\ntext/plain\n\nIf this attribute is specified, it overrides the \\[enctype](/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute of the button's form owner.\n"
            },
            {
                "name": "formmethod",
                "valueSet": "fm",
                "description": "If the button is a submit button, this attribute specifies the HTTP method that the browser uses to submit the form. Possible values are:\n\npost: The data from the form are included in the body of the form and sent to the server.\n\nget: The data from the form are appended to the form attribute URI, with a '?' as a separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n\nIf specified, this attribute overrides the \\[method](/en-US/docs/Web/HTML/Element/form#attr-method) attribute of the button's form owner.\n"
            },
            {
                "name": "formnovalidate",
                "valueSet": "v",
                "description": "If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the \\[novalidate](/en-US/docs/Web/HTML/Element/form#attr-novalidate) attribute of the button's form owner.\n"
            },
            {
                "name": "formtarget",
                "description": "If the button is a submit button, this attribute is a name or keyword indicating where to display the response that is received after submitting the form. This is a name of, or keyword for, a browsing context (for example, tab, window, or inline frame). If this attribute is specified, it overrides the \\[target](/en-US/docs/Web/HTML/Element/form#attr-target) attribute of the button's form owner. The following keywords have special meanings:\n\n\\_self: Load the response into the same browsing context as the current one. This value is the default if the attribute is not specified.\n\n\\_blank: Load the response into a new unnamed browsing context.\n\n\\_parent: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as \\_self.\n\n\\_top: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as \\_self.\n"
            },
            {
                "name": "name",
                "description": "The name of the button, which is submitted with the form data.\n"
            },
            {
                "name": "type",
                "valueSet": "bt",
                "description": "The type of the button. Possible values are:\n\nsubmit: The button submits the form data to the server. This is the default if the attribute is not specified, or if the attribute is dynamically changed to an empty or invalid value.\n\nreset: The button resets all the controls to their initial values.\n\nbutton: The button has no default behavior. It can have client-side scripts associated with the element's events, which are triggered when the events occur.\n"
            },
            {
                "name": "value",
                "description": "The initial value of the button. It defines the value associated with the button which is submitted with the form data. This value is passed to the server in params when the form is submitted.\n"
            },
            {
                "name": "autocomplete",
                "description": "The use of this attribute on a &lt;button> is nonstandard and Firefox-specific. By default, unlike other browsers, Firefox persists the dynamic disabled state of a &lt;button> across page loads. Setting the value of this attribute to off (i.e. autocomplete=\"off\") disables this feature. See bug 654072.\n"
            }
        ]
    },
    {
        "name": "select",
        "description": "The select element represents a control for selecting amongst a set of options.",
        "attributes": [
            {
                "name": "autocomplete",
                "valueSet": "inputautocomplete",
                "description": "A DOMString providing a hint for a user agent's autocomplete feature. See The HTML autocomplete attribute for a complete list of values and details on how to use autocomplete.\n"
            },
            {
                "name": "autofocus",
                "valueSet": "v",
                "description": "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form element in a document can have the autofocus attribute.\n"
            },
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example fieldset; if there is no containing element with the disabled attribute set, then the control is enabled.\n"
            },
            {
                "name": "form",
                "description": "This attribute lets you specify the form element to which the select element is associated (that is, its \"form owner\"). If this attribute is specified, its value must be the same as the id of a form element in the same document. This enables you to place select elements anywhere within a document, not just as descendants of their form elements.\n"
            },
            {
                "name": "multiple",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that multiple options can be selected in the list. If it is not specified, then only one option can be selected at a time. When multiple is specified, most browsers will show a scrolling list box instead of a single line dropdown.\n"
            },
            {
                "name": "name",
                "description": "This attribute is used to specify the name of the control.\n"
            },
            {
                "name": "required",
                "valueSet": "v",
                "description": "A Boolean attribute indicating that an option with a non-empty string value must be selected.\n"
            },
            {
                "name": "size",
                "description": "If the control is presented as a scrolling list box (e.g. when multiple is specified), this attribute represents the number of rows in the list that should be visible at one time. Browsers are not required to present a select element as a scrolled list box. The default value is 0.\n\nNote: According to the HTML5 specification, the default value for size should be 1; however, in practice, this has been found to break some web sites, and no other browser currently does that, so Mozilla has opted to continue to return 0 for the time being with Firefox.\n"
            }
        ]
    },
    {
        "name": "datalist",
        "description": "The datalist element represents a set of option elements that represent predefined options for other controls. In the rendering, the datalist element represents nothing and it, along with its children, should be hidden.",
        "attributes": []
    },
    {
        "name": "optgroup",
        "description": "The optgroup element represents a group of option elements with a common label.",
        "attributes": [
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "If this Boolean attribute is set, none of the items in this option group is selectable. Often browsers grey out such control and it won't receive any browsing events, like mouse clicks or focus-related ones."
            },
            {
                "name": "label",
                "description": "The name of the group of options, which the browser can use when labeling the options in the user interface. This attribute is mandatory if this element is used."
            }
        ]
    },
    {
        "name": "option",
        "description": "The option element represents an option in a select element or as part of a list of suggestions in a datalist element.",
        "attributes": [
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "If this Boolean attribute is set, this option is not checkable. Often browsers grey out such control and it won't receive any browsing event, like mouse clicks or focus-related ones. If this attribute is not set, the element can still be disabled if one of its ancestors is a disabled &lt;optgroup> element.\n"
            },
            {
                "name": "label",
                "description": "This attribute is text for the label indicating the meaning of the option. If the label attribute isn't defined, its value is that of the element text content.\n"
            },
            {
                "name": "selected",
                "valueSet": "v",
                "description": "If present, this Boolean attribute indicates that the option is initially selected. If the &lt;option> element is the descendant of a &lt;select> element whose \\[multiple](/en-US/docs/Web/HTML/Element/select#attr-multiple) attribute is not set, only one single &lt;option> of this &lt;select> element may have the selected attribute.\n"
            },
            {
                "name": "value",
                "description": "The content of this attribute represents the value to be submitted with the form, should this option be selected. If this attribute is omitted, the value is taken from the text content of the option element.\n"
            }
        ]
    },
    {
        "name": "textarea",
        "description": "The textarea element represents a multiline plain text edit control for the element's raw value. The contents of the control represent the control's default value.",
        "attributes": [
            {
                "name": "autocomplete",
                "valueSet": "inputautocomplete",
                "description": "This attribute indicates whether the value of the control can be automatically completed by the browser. Possible values are:\n\n*   `off`: The user must explicitly enter a value into this field for every use, or the document provides its own auto-completion method; the browser does not automatically complete the entry.\n*   `on`: The browser can automatically complete the value based on values that the user has entered during previous uses.\n\nIf the `autocomplete` attribute is not specified on a `<textarea>` element, then the browser uses the `autocomplete` attribute value of the `<textarea>` element's form owner. The form owner is either the [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element that this `<textarea>` element is a descendant of or the form element whose `id` is specified by the `form` attribute of the input element. For more information, see the `[autocomplete](/en-US/docs/Web/HTML/Element/form#attr-autocomplete)` attribute in [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\")."
            },
            {
                "name": "autofocus",
                "valueSet": "v",
                "description": "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form-associated element in a document can have this attribute specified."
            },
            {
                "name": "cols",
                "description": "The visible width of the text control, in average character widths. If it is specified, it must be a positive integer. If it is not specified, the default value is `20`."
            },
            {
                "name": "dirname"
            },
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example [`<fieldset>`](/en-US/docs/Web/HTML/Element/fieldset \"The HTML <fieldset> element is used to group several controls as well as labels (<label>) within a web form.\"); if there is no containing element when the `disabled` attribute is set, the control is enabled."
            },
            {
                "name": "form",
                "description": "The form element that the `<textarea>` element is associated with (its \"form owner\"). The value of the attribute must be the `id` of a form element in the same document. If this attribute is not specified, the `<textarea>` element must be a descendant of a form element. This attribute enables you to place `<textarea>` elements anywhere within a document, not just as descendants of form elements."
            },
            {
                "name": "inputmode",
                "valueSet": "im"
            },
            {
                "name": "maxlength",
                "description": "The maximum number of characters (unicode code points) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters."
            },
            {
                "name": "minlength",
                "description": "The minimum number of characters (unicode code points) required that the user should enter."
            },
            {
                "name": "name",
                "description": "The name of the control."
            },
            {
                "name": "placeholder",
                "description": "A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint.\n\n**Note:** Placeholders should only be used to show an example of the type of data that should be entered into a form; they are _not_ a substitute for a proper [`<label>`](/en-US/docs/Web/HTML/Element/label \"The HTML <label> element represents a caption for an item in a user interface.\") element tied to the input. See [Labels and placeholders](/en-US/docs/Web/HTML/Element/input#Labels_and_placeholders \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") in [<input>: The Input (Form Input) element](/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") for a full explanation."
            },
            {
                "name": "readonly",
                "valueSet": "v",
                "description": "This Boolean attribute indicates that the user cannot modify the value of the control. Unlike the `disabled` attribute, the `readonly` attribute does not prevent the user from clicking or selecting in the control. The value of a read-only control is still submitted with the form."
            },
            {
                "name": "required",
                "valueSet": "v",
                "description": "This attribute specifies that the user must fill in a value before submitting a form."
            },
            {
                "name": "rows",
                "description": "The number of visible text lines for the control."
            },
            {
                "name": "wrap",
                "valueSet": "w",
                "description": "Indicates how the control wraps text. Possible values are:\n\n*   `hard`: The browser automatically inserts line breaks (CR+LF) so that each line has no more than the width of the control; the `cols` attribute must also be specified for this to take effect.\n*   `soft`: The browser ensures that all line breaks in the value consist of a CR+LF pair, but does not insert any additional line breaks.\n*   `off` : Like `soft` but changes appearance to `white-space: pre` so line segments exceeding `cols` are not wrapped and the `<textarea>` becomes horizontally scrollable.\n\nIf this attribute is not specified, `soft` is its default value."
            },
            {
                "name": "autocapitalize",
                "description": "This is a non-standard attribute supported by WebKit on iOS (therefore nearly all browsers running on iOS, including Safari, Firefox, and Chrome), which controls whether and how the text value should be automatically capitalized as it is entered/edited by the user. The non-deprecated values are available in iOS 5 and later. Possible values are:\n\n*   `none`: Completely disables automatic capitalization.\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5."
            },
            {
                "name": "spellcheck",
                "description": "Specifies whether the `<textarea>` is subject to spell checking by the underlying browser/OS. the value can be:\n\n*   `true`: Indicates that the element needs to have its spelling and grammar checked.\n*   `default` : Indicates that the element is to act according to a default behavior, possibly based on the parent element's own `spellcheck` value.\n*   `false` : Indicates that the element should not be spell checked."
            }
        ]
    },
    {
        "name": "output",
        "description": "The output element represents the result of a calculation performed by the application, or the result of a user action.",
        "attributes": [
            {
                "name": "for",
                "description": "A space-separated list of other elements’ \\[id](/en-US/docs/Web/HTML/Global_attributes/id)s, indicating that those elements contributed input values to (or otherwise affected) the calculation.\n"
            },
            {
                "name": "form",
                "description": "The form element that this element is associated with (its \"form owner\"). The value of the attribute must be an id of a form element in the same document. If this attribute is not specified, the output element must be a descendant of a form element. This attribute enables you to place output elements anywhere within a document, not just as descendants of their form elements.\n"
            },
            {
                "name": "name",
                "description": "The name of the element, exposed in the HTMLFormElement API.\n"
            }
        ]
    },
    {
        "name": "progress",
        "description": "The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a number in the range zero to a maximum, giving the fraction of work that has so far been completed.",
        "attributes": [
            {
                "name": "value",
                "description": "This attribute specifies how much of the task that has been completed. It must be a valid floating point number between 0 and `max`, or between 0 and 1 if `max` is omitted. If there is no `value` attribute, the progress bar is indeterminate; this indicates that an activity is ongoing with no indication of how long it is expected to take."
            },
            {
                "name": "max",
                "description": "This attribute describes how much work the task indicated by the `progress` element requires. The `max` attribute, if present, must have a value greater than zero and be a valid floating point number. The default value is 1."
            }
        ]
    },
    {
        "name": "meter",
        "description": "The meter element represents a scalar measurement within a known range, or a fractional value; for example disk usage, the relevance of a query result, or the fraction of a voting population to have selected a particular candidate.",
        "attributes": [
            {
                "name": "value",
                "description": "The current numeric value. This must be between the minimum and maximum values (`min` attribute and `max` attribute) if they are specified. If unspecified or malformed, the value is 0. If specified, but not within the range given by the `min` attribute and `max` attribute, the value is equal to the nearest end of the range.\n\n**Usage note:** Unless the `value` attribute is between `0` and `1` (inclusive), the `min` and `max` attributes should define the range so that the `value` attribute's value is within it."
            },
            {
                "name": "min",
                "description": "The lower numeric bound of the measured range. This must be less than the maximum value (`max` attribute), if specified. If unspecified, the minimum value is 0."
            },
            {
                "name": "max",
                "description": "The upper numeric bound of the measured range. This must be greater than the minimum value (`min` attribute), if specified. If unspecified, the maximum value is 1."
            },
            {
                "name": "low",
                "description": "The upper numeric bound of the low end of the measured range. This must be greater than the minimum value (`min` attribute), and it also must be less than the high value and maximum value (`high` attribute and `max` attribute, respectively), if any are specified. If unspecified, or if less than the minimum value, the `low` value is equal to the minimum value."
            },
            {
                "name": "high",
                "description": "The lower numeric bound of the high end of the measured range. This must be less than the maximum value (`max` attribute), and it also must be greater than the low value and minimum value (`low` attribute and **min** attribute, respectively), if any are specified. If unspecified, or if greater than the maximum value, the `high` value is equal to the maximum value."
            },
            {
                "name": "optimum",
                "description": "This attribute indicates the optimal numeric value. It must be within the range (as defined by the `min` attribute and `max` attribute). When used with the `low` attribute and `high` attribute, it gives an indication where along the range is considered preferable. For example, if it is between the `min` attribute and the `low` attribute, then the lower range is considered preferred."
            },
            {
                "name": "form",
                "description": "This attribute associates the element with a `form` element that has ownership of the `meter` element. For example, a `meter` might be displaying a range corresponding to an `input` element of `type` _number_. This attribute is only used if the `meter` element is being used as a form-associated element; even then, it may be omitted if the element appears as a descendant of a `form` element."
            }
        ]
    },
    {
        "name": "fieldset",
        "description": "The fieldset element represents a set of form controls optionally grouped under a common name.",
        "attributes": [
            {
                "name": "disabled",
                "valueSet": "v",
                "description": "If this Boolean attribute is set, all form controls that are descendants of the `<fieldset>`, are disabled, meaning they are not editable and won't be submitted along with the `<form>`. They won't receive any browsing events, like mouse clicks or focus-related events. By default browsers display such controls grayed out. Note that form elements inside the [`<legend>`](/en-US/docs/Web/HTML/Element/legend \"The HTML <legend> element represents a caption for the content of its parent <fieldset>.\") element won't be disabled."
            },
            {
                "name": "form",
                "description": "This attribute takes the value of the `id` attribute of a [`<form>`](/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element you want the `<fieldset>` to be part of, even if it is not inside the form."
            },
            {
                "name": "name",
                "description": "The name associated with the group.\n\n**Note**: The caption for the fieldset is given by the first [`<legend>`](/en-US/docs/Web/HTML/Element/legend \"The HTML <legend> element represents a caption for the content of its parent <fieldset>.\") element nested inside it."
            }
        ]
    },
    {
        "name": "legend",
        "description": "The legend element represents a caption for the rest of the contents of the legend element's parent fieldset element, if any.",
        "attributes": []
    },
    {
        "name": "details",
        "description": "The details element represents a disclosure widget from which the user can obtain additional information or controls.",
        "attributes": [
            {
                "name": "open",
                "valueSet": "v",
                "description": "This Boolean attribute indicates whether or not the details — that is, the contents of the &lt;details> element — are currently visible. The default, false, means the details are not visible.\n"
            }
        ]
    },
    {
        "name": "summary",
        "description": "The summary element represents a summary, caption, or legend for the rest of the contents of the summary element's parent details element, if any.",
        "attributes": []
    },
    {
        "name": "dialog",
        "description": "The dialog element represents a part of an application that a user interacts with to perform a task, for example a dialog box, inspector, or window.",
        "attributes": [
            {
                "name": "open",
                "description": "Indicates that the dialog is active and available for interaction. When the `open` attribute is not set, the dialog shouldn't be shown to the user."
            }
        ]
    },
    {
        "name": "script",
        "description": "The script element allows authors to include dynamic script and data blocks in their documents. The element does not represent content for the user.",
        "attributes": [
            {
                "name": "src",
                "description": "This attribute specifies the URI of an external script; this can be used as an alternative to embedding a script directly within a document.\n\nIf a script element has a src attribute specified, it should not have a script embedded inside its tags.\n"
            },
            {
                "name": "type",
                "description": "This attribute indicates the type of script represented. The value of this attribute will be in one of the following categories:\n\nOmitted or a JavaScript MIME type: For HTML5-compliant browsers this indicates the script is JavaScript. HTML5 specification urges authors to omit the attribute rather than provide a redundant MIME type. In earlier browsers, this identified the scripting language of the embedded or imported (via the src attribute) code. JavaScript MIME types are listed in the specification.\n\nmodule: For HTML5-compliant browsers the code is treated as a JavaScript module. The processing of the script contents is not affected by the charset and defer attributes. For information on using module, see ES6 in Depth: Modules. Code may behave differently when the module keyword is used.\n\nAny other value: The embedded content is treated as a data block which won't be processed by the browser. Developers must use a valid MIME type that is not a JavaScript MIME type to denote data blocks. The src attribute will be ignored.\n\nNote: in Firefox you could specify the version of JavaScript contained in a &lt;script> element by including a non-standard version parameter inside the type attribute — for example type=\"text/javascript;version=1.8\". This has been removed in Firefox 59 (see bug 1428745).\n"
            },
            {
                "name": "charset"
            },
            {
                "name": "async",
                "valueSet": "v",
                "description": "This is a Boolean attribute indicating that the browser should, if possible, load the script asynchronously.\n\nThis attribute must not be used if the src attribute is absent (i.e. for inline scripts). If it is included in this case it will have no effect.\n\nBrowsers usually assume the worst case scenario and load scripts synchronously, (i.e. async=\"false\") during HTML parsing.\n\nDynamically inserted scripts (using document.createElement()) load asynchronously by default, so to turn on synchronous loading (i.e. scripts load in the order they were inserted) set async=\"false\".\n\nSee Browser compatibility for notes on browser support. See also Async scripts for asm.js.\n"
            },
            {
                "name": "defer",
                "valueSet": "v",
                "description": "This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document has been parsed, but before firing \\[DOMContentLoaded](/en-US/docs/Web/Events/DOMContentLoaded \"/en-US/docs/Web/Events/DOMContentLoaded\").\n\nScripts with the defer attribute will prevent the DOMContentLoaded event from firing until the script has loaded and finished evaluating.\n\nThis attribute must not be used if the src attribute is absent (i.e. for inline scripts), in this case it would have no effect.\n\nTo achieve a similar effect for dynamically inserted scripts use async=\"false\" instead. Scripts with the defer attribute will execute in the order in which they appear in the document.\n"
            },
            {
                "name": "crossorigin",
                "valueSet": "xo",
                "description": "Normal script elements pass minimal information to the window.onerror for scripts which do not pass the standard CORS checks. To allow error logging for sites which use a separate domain for static media, use this attribute. See CORS settings attributes for a more descriptive explanation of its valid arguments.\n"
            },
            {
                "name": "nonce",
                "description": "A cryptographic nonce (number used once) to whitelist inline scripts in a script-src Content-Security-Policy. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.\n"
            },
            {
                "name": "integrity",
                "description": "This attribute contains inline metadata that a user agent can use to verify that a fetched resource has been delivered free of unexpected manipulation. See Subresource Integrity.\n"
            },
            {
                "name": "nomodule",
                "description": "This Boolean attribute is set to indicate that the script should not be executed in browsers that support ES2015 modules — in effect, this can be used to serve fallback scripts to older browsers that do not support modular JavaScript code.\n"
            },
            {
                "name": "referrerpolicy",
                "description": "Indicates which referrer to send when fetching the script, or resources fetched by the script:\n\nno-referrer: The Referer header will not be sent.\n\nno-referrer-when-downgrade (default): The Referer header will not be sent to origins without TLS (HTTPS).\n\norigin: The sent referrer will be limited to the origin of the referring page: its scheme, host, and port.\n\norigin-when-cross-origin: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n\nsame-origin: A referrer will be sent for same origin, but cross-origin requests will contain no referrer information.\n\nstrict-origin: Only send the origin of the document as the referrer when the protocol security level stays the same (e.g. HTTPS→HTTPS), but don't send it to a less secure destination (e.g. HTTPS→HTTP).\n\nstrict-origin-when-cross-origin: Send a full URL when performing a same-origin request, but only send the origin when the protocol security level stays the same (e.g.HTTPS→HTTPS), and send no header to a less secure destination (e.g. HTTPS→HTTP).\n\nunsafe-url: The referrer will include the origin and the path (but not the fragment, password, or username). This value is unsafe, because it leaks origins and paths from TLS-protected resources to insecure origins.\n\nNote: An empty string value (\"\") is both the default value, and a fallback value if referrerpolicy is not supported. If referrerpolicy is not explicitly specified on the &lt;script> element, it will adopt a higher-level referrer policy, i.e. one set on the whole document or domain. If a higher-level policy is not available, the empty string is treated as being equivalent to no-referrer-when-downgrade.\n"
            },
            {
                "name": "text",
                "description": "Like the textContent attribute, this attribute sets the text content of the element. Unlike the textContent attribute, however, this attribute is evaluated as executable code after the node is inserted into the DOM.\n"
            }
        ]
    },
    {
        "name": "noscript",
        "description": "The noscript element represents nothing if scripting is enabled, and represents its children if scripting is disabled. It is used to present different markup to user agents that support scripting and those that don't support scripting, by affecting how the document is parsed.",
        "attributes": []
    },
    {
        "name": "template",
        "description": "The template element is used to declare fragments of HTML that can be cloned and inserted in the document by script.",
        "attributes": []
    },
    {
        "name": "canvas",
        "description": "The canvas element provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images on the fly.",
        "attributes": [
            {
                "name": "width",
                "description": "The width of the coordinate space in CSS pixels. Defaults to 300."
            },
            {
                "name": "height",
                "description": "The height of the coordinate space in CSS pixels. Defaults to 150."
            },
            {
                "name": "moz-opaque",
                "description": "Lets the canvas know whether or not translucency will be a factor. If the canvas knows there's no translucency, painting performance can be optimized. This is only supported by Mozilla-based browsers; use the standardized [`canvas.getContext('2d', { alpha: false })`](/en-US/docs/Web/API/HTMLCanvasElement/getContext \"The HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null if the context identifier is not supported.\") instead."
            }
        ]
    }
];
//# sourceMappingURL=html5Tags.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/data/html5Events.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var HTML5_EVENTS = [
    {
        "name": "onabort",
        "description": "The loading of a resource has been aborted."
    },
    {
        "name": "onblur",
        "description": "An element has lost focus (does not bubble)."
    },
    {
        "name": "oncanplay",
        "description": "The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content."
    },
    {
        "name": "oncanplaythrough",
        "description": "The user agent can play the media up to its end without having to stop for further buffering of content."
    },
    {
        "name": "onchange",
        "description": "The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user."
    },
    {
        "name": "onclick",
        "description": "A pointing device button has been pressed and released on an element."
    },
    {
        "name": "oncontextmenu",
        "description": "The right button of the mouse is clicked (before the context menu is displayed)."
    },
    {
        "name": "ondblclick",
        "description": "A pointing device button is clicked twice on an element."
    },
    {
        "name": "ondrag",
        "description": "An element or text selection is being dragged (every 350ms)."
    },
    {
        "name": "ondragend",
        "description": "A drag operation is being ended (by releasing a mouse button or hitting the escape key)."
    },
    {
        "name": "ondragenter",
        "description": "A dragged element or text selection enters a valid drop target."
    },
    {
        "name": "ondragleave",
        "description": "A dragged element or text selection leaves a valid drop target."
    },
    {
        "name": "ondragover",
        "description": "An element or text selection is being dragged over a valid drop target (every 350ms)."
    },
    {
        "name": "ondragstart",
        "description": "The user starts dragging an element or text selection."
    },
    {
        "name": "ondrop",
        "description": "An element is dropped on a valid drop target."
    },
    {
        "name": "ondurationchange",
        "description": "The duration attribute has been updated."
    },
    {
        "name": "onemptied",
        "description": "The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it."
    },
    {
        "name": "onended",
        "description": "Playback has stopped because the end of the media was reached."
    },
    {
        "name": "onerror",
        "description": "A resource failed to load."
    },
    {
        "name": "onfocus",
        "description": "An element has received focus (does not bubble)."
    },
    {
        "name": "onformchange"
    },
    {
        "name": "onforminput"
    },
    {
        "name": "oninput",
        "description": "The value of an element changes or the content of an element with the attribute contenteditable is modified."
    },
    {
        "name": "oninvalid",
        "description": "A submittable element has been checked and doesn't satisfy its constraints."
    },
    {
        "name": "onkeydown",
        "description": "A key is pressed down."
    },
    {
        "name": "onkeypress",
        "description": "A key is pressed down and that key normally produces a character value (use input instead)."
    },
    {
        "name": "onkeyup",
        "description": "A key is released."
    },
    {
        "name": "onload",
        "description": "A resource and its dependent resources have finished loading."
    },
    {
        "name": "onloadeddata",
        "description": "The first frame of the media has finished loading."
    },
    {
        "name": "onloadedmetadata",
        "description": "The metadata has been loaded."
    },
    {
        "name": "onloadstart",
        "description": "Progress has begun."
    },
    {
        "name": "onmousedown",
        "description": "A pointing device button (usually a mouse) is pressed on an element."
    },
    {
        "name": "onmousemove",
        "description": "A pointing device is moved over an element."
    },
    {
        "name": "onmouseout",
        "description": "A pointing device is moved off the element that has the listener attached or off one of its children."
    },
    {
        "name": "onmouseover",
        "description": "A pointing device is moved onto the element that has the listener attached or onto one of its children."
    },
    {
        "name": "onmouseup",
        "description": "A pointing device button is released over an element."
    },
    {
        "name": "onmousewheel"
    },
    {
        "name": "onpause",
        "description": "Playback has been paused."
    },
    {
        "name": "onplay",
        "description": "Playback has begun."
    },
    {
        "name": "onplaying",
        "description": "Playback is ready to start after having been paused or delayed due to lack of data."
    },
    {
        "name": "onprogress",
        "description": "In progress."
    },
    {
        "name": "onratechange",
        "description": "The playback rate has changed."
    },
    {
        "name": "onreset",
        "description": "A form is reset."
    },
    {
        "name": "onresize",
        "description": "The document view has been resized."
    },
    {
        "name": "onreadystatechange",
        "description": "The readyState attribute of a document has changed."
    },
    {
        "name": "onscroll",
        "description": "The document view or an element has been scrolled."
    },
    {
        "name": "onseeked",
        "description": "A seek operation completed."
    },
    {
        "name": "onseeking",
        "description": "A seek operation began."
    },
    {
        "name": "onselect",
        "description": "Some text is being selected."
    },
    {
        "name": "onshow",
        "description": "A contextmenu event was fired on/bubbled to an element that has a contextmenu attribute"
    },
    {
        "name": "onstalled",
        "description": "The user agent is trying to fetch media data, but data is unexpectedly not forthcoming."
    },
    {
        "name": "onsubmit",
        "description": "A form is submitted."
    },
    {
        "name": "onsuspend",
        "description": "Media data loading has been suspended."
    },
    {
        "name": "ontimeupdate",
        "description": "The time indicated by the currentTime attribute has been updated."
    },
    {
        "name": "onvolumechange",
        "description": "The volume has changed."
    },
    {
        "name": "onwaiting",
        "description": "Playback has stopped because of a temporary lack of data."
    }
];
//# sourceMappingURL=html5Events.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/data/html5Aria.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var ARIA_ATTRIBUTES = [
    {
        "name": "aria-activedescendant",
        "description": "Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application.\n"
    },
    {
        "name": "aria-atomic",
        "valueSet": "b",
        "description": "Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute.\n"
    },
    {
        "name": "aria-autocomplete",
        "valueSet": "autocomplete",
        "description": "Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made.\n"
    },
    {
        "name": "aria-busy",
        "valueSet": "b",
        "description": "Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user.\n"
    },
    {
        "name": "aria-checked",
        "valueSet": "tristate",
        "description": "Indicates the current \"checked\" state of checkboxes, radio buttons, and other widgets. See related aria-pressed and aria-selected.\n"
    },
    {
        "name": "aria-colcount",
        "description": "Defines the total number of columns in a table, grid, or treegrid. See related aria-colindex.\n"
    },
    {
        "name": "aria-colindex",
        "description": "Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. See related aria-colcount and aria-colspan.\n"
    },
    {
        "name": "aria-colspan",
        "description": "Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. See related aria-colindex and aria-rowspan.\n"
    },
    {
        "name": "aria-controls",
        "description": "Identifies the element (or elements) whose contents or presence are controlled by the current element. See related aria-owns.\n"
    },
    {
        "name": "aria-current",
        "valueSet": "current",
        "description": "Indicates the element that represents the current item within a container or set of related elements.\n"
    },
    {
        "name": "aria-describedat"
    },
    {
        "name": "aria-describedby",
        "description": "Identifies the element (or elements) that describes the object. See related aria-labelledby.\n"
    },
    {
        "name": "aria-disabled",
        "valueSet": "b",
        "description": "Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. See related aria-hidden and aria-readonly.\n"
    },
    {
        "name": "aria-dropeffect",
        "valueSet": "dropeffect",
        "description": "\\[Deprecated in ARIA 1.1] Indicates what functions can be performed when a dragged object is released on the drop target.\n"
    },
    {
        "name": "aria-errormessage",
        "description": "Identifies the element that provides an error message for the object. See related aria-invalid and aria-describedby.\n"
    },
    {
        "name": "aria-expanded",
        "valueSet": "u",
        "description": "Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.\n"
    },
    {
        "name": "aria-flowto",
        "description": "Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order.\n"
    },
    {
        "name": "aria-grabbed",
        "valueSet": "u",
        "description": "\\[Deprecated in ARIA 1.1] Indicates an element's \"grabbed\" state in a drag-and-drop operation.\n"
    },
    {
        "name": "aria-haspopup",
        "valueSet": "b",
        "description": "Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.\n"
    },
    {
        "name": "aria-hidden",
        "valueSet": "b",
        "description": "Indicates whether the element is exposed to an accessibility API. See related aria-disabled.\n"
    },
    {
        "name": "aria-invalid",
        "valueSet": "invalid",
        "description": "Indicates the entered value does not conform to the format expected by the application. See related aria-errormessage.\n"
    },
    {
        "name": "aria-kbdshortcuts"
    },
    {
        "name": "aria-label",
        "description": "Defines a string value that labels the current element. See related aria-labelledby.\n"
    },
    {
        "name": "aria-labelledby",
        "description": "Identifies the element (or elements) that labels the current element. See related aria-describedby.\n"
    },
    {
        "name": "aria-level",
        "description": "Defines the hierarchical level of an element within a structure.\n"
    },
    {
        "name": "aria-live",
        "valueSet": "live",
        "description": "Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region.\n"
    },
    {
        "name": "aria-modal",
        "valueSet": "b",
        "description": "Indicates whether an element is modal when displayed.\n"
    },
    {
        "name": "aria-multiline",
        "valueSet": "b",
        "description": "Indicates whether a text box accepts multiple lines of input or only a single line.\n"
    },
    {
        "name": "aria-multiselectable",
        "valueSet": "b",
        "description": "Indicates that the user may select more than one item from the current selectable descendants.\n"
    },
    {
        "name": "aria-orientation",
        "valueSet": "orientation",
        "description": "Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.\n"
    },
    {
        "name": "aria-owns",
        "description": "Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. See related aria-controls.\n"
    },
    {
        "name": "aria-placeholder",
        "description": "Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format.\n"
    },
    {
        "name": "aria-posinset",
        "description": "Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related aria-setsize.\n"
    },
    {
        "name": "aria-pressed",
        "valueSet": "tristate",
        "description": "Indicates the current \"pressed\" state of toggle buttons. See related aria-checked and aria-selected.\n"
    },
    {
        "name": "aria-readonly",
        "valueSet": "b",
        "description": "Indicates that the element is not editable, but is otherwise operable. See related aria-disabled.\n"
    },
    {
        "name": "aria-relevant",
        "valueSet": "relevant",
        "description": "Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. See related aria-atomic.\n"
    },
    {
        "name": "aria-required",
        "valueSet": "b",
        "description": "Indicates that user input is required on the element before a form may be submitted.\n"
    },
    {
        "name": "aria-roledescription",
        "description": "Defines a human-readable, author-localized description for the role of an element.\n"
    },
    {
        "name": "aria-rowcount",
        "description": "Defines the total number of rows in a table, grid, or treegrid. See related aria-rowindex.\n"
    },
    {
        "name": "aria-rowindex",
        "description": "Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. See related aria-rowcount and aria-rowspan.\n"
    },
    {
        "name": "aria-rowspan",
        "description": "Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. See related aria-rowindex and aria-colspan.\n"
    },
    {
        "name": "aria-selected",
        "valueSet": "u",
        "description": "Indicates the current \"selected\" state of various widgets. See related aria-checked and aria-pressed.\n"
    },
    {
        "name": "aria-setsize",
        "description": "Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related aria-posinset.\n"
    },
    {
        "name": "aria-sort",
        "valueSet": "sort",
        "description": "Indicates if items in a table or grid are sorted in ascending or descending order.\n"
    },
    {
        "name": "aria-valuemax",
        "description": "Defines the maximum allowed value for a range widget.\n"
    },
    {
        "name": "aria-valuemin",
        "description": "Defines the minimum allowed value for a range widget.\n"
    },
    {
        "name": "aria-valuenow",
        "description": "Defines the current value for a range widget. See related aria-valuetext.\n"
    },
    {
        "name": "aria-valuetext",
        "description": "Defines the human readable text alternative of aria-valuenow for a range widget.\n"
    },
    {
        "name": "aria-details",
        "description": "Identifies the element that provides a detailed, extended description for the object. See related aria-describedby.\n"
    },
    {
        "name": "aria-keyshortcuts",
        "description": "Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.\n"
    }
];
//# sourceMappingURL=html5Aria.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/data/html5.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/




function getHTML5DataProvider() {
    return new HTMLDataProvider('html5', {
        version: 1,
        tags: HTML5_TAGS,
        globalAttributes: HTML5_GLOBAL_ATTRIBUTES.concat(HTML5_EVENTS),
        valueSets: HTML5_VALUE_MAP
    });
}
var HTML5_GLOBAL_ATTRIBUTES = ARIA_ATTRIBUTES.concat([
    {
        name: 'accesskey'
    },
    {
        name: 'class'
    },
    {
        name: 'contenteditable',
        valueSet: 'b'
    },
    {
        name: 'contextmenu'
    },
    {
        name: 'dir',
        valueSet: 'd'
    },
    {
        name: 'draggable',
        valueSet: 'b'
    },
    {
        name: 'dropzone'
    },
    {
        name: 'hidden',
        valueSet: 'v'
    },
    {
        name: 'id'
    },
    {
        name: 'itemid'
    },
    {
        name: 'itemprop'
    },
    {
        name: 'itemref'
    },
    {
        name: 'itemscope',
        valueSet: 'v'
    },
    {
        name: 'itemtype'
    },
    {
        name: 'lang'
    },
    {
        name: 'role',
        valueSet: 'roles'
    },
    {
        name: 'spellcheck',
        valueSet: 'b'
    },
    {
        name: 'style'
    },
    {
        name: 'tabindex'
    },
    {
        name: 'title'
    },
    {
        name: 'translate',
        valueSet: 'y'
    }
]);
var HTML5_VALUE_MAP = [
    {
        name: 'b',
        values: [
            {
                name: 'true'
            },
            {
                name: 'false'
            }
        ]
    },
    {
        name: 'u',
        values: [
            {
                name: 'true'
            },
            {
                name: 'false'
            },
            {
                name: 'undefined'
            }
        ]
    },
    {
        name: 'o',
        values: [
            {
                name: 'on'
            },
            {
                name: 'off'
            }
        ]
    },
    {
        name: 'y',
        values: [
            {
                name: 'yes'
            },
            {
                name: 'no'
            }
        ]
    },
    {
        name: 'w',
        values: [
            {
                name: 'soft'
            },
            {
                name: 'hard'
            }
        ]
    },
    {
        name: 'd',
        values: [
            {
                name: 'ltr'
            },
            {
                name: 'rtl'
            },
            {
                name: 'auto'
            }
        ]
    },
    {
        name: 'm',
        values: [
            {
                name: 'GET'
            },
            {
                name: 'POST'
            },
            {
                name: 'dialog'
            }
        ]
    },
    {
        name: 'fm',
        values: [
            {
                name: 'GET'
            },
            {
                name: 'POST'
            }
        ]
    },
    {
        name: 's',
        values: [
            {
                name: 'row'
            },
            {
                name: 'col'
            },
            {
                name: 'rowgroup'
            },
            {
                name: 'colgroup'
            }
        ]
    },
    {
        name: 't',
        values: [
            {
                name: 'hidden'
            },
            {
                name: 'text'
            },
            {
                name: 'search'
            },
            {
                name: 'tel'
            },
            {
                name: 'url'
            },
            {
                name: 'email'
            },
            {
                name: 'password'
            },
            {
                name: 'datetime'
            },
            {
                name: 'date'
            },
            {
                name: 'month'
            },
            {
                name: 'week'
            },
            {
                name: 'time'
            },
            {
                name: 'datetime-local'
            },
            {
                name: 'number'
            },
            {
                name: 'range'
            },
            {
                name: 'color'
            },
            {
                name: 'checkbox'
            },
            {
                name: 'radio'
            },
            {
                name: 'file'
            },
            {
                name: 'submit'
            },
            {
                name: 'image'
            },
            {
                name: 'reset'
            },
            {
                name: 'button'
            }
        ]
    },
    {
        name: 'im',
        values: [
            {
                name: 'verbatim'
            },
            {
                name: 'latin'
            },
            {
                name: 'latin-name'
            },
            {
                name: 'latin-prose'
            },
            {
                name: 'full-width-latin'
            },
            {
                name: 'kana'
            },
            {
                name: 'kana-name'
            },
            {
                name: 'katakana'
            },
            {
                name: 'numeric'
            },
            {
                name: 'tel'
            },
            {
                name: 'email'
            },
            {
                name: 'url'
            }
        ]
    },
    {
        name: 'bt',
        values: [
            {
                name: 'button'
            },
            {
                name: 'submit'
            },
            {
                name: 'reset'
            },
            {
                name: 'menu'
            }
        ]
    },
    {
        name: 'lt',
        values: [
            {
                name: '1'
            },
            {
                name: 'a'
            },
            {
                name: 'A'
            },
            {
                name: 'i'
            },
            {
                name: 'I'
            }
        ]
    },
    {
        name: 'mt',
        values: [
            {
                name: 'context'
            },
            {
                name: 'toolbar'
            }
        ]
    },
    {
        name: 'mit',
        values: [
            {
                name: 'command'
            },
            {
                name: 'checkbox'
            },
            {
                name: 'radio'
            }
        ]
    },
    {
        name: 'et',
        values: [
            {
                name: 'application/x-www-form-urlencoded'
            },
            {
                name: 'multipart/form-data'
            },
            {
                name: 'text/plain'
            }
        ]
    },
    {
        name: 'tk',
        values: [
            {
                name: 'subtitles'
            },
            {
                name: 'captions'
            },
            {
                name: 'descriptions'
            },
            {
                name: 'chapters'
            },
            {
                name: 'metadata'
            }
        ]
    },
    {
        name: 'pl',
        values: [
            {
                name: 'none'
            },
            {
                name: 'metadata'
            },
            {
                name: 'auto'
            }
        ]
    },
    {
        name: 'sh',
        values: [
            {
                name: 'circle'
            },
            {
                name: 'default'
            },
            {
                name: 'poly'
            },
            {
                name: 'rect'
            }
        ]
    },
    {
        name: 'xo',
        values: [
            {
                name: 'anonymous'
            },
            {
                name: 'use-credentials'
            }
        ]
    },
    {
        name: 'sb',
        values: [
            {
                name: 'allow-forms'
            },
            {
                name: 'allow-modals'
            },
            {
                name: 'allow-pointer-lock'
            },
            {
                name: 'allow-popups'
            },
            {
                name: 'allow-popups-to-escape-sandbox'
            },
            {
                name: 'allow-same-origin'
            },
            {
                name: 'allow-scripts'
            },
            {
                name: 'allow-top-navigation'
            }
        ]
    },
    {
        name: 'tristate',
        values: [
            {
                name: 'true'
            },
            {
                name: 'false'
            },
            {
                name: 'mixed'
            },
            {
                name: 'undefined'
            }
        ]
    },
    {
        name: 'inputautocomplete',
        values: [
            {
                name: 'additional-name'
            },
            {
                name: 'address-level1'
            },
            {
                name: 'address-level2'
            },
            {
                name: 'address-level3'
            },
            {
                name: 'address-level4'
            },
            {
                name: 'address-line1'
            },
            {
                name: 'address-line2'
            },
            {
                name: 'address-line3'
            },
            {
                name: 'bday'
            },
            {
                name: 'bday-year'
            },
            {
                name: 'bday-day'
            },
            {
                name: 'bday-month'
            },
            {
                name: 'billing'
            },
            {
                name: 'cc-additional-name'
            },
            {
                name: 'cc-csc'
            },
            {
                name: 'cc-exp'
            },
            {
                name: 'cc-exp-month'
            },
            {
                name: 'cc-exp-year'
            },
            {
                name: 'cc-family-name'
            },
            {
                name: 'cc-given-name'
            },
            {
                name: 'cc-name'
            },
            {
                name: 'cc-number'
            },
            {
                name: 'cc-type'
            },
            {
                name: 'country'
            },
            {
                name: 'country-name'
            },
            {
                name: 'current-password'
            },
            {
                name: 'email'
            },
            {
                name: 'family-name'
            },
            {
                name: 'fax'
            },
            {
                name: 'given-name'
            },
            {
                name: 'home'
            },
            {
                name: 'honorific-prefix'
            },
            {
                name: 'honorific-suffix'
            },
            {
                name: 'impp'
            },
            {
                name: 'language'
            },
            {
                name: 'mobile'
            },
            {
                name: 'name'
            },
            {
                name: 'new-password'
            },
            {
                name: 'nickname'
            },
            {
                name: 'organization'
            },
            {
                name: 'organization-title'
            },
            {
                name: 'pager'
            },
            {
                name: 'photo'
            },
            {
                name: 'postal-code'
            },
            {
                name: 'sex'
            },
            {
                name: 'shipping'
            },
            {
                name: 'street-address'
            },
            {
                name: 'tel-area-code'
            },
            {
                name: 'tel'
            },
            {
                name: 'tel-country-code'
            },
            {
                name: 'tel-extension'
            },
            {
                name: 'tel-local'
            },
            {
                name: 'tel-local-prefix'
            },
            {
                name: 'tel-local-suffix'
            },
            {
                name: 'tel-national'
            },
            {
                name: 'transaction-amount'
            },
            {
                name: 'transaction-currency'
            },
            {
                name: 'url'
            },
            {
                name: 'username'
            },
            {
                name: 'work'
            }
        ]
    },
    {
        name: 'autocomplete',
        values: [
            {
                name: 'inline'
            },
            {
                name: 'list'
            },
            {
                name: 'both'
            },
            {
                name: 'none'
            }
        ]
    },
    {
        name: 'current',
        values: [
            {
                name: 'page'
            },
            {
                name: 'step'
            },
            {
                name: 'location'
            },
            {
                name: 'date'
            },
            {
                name: 'time'
            },
            {
                name: 'true'
            },
            {
                name: 'false'
            }
        ]
    },
    {
        name: 'dropeffect',
        values: [
            {
                name: 'copy'
            },
            {
                name: 'move'
            },
            {
                name: 'link'
            },
            {
                name: 'execute'
            },
            {
                name: 'popup'
            },
            {
                name: 'none'
            }
        ]
    },
    {
        name: 'invalid',
        values: [
            {
                name: 'grammar'
            },
            {
                name: 'false'
            },
            {
                name: 'spelling'
            },
            {
                name: 'true'
            }
        ]
    },
    {
        name: 'live',
        values: [
            {
                name: 'off'
            },
            {
                name: 'polite'
            },
            {
                name: 'assertive'
            }
        ]
    },
    {
        name: 'orientation',
        values: [
            {
                name: 'vertical'
            },
            {
                name: 'horizontal'
            },
            {
                name: 'undefined'
            }
        ]
    },
    {
        name: 'relevant',
        values: [
            {
                name: 'additions'
            },
            {
                name: 'removals'
            },
            {
                name: 'text'
            },
            {
                name: 'all'
            },
            {
                name: 'additions text'
            }
        ]
    },
    {
        name: 'sort',
        values: [
            {
                name: 'ascending'
            },
            {
                name: 'descending'
            },
            {
                name: 'none'
            },
            {
                name: 'other'
            }
        ]
    },
    {
        name: 'roles',
        values: [
            {
                name: 'alert'
            },
            {
                name: 'alertdialog'
            },
            {
                name: 'button'
            },
            {
                name: 'checkbox'
            },
            {
                name: 'dialog'
            },
            {
                name: 'gridcell'
            },
            {
                name: 'link'
            },
            {
                name: 'log'
            },
            {
                name: 'marquee'
            },
            {
                name: 'menuitem'
            },
            {
                name: 'menuitemcheckbox'
            },
            {
                name: 'menuitemradio'
            },
            {
                name: 'option'
            },
            {
                name: 'progressbar'
            },
            {
                name: 'radio'
            },
            {
                name: 'scrollbar'
            },
            {
                name: 'searchbox'
            },
            {
                name: 'slider'
            },
            {
                name: 'spinbutton'
            },
            {
                name: 'status'
            },
            {
                name: 'switch'
            },
            {
                name: 'tab'
            },
            {
                name: 'tabpanel'
            },
            {
                name: 'textbox'
            },
            {
                name: 'timer'
            },
            {
                name: 'tooltip'
            },
            {
                name: 'treeitem'
            },
            {
                name: 'combobox'
            },
            {
                name: 'grid'
            },
            {
                name: 'listbox'
            },
            {
                name: 'menu'
            },
            {
                name: 'menubar'
            },
            {
                name: 'radiogroup'
            },
            {
                name: 'tablist'
            },
            {
                name: 'tree'
            },
            {
                name: 'treegrid'
            },
            {
                name: 'application'
            },
            {
                name: 'article'
            },
            {
                name: 'cell'
            },
            {
                name: 'columnheader'
            },
            {
                name: 'definition'
            },
            {
                name: 'directory'
            },
            {
                name: 'document'
            },
            {
                name: 'feed'
            },
            {
                name: 'figure'
            },
            {
                name: 'group'
            },
            {
                name: 'heading'
            },
            {
                name: 'img'
            },
            {
                name: 'list'
            },
            {
                name: 'listitem'
            },
            {
                name: 'math'
            },
            {
                name: 'none'
            },
            {
                name: 'note'
            },
            {
                name: 'presentation'
            },
            {
                name: 'region'
            },
            {
                name: 'row'
            },
            {
                name: 'rowgroup'
            },
            {
                name: 'rowheader'
            },
            {
                name: 'separator'
            },
            {
                name: 'table'
            },
            {
                name: 'term'
            },
            {
                name: 'text'
            },
            {
                name: 'toolbar'
            },
            {
                name: 'banner'
            },
            {
                name: 'complementary'
            },
            {
                name: 'contentinfo'
            },
            {
                name: 'form'
            },
            {
                name: 'main'
            },
            {
                name: 'navigation'
            },
            {
                name: 'region'
            },
            {
                name: 'search'
            },
            {
                name: 'doc-abstract'
            },
            {
                name: 'doc-acknowledgments'
            },
            {
                name: 'doc-afterword'
            },
            {
                name: 'doc-appendix'
            },
            {
                name: 'doc-backlink'
            },
            {
                name: 'doc-biblioentry'
            },
            {
                name: 'doc-bibliography'
            },
            {
                name: 'doc-biblioref'
            },
            {
                name: 'doc-chapter'
            },
            {
                name: 'doc-colophon'
            },
            {
                name: 'doc-conclusion'
            },
            {
                name: 'doc-cover'
            },
            {
                name: 'doc-credit'
            },
            {
                name: 'doc-credits'
            },
            {
                name: 'doc-dedication'
            },
            {
                name: 'doc-endnote'
            },
            {
                name: 'doc-endnotes'
            },
            {
                name: 'doc-epigraph'
            },
            {
                name: 'doc-epilogue'
            },
            {
                name: 'doc-errata'
            },
            {
                name: 'doc-example'
            },
            {
                name: 'doc-footnote'
            },
            {
                name: 'doc-foreword'
            },
            {
                name: 'doc-glossary'
            },
            {
                name: 'doc-glossref'
            },
            {
                name: 'doc-index'
            },
            {
                name: 'doc-introduction'
            },
            {
                name: 'doc-noteref'
            },
            {
                name: 'doc-notice'
            },
            {
                name: 'doc-pagebreak'
            },
            {
                name: 'doc-pagelist'
            },
            {
                name: 'doc-part'
            },
            {
                name: 'doc-preface'
            },
            {
                name: 'doc-prologue'
            },
            {
                name: 'doc-pullquote'
            },
            {
                name: 'doc-qna'
            },
            {
                name: 'doc-subtitle'
            },
            {
                name: 'doc-tip'
            },
            {
                name: 'doc-toc'
            }
        ]
    },
    {
        name: 'metanames',
        values: [
            {
                name: 'application-name'
            },
            {
                name: 'author'
            },
            {
                name: 'description'
            },
            {
                name: 'format-detection'
            },
            {
                name: 'generator'
            },
            {
                name: 'keywords'
            },
            {
                name: 'publisher'
            },
            {
                name: 'referrer'
            },
            {
                name: 'robots'
            },
            {
                name: 'theme-color'
            },
            {
                name: 'viewport'
            }
        ]
    }
];
//# sourceMappingURL=html5.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/languageFacts/builtinDataProviders.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var builtinDataProviders = [
    getHTML5DataProvider()
];
var customDataProviders = [];
function getAllDataProviders() {
    return builtinDataProviders.concat(customDataProviders);
}
function handleCustomDataProviders(providers) {
    providers.forEach(function (p) {
        customDataProviders.push(p);
    });
}
//# sourceMappingURL=builtinDataProviders.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlCompletion.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/








var htmlCompletion_localize = loadMessageBundle();
var htmlCompletion_HTMLCompletion = /** @class */ (function () {
    function HTMLCompletion() {
        this.completionParticipants = [];
    }
    HTMLCompletion.prototype.setCompletionParticipants = function (registeredCompletionParticipants) {
        this.completionParticipants = registeredCompletionParticipants || [];
    };
    HTMLCompletion.prototype.doComplete = function (document, position, htmlDocument, settings) {
        var result = {
            isIncomplete: false,
            items: []
        };
        var completionParticipants = this.completionParticipants;
        var dataProviders = getAllDataProviders().filter(function (p) { return p.isApplicable(document.languageId) && (!settings || settings[p.getId()] !== false); });
        var text = document.getText();
        var offset = document.offsetAt(position);
        var node = htmlDocument.findNodeBefore(offset);
        if (!node) {
            return result;
        }
        var scanner = createScanner(text, node.start);
        var currentTag = '';
        var currentAttributeName;
        function getReplaceRange(replaceStart, replaceEnd) {
            if (replaceEnd === void 0) { replaceEnd = offset; }
            if (replaceStart > offset) {
                replaceStart = offset;
            }
            return { start: document.positionAt(replaceStart), end: document.positionAt(replaceEnd) };
        }
        function collectOpenTagSuggestions(afterOpenBracket, tagNameEnd) {
            var range = getReplaceRange(afterOpenBracket, tagNameEnd);
            dataProviders.forEach(function (provider) {
                provider.provideTags().forEach(function (tag) {
                    result.items.push({
                        label: tag.name,
                        kind: main_CompletionItemKind.Property,
                        documentation: tag.description,
                        textEdit: TextEdit.replace(range, tag.name),
                        insertTextFormat: InsertTextFormat.PlainText
                    });
                });
            });
            return result;
        }
        function getLineIndent(offset) {
            var start = offset;
            while (start > 0) {
                var ch = text.charAt(start - 1);
                if ("\n\r".indexOf(ch) >= 0) {
                    return text.substring(start, offset);
                }
                if (!isWhiteSpace(ch)) {
                    return null;
                }
                start--;
            }
            return text.substring(0, offset);
        }
        function collectCloseTagSuggestions(afterOpenBracket, inOpenTag, tagNameEnd) {
            if (tagNameEnd === void 0) { tagNameEnd = offset; }
            var range = getReplaceRange(afterOpenBracket, tagNameEnd);
            var closeTag = isFollowedBy(text, tagNameEnd, ScannerState.WithinEndTag, TokenType.EndTagClose) ? '' : '>';
            var curr = node;
            if (inOpenTag) {
                curr = curr.parent; // don't suggest the own tag, it's not yet open
            }
            while (curr) {
                var tag = curr.tag;
                if (tag && (!curr.closed || curr.endTagStart && (curr.endTagStart > offset))) {
                    var item = {
                        label: '/' + tag,
                        kind: main_CompletionItemKind.Property,
                        filterText: '/' + tag + closeTag,
                        textEdit: TextEdit.replace(range, '/' + tag + closeTag),
                        insertTextFormat: InsertTextFormat.PlainText
                    };
                    var startIndent = getLineIndent(curr.start);
                    var endIndent = getLineIndent(afterOpenBracket - 1);
                    if (startIndent !== null && endIndent !== null && startIndent !== endIndent) {
                        var insertText = startIndent + '</' + tag + closeTag;
                        item.textEdit = TextEdit.replace(getReplaceRange(afterOpenBracket - 1 - endIndent.length), insertText);
                        item.filterText = endIndent + '</' + tag + closeTag;
                    }
                    result.items.push(item);
                    return result;
                }
                curr = curr.parent;
            }
            if (inOpenTag) {
                return result;
            }
            dataProviders.forEach(function (provider) {
                provider.provideTags().forEach(function (tag) {
                    result.items.push({
                        label: '/' + tag.name,
                        kind: main_CompletionItemKind.Property,
                        documentation: tag.description,
                        filterText: '/' + tag + closeTag,
                        textEdit: TextEdit.replace(range, '/' + tag + closeTag),
                        insertTextFormat: InsertTextFormat.PlainText
                    });
                });
            });
            return result;
        }
        function collectAutoCloseTagSuggestion(tagCloseEnd, tag) {
            if (settings && settings.hideAutoCompleteProposals) {
                return result;
            }
            if (!isVoidElement(tag)) {
                var pos = document.positionAt(tagCloseEnd);
                result.items.push({
                    label: '</' + tag + '>',
                    kind: main_CompletionItemKind.Property,
                    filterText: '</' + tag + '>',
                    textEdit: TextEdit.insert(pos, '$0</' + tag + '>'),
                    insertTextFormat: InsertTextFormat.Snippet
                });
            }
            return result;
        }
        function collectTagSuggestions(tagStart, tagEnd) {
            collectOpenTagSuggestions(tagStart, tagEnd);
            collectCloseTagSuggestions(tagStart, true, tagEnd);
            return result;
        }
        function collectAttributeNameSuggestions(nameStart, nameEnd) {
            if (nameEnd === void 0) { nameEnd = offset; }
            var replaceEnd = offset;
            while (replaceEnd < nameEnd && text[replaceEnd] !== '<') { // < is a valid attribute name character, but we rather assume the attribute name ends. See #23236.
                replaceEnd++;
            }
            var range = getReplaceRange(nameStart, replaceEnd);
            var value = isFollowedBy(text, nameEnd, ScannerState.AfterAttributeName, TokenType.DelimiterAssign) ? '' : '="$1"';
            var tag = currentTag.toLowerCase();
            var seenAttributes = Object.create(null);
            dataProviders.forEach(function (provider) {
                provider.provideAttributes(tag).forEach(function (attr) {
                    if (seenAttributes[attr.name]) {
                        return;
                    }
                    seenAttributes[attr.name] = true;
                    var codeSnippet = attr.name;
                    var command;
                    if (attr.valueSet !== 'v' && value.length) {
                        codeSnippet = codeSnippet + value;
                        if (attr.valueSet) {
                            command = {
                                title: 'Suggest',
                                command: 'editor.action.triggerSuggest'
                            };
                        }
                    }
                    result.items.push({
                        label: attr.name,
                        kind: attr.valueSet === 'handler' ? main_CompletionItemKind.Function : main_CompletionItemKind.Value,
                        documentation: attr.description,
                        textEdit: TextEdit.replace(range, codeSnippet),
                        insertTextFormat: InsertTextFormat.Snippet,
                        command: command
                    });
                });
            });
            collectDataAttributesSuggestions(range, seenAttributes);
            return result;
        }
        function collectDataAttributesSuggestions(range, seenAttributes) {
            var dataAttr = 'data-';
            var dataAttributes = {};
            dataAttributes[dataAttr] = dataAttr + "$1=\"$2\"";
            function addNodeDataAttributes(node) {
                node.attributeNames.forEach(function (attr) {
                    if (strings_startsWith(attr, dataAttr) && !dataAttributes[attr] && !seenAttributes[attr]) {
                        dataAttributes[attr] = attr + '="$1"';
                    }
                });
                node.children.forEach(function (child) { return addNodeDataAttributes(child); });
            }
            if (htmlDocument) {
                htmlDocument.roots.forEach(function (root) { return addNodeDataAttributes(root); });
            }
            Object.keys(dataAttributes).forEach(function (attr) { return result.items.push({
                label: attr,
                kind: main_CompletionItemKind.Value,
                textEdit: TextEdit.replace(range, dataAttributes[attr]),
                insertTextFormat: InsertTextFormat.Snippet
            }); });
        }
        function collectAttributeValueSuggestions(valueStart, valueEnd) {
            if (valueEnd === void 0) { valueEnd = offset; }
            var range;
            var addQuotes;
            var valuePrefix;
            if (offset > valueStart && offset <= valueEnd && isQuote(text[valueStart])) {
                // inside quoted attribute
                var valueContentStart = valueStart + 1;
                var valueContentEnd = valueEnd;
                // valueEnd points to the char after quote, which encloses the replace range
                if (valueEnd > valueStart && text[valueEnd - 1] === text[valueStart]) {
                    valueContentEnd--;
                }
                var wsBefore = getWordStart(text, offset, valueContentStart);
                var wsAfter = getWordEnd(text, offset, valueContentEnd);
                range = getReplaceRange(wsBefore, wsAfter);
                valuePrefix = offset >= valueContentStart && offset <= valueContentEnd ? text.substring(valueContentStart, offset) : '';
                addQuotes = false;
            }
            else {
                range = getReplaceRange(valueStart, valueEnd);
                valuePrefix = text.substring(valueStart, offset);
                addQuotes = true;
            }
            var tag = currentTag.toLowerCase();
            var attribute = currentAttributeName.toLowerCase();
            if (completionParticipants.length > 0) {
                var fullRange = getReplaceRange(valueStart, valueEnd);
                for (var _i = 0, completionParticipants_1 = completionParticipants; _i < completionParticipants_1.length; _i++) {
                    var participant = completionParticipants_1[_i];
                    if (participant.onHtmlAttributeValue) {
                        participant.onHtmlAttributeValue({ document: document, position: position, tag: tag, attribute: attribute, value: valuePrefix, range: fullRange });
                    }
                }
            }
            dataProviders.forEach(function (provider) {
                provider.provideValues(tag, attribute).forEach(function (value) {
                    var insertText = addQuotes ? '"' + value.name + '"' : value.name;
                    result.items.push({
                        label: value.name,
                        filterText: insertText,
                        kind: main_CompletionItemKind.Unit,
                        textEdit: TextEdit.replace(range, insertText),
                        insertTextFormat: InsertTextFormat.PlainText
                    });
                });
            });
            collectCharacterEntityProposals();
            return result;
        }
        function scanNextForEndPos(nextToken) {
            if (offset === scanner.getTokenEnd()) {
                token = scanner.scan();
                if (token === nextToken && scanner.getTokenOffset() === offset) {
                    return scanner.getTokenEnd();
                }
            }
            return offset;
        }
        function collectInsideContent() {
            for (var _i = 0, completionParticipants_2 = completionParticipants; _i < completionParticipants_2.length; _i++) {
                var participant = completionParticipants_2[_i];
                if (participant.onHtmlContent) {
                    participant.onHtmlContent({ document: document, position: position });
                }
            }
            return collectCharacterEntityProposals();
        }
        function collectCharacterEntityProposals() {
            // character entities
            var k = offset - 1;
            var characterStart = position.character;
            while (k >= 0 && isLetterOrDigit(text, k)) {
                k--;
                characterStart--;
            }
            if (k >= 0 && text[k] === '&') {
                var range = main_Range.create(main_Position.create(position.line, characterStart - 1), position);
                for (var entity in entities) {
                    if (strings_endsWith(entity, ';')) {
                        var label = '&' + entity;
                        result.items.push({
                            label: label,
                            kind: main_CompletionItemKind.Keyword,
                            documentation: htmlCompletion_localize('entity.propose', "Character entity representing '" + entities[entity] + "'"),
                            textEdit: TextEdit.replace(range, label),
                            insertTextFormat: InsertTextFormat.PlainText
                        });
                    }
                }
            }
            return result;
        }
        function suggestDoctype(replaceStart, replaceEnd) {
            var range = getReplaceRange(replaceStart, replaceEnd);
            result.items.push({
                label: '!DOCTYPE',
                kind: main_CompletionItemKind.Property,
                documentation: 'A preamble for an HTML document.',
                textEdit: TextEdit.replace(range, '!DOCTYPE html>'),
                insertTextFormat: InsertTextFormat.PlainText
            });
        }
        var token = scanner.scan();
        while (token !== TokenType.EOS && scanner.getTokenOffset() <= offset) {
            switch (token) {
                case TokenType.StartTagOpen:
                    if (scanner.getTokenEnd() === offset) {
                        var endPos = scanNextForEndPos(TokenType.StartTag);
                        if (position.line === 0) {
                            suggestDoctype(offset, endPos);
                        }
                        return collectTagSuggestions(offset, endPos);
                    }
                    break;
                case TokenType.StartTag:
                    if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                        return collectOpenTagSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                    }
                    currentTag = scanner.getTokenText();
                    break;
                case TokenType.AttributeName:
                    if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                        return collectAttributeNameSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                    }
                    currentAttributeName = scanner.getTokenText();
                    break;
                case TokenType.DelimiterAssign:
                    if (scanner.getTokenEnd() === offset) {
                        var endPos = scanNextForEndPos(TokenType.AttributeValue);
                        return collectAttributeValueSuggestions(offset, endPos);
                    }
                    break;
                case TokenType.AttributeValue:
                    if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                        return collectAttributeValueSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                    }
                    break;
                case TokenType.Whitespace:
                    if (offset <= scanner.getTokenEnd()) {
                        switch (scanner.getScannerState()) {
                            case ScannerState.AfterOpeningStartTag:
                                var startPos = scanner.getTokenOffset();
                                var endTagPos = scanNextForEndPos(TokenType.StartTag);
                                return collectTagSuggestions(startPos, endTagPos);
                            case ScannerState.WithinTag:
                            case ScannerState.AfterAttributeName:
                                return collectAttributeNameSuggestions(scanner.getTokenEnd());
                            case ScannerState.BeforeAttributeValue:
                                return collectAttributeValueSuggestions(scanner.getTokenEnd());
                            case ScannerState.AfterOpeningEndTag:
                                return collectCloseTagSuggestions(scanner.getTokenOffset() - 1, false);
                            case ScannerState.WithinContent:
                                return collectInsideContent();
                        }
                    }
                    break;
                case TokenType.EndTagOpen:
                    if (offset <= scanner.getTokenEnd()) {
                        var afterOpenBracket = scanner.getTokenOffset() + 1;
                        var endOffset = scanNextForEndPos(TokenType.EndTag);
                        return collectCloseTagSuggestions(afterOpenBracket, false, endOffset);
                    }
                    break;
                case TokenType.EndTag:
                    if (offset <= scanner.getTokenEnd()) {
                        var start = scanner.getTokenOffset() - 1;
                        while (start >= 0) {
                            var ch = text.charAt(start);
                            if (ch === '/') {
                                return collectCloseTagSuggestions(start, false, scanner.getTokenEnd());
                            }
                            else if (!isWhiteSpace(ch)) {
                                break;
                            }
                            start--;
                        }
                    }
                    break;
                case TokenType.StartTagClose:
                    if (offset <= scanner.getTokenEnd()) {
                        if (currentTag) {
                            return collectAutoCloseTagSuggestion(scanner.getTokenEnd(), currentTag);
                        }
                    }
                    break;
                case TokenType.Content:
                    if (offset <= scanner.getTokenEnd()) {
                        return collectInsideContent();
                    }
                    break;
                default:
                    if (offset <= scanner.getTokenEnd()) {
                        return result;
                    }
                    break;
            }
            token = scanner.scan();
        }
        return result;
    };
    HTMLCompletion.prototype.doTagComplete = function (document, position, htmlDocument) {
        var offset = document.offsetAt(position);
        if (offset <= 0) {
            return null;
        }
        var char = document.getText().charAt(offset - 1);
        if (char === '>') {
            var node = htmlDocument.findNodeBefore(offset);
            if (node && node.tag && !isVoidElement(node.tag) && node.start < offset && (!node.endTagStart || node.endTagStart > offset)) {
                var scanner = createScanner(document.getText(), node.start);
                var token = scanner.scan();
                while (token !== TokenType.EOS && scanner.getTokenEnd() <= offset) {
                    if (token === TokenType.StartTagClose && scanner.getTokenEnd() === offset) {
                        return "$0</" + node.tag + ">";
                    }
                    token = scanner.scan();
                }
            }
        }
        else if (char === '/') {
            var node = htmlDocument.findNodeBefore(offset);
            while (node && node.closed) {
                node = node.parent;
            }
            if (node && node.tag) {
                var scanner = createScanner(document.getText(), node.start);
                var token = scanner.scan();
                while (token !== TokenType.EOS && scanner.getTokenEnd() <= offset) {
                    if (token === TokenType.EndTagOpen && scanner.getTokenEnd() === offset) {
                        return node.tag + ">";
                    }
                    token = scanner.scan();
                }
            }
        }
        return null;
    };
    return HTMLCompletion;
}());

function isQuote(s) {
    return /^["']*$/.test(s);
}
function isWhiteSpace(s) {
    return /^\s*$/.test(s);
}
function isFollowedBy(s, offset, intialState, expectedToken) {
    var scanner = createScanner(s, offset, intialState);
    var token = scanner.scan();
    while (token === TokenType.Whitespace) {
        token = scanner.scan();
    }
    return token === expectedToken;
}
function getWordStart(s, offset, limit) {
    while (offset > limit && !isWhiteSpace(s[offset - 1])) {
        offset--;
    }
    return offset;
}
function getWordEnd(s, offset, limit) {
    while (offset < limit && !isWhiteSpace(s[offset])) {
        offset++;
    }
    return offset;
}
//# sourceMappingURL=htmlCompletion.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlHover.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/




function doHover(document, position, htmlDocument) {
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    if (!node || !node.tag) {
        return null;
    }
    var dataProviders = getAllDataProviders().filter(function (p) { return p.isApplicable(document.languageId); });
    function getTagHover(currTag, range, open) {
        currTag = currTag.toLowerCase();
        var _loop_1 = function (provider) {
            var hover = null;
            provider.provideTags().forEach(function (tag) {
                if (tag.name.toLowerCase() === currTag.toLowerCase()) {
                    var tagLabel = open ? '<' + currTag + '>' : '</' + currTag + '>';
                    var tagDescription = tag.description || '';
                    hover = { contents: [{ language: 'html', value: tagLabel }, MarkedString.fromPlainText(tagDescription)], range: range };
                }
            });
            if (hover) {
                return { value: hover };
            }
        };
        for (var _i = 0, dataProviders_1 = dataProviders; _i < dataProviders_1.length; _i++) {
            var provider = dataProviders_1[_i];
            var state_1 = _loop_1(provider);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return null;
    }
    function getTagNameRange(tokenType, startOffset) {
        var scanner = createScanner(document.getText(), startOffset);
        var token = scanner.scan();
        while (token !== TokenType.EOS && (scanner.getTokenEnd() < offset || scanner.getTokenEnd() === offset && token !== tokenType)) {
            token = scanner.scan();
        }
        if (token === tokenType && offset <= scanner.getTokenEnd()) {
            return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
        }
        return null;
    }
    if (node.endTagStart && offset >= node.endTagStart) {
        var tagRange_1 = getTagNameRange(TokenType.EndTag, node.endTagStart);
        if (tagRange_1) {
            return getTagHover(node.tag, tagRange_1, false);
        }
        return null;
    }
    var tagRange = getTagNameRange(TokenType.StartTag, node.start);
    if (tagRange) {
        return getTagHover(node.tag, tagRange, true);
    }
    return null;
}
//# sourceMappingURL=htmlHover.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/beautify/beautify.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/*
 * Mock for the JS formatter. Ignore formatting of JS content in HTML.
 */
function js_beautify(js_source_text, options) {
    // no formatting
    return js_source_text;
}
//# sourceMappingURL=beautify.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/beautify/beautify-css.js
// copied from js-beautify/js/lib/beautify-css.js
// version: 1.9.0
/* AUTO-GENERATED. DO NOT MODIFY. */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <einar@beautifier.io>
        https://beautifier.io/

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are (default in brackets):
        indent_size (4)                         — indentation size,
        indent_char (space)                     — character to indent with,
        selector_separator_newline (true)       - separate selectors with newline or
                                                  not (e.g. "a,\nbr" or "a, br")
        end_with_newline (false)                - end with a newline
        newline_between_rules (true)            - add a new line after every css rule
        space_around_selector_separator (false) - ensure space around selector separators:
                                                  '>', '+', '~' (e.g. "a>b" -> "a > b")
    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' ',
      'end_with_newline': false,
      'newline_between_rules': true,
      'space_around_selector_separator': true
    });
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/

var legacy_beautify_css =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function OutputLine(parent) {
  this.__parent = parent;
  this.__character_count = 0;
  // use indent_count as a marker for this.__lines that have preserved indentation
  this.__indent_count = -1;
  this.__alignment_count = 0;
  this.__wrap_point_index = 0;
  this.__wrap_point_character_count = 0;
  this.__wrap_point_indent_count = -1;
  this.__wrap_point_alignment_count = 0;

  this.__items = [];
}

OutputLine.prototype.clone_empty = function() {
  var line = new OutputLine(this.__parent);
  line.set_indent(this.__indent_count, this.__alignment_count);
  return line;
};

OutputLine.prototype.item = function(index) {
  if (index < 0) {
    return this.__items[this.__items.length + index];
  } else {
    return this.__items[index];
  }
};

OutputLine.prototype.has_match = function(pattern) {
  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
    if (this.__items[lastCheckedOutput].match(pattern)) {
      return true;
    }
  }
  return false;
};

OutputLine.prototype.set_indent = function(indent, alignment) {
  if (this.is_empty()) {
    this.__indent_count = indent || 0;
    this.__alignment_count = alignment || 0;
    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
  }
};

OutputLine.prototype._set_wrap_point = function() {
  if (this.__parent.wrap_line_length) {
    this.__wrap_point_index = this.__items.length;
    this.__wrap_point_character_count = this.__character_count;
    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
  }
};

OutputLine.prototype._should_wrap = function() {
  return this.__wrap_point_index &&
    this.__character_count > this.__parent.wrap_line_length &&
    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
};

OutputLine.prototype._allow_wrap = function() {
  if (this._should_wrap()) {
    this.__parent.add_new_line();
    var next = this.__parent.current_line;
    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
    next.__items = this.__items.slice(this.__wrap_point_index);
    this.__items = this.__items.slice(0, this.__wrap_point_index);

    next.__character_count += this.__character_count - this.__wrap_point_character_count;
    this.__character_count = this.__wrap_point_character_count;

    if (next.__items[0] === " ") {
      next.__items.splice(0, 1);
      next.__character_count -= 1;
    }
    return true;
  }
  return false;
};

OutputLine.prototype.is_empty = function() {
  return this.__items.length === 0;
};

OutputLine.prototype.last = function() {
  if (!this.is_empty()) {
    return this.__items[this.__items.length - 1];
  } else {
    return null;
  }
};

OutputLine.prototype.push = function(item) {
  this.__items.push(item);
  var last_newline_index = item.lastIndexOf('\n');
  if (last_newline_index !== -1) {
    this.__character_count = item.length - last_newline_index;
  } else {
    this.__character_count += item.length;
  }
};

OutputLine.prototype.pop = function() {
  var item = null;
  if (!this.is_empty()) {
    item = this.__items.pop();
    this.__character_count -= item.length;
  }
  return item;
};


OutputLine.prototype._remove_indent = function() {
  if (this.__indent_count > 0) {
    this.__indent_count -= 1;
    this.__character_count -= this.__parent.indent_size;
  }
};

OutputLine.prototype._remove_wrap_indent = function() {
  if (this.__wrap_point_indent_count > 0) {
    this.__wrap_point_indent_count -= 1;
  }
};
OutputLine.prototype.trim = function() {
  while (this.last() === ' ') {
    this.__items.pop();
    this.__character_count -= 1;
  }
};

OutputLine.prototype.toString = function() {
  var result = '';
  if (!this.is_empty()) {
    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
    result += this.__items.join('');
  }
  return result;
};

function IndentStringCache(options, baseIndentString) {
  this.__cache = [''];
  this.__indent_size = options.indent_size;
  this.__indent_string = options.indent_char;
  if (!options.indent_with_tabs) {
    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
  }

  // Set to null to continue support for auto detection of base indent
  baseIndentString = baseIndentString || '';
  if (options.indent_level > 0) {
    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
  }

  this.__base_string = baseIndentString;
  this.__base_string_length = baseIndentString.length;
}

IndentStringCache.prototype.get_indent_size = function(indent, column) {
  var result = this.__base_string_length;
  column = column || 0;
  if (indent < 0) {
    result = 0;
  }
  result += indent * this.__indent_size;
  result += column;
  return result;
};

IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
  var result = this.__base_string;
  column = column || 0;
  if (indent_level < 0) {
    indent_level = 0;
    result = '';
  }
  column += indent_level * this.__indent_size;
  this.__ensure_cache(column);
  result += this.__cache[column];
  return result;
};

IndentStringCache.prototype.__ensure_cache = function(column) {
  while (column >= this.__cache.length) {
    this.__add_column();
  }
};

IndentStringCache.prototype.__add_column = function() {
  var column = this.__cache.length;
  var indent = 0;
  var result = '';
  if (this.__indent_size && column >= this.__indent_size) {
    indent = Math.floor(column / this.__indent_size);
    column -= indent * this.__indent_size;
    result = new Array(indent + 1).join(this.__indent_string);
  }
  if (column) {
    result += new Array(column + 1).join(' ');
  }

  this.__cache.push(result);
};

function Output(options, baseIndentString) {
  this.__indent_cache = new IndentStringCache(options, baseIndentString);
  this.raw = false;
  this._end_with_newline = options.end_with_newline;
  this.indent_size = options.indent_size;
  this.wrap_line_length = options.wrap_line_length;
  this.__lines = [];
  this.previous_line = null;
  this.current_line = null;
  this.next_line = new OutputLine(this);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
  // initialize
  this.__add_outputline();
}

Output.prototype.__add_outputline = function() {
  this.previous_line = this.current_line;
  this.current_line = this.next_line.clone_empty();
  this.__lines.push(this.current_line);
};

Output.prototype.get_line_number = function() {
  return this.__lines.length;
};

Output.prototype.get_indent_string = function(indent, column) {
  return this.__indent_cache.get_indent_string(indent, column);
};

Output.prototype.get_indent_size = function(indent, column) {
  return this.__indent_cache.get_indent_size(indent, column);
};

Output.prototype.is_empty = function() {
  return !this.previous_line && this.current_line.is_empty();
};

Output.prototype.add_new_line = function(force_newline) {
  // never newline at the start of file
  // otherwise, newline only if we didn't just add one or we're forced
  if (this.is_empty() ||
    (!force_newline && this.just_added_newline())) {
    return false;
  }

  // if raw output is enabled, don't print additional newlines,
  // but still return True as though you had
  if (!this.raw) {
    this.__add_outputline();
  }
  return true;
};

Output.prototype.get_code = function(eol) {
  this.trim(true);

  // handle some edge cases where the last tokens
  // has text that ends with newline(s)
  var last_item = this.current_line.pop();
  if (last_item) {
    if (last_item[last_item.length - 1] === '\n') {
      last_item = last_item.replace(/\n+$/g, '');
    }
    this.current_line.push(last_item);
  }

  if (this._end_with_newline) {
    this.__add_outputline();
  }

  var sweet_code = this.__lines.join('\n');

  if (eol !== '\n') {
    sweet_code = sweet_code.replace(/[\n]/g, eol);
  }
  return sweet_code;
};

Output.prototype.set_wrap_point = function() {
  this.current_line._set_wrap_point();
};

Output.prototype.set_indent = function(indent, alignment) {
  indent = indent || 0;
  alignment = alignment || 0;

  // Next line stores alignment values
  this.next_line.set_indent(indent, alignment);

  // Never indent your first output indent at the start of the file
  if (this.__lines.length > 1) {
    this.current_line.set_indent(indent, alignment);
    return true;
  }

  this.current_line.set_indent();
  return false;
};

Output.prototype.add_raw_token = function(token) {
  for (var x = 0; x < token.newlines; x++) {
    this.__add_outputline();
  }
  this.current_line.set_indent(-1);
  this.current_line.push(token.whitespace_before);
  this.current_line.push(token.text);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
};

Output.prototype.add_token = function(printable_token) {
  this.__add_space_before_token();
  this.current_line.push(printable_token);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = this.current_line._allow_wrap();
};

Output.prototype.__add_space_before_token = function() {
  if (this.space_before_token && !this.just_added_newline()) {
    if (!this.non_breaking_space) {
      this.set_wrap_point();
    }
    this.current_line.push(' ');
  }
};

Output.prototype.remove_indent = function(index) {
  var output_length = this.__lines.length;
  while (index < output_length) {
    this.__lines[index]._remove_indent();
    index++;
  }
  this.current_line._remove_wrap_indent();
};

Output.prototype.trim = function(eat_newlines) {
  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

  this.current_line.trim();

  while (eat_newlines && this.__lines.length > 1 &&
    this.current_line.is_empty()) {
    this.__lines.pop();
    this.current_line = this.__lines[this.__lines.length - 1];
    this.current_line.trim();
  }

  this.previous_line = this.__lines.length > 1 ?
    this.__lines[this.__lines.length - 2] : null;
};

Output.prototype.just_added_newline = function() {
  return this.current_line.is_empty();
};

Output.prototype.just_added_blankline = function() {
  return this.is_empty() ||
    (this.current_line.is_empty() && this.previous_line.is_empty());
};

Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
  var index = this.__lines.length - 2;
  while (index >= 0) {
    var potentialEmptyLine = this.__lines[index];
    if (potentialEmptyLine.is_empty()) {
      break;
    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
      potentialEmptyLine.item(-1) !== ends_with) {
      this.__lines.splice(index + 1, 0, new OutputLine(this));
      this.previous_line = this.__lines[this.__lines.length - 2];
      break;
    }
    index--;
  }
};

module.exports.Output = Output;


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Options(options, merge_child_field) {
  this.raw_options = _mergeOpts(options, merge_child_field);

  // Support passing the source text back with no change
  this.disabled = this._get_boolean('disabled');

  this.eol = this._get_characters('eol', 'auto');
  this.end_with_newline = this._get_boolean('end_with_newline');
  this.indent_size = this._get_number('indent_size', 4);
  this.indent_char = this._get_characters('indent_char', ' ');
  this.indent_level = this._get_number('indent_level');

  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
  if (!this.preserve_newlines) {
    this.max_preserve_newlines = 0;
  }

  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
  if (this.indent_with_tabs) {
    this.indent_char = '\t';

    // indent_size behavior changed after 1.8.6
    // It used to be that indent_size would be
    // set to 1 for indent_with_tabs. That is no longer needed and
    // actually doesn't make sense - why not use spaces? Further,
    // that might produce unexpected behavior - tabs being used
    // for single-column alignment. So, when indent_with_tabs is true
    // and indent_size is 1, reset indent_size to 4.
    if (this.indent_size === 1) {
      this.indent_size = 4;
    }
  }

  // Backwards compat with 1.3.x
  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

}

Options.prototype._get_array = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || [];
  if (typeof option_value === 'object') {
    if (option_value !== null && typeof option_value.concat === 'function') {
      result = option_value.concat();
    }
  } else if (typeof option_value === 'string') {
    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
  }
  return result;
};

Options.prototype._get_boolean = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = option_value === undefined ? !!default_value : !!option_value;
  return result;
};

Options.prototype._get_characters = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || '';
  if (typeof option_value === 'string') {
    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
  }
  return result;
};

Options.prototype._get_number = function(name, default_value) {
  var option_value = this.raw_options[name];
  default_value = parseInt(default_value, 10);
  if (isNaN(default_value)) {
    default_value = 0;
  }
  var result = parseInt(option_value, 10);
  if (isNaN(result)) {
    result = default_value;
  }
  return result;
};

Options.prototype._get_selection = function(name, selection_list, default_value) {
  var result = this._get_selection_list(name, selection_list, default_value);
  if (result.length !== 1) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result[0];
};


Options.prototype._get_selection_list = function(name, selection_list, default_value) {
  if (!selection_list || selection_list.length === 0) {
    throw new Error("Selection list cannot be empty.");
  }

  default_value = default_value || [selection_list[0]];
  if (!this._is_valid_selection(default_value, selection_list)) {
    throw new Error("Invalid Default Value!");
  }

  var result = this._get_array(name, default_value);
  if (!this._is_valid_selection(result, selection_list)) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result;
};

Options.prototype._is_valid_selection = function(result, selection_list) {
  return result.length && selection_list.length &&
    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
};


// merges child options up with the parent options object
// Example: obj = {a: 1, b: {a: 2}}
//          mergeOpts(obj, 'b')
//
//          Returns: {a: 2}
function _mergeOpts(allOptions, childFieldName) {
  var finalOpts = {};
  allOptions = _normalizeOpts(allOptions);
  var name;

  for (name in allOptions) {
    if (name !== childFieldName) {
      finalOpts[name] = allOptions[name];
    }
  }

  //merge in the per type settings for the childFieldName
  if (childFieldName && allOptions[childFieldName]) {
    for (name in allOptions[childFieldName]) {
      finalOpts[name] = allOptions[childFieldName][name];
    }
  }
  return finalOpts;
}

function _normalizeOpts(options) {
  var convertedOpts = {};
  var key;

  for (key in options) {
    var newKey = key.replace(/-/g, "_");
    convertedOpts[newKey] = options[key];
  }
  return convertedOpts;
}

module.exports.Options = Options;
module.exports.normalizeOpts = _normalizeOpts;
module.exports.mergeOpts = _mergeOpts;


/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

function InputScanner(input_string) {
  this.__input = input_string || '';
  this.__input_length = this.__input.length;
  this.__position = 0;
}

InputScanner.prototype.restart = function() {
  this.__position = 0;
};

InputScanner.prototype.back = function() {
  if (this.__position > 0) {
    this.__position -= 1;
  }
};

InputScanner.prototype.hasNext = function() {
  return this.__position < this.__input_length;
};

InputScanner.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__input.charAt(this.__position);
    this.__position += 1;
  }
  return val;
};

InputScanner.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__input_length) {
    val = this.__input.charAt(index);
  }
  return val;
};

// This is a JavaScript only helper function (not in python)
// Javascript doesn't have a match method
// and not all implementation support "sticky" flag.
// If they do not support sticky then both this.match() and this.test() method
// must get the match and check the index of the match.
// If sticky is supported and set, this method will use it.
// Otherwise it will check that global is set, and fall back to the slower method.
InputScanner.prototype.__match = function(pattern, index) {
  pattern.lastIndex = index;
  var pattern_match = pattern.exec(this.__input);

  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
    if (pattern_match.index !== index) {
      pattern_match = null;
    }
  }

  return pattern_match;
};

InputScanner.prototype.test = function(pattern, index) {
  index = index || 0;
  index += this.__position;

  if (index >= 0 && index < this.__input_length) {
    return !!this.__match(pattern, index);
  } else {
    return false;
  }
};

InputScanner.prototype.testChar = function(pattern, index) {
  // test one character regex match
  var val = this.peek(index);
  pattern.lastIndex = 0;
  return val !== null && pattern.test(val);
};

InputScanner.prototype.match = function(pattern) {
  var pattern_match = this.__match(pattern, this.__position);
  if (pattern_match) {
    this.__position += pattern_match[0].length;
  } else {
    pattern_match = null;
  }
  return pattern_match;
};

InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
  var val = '';
  var match;
  if (starting_pattern) {
    match = this.match(starting_pattern);
    if (match) {
      val += match[0];
    }
  }
  if (until_pattern && (match || !starting_pattern)) {
    val += this.readUntil(until_pattern, until_after);
  }
  return val;
};

InputScanner.prototype.readUntil = function(pattern, until_after) {
  var val = '';
  var match_index = this.__position;
  pattern.lastIndex = this.__position;
  var pattern_match = pattern.exec(this.__input);
  if (pattern_match) {
    match_index = pattern_match.index;
    if (until_after) {
      match_index += pattern_match[0].length;
    }
  } else {
    match_index = this.__input_length;
  }

  val = this.__input.substring(this.__position, match_index);
  this.__position = match_index;
  return val;
};

InputScanner.prototype.readUntilAfter = function(pattern) {
  return this.readUntil(pattern, true);
};

InputScanner.prototype.get_regexp = function(pattern, match_from) {
  var result = null;
  var flags = 'g';
  if (match_from && regexp_has_sticky) {
    flags = 'y';
  }
  // strings are converted to regexp
  if (typeof pattern === "string" && pattern !== '') {
    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    result = new RegExp(pattern, flags);
  } else if (pattern) {
    result = new RegExp(pattern.source, flags);
  }
  return result;
};

InputScanner.prototype.get_literal_regexp = function(literal_string) {
  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
};

/* css beautifier legacy helpers */
InputScanner.prototype.peekUntilAfter = function(pattern) {
  var start = this.__position;
  var val = this.readUntilAfter(pattern);
  this.__position = start;
  return val;
};

InputScanner.prototype.lookBack = function(testVal) {
  var start = this.__position - 1;
  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
    .toLowerCase() === testVal;
};

module.exports.InputScanner = InputScanner;


/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Directives(start_block_pattern, end_block_pattern) {
  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
  this.__directive_pattern = / (\w+)[:](\w+)/g;

  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
}

Directives.prototype.get_directives = function(text) {
  if (!text.match(this.__directives_block_pattern)) {
    return null;
  }

  var directives = {};
  this.__directive_pattern.lastIndex = 0;
  var directive_match = this.__directive_pattern.exec(text);

  while (directive_match) {
    directives[directive_match[1]] = directive_match[2];
    directive_match = this.__directive_pattern.exec(text);
  }

  return directives;
};

Directives.prototype.readIgnored = function(input) {
  return input.readUntilAfter(this.__directives_end_ignore_pattern);
};


module.exports.Directives = Directives;


/***/ }),
/* 14 */,
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Beautifier = __webpack_require__(16).Beautifier,
  Options = __webpack_require__(17).Options;

function css_beautify(source_text, options) {
  var beautifier = new Beautifier(source_text, options);
  return beautifier.beautify();
}

module.exports = css_beautify;
module.exports.defaultOptions = function() {
  return new Options();
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Options = __webpack_require__(17).Options;
var Output = __webpack_require__(2).Output;
var InputScanner = __webpack_require__(8).InputScanner;
var Directives = __webpack_require__(13).Directives;

var directives_core = new Directives(/\/\*/, /\*\//);

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

// tokenizer
var whitespaceChar = /\s/;
var whitespacePattern = /(?:\s|\n)+/g;
var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;

function Beautifier(source_text, options) {
  this._source_text = source_text || '';
  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  this._options = new Options(options);
  this._ch = null;
  this._input = null;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
  this.NESTED_AT_RULE = {
    "@page": true,
    "@font-face": true,
    "@keyframes": true,
    // also in CONDITIONAL_GROUP_RULE below
    "@media": true,
    "@supports": true,
    "@document": true
  };
  this.CONDITIONAL_GROUP_RULE = {
    "@media": true,
    "@supports": true,
    "@document": true
  };

}

Beautifier.prototype.eatString = function(endChars) {
  var result = '';
  this._ch = this._input.next();
  while (this._ch) {
    result += this._ch;
    if (this._ch === "\\") {
      result += this._input.next();
    } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
      break;
    }
    this._ch = this._input.next();
  }
  return result;
};

// Skips any white space in the source text from the current position.
// When allowAtLeastOneNewLine is true, will output new lines for each
// newline character found; if the user has preserve_newlines off, only
// the first newline will be output
Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
  var result = whitespaceChar.test(this._input.peek());
  var isFirstNewLine = true;

  while (whitespaceChar.test(this._input.peek())) {
    this._ch = this._input.next();
    if (allowAtLeastOneNewLine && this._ch === '\n') {
      if (this._options.preserve_newlines || isFirstNewLine) {
        isFirstNewLine = false;
        this._output.add_new_line(true);
      }
    }
  }
  return result;
};

// Nested pseudo-class if we are insideRule
// and the next special character found opens
// a new block
Beautifier.prototype.foundNestedPseudoClass = function() {
  var openParen = 0;
  var i = 1;
  var ch = this._input.peek(i);
  while (ch) {
    if (ch === "{") {
      return true;
    } else if (ch === '(') {
      // pseudoclasses can contain ()
      openParen += 1;
    } else if (ch === ')') {
      if (openParen === 0) {
        return false;
      }
      openParen -= 1;
    } else if (ch === ";" || ch === "}") {
      return false;
    }
    i++;
    ch = this._input.peek(i);
  }
  return false;
};

Beautifier.prototype.print_string = function(output_string) {
  this._output.set_indent(this._indentLevel);
  this._output.non_breaking_space = true;
  this._output.add_token(output_string);
};

Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
  if (isAfterSpace) {
    this._output.space_before_token = true;
  }
};

Beautifier.prototype.indent = function() {
  this._indentLevel++;
};

Beautifier.prototype.outdent = function() {
  if (this._indentLevel > 0) {
    this._indentLevel--;
  }
};

/*_____________________--------------------_____________________*/

Beautifier.prototype.beautify = function() {
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text || '')) {
      eol = source_text.match(lineBreak)[0];
    }
  }


  // HACK: newline parsing inconsistent. This brute force normalizes the this._input.
  source_text = source_text.replace(allLineBreaks, '\n');

  // reset
  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  this._output = new Output(this._options, baseIndentString);
  this._input = new InputScanner(source_text);
  this._indentLevel = 0;
  this._nestedLevel = 0;

  this._ch = null;
  var parenLevel = 0;

  var insideRule = false;
  // This is the value side of a property value pair (blue in the following ex)
  // label { content: blue }
  var insidePropertyValue = false;
  var enteringConditionalGroup = false;
  var insideAtExtend = false;
  var insideAtImport = false;
  var topCharacter = this._ch;
  var whitespace;
  var isAfterSpace;
  var previous_ch;

  while (true) {
    whitespace = this._input.read(whitespacePattern);
    isAfterSpace = whitespace !== '';
    previous_ch = topCharacter;
    this._ch = this._input.next();
    topCharacter = this._ch;

    if (!this._ch) {
      break;
    } else if (this._ch === '/' && this._input.peek() === '*') {
      // /* css comment */
      // Always start block comments on a new line.
      // This handles scenarios where a block comment immediately
      // follows a property definition on the same line or where
      // minified code is being beautified.
      this._output.add_new_line();
      this._input.back();

      var comment = this._input.read(block_comment_pattern);

      // Handle ignore directive
      var directives = directives_core.get_directives(comment);
      if (directives && directives.ignore === 'start') {
        comment += directives_core.readIgnored(this._input);
      }

      this.print_string(comment);

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);

      // Block comments are followed by a new line so they don't
      // share a line with other properties
      this._output.add_new_line();
    } else if (this._ch === '/' && this._input.peek() === '/') {
      // // single line comment
      // Preserves the space before a comment
      // on the same line as a rule
      this._output.space_before_token = true;
      this._input.back();
      this.print_string(this._input.read(comment_pattern));

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);
    } else if (this._ch === '@') {
      this.preserveSingleSpace(isAfterSpace);

      // deal with less propery mixins @{...}
      if (this._input.peek() === '{') {
        this.print_string(this._ch + this.eatString('}'));
      } else {
        this.print_string(this._ch);

        // strip trailing space, if present, for hash property checks
        var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

        if (variableOrRule.match(/[ :]$/)) {
          // we have a variable or pseudo-class, add it and insert one space before continuing
          variableOrRule = this.eatString(": ").replace(/\s$/, '');
          this.print_string(variableOrRule);
          this._output.space_before_token = true;
        }

        variableOrRule = variableOrRule.replace(/\s$/, '');

        if (variableOrRule === 'extend') {
          insideAtExtend = true;
        } else if (variableOrRule === 'import') {
          insideAtImport = true;
        }

        // might be a nesting at-rule
        if (variableOrRule in this.NESTED_AT_RULE) {
          this._nestedLevel += 1;
          if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
            enteringConditionalGroup = true;
          }
          // might be less variable
        } else if (!insideRule && parenLevel === 0 && variableOrRule.indexOf(':') !== -1) {
          insidePropertyValue = true;
          this.indent();
        }
      }
    } else if (this._ch === '#' && this._input.peek() === '{') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString('}'));
    } else if (this._ch === '{') {
      if (insidePropertyValue) {
        insidePropertyValue = false;
        this.outdent();
      }
      this.indent();
      this._output.space_before_token = true;
      this.print_string(this._ch);

      // when entering conditional groups, only rulesets are allowed
      if (enteringConditionalGroup) {
        enteringConditionalGroup = false;
        insideRule = (this._indentLevel > this._nestedLevel);
      } else {
        // otherwise, declarations are also allowed
        insideRule = (this._indentLevel >= this._nestedLevel);
      }
      if (this._options.newline_between_rules && insideRule) {
        if (this._output.previous_line && this._output.previous_line.item(-1) !== '{') {
          this._output.ensure_empty_line_above('/', ',');
        }
      }
      this.eatWhitespace(true);
      this._output.add_new_line();
    } else if (this._ch === '}') {
      this.outdent();
      this._output.add_new_line();
      if (previous_ch === '{') {
        this._output.trim(true);
      }
      insideAtImport = false;
      insideAtExtend = false;
      if (insidePropertyValue) {
        this.outdent();
        insidePropertyValue = false;
      }
      this.print_string(this._ch);
      insideRule = false;
      if (this._nestedLevel) {
        this._nestedLevel--;
      }

      this.eatWhitespace(true);
      this._output.add_new_line();

      if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
        if (this._input.peek() !== '}') {
          this._output.add_new_line(true);
        }
      }
    } else if (this._ch === ":") {
      if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideAtExtend) {
        // 'property: value' delimiter
        // which could be in a conditional group query
        this.print_string(':');
        if (!insidePropertyValue) {
          insidePropertyValue = true;
          this._output.space_before_token = true;
          this.eatWhitespace(true);
          this.indent();
        }
      } else {
        // sass/less parent reference don't use a space
        // sass nested pseudo-class don't use a space

        // preserve space before pseudoclasses/pseudoelements, as it means "in any child"
        if (this._input.lookBack(" ")) {
          this._output.space_before_token = true;
        }
        if (this._input.peek() === ":") {
          // pseudo-element
          this._ch = this._input.next();
          this.print_string("::");
        } else {
          // pseudo-class
          this.print_string(':');
        }
      }
    } else if (this._ch === '"' || this._ch === '\'') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString(this._ch));
      this.eatWhitespace(true);
    } else if (this._ch === ';') {
      if (insidePropertyValue) {
        this.outdent();
        insidePropertyValue = false;
      }
      insideAtExtend = false;
      insideAtImport = false;
      this.print_string(this._ch);
      this.eatWhitespace(true);

      // This maintains single line comments on the same
      // line. Block comments are also affected, but
      // a new line is always output before one inside
      // that section
      if (this._input.peek() !== '/') {
        this._output.add_new_line();
      }
    } else if (this._ch === '(') { // may be a url
      if (this._input.lookBack("url")) {
        this.print_string(this._ch);
        this.eatWhitespace();
        this._ch = this._input.next();
        if (this._ch === ')' || this._ch === '"' || this._ch === '\'') {
          this._input.back();
          parenLevel++;
        } else if (this._ch) {
          this.print_string(this._ch + this.eatString(')'));
        }
      } else {
        parenLevel++;
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
        this.eatWhitespace();
      }
    } else if (this._ch === ')') {
      this.print_string(this._ch);
      parenLevel--;
    } else if (this._ch === ',') {
      this.print_string(this._ch);
      this.eatWhitespace(true);
      if (this._options.selector_separator_newline && !insidePropertyValue && parenLevel < 1 && !insideAtImport) {
        this._output.add_new_line();
      } else {
        this._output.space_before_token = true;
      }
    } else if ((this._ch === '>' || this._ch === '+' || this._ch === '~') && !insidePropertyValue && parenLevel < 1) {
      //handle combinator spacing
      if (this._options.space_around_combinator) {
        this._output.space_before_token = true;
        this.print_string(this._ch);
        this._output.space_before_token = true;
      } else {
        this.print_string(this._ch);
        this.eatWhitespace();
        // squash extra whitespace
        if (this._ch && whitespaceChar.test(this._ch)) {
          this._ch = '';
        }
      }
    } else if (this._ch === ']') {
      this.print_string(this._ch);
    } else if (this._ch === '[') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    } else if (this._ch === '=') { // no whitespace before or after
      this.eatWhitespace();
      this.print_string('=');
      if (whitespaceChar.test(this._ch)) {
        this._ch = '';
      }
    } else if (this._ch === '!') { // !important
      this.print_string(' ');
      this.print_string(this._ch);
    } else {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    }
  }

  var sweetCode = this._output.get_code(eol);

  return sweetCode;
};

module.exports.Beautifier = Beautifier;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var BaseOptions = __webpack_require__(6).Options;

function Options(options) {
  BaseOptions.call(this, options, 'css');

  this.selector_separator_newline = this._get_boolean('selector_separator_newline', true);
  this.newline_between_rules = this._get_boolean('newline_between_rules', true);
  var space_around_selector_separator = this._get_boolean('space_around_selector_separator');
  this.space_around_combinator = this._get_boolean('space_around_combinator') || space_around_selector_separator;

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;


/***/ })
/******/ ]);

const css_beautify = legacy_beautify_css;
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/beautify/beautify-html.js
// copied from js-beautify/js/lib/beautify-html.js
// version: 1.9.0
/* AUTO-GENERATED. DO NOT MODIFY. */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <einar@beautifier.io>
    https://beautifier.io/

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_inner_html (default false)  — indent <head> and <body> sections,
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    wrap_line_length (default 250)            -  maximum amount of characters per line (0 = disable)
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.
    inline (defaults to inline tags) - list of tags to be considered inline tags
    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
    content_unformatted (defaults to ["pre", "textarea"] tags) - list of tags, whose content shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"
    preserve_newlines (default true) - whether existing line breaks before elements should be preserved
                                        Only works before elements, not inside tags or for text.
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk
    indent_handlebars (default false) - format and indent {{#foo}} and {{/foo}}
    end_with_newline (false)          - end with a newline
    extra_liners (default [head,body,/html]) -List of tags that should have an extra newline before them.

    e.g.

    style_html(html_source, {
      'indent_inner_html': false,
      'indent_size': 2,
      'indent_char': ' ',
      'wrap_line_length': 78,
      'brace_style': 'expand',
      'preserve_newlines': true,
      'max_preserve_newlines': 5,
      'indent_handlebars': false,
      'extra_liners': ['/html']
    });
*/




var legacy_beautify_html =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function OutputLine(parent) {
  this.__parent = parent;
  this.__character_count = 0;
  // use indent_count as a marker for this.__lines that have preserved indentation
  this.__indent_count = -1;
  this.__alignment_count = 0;
  this.__wrap_point_index = 0;
  this.__wrap_point_character_count = 0;
  this.__wrap_point_indent_count = -1;
  this.__wrap_point_alignment_count = 0;

  this.__items = [];
}

OutputLine.prototype.clone_empty = function() {
  var line = new OutputLine(this.__parent);
  line.set_indent(this.__indent_count, this.__alignment_count);
  return line;
};

OutputLine.prototype.item = function(index) {
  if (index < 0) {
    return this.__items[this.__items.length + index];
  } else {
    return this.__items[index];
  }
};

OutputLine.prototype.has_match = function(pattern) {
  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
    if (this.__items[lastCheckedOutput].match(pattern)) {
      return true;
    }
  }
  return false;
};

OutputLine.prototype.set_indent = function(indent, alignment) {
  if (this.is_empty()) {
    this.__indent_count = indent || 0;
    this.__alignment_count = alignment || 0;
    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
  }
};

OutputLine.prototype._set_wrap_point = function() {
  if (this.__parent.wrap_line_length) {
    this.__wrap_point_index = this.__items.length;
    this.__wrap_point_character_count = this.__character_count;
    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
  }
};

OutputLine.prototype._should_wrap = function() {
  return this.__wrap_point_index &&
    this.__character_count > this.__parent.wrap_line_length &&
    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
};

OutputLine.prototype._allow_wrap = function() {
  if (this._should_wrap()) {
    this.__parent.add_new_line();
    var next = this.__parent.current_line;
    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
    next.__items = this.__items.slice(this.__wrap_point_index);
    this.__items = this.__items.slice(0, this.__wrap_point_index);

    next.__character_count += this.__character_count - this.__wrap_point_character_count;
    this.__character_count = this.__wrap_point_character_count;

    if (next.__items[0] === " ") {
      next.__items.splice(0, 1);
      next.__character_count -= 1;
    }
    return true;
  }
  return false;
};

OutputLine.prototype.is_empty = function() {
  return this.__items.length === 0;
};

OutputLine.prototype.last = function() {
  if (!this.is_empty()) {
    return this.__items[this.__items.length - 1];
  } else {
    return null;
  }
};

OutputLine.prototype.push = function(item) {
  this.__items.push(item);
  var last_newline_index = item.lastIndexOf('\n');
  if (last_newline_index !== -1) {
    this.__character_count = item.length - last_newline_index;
  } else {
    this.__character_count += item.length;
  }
};

OutputLine.prototype.pop = function() {
  var item = null;
  if (!this.is_empty()) {
    item = this.__items.pop();
    this.__character_count -= item.length;
  }
  return item;
};


OutputLine.prototype._remove_indent = function() {
  if (this.__indent_count > 0) {
    this.__indent_count -= 1;
    this.__character_count -= this.__parent.indent_size;
  }
};

OutputLine.prototype._remove_wrap_indent = function() {
  if (this.__wrap_point_indent_count > 0) {
    this.__wrap_point_indent_count -= 1;
  }
};
OutputLine.prototype.trim = function() {
  while (this.last() === ' ') {
    this.__items.pop();
    this.__character_count -= 1;
  }
};

OutputLine.prototype.toString = function() {
  var result = '';
  if (!this.is_empty()) {
    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
    result += this.__items.join('');
  }
  return result;
};

function IndentStringCache(options, baseIndentString) {
  this.__cache = [''];
  this.__indent_size = options.indent_size;
  this.__indent_string = options.indent_char;
  if (!options.indent_with_tabs) {
    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
  }

  // Set to null to continue support for auto detection of base indent
  baseIndentString = baseIndentString || '';
  if (options.indent_level > 0) {
    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
  }

  this.__base_string = baseIndentString;
  this.__base_string_length = baseIndentString.length;
}

IndentStringCache.prototype.get_indent_size = function(indent, column) {
  var result = this.__base_string_length;
  column = column || 0;
  if (indent < 0) {
    result = 0;
  }
  result += indent * this.__indent_size;
  result += column;
  return result;
};

IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
  var result = this.__base_string;
  column = column || 0;
  if (indent_level < 0) {
    indent_level = 0;
    result = '';
  }
  column += indent_level * this.__indent_size;
  this.__ensure_cache(column);
  result += this.__cache[column];
  return result;
};

IndentStringCache.prototype.__ensure_cache = function(column) {
  while (column >= this.__cache.length) {
    this.__add_column();
  }
};

IndentStringCache.prototype.__add_column = function() {
  var column = this.__cache.length;
  var indent = 0;
  var result = '';
  if (this.__indent_size && column >= this.__indent_size) {
    indent = Math.floor(column / this.__indent_size);
    column -= indent * this.__indent_size;
    result = new Array(indent + 1).join(this.__indent_string);
  }
  if (column) {
    result += new Array(column + 1).join(' ');
  }

  this.__cache.push(result);
};

function Output(options, baseIndentString) {
  this.__indent_cache = new IndentStringCache(options, baseIndentString);
  this.raw = false;
  this._end_with_newline = options.end_with_newline;
  this.indent_size = options.indent_size;
  this.wrap_line_length = options.wrap_line_length;
  this.__lines = [];
  this.previous_line = null;
  this.current_line = null;
  this.next_line = new OutputLine(this);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
  // initialize
  this.__add_outputline();
}

Output.prototype.__add_outputline = function() {
  this.previous_line = this.current_line;
  this.current_line = this.next_line.clone_empty();
  this.__lines.push(this.current_line);
};

Output.prototype.get_line_number = function() {
  return this.__lines.length;
};

Output.prototype.get_indent_string = function(indent, column) {
  return this.__indent_cache.get_indent_string(indent, column);
};

Output.prototype.get_indent_size = function(indent, column) {
  return this.__indent_cache.get_indent_size(indent, column);
};

Output.prototype.is_empty = function() {
  return !this.previous_line && this.current_line.is_empty();
};

Output.prototype.add_new_line = function(force_newline) {
  // never newline at the start of file
  // otherwise, newline only if we didn't just add one or we're forced
  if (this.is_empty() ||
    (!force_newline && this.just_added_newline())) {
    return false;
  }

  // if raw output is enabled, don't print additional newlines,
  // but still return True as though you had
  if (!this.raw) {
    this.__add_outputline();
  }
  return true;
};

Output.prototype.get_code = function(eol) {
  this.trim(true);

  // handle some edge cases where the last tokens
  // has text that ends with newline(s)
  var last_item = this.current_line.pop();
  if (last_item) {
    if (last_item[last_item.length - 1] === '\n') {
      last_item = last_item.replace(/\n+$/g, '');
    }
    this.current_line.push(last_item);
  }

  if (this._end_with_newline) {
    this.__add_outputline();
  }

  var sweet_code = this.__lines.join('\n');

  if (eol !== '\n') {
    sweet_code = sweet_code.replace(/[\n]/g, eol);
  }
  return sweet_code;
};

Output.prototype.set_wrap_point = function() {
  this.current_line._set_wrap_point();
};

Output.prototype.set_indent = function(indent, alignment) {
  indent = indent || 0;
  alignment = alignment || 0;

  // Next line stores alignment values
  this.next_line.set_indent(indent, alignment);

  // Never indent your first output indent at the start of the file
  if (this.__lines.length > 1) {
    this.current_line.set_indent(indent, alignment);
    return true;
  }

  this.current_line.set_indent();
  return false;
};

Output.prototype.add_raw_token = function(token) {
  for (var x = 0; x < token.newlines; x++) {
    this.__add_outputline();
  }
  this.current_line.set_indent(-1);
  this.current_line.push(token.whitespace_before);
  this.current_line.push(token.text);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
};

Output.prototype.add_token = function(printable_token) {
  this.__add_space_before_token();
  this.current_line.push(printable_token);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = this.current_line._allow_wrap();
};

Output.prototype.__add_space_before_token = function() {
  if (this.space_before_token && !this.just_added_newline()) {
    if (!this.non_breaking_space) {
      this.set_wrap_point();
    }
    this.current_line.push(' ');
  }
};

Output.prototype.remove_indent = function(index) {
  var output_length = this.__lines.length;
  while (index < output_length) {
    this.__lines[index]._remove_indent();
    index++;
  }
  this.current_line._remove_wrap_indent();
};

Output.prototype.trim = function(eat_newlines) {
  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

  this.current_line.trim();

  while (eat_newlines && this.__lines.length > 1 &&
    this.current_line.is_empty()) {
    this.__lines.pop();
    this.current_line = this.__lines[this.__lines.length - 1];
    this.current_line.trim();
  }

  this.previous_line = this.__lines.length > 1 ?
    this.__lines[this.__lines.length - 2] : null;
};

Output.prototype.just_added_newline = function() {
  return this.current_line.is_empty();
};

Output.prototype.just_added_blankline = function() {
  return this.is_empty() ||
    (this.current_line.is_empty() && this.previous_line.is_empty());
};

Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
  var index = this.__lines.length - 2;
  while (index >= 0) {
    var potentialEmptyLine = this.__lines[index];
    if (potentialEmptyLine.is_empty()) {
      break;
    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
      potentialEmptyLine.item(-1) !== ends_with) {
      this.__lines.splice(index + 1, 0, new OutputLine(this));
      this.previous_line = this.__lines[this.__lines.length - 2];
      break;
    }
    index--;
  }
};

module.exports.Output = Output;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Token(type, text, newlines, whitespace_before) {
  this.type = type;
  this.text = text;

  // comments_before are
  // comments that have a new line before them
  // and may or may not have a newline after
  // this is a set of comments before
  this.comments_before = null; /* inline comment*/


  // this.comments_after =  new TokenStream(); // no new line before and newline after
  this.newlines = newlines || 0;
  this.whitespace_before = whitespace_before || '';
  this.parent = null;
  this.next = null;
  this.previous = null;
  this.opened = null;
  this.closed = null;
  this.directives = null;
}


module.exports.Token = Token;


/***/ }),
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Options(options, merge_child_field) {
  this.raw_options = _mergeOpts(options, merge_child_field);

  // Support passing the source text back with no change
  this.disabled = this._get_boolean('disabled');

  this.eol = this._get_characters('eol', 'auto');
  this.end_with_newline = this._get_boolean('end_with_newline');
  this.indent_size = this._get_number('indent_size', 4);
  this.indent_char = this._get_characters('indent_char', ' ');
  this.indent_level = this._get_number('indent_level');

  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
  if (!this.preserve_newlines) {
    this.max_preserve_newlines = 0;
  }

  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
  if (this.indent_with_tabs) {
    this.indent_char = '\t';

    // indent_size behavior changed after 1.8.6
    // It used to be that indent_size would be
    // set to 1 for indent_with_tabs. That is no longer needed and
    // actually doesn't make sense - why not use spaces? Further,
    // that might produce unexpected behavior - tabs being used
    // for single-column alignment. So, when indent_with_tabs is true
    // and indent_size is 1, reset indent_size to 4.
    if (this.indent_size === 1) {
      this.indent_size = 4;
    }
  }

  // Backwards compat with 1.3.x
  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

}

Options.prototype._get_array = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || [];
  if (typeof option_value === 'object') {
    if (option_value !== null && typeof option_value.concat === 'function') {
      result = option_value.concat();
    }
  } else if (typeof option_value === 'string') {
    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
  }
  return result;
};

Options.prototype._get_boolean = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = option_value === undefined ? !!default_value : !!option_value;
  return result;
};

Options.prototype._get_characters = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || '';
  if (typeof option_value === 'string') {
    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
  }
  return result;
};

Options.prototype._get_number = function(name, default_value) {
  var option_value = this.raw_options[name];
  default_value = parseInt(default_value, 10);
  if (isNaN(default_value)) {
    default_value = 0;
  }
  var result = parseInt(option_value, 10);
  if (isNaN(result)) {
    result = default_value;
  }
  return result;
};

Options.prototype._get_selection = function(name, selection_list, default_value) {
  var result = this._get_selection_list(name, selection_list, default_value);
  if (result.length !== 1) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result[0];
};


Options.prototype._get_selection_list = function(name, selection_list, default_value) {
  if (!selection_list || selection_list.length === 0) {
    throw new Error("Selection list cannot be empty.");
  }

  default_value = default_value || [selection_list[0]];
  if (!this._is_valid_selection(default_value, selection_list)) {
    throw new Error("Invalid Default Value!");
  }

  var result = this._get_array(name, default_value);
  if (!this._is_valid_selection(result, selection_list)) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result;
};

Options.prototype._is_valid_selection = function(result, selection_list) {
  return result.length && selection_list.length &&
    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
};


// merges child options up with the parent options object
// Example: obj = {a: 1, b: {a: 2}}
//          mergeOpts(obj, 'b')
//
//          Returns: {a: 2}
function _mergeOpts(allOptions, childFieldName) {
  var finalOpts = {};
  allOptions = _normalizeOpts(allOptions);
  var name;

  for (name in allOptions) {
    if (name !== childFieldName) {
      finalOpts[name] = allOptions[name];
    }
  }

  //merge in the per type settings for the childFieldName
  if (childFieldName && allOptions[childFieldName]) {
    for (name in allOptions[childFieldName]) {
      finalOpts[name] = allOptions[childFieldName][name];
    }
  }
  return finalOpts;
}

function _normalizeOpts(options) {
  var convertedOpts = {};
  var key;

  for (key in options) {
    var newKey = key.replace(/-/g, "_");
    convertedOpts[newKey] = options[key];
  }
  return convertedOpts;
}

module.exports.Options = Options;
module.exports.normalizeOpts = _normalizeOpts;
module.exports.mergeOpts = _mergeOpts;


/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

function InputScanner(input_string) {
  this.__input = input_string || '';
  this.__input_length = this.__input.length;
  this.__position = 0;
}

InputScanner.prototype.restart = function() {
  this.__position = 0;
};

InputScanner.prototype.back = function() {
  if (this.__position > 0) {
    this.__position -= 1;
  }
};

InputScanner.prototype.hasNext = function() {
  return this.__position < this.__input_length;
};

InputScanner.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__input.charAt(this.__position);
    this.__position += 1;
  }
  return val;
};

InputScanner.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__input_length) {
    val = this.__input.charAt(index);
  }
  return val;
};

// This is a JavaScript only helper function (not in python)
// Javascript doesn't have a match method
// and not all implementation support "sticky" flag.
// If they do not support sticky then both this.match() and this.test() method
// must get the match and check the index of the match.
// If sticky is supported and set, this method will use it.
// Otherwise it will check that global is set, and fall back to the slower method.
InputScanner.prototype.__match = function(pattern, index) {
  pattern.lastIndex = index;
  var pattern_match = pattern.exec(this.__input);

  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
    if (pattern_match.index !== index) {
      pattern_match = null;
    }
  }

  return pattern_match;
};

InputScanner.prototype.test = function(pattern, index) {
  index = index || 0;
  index += this.__position;

  if (index >= 0 && index < this.__input_length) {
    return !!this.__match(pattern, index);
  } else {
    return false;
  }
};

InputScanner.prototype.testChar = function(pattern, index) {
  // test one character regex match
  var val = this.peek(index);
  pattern.lastIndex = 0;
  return val !== null && pattern.test(val);
};

InputScanner.prototype.match = function(pattern) {
  var pattern_match = this.__match(pattern, this.__position);
  if (pattern_match) {
    this.__position += pattern_match[0].length;
  } else {
    pattern_match = null;
  }
  return pattern_match;
};

InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
  var val = '';
  var match;
  if (starting_pattern) {
    match = this.match(starting_pattern);
    if (match) {
      val += match[0];
    }
  }
  if (until_pattern && (match || !starting_pattern)) {
    val += this.readUntil(until_pattern, until_after);
  }
  return val;
};

InputScanner.prototype.readUntil = function(pattern, until_after) {
  var val = '';
  var match_index = this.__position;
  pattern.lastIndex = this.__position;
  var pattern_match = pattern.exec(this.__input);
  if (pattern_match) {
    match_index = pattern_match.index;
    if (until_after) {
      match_index += pattern_match[0].length;
    }
  } else {
    match_index = this.__input_length;
  }

  val = this.__input.substring(this.__position, match_index);
  this.__position = match_index;
  return val;
};

InputScanner.prototype.readUntilAfter = function(pattern) {
  return this.readUntil(pattern, true);
};

InputScanner.prototype.get_regexp = function(pattern, match_from) {
  var result = null;
  var flags = 'g';
  if (match_from && regexp_has_sticky) {
    flags = 'y';
  }
  // strings are converted to regexp
  if (typeof pattern === "string" && pattern !== '') {
    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    result = new RegExp(pattern, flags);
  } else if (pattern) {
    result = new RegExp(pattern.source, flags);
  }
  return result;
};

InputScanner.prototype.get_literal_regexp = function(literal_string) {
  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
};

/* css beautifier legacy helpers */
InputScanner.prototype.peekUntilAfter = function(pattern) {
  var start = this.__position;
  var val = this.readUntilAfter(pattern);
  this.__position = start;
  return val;
};

InputScanner.prototype.lookBack = function(testVal) {
  var start = this.__position - 1;
  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
    .toLowerCase() === testVal;
};

module.exports.InputScanner = InputScanner;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var InputScanner = __webpack_require__(8).InputScanner;
var Token = __webpack_require__(3).Token;
var TokenStream = __webpack_require__(10).TokenStream;
var WhitespacePattern = __webpack_require__(11).WhitespacePattern;

var TOKEN = {
  START: 'TK_START',
  RAW: 'TK_RAW',
  EOF: 'TK_EOF'
};

var Tokenizer = function(input_string, options) {
  this._input = new InputScanner(input_string);
  this._options = options || {};
  this.__tokens = null;

  this._patterns = {};
  this._patterns.whitespace = new WhitespacePattern(this._input);
};

Tokenizer.prototype.tokenize = function() {
  this._input.restart();
  this.__tokens = new TokenStream();

  this._reset();

  var current;
  var previous = new Token(TOKEN.START, '');
  var open_token = null;
  var open_stack = [];
  var comments = new TokenStream();

  while (previous.type !== TOKEN.EOF) {
    current = this._get_next_token(previous, open_token);
    while (this._is_comment(current)) {
      comments.add(current);
      current = this._get_next_token(previous, open_token);
    }

    if (!comments.isEmpty()) {
      current.comments_before = comments;
      comments = new TokenStream();
    }

    current.parent = open_token;

    if (this._is_opening(current)) {
      open_stack.push(open_token);
      open_token = current;
    } else if (open_token && this._is_closing(current, open_token)) {
      current.opened = open_token;
      open_token.closed = current;
      open_token = open_stack.pop();
      current.parent = open_token;
    }

    current.previous = previous;
    previous.next = current;

    this.__tokens.add(current);
    previous = current;
  }

  return this.__tokens;
};


Tokenizer.prototype._is_first_token = function() {
  return this.__tokens.isEmpty();
};

Tokenizer.prototype._reset = function() {};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  this._readWhitespace();
  var resulting_string = this._input.read(/.+/g);
  if (resulting_string) {
    return this._create_token(TOKEN.RAW, resulting_string);
  } else {
    return this._create_token(TOKEN.EOF, '');
  }
};

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_opening = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._create_token = function(type, text) {
  var token = new Token(type, text,
    this._patterns.whitespace.newline_count,
    this._patterns.whitespace.whitespace_before_token);
  return token;
};

Tokenizer.prototype._readWhitespace = function() {
  return this._patterns.whitespace.read();
};



module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function TokenStream(parent_token) {
  // private
  this.__tokens = [];
  this.__tokens_length = this.__tokens.length;
  this.__position = 0;
  this.__parent_token = parent_token;
}

TokenStream.prototype.restart = function() {
  this.__position = 0;
};

TokenStream.prototype.isEmpty = function() {
  return this.__tokens_length === 0;
};

TokenStream.prototype.hasNext = function() {
  return this.__position < this.__tokens_length;
};

TokenStream.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__tokens[this.__position];
    this.__position += 1;
  }
  return val;
};

TokenStream.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__tokens_length) {
    val = this.__tokens[index];
  }
  return val;
};

TokenStream.prototype.add = function(token) {
  if (this.__parent_token) {
    token.parent = this.__parent_token;
  }
  this.__tokens.push(token);
  this.__tokens_length += 1;
};

module.exports.TokenStream = TokenStream;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Pattern = __webpack_require__(12).Pattern;

function WhitespacePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  if (parent) {
    this._line_regexp = this._input.get_regexp(parent._line_regexp);
  } else {
    this.__set_whitespace_patterns('', '');
  }

  this.newline_count = 0;
  this.whitespace_before_token = '';
}
WhitespacePattern.prototype = new Pattern();

WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
  whitespace_chars += '\\t ';
  newline_chars += '\\n\\r';

  this._match_pattern = this._input.get_regexp(
    '[' + whitespace_chars + newline_chars + ']+', true);
  this._newline_regexp = this._input.get_regexp(
    '\\r\\n|[' + newline_chars + ']');
};

WhitespacePattern.prototype.read = function() {
  this.newline_count = 0;
  this.whitespace_before_token = '';

  var resulting_string = this._input.read(this._match_pattern);
  if (resulting_string === ' ') {
    this.whitespace_before_token = ' ';
  } else if (resulting_string) {
    var matches = this.__split(this._newline_regexp, resulting_string);
    this.newline_count = matches.length - 1;
    this.whitespace_before_token = matches[this.newline_count];
  }

  return resulting_string;
};

WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
  var result = this._create();
  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
  result._update();
  return result;
};

WhitespacePattern.prototype._create = function() {
  return new WhitespacePattern(this._input, this);
};

WhitespacePattern.prototype.__split = function(regexp, input_string) {
  regexp.lastIndex = 0;
  var start_index = 0;
  var result = [];
  var next_match = regexp.exec(input_string);
  while (next_match) {
    result.push(input_string.substring(start_index, next_match.index));
    start_index = next_match.index + next_match[0].length;
    next_match = regexp.exec(input_string);
  }

  if (start_index < input_string.length) {
    result.push(input_string.substring(start_index, input_string.length));
  } else {
    result.push('');
  }

  return result;
};



module.exports.WhitespacePattern = WhitespacePattern;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Pattern(input_scanner, parent) {
  this._input = input_scanner;
  this._starting_pattern = null;
  this._match_pattern = null;
  this._until_pattern = null;
  this._until_after = false;

  if (parent) {
    this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
    this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
    this._until_pattern = this._input.get_regexp(parent._until_pattern);
    this._until_after = parent._until_after;
  }
}

Pattern.prototype.read = function() {
  var result = this._input.read(this._starting_pattern);
  if (!this._starting_pattern || result) {
    result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
  }
  return result;
};

Pattern.prototype.read_match = function() {
  return this._input.match(this._match_pattern);
};

Pattern.prototype.until_after = function(pattern) {
  var result = this._create();
  result._until_after = true;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.until = function(pattern) {
  var result = this._create();
  result._until_after = false;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.starting_with = function(pattern) {
  var result = this._create();
  result._starting_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype.matching = function(pattern) {
  var result = this._create();
  result._match_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype._create = function() {
  return new Pattern(this._input, this);
};

Pattern.prototype._update = function() {};

module.exports.Pattern = Pattern;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



function Directives(start_block_pattern, end_block_pattern) {
  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
  this.__directive_pattern = / (\w+)[:](\w+)/g;

  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
}

Directives.prototype.get_directives = function(text) {
  if (!text.match(this.__directives_block_pattern)) {
    return null;
  }

  var directives = {};
  this.__directive_pattern.lastIndex = 0;
  var directive_match = this.__directive_pattern.exec(text);

  while (directive_match) {
    directives[directive_match[1]] = directive_match[2];
    directive_match = this.__directive_pattern.exec(text);
  }

  return directives;
};

Directives.prototype.readIgnored = function(input) {
  return input.readUntilAfter(this.__directives_end_ignore_pattern);
};


module.exports.Directives = Directives;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Pattern = __webpack_require__(12).Pattern;


var template_names = {
  django: false,
  erb: false,
  handlebars: false,
  php: false
};

// This lets templates appear anywhere we would do a readUntil
// The cost is higher but it is pay to play.
function TemplatablePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  this.__template_pattern = null;
  this._disabled = Object.assign({}, template_names);
  this._excluded = Object.assign({}, template_names);

  if (parent) {
    this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
    this._excluded = Object.assign(this._excluded, parent._excluded);
    this._disabled = Object.assign(this._disabled, parent._disabled);
  }
  var pattern = new Pattern(input_scanner);
  this.__patterns = {
    handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
    handlebars: pattern.starting_with(/{{/).until_after(/}}/),
    php: pattern.starting_with(/<\?(?:[=]|php)/).until_after(/\?>/),
    erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
    // django coflicts with handlebars a bit.
    django: pattern.starting_with(/{%/).until_after(/%}/),
    django_value: pattern.starting_with(/{{/).until_after(/}}/),
    django_comment: pattern.starting_with(/{#/).until_after(/#}/)
  };
}
TemplatablePattern.prototype = new Pattern();

TemplatablePattern.prototype._create = function() {
  return new TemplatablePattern(this._input, this);
};

TemplatablePattern.prototype._update = function() {
  this.__set_templated_pattern();
};

TemplatablePattern.prototype.disable = function(language) {
  var result = this._create();
  result._disabled[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.exclude = function(language) {
  var result = this._create();
  result._excluded[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.read = function() {
  var result = '';
  if (this._match_pattern) {
    result = this._input.read(this._starting_pattern);
  } else {
    result = this._input.read(this._starting_pattern, this.__template_pattern);
  }
  var next = this._read_template();
  while (next) {
    if (this._match_pattern) {
      next += this._input.read(this._match_pattern);
    } else {
      next += this._input.readUntil(this.__template_pattern);
    }
    result += next;
    next = this._read_template();
  }

  if (this._until_after) {
    result += this._input.readUntilAfter(this._until_pattern);
  }
  return result;
};

TemplatablePattern.prototype.__set_templated_pattern = function() {
  var items = [];

  if (!this._disabled.php) {
    items.push(this.__patterns.php._starting_pattern.source);
  }
  if (!this._disabled.handlebars) {
    items.push(this.__patterns.handlebars._starting_pattern.source);
  }
  if (!this._disabled.erb) {
    items.push(this.__patterns.erb._starting_pattern.source);
  }
  if (!this._disabled.django) {
    items.push(this.__patterns.django._starting_pattern.source);
    items.push(this.__patterns.django_value._starting_pattern.source);
    items.push(this.__patterns.django_comment._starting_pattern.source);
  }

  if (this._until_pattern) {
    items.push(this._until_pattern.source);
  }
  this.__template_pattern = this._input.get_regexp('(?:' + items.join('|') + ')');
};

TemplatablePattern.prototype._read_template = function() {
  var resulting_string = '';
  var c = this._input.peek();
  if (c === '<') {
    var peek1 = this._input.peek(1);
    //if we're in a comment, do something special
    // We treat all comments as literals, even more than preformatted tags
    // we just look for the appropriate close tag
    if (!this._disabled.php && !this._excluded.php && peek1 === '?') {
      resulting_string = resulting_string ||
        this.__patterns.php.read();
    }
    if (!this._disabled.erb && !this._excluded.erb && peek1 === '%') {
      resulting_string = resulting_string ||
        this.__patterns.erb.read();
    }
  } else if (c === '{') {
    if (!this._disabled.handlebars && !this._excluded.handlebars) {
      resulting_string = resulting_string ||
        this.__patterns.handlebars_comment.read();
      resulting_string = resulting_string ||
        this.__patterns.handlebars.read();
    }
    if (!this._disabled.django) {
      // django coflicts with handlebars a bit.
      if (!this._excluded.django && !this._excluded.handlebars) {
        resulting_string = resulting_string ||
          this.__patterns.django_value.read();
      }
      if (!this._excluded.django) {
        resulting_string = resulting_string ||
          this.__patterns.django_comment.read();
        resulting_string = resulting_string ||
          this.__patterns.django.read();
      }
    }
  }
  return resulting_string;
};


module.exports.TemplatablePattern = TemplatablePattern;


/***/ }),
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Beautifier = __webpack_require__(19).Beautifier,
  Options = __webpack_require__(20).Options;

function style_html(html_source, options, js_beautify, css_beautify) {
  var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
  return beautifier.beautify();
}

module.exports = style_html;
module.exports.defaultOptions = function() {
  return new Options();
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var Options = __webpack_require__(20).Options;
var Output = __webpack_require__(2).Output;
var Tokenizer = __webpack_require__(21).Tokenizer;
var TOKEN = __webpack_require__(21).TOKEN;

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

var Printer = function(options, base_indent_string) { //handles input/output and some other printing functions

  this.indent_level = 0;
  this.alignment_size = 0;
  this.max_preserve_newlines = options.max_preserve_newlines;
  this.preserve_newlines = options.preserve_newlines;

  this._output = new Output(options, base_indent_string);

};

Printer.prototype.current_line_has_match = function(pattern) {
  return this._output.current_line.has_match(pattern);
};

Printer.prototype.set_space_before_token = function(value, non_breaking) {
  this._output.space_before_token = value;
  this._output.non_breaking_space = non_breaking;
};

Printer.prototype.set_wrap_point = function() {
  this._output.set_indent(this.indent_level, this.alignment_size);
  this._output.set_wrap_point();
};


Printer.prototype.add_raw_token = function(token) {
  this._output.add_raw_token(token);
};

Printer.prototype.print_preserved_newlines = function(raw_token) {
  var newlines = 0;
  if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
    newlines = raw_token.newlines ? 1 : 0;
  }

  if (this.preserve_newlines) {
    newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
  }
  for (var n = 0; n < newlines; n++) {
    this.print_newline(n > 0);
  }

  return newlines !== 0;
};

Printer.prototype.traverse_whitespace = function(raw_token) {
  if (raw_token.whitespace_before || raw_token.newlines) {
    if (!this.print_preserved_newlines(raw_token)) {
      this._output.space_before_token = true;
    }
    return true;
  }
  return false;
};

Printer.prototype.previous_token_wrapped = function() {
  return this._output.previous_token_wrapped;
};

Printer.prototype.print_newline = function(force) {
  this._output.add_new_line(force);
};

Printer.prototype.print_token = function(token) {
  if (token.text) {
    this._output.set_indent(this.indent_level, this.alignment_size);
    this._output.add_token(token.text);
  }
};

Printer.prototype.indent = function() {
  this.indent_level++;
};

Printer.prototype.get_full_indent = function(level) {
  level = this.indent_level + (level || 0);
  if (level < 1) {
    return '';
  }

  return this._output.get_indent_string(level);
};

var get_type_attribute = function(start_token) {
  var result = null;
  var raw_token = start_token.next;

  // Search attributes for a type attribute
  while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
    if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === 'type') {
      if (raw_token.next && raw_token.next.type === TOKEN.EQUALS &&
        raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
        result = raw_token.next.next.text;
      }
      break;
    }
    raw_token = raw_token.next;
  }

  return result;
};

var get_custom_beautifier_name = function(tag_check, raw_token) {
  var typeAttribute = null;
  var result = null;

  if (!raw_token.closed) {
    return null;
  }

  if (tag_check === 'script') {
    typeAttribute = 'text/javascript';
  } else if (tag_check === 'style') {
    typeAttribute = 'text/css';
  }

  typeAttribute = get_type_attribute(raw_token) || typeAttribute;

  // For script and style tags that have a type attribute, only enable custom beautifiers for matching values
  // For those without a type attribute use default;
  if (typeAttribute.search('text/css') > -1) {
    result = 'css';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect)/) > -1) {
    result = 'javascript';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
    result = 'html';
  } else if (typeAttribute.search(/test\/null/) > -1) {
    // Test only mime-type for testing the beautifier when null is passed as beautifing function
    result = 'null';
  }

  return result;
};

function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}

function TagFrame(parent, parser_token, indent_level) {
  this.parent = parent || null;
  this.tag = parser_token ? parser_token.tag_name : '';
  this.indent_level = indent_level || 0;
  this.parser_token = parser_token || null;
}

function TagStack(printer) {
  this._printer = printer;
  this._current_frame = null;
}

TagStack.prototype.get_parser_token = function() {
  return this._current_frame ? this._current_frame.parser_token : null;
};

TagStack.prototype.record_tag = function(parser_token) { //function to record a tag and its parent in this.tags Object
  var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
  this._current_frame = new_frame;
};

TagStack.prototype._try_pop_frame = function(frame) { //function to retrieve the opening tag to the corresponding closer
  var parser_token = null;

  if (frame) {
    parser_token = frame.parser_token;
    this._printer.indent_level = frame.indent_level;
    this._current_frame = frame.parent;
  }

  return parser_token;
};

TagStack.prototype._get_frame = function(tag_list, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._current_frame;

  while (frame) { //till we reach '' (the initial value);
    if (tag_list.indexOf(frame.tag) !== -1) { //if this is it use it
      break;
    } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
      frame = null;
      break;
    }
    frame = frame.parent;
  }

  return frame;
};

TagStack.prototype.try_pop = function(tag, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._get_frame([tag], stop_list);
  return this._try_pop_frame(frame);
};

TagStack.prototype.indent_to_tag = function(tag_list) {
  var frame = this._get_frame(tag_list);
  if (frame) {
    this._printer.indent_level = frame.indent_level;
  }
};

function Beautifier(source_text, options, js_beautify, css_beautify) {
  //Wrapper function to invoke all the necessary constructors and deal with the output.
  this._source_text = source_text || '';
  options = options || {};
  this._js_beautify = js_beautify;
  this._css_beautify = css_beautify;
  this._tag_stack = null;

  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  var optionHtml = new Options(options, 'html');

  this._options = optionHtml;

  this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, 'force'.length) === 'force';
  this._is_wrap_attributes_force_expand_multiline = (this._options.wrap_attributes === 'force-expand-multiline');
  this._is_wrap_attributes_force_aligned = (this._options.wrap_attributes === 'force-aligned');
  this._is_wrap_attributes_aligned_multiple = (this._options.wrap_attributes === 'aligned-multiple');
  this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, 'preserve'.length) === 'preserve';
  this._is_wrap_attributes_preserve_aligned = (this._options.wrap_attributes === 'preserve-aligned');
}

Beautifier.prototype.beautify = function() {

  // if disabled, return the input unchanged.
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (this._options.eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text)) {
      eol = source_text.match(lineBreak)[0];
    }
  }

  // HACK: newline parsing inconsistent. This brute force normalizes the input.
  source_text = source_text.replace(allLineBreaks, '\n');

  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  var last_token = {
    text: '',
    type: ''
  };

  var last_tag_token = new TagOpenParserToken();

  var printer = new Printer(this._options, baseIndentString);
  var tokens = new Tokenizer(source_text, this._options).tokenize();

  this._tag_stack = new TagStack(printer);

  var parser_token = null;
  var raw_token = tokens.next();
  while (raw_token.type !== TOKEN.EOF) {

    if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
      parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token);
      last_tag_token = parser_token;
    } else if ((raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE) ||
      (raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete)) {
      parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, tokens);
    } else if (raw_token.type === TOKEN.TAG_CLOSE) {
      parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
    } else if (raw_token.type === TOKEN.TEXT) {
      parser_token = this._handle_text(printer, raw_token, last_tag_token);
    } else {
      // This should never happen, but if it does. Print the raw token
      printer.add_raw_token(raw_token);
    }

    last_token = parser_token;

    raw_token = tokens.next();
  }
  var sweet_code = printer._output.get_code(eol);

  return sweet_code;
};

Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };
  printer.alignment_size = 0;
  last_tag_token.tag_complete = true;

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    if (last_tag_token.tag_start_char === '<') {
      printer.set_space_before_token(raw_token.text[0] === '/', true); // space before />, no space before >
      if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
        printer.print_newline(false);
      }
    }
    printer.print_token(raw_token);

  }

  if (last_tag_token.indent_content &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.indent();

    // only indent once per opened tag
    last_tag_token.indent_content = false;
  }

  if (!last_tag_token.is_inline_element &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.set_wrap_point();
  }

  return parser_token;
};

Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, tokens) {
  var wrapped = last_tag_token.has_wrapped_attrs;
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else if (last_tag_token.tag_start_char === '{' && raw_token.type === TOKEN.TEXT) {
    // For the insides of handlebars allow newlines or a single space between open and contents
    if (printer.print_preserved_newlines(raw_token)) {
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
    } else {
      printer.print_token(raw_token);
    }
  } else {
    if (raw_token.type === TOKEN.ATTRIBUTE) {
      printer.set_space_before_token(true);
      last_tag_token.attr_count += 1;
    } else if (raw_token.type === TOKEN.EQUALS) { //no space before =
      printer.set_space_before_token(false);
    } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) { //no space before value
      printer.set_space_before_token(false);
    }

    if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === '<') {
      if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
        printer.traverse_whitespace(raw_token);
        wrapped = wrapped || raw_token.newlines !== 0;
      }


      if (this._is_wrap_attributes_force) {
        var force_attr_wrap = last_tag_token.attr_count > 1;
        if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.attr_count === 1) {
          var is_only_attribute = true;
          var peek_index = 0;
          var peek_token;
          do {
            peek_token = tokens.peek(peek_index);
            if (peek_token.type === TOKEN.ATTRIBUTE) {
              is_only_attribute = false;
              break;
            }
            peek_index += 1;
          } while (peek_index < 4 && peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);

          force_attr_wrap = !is_only_attribute;
        }

        if (force_attr_wrap) {
          printer.print_newline(false);
          wrapped = true;
        }
      }
    }
    printer.print_token(raw_token);
    wrapped = wrapped || printer.previous_token_wrapped();
    last_tag_token.has_wrapped_attrs = wrapped;
  }
  return parser_token;
};

Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: 'TK_CONTENT'
  };
  if (last_tag_token.custom_beautifier_name) { //check if we need to format javascript
    this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
  } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    printer.print_token(raw_token);
  }
  return parser_token;
};

Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
  var local = this;
  if (raw_token.text !== '') {
    printer.print_newline(false);
    var text = raw_token.text,
      _beautifier,
      script_indent_level = 1;
    if (last_tag_token.custom_beautifier_name === 'javascript' && typeof this._js_beautify === 'function') {
      _beautifier = this._js_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'css' && typeof this._css_beautify === 'function') {
      _beautifier = this._css_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'html') {
      _beautifier = function(html_source, options) {
        var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
        return beautifier.beautify();
      };
    }


    if (this._options.indent_scripts === "keep") {
      script_indent_level = 0;
    } else if (this._options.indent_scripts === "separate") {
      script_indent_level = -printer.indent_level;
    }

    var indentation = printer.get_full_indent(script_indent_level);

    // if there is at least one empty line at the end of this text, strip it
    // we'll be adding one back after the text but before the containing tag.
    text = text.replace(/\n[ \t]*$/, '');

    if (_beautifier) {

      // call the Beautifier if avaliable
      var Child_options = function() {
        this.eol = '\n';
      };
      Child_options.prototype = this._options.raw_options;
      var child_options = new Child_options();
      text = _beautifier(indentation + text, child_options);
    } else {
      // simply indent the string otherwise
      var white = raw_token.whitespace_before;
      if (white) {
        text = text.replace(new RegExp('\n(' + white + ')?', 'g'), '\n');
      }

      text = indentation + text.replace(/\n/g, '\n' + indentation);
    }
    if (text) {
      raw_token.text = text;
      raw_token.whitespace_before = '';
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
      printer.print_newline(true);
    }
  }
};

Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token) {
  var parser_token = this._get_tag_open_token(raw_token);

  if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) &&
    raw_token.type === TOKEN.TAG_OPEN && raw_token.text.indexOf('</') === 0) {
    // End element tags for unformatted or content_unformatted elements
    // are printed raw to keep any newlines inside them exactly the same.
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
    if (!parser_token.is_inline_element) {
      printer.set_wrap_point();
    }
    printer.print_token(raw_token);
  }

  //indent attributes an auto, forced, aligned or forced-align line-wrap
  if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
    parser_token.alignment_size = raw_token.text.length + 1;
  }

  if (!parser_token.tag_complete && !parser_token.is_unformatted) {
    printer.alignment_size = parser_token.alignment_size;
  }

  return parser_token;
};

var TagOpenParserToken = function(parent, raw_token) {
  this.parent = parent || null;
  this.text = '';
  this.type = 'TK_TAG_OPEN';
  this.tag_name = '';
  this.is_inline_element = false;
  this.is_unformatted = false;
  this.is_content_unformatted = false;
  this.is_empty_element = false;
  this.is_start_tag = false;
  this.is_end_tag = false;
  this.indent_content = false;
  this.multiline_content = false;
  this.custom_beautifier_name = null;
  this.start_tag_token = null;
  this.attr_count = 0;
  this.has_wrapped_attrs = false;
  this.alignment_size = 0;
  this.tag_complete = false;
  this.tag_start_char = '';
  this.tag_check = '';

  if (!raw_token) {
    this.tag_complete = true;
  } else {
    var tag_check_match;

    this.tag_start_char = raw_token.text[0];
    this.text = raw_token.text;

    if (this.tag_start_char === '<') {
      tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    } else {
      tag_check_match = raw_token.text.match(/^{{[#\^]?([^\s}]+)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    }
    this.tag_check = this.tag_check.toLowerCase();

    if (raw_token.type === TOKEN.COMMENT) {
      this.tag_complete = true;
    }

    this.is_start_tag = this.tag_check.charAt(0) !== '/';
    this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
    this.is_end_tag = !this.is_start_tag ||
      (raw_token.closed && raw_token.closed.text === '/>');

    // handlebars tags that don't start with # or ^ are single_tags, and so also start and end.
    this.is_end_tag = this.is_end_tag ||
      (this.tag_start_char === '{' && (this.text.length < 3 || (/[^#\^]/.test(this.text.charAt(2)))));
  }
};

Beautifier.prototype._get_tag_open_token = function(raw_token) { //function to get a full tag and parse its type
  var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);

  parser_token.alignment_size = this._options.wrap_attributes_indent_size;

  parser_token.is_end_tag = parser_token.is_end_tag ||
    in_array(parser_token.tag_check, this._options.void_elements);

  parser_token.is_empty_element = parser_token.tag_complete ||
    (parser_token.is_start_tag && parser_token.is_end_tag);

  parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
  parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
  parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || parser_token.tag_start_char === '{';

  return parser_token;
};

Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {

  if (!parser_token.is_empty_element) {
    if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name); //remove it and all ancestors
    } else { // it's a start-tag
      // check if this tag is starting an element that has optional end element
      // and do an ending needed
      if (this._do_optional_end_element(parser_token)) {
        if (!parser_token.is_inline_element) {
          if (parser_token.parent) {
            parser_token.parent.multiline_content = true;
          }
          printer.print_newline(false);
        }

      }

      this._tag_stack.record_tag(parser_token); //push it on the tag stack

      if ((parser_token.tag_name === 'script' || parser_token.tag_name === 'style') &&
        !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
        parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
      }
    }
  }

  if (in_array(parser_token.tag_check, this._options.extra_liners)) { //check if this double needs an extra line
    printer.print_newline(false);
    if (!printer._output.just_added_blankline()) {
      printer.print_newline(true);
    }
  }

  if (parser_token.is_empty_element) { //if this tag name is a single tag type (either in the list or has a closing /)

    // if you hit an else case, reset the indent level if you are inside an:
    // 'if', 'unless', or 'each' block.
    if (parser_token.tag_start_char === '{' && parser_token.tag_check === 'else') {
      this._tag_stack.indent_to_tag(['if', 'unless', 'each']);
      parser_token.indent_content = true;
      // Don't add a newline if opening {{#if}} tag is on the current line
      var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
      if (!foundIfOnCurrentLine) {
        printer.print_newline(false);
      }
    }

    // Don't add a newline before elements that should remain where they are.
    if (parser_token.tag_name === '!--' && last_token.type === TOKEN.TAG_CLOSE &&
      last_tag_token.is_end_tag && parser_token.text.indexOf('\n') === -1) {
      //Do nothing. Leave comments on same line.
    } else if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_unformatted || parser_token.is_content_unformatted) {
    if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
    if ((parser_token.start_tag_token && parser_token.start_tag_token.multiline_content) ||
      !(parser_token.is_inline_element ||
        (last_tag_token.is_inline_element) ||
        (last_token.type === TOKEN.TAG_CLOSE &&
          parser_token.start_tag_token === last_tag_token) ||
        (last_token.type === 'TK_CONTENT')
      )) {
      printer.print_newline(false);
    }
  } else { // it's a start-tag
    parser_token.indent_content = !parser_token.custom_beautifier_name;

    if (parser_token.tag_start_char === '<') {
      if (parser_token.tag_name === 'html') {
        parser_token.indent_content = this._options.indent_inner_html;
      } else if (parser_token.tag_name === 'head') {
        parser_token.indent_content = this._options.indent_head_inner_html;
      } else if (parser_token.tag_name === 'body') {
        parser_token.indent_content = this._options.indent_body_inner_html;
      }
    }

    if (!parser_token.is_inline_element && last_token.type !== 'TK_CONTENT') {
      if (parser_token.parent) {
        parser_token.parent.multiline_content = true;
      }
      printer.print_newline(false);
    }
  }
};

//To be used for <p> tag special case:
//var p_closers = ['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];

Beautifier.prototype._do_optional_end_element = function(parser_token) {
  var result = null;
  // NOTE: cases of "if there is no more content in the parent element"
  // are handled automatically by the beautifier.
  // It assumes parent or ancestor close tag closes all children.
  // https://www.w3.org/TR/html5/syntax.html#optional-tags
  if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
    return;

  } else if (parser_token.tag_name === 'body') {
    // A head element’s end tag may be omitted if the head element is not immediately followed by a space character or a comment.
    result = result || this._tag_stack.try_pop('head');

    //} else if (parser_token.tag_name === 'body') {
    // DONE: A body element’s end tag may be omitted if the body element is not immediately followed by a comment.

  } else if (parser_token.tag_name === 'li') {
    // An li element’s end tag may be omitted if the li element is immediately followed by another li element or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('li', ['ol', 'ul']);

  } else if (parser_token.tag_name === 'dd' || parser_token.tag_name === 'dt') {
    // A dd element’s end tag may be omitted if the dd element is immediately followed by another dd element or a dt element, or if there is no more content in the parent element.
    // A dt element’s end tag may be omitted if the dt element is immediately followed by another dt element or a dd element.
    result = result || this._tag_stack.try_pop('dt', ['dl']);
    result = result || this._tag_stack.try_pop('dd', ['dl']);

    //} else if (p_closers.indexOf(parser_token.tag_name) !== -1) {
    //TODO: THIS IS A BUG FARM. We are not putting this into 1.8.0 as it is likely to blow up.
    //A p element’s end tag may be omitted if the p element is immediately followed by an address, article, aside, blockquote, details, div, dl, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, main, nav, ol, p, pre, section, table, or ul element, or if there is no more content in the parent element and the parent element is an HTML element that is not an a, audio, del, ins, map, noscript, or video element, or an autonomous custom element.
    //result = result || this._tag_stack.try_pop('p', ['body']);

  } else if (parser_token.tag_name === 'rp' || parser_token.tag_name === 'rt') {
    // An rt element’s end tag may be omitted if the rt element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    // An rp element’s end tag may be omitted if the rp element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('rt', ['ruby', 'rtc']);
    result = result || this._tag_stack.try_pop('rp', ['ruby', 'rtc']);

  } else if (parser_token.tag_name === 'optgroup') {
    // An optgroup element’s end tag may be omitted if the optgroup element is immediately followed by another optgroup element, or if there is no more content in the parent element.
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('optgroup', ['select']);
    //result = result || this._tag_stack.try_pop('option', ['select']);

  } else if (parser_token.tag_name === 'option') {
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('option', ['select', 'datalist', 'optgroup']);

  } else if (parser_token.tag_name === 'colgroup') {
    // DONE: A colgroup element’s end tag may be omitted if the colgroup element is not immediately followed by a space character or a comment.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);

  } else if (parser_token.tag_name === 'thead') {
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);

    //} else if (parser_token.tag_name === 'caption') {
    // DONE: A caption element’s end tag may be omitted if the caption element is not immediately followed by a space character or a comment.

  } else if (parser_token.tag_name === 'tbody' || parser_token.tag_name === 'tfoot') {
    // A thead element’s end tag may be omitted if the thead element is immediately followed by a tbody or tfoot element.
    // A tbody element’s end tag may be omitted if the tbody element is immediately followed by a tbody or tfoot element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('thead', ['table']);
    result = result || this._tag_stack.try_pop('tbody', ['table']);

    //} else if (parser_token.tag_name === 'tfoot') {
    // DONE: A tfoot element’s end tag may be omitted if there is no more content in the parent element.

  } else if (parser_token.tag_name === 'tr') {
    // A tr element’s end tag may be omitted if the tr element is immediately followed by another tr element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('tr', ['table', 'thead', 'tbody', 'tfoot']);

  } else if (parser_token.tag_name === 'th' || parser_token.tag_name === 'td') {
    // A td element’s end tag may be omitted if the td element is immediately followed by a td or th element, or if there is no more content in the parent element.
    // A th element’s end tag may be omitted if the th element is immediately followed by a td or th element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('td', ['tr']);
    result = result || this._tag_stack.try_pop('th', ['tr']);
  }

  // Start element omission not handled currently
  // A head element’s start tag may be omitted if the element is empty, or if the first thing inside the head element is an element.
  // A tbody element’s start tag may be omitted if the first thing inside the tbody element is a tr element, and if the element is not immediately preceded by a tbody, thead, or tfoot element whose end tag has been omitted. (It can’t be omitted if the element is empty.)
  // A colgroup element’s start tag may be omitted if the first thing inside the colgroup element is a col element, and if the element is not immediately preceded by another colgroup element whose end tag has been omitted. (It can’t be omitted if the element is empty.)

  // Fix up the parent of the parser token
  parser_token.parent = this._tag_stack.get_parser_token();

  return result;
};

module.exports.Beautifier = Beautifier;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var BaseOptions = __webpack_require__(6).Options;

function Options(options) {
  BaseOptions.call(this, options, 'html');

  this.indent_inner_html = this._get_boolean('indent_inner_html');
  this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
  this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

  this.indent_handlebars = this._get_boolean('indent_handlebars', true);
  this.wrap_attributes = this._get_selection('wrap_attributes',
    ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
  this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
  this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

  // Block vs inline elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
  // https://www.w3.org/TR/html5/dom.html#phrasing-content
  this.inline = this._get_array('inline', [
    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
    'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
    'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
    'video', 'wbr', 'text',
    // obsolete inline tags
    'acronym', 'big', 'strike', 'tt'
  ]);
  this.void_elements = this._get_array('void_elements', [
    // HTLM void elements - aka self-closing tags - aka singletons
    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
    // NOTE: Optional tags are too complex for a simple list
    // they are hard coded in _do_optional_end_element

    // Doctype and xml elements
    '!doctype', '?xml',

    // obsolete tags
    // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
    // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
    'basefont', 'isindex'
  ]);
  this.unformatted = this._get_array('unformatted', []);
  this.content_unformatted = this._get_array('content_unformatted', [
    'pre', 'textarea'
  ]);
  this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
  this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);
}
Options.prototype = new BaseOptions();



module.exports.Options = Options;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



var BaseTokenizer = __webpack_require__(9).Tokenizer;
var BASETOKEN = __webpack_require__(9).TOKEN;
var Directives = __webpack_require__(13).Directives;
var TemplatablePattern = __webpack_require__(14).TemplatablePattern;
var Pattern = __webpack_require__(12).Pattern;

var TOKEN = {
  TAG_OPEN: 'TK_TAG_OPEN',
  TAG_CLOSE: 'TK_TAG_CLOSE',
  ATTRIBUTE: 'TK_ATTRIBUTE',
  EQUALS: 'TK_EQUALS',
  VALUE: 'TK_VALUE',
  COMMENT: 'TK_COMMENT',
  TEXT: 'TK_TEXT',
  UNKNOWN: 'TK_UNKNOWN',
  START: BASETOKEN.START,
  RAW: BASETOKEN.RAW,
  EOF: BASETOKEN.EOF
};

var directives_core = new Directives(/<\!--/, /-->/);

var Tokenizer = function(input_string, options) {
  BaseTokenizer.call(this, input_string, options);
  this._current_tag_name = '';

  // Words end at whitespace or when a tag starts
  // if we are indenting handlebars, they are considered tags
  var templatable_reader = new TemplatablePattern(this._input);
  var pattern_reader = new Pattern(this._input);

  this.__patterns = {
    word: templatable_reader.until(/[\n\r\t <]/),
    single_quote: templatable_reader.until_after(/'/),
    double_quote: templatable_reader.until_after(/"/),
    attribute: templatable_reader.until(/[\n\r\t =\/>]/),
    element_name: templatable_reader.until(/[\n\r\t >\/]/),

    handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
    handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
    handlebars_open: pattern_reader.until(/[\n\r\t }]/),
    handlebars_raw_close: pattern_reader.until(/}}/),
    comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
    cdata: pattern_reader.starting_with(/<!\[cdata\[/).until_after(/]]>/),
    // https://en.wikipedia.org/wiki/Conditional_comment
    conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
    processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
  };

  if (this._options.indent_handlebars) {
    this.__patterns.word = this.__patterns.word.exclude('handlebars');
  }

  this._unformatted_content_delimiter = null;

  if (this._options.unformatted_content_delimiter) {
    var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
    this.__patterns.unformatted_content_delimiter =
      pattern_reader.matching(literal_regexp)
      .until_after(literal_regexp);
  }
};
Tokenizer.prototype = new BaseTokenizer();

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false; //current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.UNKNOWN;
};

Tokenizer.prototype._is_opening = function(current_token) {
  return current_token.type === TOKEN.TAG_OPEN;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) {
  return current_token.type === TOKEN.TAG_CLOSE &&
    (open_token && (
      ((current_token.text === '>' || current_token.text === '/>') && open_token.text[0] === '<') ||
      (current_token.text === '}}' && open_token.text[0] === '{' && open_token.text[1] === '{')));
};

Tokenizer.prototype._reset = function() {
  this._current_tag_name = '';
};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  var token = null;
  this._readWhitespace();
  var c = this._input.peek();

  if (c === null) {
    return this._create_token(TOKEN.EOF, '');
  }

  token = token || this._read_open_handlebars(c, open_token);
  token = token || this._read_attribute(c, previous_token, open_token);
  token = token || this._read_raw_content(previous_token, open_token);
  token = token || this._read_close(c, open_token);
  token = token || this._read_content_word(c);
  token = token || this._read_comment(c);
  token = token || this._read_open(c, open_token);
  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  return token;
};

Tokenizer.prototype._read_comment = function(c) { // jshint unused:false
  var token = null;
  var resulting_string = null;
  var directives = null;

  if (c === '<') {
    var peek1 = this._input.peek(1);
    //if we're in a comment, do something special
    // We treat all comments as literals, even more than preformatted tags
    // we just look for the appropriate close tag
    if (c === '<' && (peek1 === '!' || peek1 === '?')) {
      resulting_string = this.__patterns.comment.read();

      // only process directive on html comments
      if (resulting_string) {
        directives = directives_core.get_directives(resulting_string);
        if (directives && directives.ignore === 'start') {
          resulting_string += directives_core.readIgnored(this._input);
        }
      } else {
        resulting_string = this.__patterns.cdata.read();
        resulting_string = resulting_string || this.__patterns.conditional_comment.read();
        resulting_string = resulting_string || this.__patterns.processing.read();
      }
    }

    if (resulting_string) {
      token = this._create_token(TOKEN.COMMENT, resulting_string);
      token.directives = directives;
    }
  }

  return token;
};

Tokenizer.prototype._read_open = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (c === '<') {

      resulting_string = this._input.next();
      if (this._input.peek() === '/') {
        resulting_string += this._input.next();
      }
      resulting_string += this.__patterns.element_name.read();
      token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
    }
  }
  return token;
};

Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (this._options.indent_handlebars && c === '{' && this._input.peek(1) === '{') {
      if (this._input.peek(2) === '!') {
        resulting_string = this.__patterns.handlebars_comment.read();
        resulting_string = resulting_string || this.__patterns.handlebars.read();
        token = this._create_token(TOKEN.COMMENT, resulting_string);
      } else {
        resulting_string = this.__patterns.handlebars_open.read();
        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
      }
    }
  }
  return token;
};


Tokenizer.prototype._read_close = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (open_token) {
    if (open_token.text[0] === '<' && (c === '>' || (c === '/' && this._input.peek(1) === '>'))) {
      resulting_string = this._input.next();
      if (c === '/') { //  for close tag "/>"
        resulting_string += this._input.next();
      }
      token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
    } else if (open_token.text[0] === '{' && c === '}' && this._input.peek(1) === '}') {
      this._input.next();
      this._input.next();
      token = this._create_token(TOKEN.TAG_CLOSE, '}}');
    }
  }

  return token;
};

Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
  var token = null;
  var resulting_string = '';
  if (open_token && open_token.text[0] === '<') {

    if (c === '=') {
      token = this._create_token(TOKEN.EQUALS, this._input.next());
    } else if (c === '"' || c === "'") {
      var content = this._input.next();
      if (c === '"') {
        content += this.__patterns.double_quote.read();
      } else {
        content += this.__patterns.single_quote.read();
      }
      token = this._create_token(TOKEN.VALUE, content);
    } else {
      resulting_string = this.__patterns.attribute.read();

      if (resulting_string) {
        if (previous_token.type === TOKEN.EQUALS) {
          token = this._create_token(TOKEN.VALUE, resulting_string);
        } else {
          token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
        }
      }
    }
  }
  return token;
};

Tokenizer.prototype._is_content_unformatted = function(tag_name) {
  // void_elements have no content and so cannot have unformatted content
  // script and style tags should always be read as unformatted content
  // finally content_unformatted and unformatted element contents are unformatted
  return this._options.void_elements.indexOf(tag_name) === -1 &&
    (tag_name === 'script' || tag_name === 'style' ||
      this._options.content_unformatted.indexOf(tag_name) !== -1 ||
      this._options.unformatted.indexOf(tag_name) !== -1);
};


Tokenizer.prototype._read_raw_content = function(previous_token, open_token) { // jshint unused:false
  var resulting_string = '';
  if (open_token && open_token.text[0] === '{') {
    resulting_string = this.__patterns.handlebars_raw_close.read();
  } else if (previous_token.type === TOKEN.TAG_CLOSE && (previous_token.opened.text[0] === '<')) {
    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
    if (this._is_content_unformatted(tag_name)) {
      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
    }
  }

  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }

  return null;
};

Tokenizer.prototype._read_content_word = function(c) {
  var resulting_string = '';
  if (this._options.unformatted_content_delimiter) {
    if (c === this._options.unformatted_content_delimiter[0]) {
      resulting_string = this.__patterns.unformatted_content_delimiter.read();
    }
  }

  if (!resulting_string) {
    resulting_string = this.__patterns.word.read();
  }
  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }
};

module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;


/***/ })
/******/ ]);

function html_beautify(html_source, options) {
    return legacy_beautify_html(html_source, options, js_beautify, css_beautify);
}
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlFormatter.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/



function htmlFormatter_format(document, range, options) {
    var value = document.getText();
    var includesEnd = true;
    var initialIndentLevel = 0;
    var tabSize = options.tabSize || 4;
    if (range) {
        var startOffset = document.offsetAt(range.start);
        // include all leading whitespace iff at the beginning of the line
        var extendedStart = startOffset;
        while (extendedStart > 0 && isWhitespace(value, extendedStart - 1)) {
            extendedStart--;
        }
        if (extendedStart === 0 || isEOL(value, extendedStart - 1)) {
            startOffset = extendedStart;
        }
        else {
            // else keep at least one whitespace
            if (extendedStart < startOffset) {
                startOffset = extendedStart + 1;
            }
        }
        // include all following whitespace until the end of the line
        var endOffset = document.offsetAt(range.end);
        var extendedEnd = endOffset;
        while (extendedEnd < value.length && isWhitespace(value, extendedEnd)) {
            extendedEnd++;
        }
        if (extendedEnd === value.length || isEOL(value, extendedEnd)) {
            endOffset = extendedEnd;
        }
        range = main_Range.create(document.positionAt(startOffset), document.positionAt(endOffset));
        // Do not modify if substring starts in inside an element
        // Ending inside an element is fine as it doesn't cause formatting errors
        var firstHalf = value.substring(0, startOffset);
        if (new RegExp(/.*[<][^>]*$/).test(firstHalf)) {
            //return without modification
            value = value.substring(startOffset, endOffset);
            return [{
                    range: range,
                    newText: value
                }];
        }
        includesEnd = endOffset === value.length;
        value = value.substring(startOffset, endOffset);
        if (startOffset !== 0) {
            var startOfLineOffset = document.offsetAt(main_Position.create(range.start.line, 0));
            initialIndentLevel = computeIndentLevel(document.getText(), startOfLineOffset, options);
        }
    }
    else {
        range = main_Range.create(main_Position.create(0, 0), document.positionAt(value.length));
    }
    var htmlOptions = {
        indent_size: tabSize,
        indent_char: options.insertSpaces ? ' ' : '\t',
        wrap_line_length: getFormatOption(options, 'wrapLineLength', 120),
        unformatted: getTagsFormatOption(options, 'unformatted', void 0),
        content_unformatted: getTagsFormatOption(options, 'contentUnformatted', void 0),
        indent_inner_html: getFormatOption(options, 'indentInnerHtml', false),
        preserve_newlines: getFormatOption(options, 'preserveNewLines', true),
        max_preserve_newlines: getFormatOption(options, 'maxPreserveNewLines', 32786),
        indent_handlebars: getFormatOption(options, 'indentHandlebars', false),
        end_with_newline: includesEnd && getFormatOption(options, 'endWithNewline', false),
        extra_liners: getTagsFormatOption(options, 'extraLiners', void 0),
        wrap_attributes: getFormatOption(options, 'wrapAttributes', 'auto'),
        wrap_attributes_indent_size: getFormatOption(options, 'wrapAttributesIndentSize', void 0),
        eol: '\n'
    };
    var result = html_beautify(trimLeft(value), htmlOptions);
    if (initialIndentLevel > 0) {
        var indent = options.insertSpaces ? strings_repeat(' ', tabSize * initialIndentLevel) : strings_repeat('\t', initialIndentLevel);
        result = result.split('\n').join('\n' + indent);
        if (range.start.character === 0) {
            result = indent + result; // keep the indent
        }
    }
    return [{
            range: range,
            newText: result
        }];
}
function trimLeft(str) {
    return str.replace(/^\s+/, '');
}
function getFormatOption(options, key, dflt) {
    if (options && options.hasOwnProperty(key)) {
        var value = options[key];
        if (value !== null) {
            return value;
        }
    }
    return dflt;
}
function getTagsFormatOption(options, key, dflt) {
    var list = getFormatOption(options, key, null);
    if (typeof list === 'string') {
        if (list.length > 0) {
            return list.split(',').map(function (t) { return t.trim().toLowerCase(); });
        }
        return [];
    }
    return dflt;
}
function computeIndentLevel(content, offset, options) {
    var i = offset;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function getEOL(document) {
    var text = document.getText();
    if (document.lineCount > 1) {
        var to = document.offsetAt(main_Position.create(1, 0));
        var from = to;
        while (from > 0 && isEOL(text, from - 1)) {
            from--;
        }
        return text.substr(from, to - from);
    }
    return '\n';
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}
function isWhitespace(text, offset) {
    return ' \t'.indexOf(text.charAt(offset)) !== -1;
}
//# sourceMappingURL=htmlFormatter.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-uri/index.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var vscode_uri_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var vscode_uri_isWindows;
if (typeof process === 'object') {
    vscode_uri_isWindows = process.platform === 'win32';
}
else if (typeof navigator === 'object') {
    var vscode_uri_userAgent = navigator.userAgent;
    vscode_uri_isWindows = vscode_uri_userAgent.indexOf('Windows') >= 0;
}
//#endregion
var vscode_uri_schemePattern = /^\w[\w\d+.-]*$/;
var vscode_uri_singleSlashStart = /^\//;
var vscode_uri_doubleSlashStart = /^\/\//;
function vscode_uri_validateUri(ret) {
    // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
    // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    if (ret.scheme && !vscode_uri_schemePattern.test(ret.scheme)) {
        throw new Error('[UriError]: Scheme contains illegal characters.');
    }
    // path, http://tools.ietf.org/html/rfc3986#section-3.3
    // If a URI contains an authority component, then the path component
    // must either be empty or begin with a slash ("/") character.  If a URI
    // does not contain an authority component, then the path cannot begin
    // with two slash characters ("//").
    if (ret.path) {
        if (ret.authority) {
            if (!vscode_uri_singleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
            }
        }
        else {
            if (vscode_uri_doubleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
            }
        }
    }
}
// implements a bit of https://tools.ietf.org/html/rfc3986#section-5
function vscode_uri_referenceResolution(scheme, path) {
    // the slash-character is our 'default base' as we don't
    // support constructing URIs relative to other URIs. This
    // also means that we alter and potentially break paths.
    // see https://tools.ietf.org/html/rfc3986#section-5.1.4
    switch (scheme) {
        case 'https':
        case 'http':
        case 'file':
            if (!path) {
                path = vscode_uri_slash;
            }
            else if (path[0] !== vscode_uri_slash) {
                path = vscode_uri_slash + path;
            }
            break;
    }
    return path;
}
var vscode_uri_empty = '';
var vscode_uri_slash = '/';
var vscode_uri_regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 */
var vscode_uri_URI = (function () {
    /**
     * @internal
     */
    function URI(schemeOrData, authority, path, query, fragment) {
        if (typeof schemeOrData === 'object') {
            this.scheme = schemeOrData.scheme || vscode_uri_empty;
            this.authority = schemeOrData.authority || vscode_uri_empty;
            this.path = schemeOrData.path || vscode_uri_empty;
            this.query = schemeOrData.query || vscode_uri_empty;
            this.fragment = schemeOrData.fragment || vscode_uri_empty;
            // no validation because it's this URI
            // that creates uri components.
            // _validateUri(this);
        }
        else {
            this.scheme = schemeOrData || vscode_uri_empty;
            this.authority = authority || vscode_uri_empty;
            this.path = vscode_uri_referenceResolution(this.scheme, path || vscode_uri_empty);
            this.query = query || vscode_uri_empty;
            this.fragment = fragment || vscode_uri_empty;
            vscode_uri_validateUri(this);
        }
    }
    URI.isUri = function (thing) {
        if (thing instanceof URI) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return typeof thing.authority === 'string'
            && typeof thing.fragment === 'string'
            && typeof thing.path === 'string'
            && typeof thing.query === 'string'
            && typeof thing.scheme === 'string';
    };
    Object.defineProperty(URI.prototype, "fsPath", {
        // ---- filesystem path -----------------------
        /**
         * Returns a string representing the corresponding file system path of this URI.
         * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
         * platform specific path separator.
         *
         * * Will *not* validate the path for invalid characters and semantics.
         * * Will *not* look at the scheme of this URI.
         * * The result shall *not* be used for display purposes but for accessing a file on disk.
         *
         *
         * The *difference* to `URI#path` is the use of the platform specific separator and the handling
         * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
         *
         * ```ts
            const u = URI.parse('file://server/c$/folder/file.txt')
            u.authority === 'server'
            u.path === '/shares/c$/file.txt'
            u.fsPath === '\\server\c$\folder\file.txt'
        ```
         *
         * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
         * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
         * with URIs that represent files on disk (`file` scheme).
         */
        get: function () {
            // if (this.scheme !== 'file') {
            // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
            // }
            return vscode_uri_makeFsPath(this);
        },
        enumerable: true,
        configurable: true
    });
    // ---- modify to new -------------------------
    URI.prototype.with = function (change) {
        if (!change) {
            return this;
        }
        var scheme = change.scheme, authority = change.authority, path = change.path, query = change.query, fragment = change.fragment;
        if (scheme === void 0) {
            scheme = this.scheme;
        }
        else if (scheme === null) {
            scheme = vscode_uri_empty;
        }
        if (authority === void 0) {
            authority = this.authority;
        }
        else if (authority === null) {
            authority = vscode_uri_empty;
        }
        if (path === void 0) {
            path = this.path;
        }
        else if (path === null) {
            path = vscode_uri_empty;
        }
        if (query === void 0) {
            query = this.query;
        }
        else if (query === null) {
            query = vscode_uri_empty;
        }
        if (fragment === void 0) {
            fragment = this.fragment;
        }
        else if (fragment === null) {
            fragment = vscode_uri_empty;
        }
        if (scheme === this.scheme
            && authority === this.authority
            && path === this.path
            && query === this.query
            && fragment === this.fragment) {
            return this;
        }
        return new _deps_vscode_uri_URI(scheme, authority, path, query, fragment);
    };
    // ---- parse & validate ------------------------
    /**
     * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @param value A string which represents an URI (see `URI#toString`).
     */
    URI.parse = function (value) {
        var match = vscode_uri_regexp.exec(value);
        if (!match) {
            return new _deps_vscode_uri_URI(vscode_uri_empty, vscode_uri_empty, vscode_uri_empty, vscode_uri_empty, vscode_uri_empty);
        }
        return new _deps_vscode_uri_URI(match[2] || vscode_uri_empty, decodeURIComponent(match[4] || vscode_uri_empty), decodeURIComponent(match[5] || vscode_uri_empty), decodeURIComponent(match[7] || vscode_uri_empty), decodeURIComponent(match[9] || vscode_uri_empty));
    };
    /**
     * Creates a new URI from a file system path, e.g. `c:\my\files`,
     * `/usr/home`, or `\\server\share\some\path`.
     *
     * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
     * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
     * `URI.parse('file://' + path)` because the path might contain characters that are
     * interpreted (# and ?). See the following sample:
     * ```ts
    const good = URI.file('/coding/c#/project1');
    good.scheme === 'file';
    good.path === '/coding/c#/project1';
    good.fragment === '';

    const bad = URI.parse('file://' + '/coding/c#/project1');
    bad.scheme === 'file';
    bad.path === '/coding/c'; // path is now broken
    bad.fragment === '/project1';
    ```
     *
     * @param path A file system path (see `URI#fsPath`)
     */
    URI.file = function (path) {
        var authority = vscode_uri_empty;
        // normalize to fwd-slashes on windows,
        // on other systems bwd-slashes are valid
        // filename character, eg /f\oo/ba\r.txt
        if (vscode_uri_isWindows) {
            path = path.replace(/\\/g, vscode_uri_slash);
        }
        // check for authority as used in UNC shares
        // or use the path as given
        if (path[0] === vscode_uri_slash && path[1] === vscode_uri_slash) {
            var idx = path.indexOf(vscode_uri_slash, 2);
            if (idx === -1) {
                authority = path.substring(2);
                path = vscode_uri_slash;
            }
            else {
                authority = path.substring(2, idx);
                path = path.substring(idx) || vscode_uri_slash;
            }
        }
        return new _deps_vscode_uri_URI('file', authority, path, vscode_uri_empty, vscode_uri_empty);
    };
    URI.from = function (components) {
        return new _deps_vscode_uri_URI(components.scheme, components.authority, components.path, components.query, components.fragment);
    };
    // ---- printing/externalize ---------------------------
    /**
     * Creates a string presentation for this URI. It's guardeed that calling
     * `URI.parse` with the result of this function creates an URI which is equal
     * to this URI.
     *
     * * The result shall *not* be used for display purposes but for externalization or transport.
     * * The result will be encoded using the percentage encoding and encoding happens mostly
     * ignore the scheme-specific encoding rules.
     *
     * @param skipEncoding Do not encode the result, default is `false`
     */
    URI.prototype.toString = function (skipEncoding) {
        if (skipEncoding === void 0) { skipEncoding = false; }
        return vscode_uri_asFormatted(this, skipEncoding);
    };
    URI.prototype.toJSON = function () {
        return this;
    };
    URI.revive = function (data) {
        if (!data) {
            return data;
        }
        else if (data instanceof URI) {
            return data;
        }
        else {
            var result = new _deps_vscode_uri_URI(data);
            result._fsPath = data.fsPath;
            result._formatted = data.external;
            return result;
        }
    };
    return URI;
}());
/* harmony default export */ var vscode_uri = (vscode_uri_URI);
// tslint:disable-next-line:class-name
var _deps_vscode_uri_URI = (function (_super) {
    vscode_uri_extends(_URI, _super);
    function _URI() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._formatted = null;
        _this._fsPath = null;
        return _this;
    }
    Object.defineProperty(_URI.prototype, "fsPath", {
        get: function () {
            if (!this._fsPath) {
                this._fsPath = vscode_uri_makeFsPath(this);
            }
            return this._fsPath;
        },
        enumerable: true,
        configurable: true
    });
    _URI.prototype.toString = function (skipEncoding) {
        if (skipEncoding === void 0) { skipEncoding = false; }
        if (!skipEncoding) {
            if (!this._formatted) {
                this._formatted = vscode_uri_asFormatted(this, false);
            }
            return this._formatted;
        }
        else {
            // we don't cache that
            return vscode_uri_asFormatted(this, true);
        }
    };
    _URI.prototype.toJSON = function () {
        var res = {
            $mid: 1
        };
        // cached state
        if (this._fsPath) {
            res.fsPath = this._fsPath;
        }
        if (this._formatted) {
            res.external = this._formatted;
        }
        // uri components
        if (this.path) {
            res.path = this.path;
        }
        if (this.scheme) {
            res.scheme = this.scheme;
        }
        if (this.authority) {
            res.authority = this.authority;
        }
        if (this.query) {
            res.query = this.query;
        }
        if (this.fragment) {
            res.fragment = this.fragment;
        }
        return res;
    };
    return _URI;
}(vscode_uri_URI));
// reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
var vscode_uri_encodeTable = (vscode_uri_a = {},
    vscode_uri_a[58 /* Colon */] = '%3A',
    vscode_uri_a[47 /* Slash */] = '%2F',
    vscode_uri_a[63 /* QuestionMark */] = '%3F',
    vscode_uri_a[35 /* Hash */] = '%23',
    vscode_uri_a[91 /* OpenSquareBracket */] = '%5B',
    vscode_uri_a[93 /* CloseSquareBracket */] = '%5D',
    vscode_uri_a[64 /* AtSign */] = '%40',
    vscode_uri_a[33 /* ExclamationMark */] = '%21',
    vscode_uri_a[36 /* DollarSign */] = '%24',
    vscode_uri_a[38 /* Ampersand */] = '%26',
    vscode_uri_a[39 /* SingleQuote */] = '%27',
    vscode_uri_a[40 /* OpenParen */] = '%28',
    vscode_uri_a[41 /* CloseParen */] = '%29',
    vscode_uri_a[42 /* Asterisk */] = '%2A',
    vscode_uri_a[43 /* Plus */] = '%2B',
    vscode_uri_a[44 /* Comma */] = '%2C',
    vscode_uri_a[59 /* Semicolon */] = '%3B',
    vscode_uri_a[61 /* Equals */] = '%3D',
    vscode_uri_a[32 /* Space */] = '%20',
    vscode_uri_a);
function vscode_uri_encodeURIComponentFast(uriComponent, allowSlash) {
    var res = undefined;
    var nativeEncodePos = -1;
    for (var pos = 0; pos < uriComponent.length; pos++) {
        var code = uriComponent.charCodeAt(pos);
        // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
        if ((code >= 97 /* a */ && code <= 122 /* z */)
            || (code >= 65 /* A */ && code <= 90 /* Z */)
            || (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */)
            || code === 45 /* Dash */
            || code === 46 /* Period */
            || code === 95 /* Underline */
            || code === 126 /* Tilde */
            || (allowSlash && code === 47 /* Slash */)) {
            // check if we are delaying native encode
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            // check if we write into a new string (by default we try to return the param)
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        }
        else {
            // encoding needed, we need to allocate a new string
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            // check with default table first
            var escaped = vscode_uri_encodeTable[code];
            if (escaped !== undefined) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // append escaped variant to result
                res += escaped;
            }
            else if (nativeEncodePos === -1) {
                // use native encode only when needed
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function vscode_uri_encodeURIComponentMinimal(path) {
    var res = undefined;
    for (var pos = 0; pos < path.length; pos++) {
        var code = path.charCodeAt(pos);
        if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += vscode_uri_encodeTable[code];
        }
        else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
/**
 * Compute `fsPath` for the given uri
 * @param uri
 */
function vscode_uri_makeFsPath(uri) {
    var value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
        // unc path: file://shares/c$/far/boo
        value = "//" + uri.authority + uri.path;
    }
    else if (uri.path.charCodeAt(0) === 47 /* Slash */
        && (uri.path.charCodeAt(1) >= 65 /* A */ && uri.path.charCodeAt(1) <= 90 /* Z */ || uri.path.charCodeAt(1) >= 97 /* a */ && uri.path.charCodeAt(1) <= 122 /* z */)
        && uri.path.charCodeAt(2) === 58 /* Colon */) {
        // windows drive letter: file:///c:/far/boo
        value = uri.path[1].toLowerCase() + uri.path.substr(2);
    }
    else {
        // other path
        value = uri.path;
    }
    if (vscode_uri_isWindows) {
        value = value.replace(/\//g, '\\');
    }
    return value;
}
/**
 * Create the external version of a uri
 */
function vscode_uri_asFormatted(uri, skipEncoding) {
    var encoder = !skipEncoding
        ? vscode_uri_encodeURIComponentFast
        : vscode_uri_encodeURIComponentMinimal;
    var res = '';
    var scheme = uri.scheme, authority = uri.authority, path = uri.path, query = uri.query, fragment = uri.fragment;
    if (scheme) {
        res += scheme;
        res += ':';
    }
    if (authority || scheme === 'file') {
        res += vscode_uri_slash;
        res += vscode_uri_slash;
    }
    if (authority) {
        var idx = authority.indexOf('@');
        if (idx !== -1) {
            // <user>@<auth>
            var userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.indexOf(':');
            if (idx === -1) {
                res += encoder(userinfo, false);
            }
            else {
                // <user>:<pass>@<auth>
                res += encoder(userinfo.substr(0, idx), false);
                res += ':';
                res += encoder(userinfo.substr(idx + 1), false);
            }
            res += '@';
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(':');
        if (idx === -1) {
            res += encoder(authority, false);
        }
        else {
            // <auth>:<port>
            res += encoder(authority.substr(0, idx), false);
            res += authority.substr(idx);
        }
    }
    if (path) {
        // lower-case windows drive letters in /C:/fff or C:/fff
        if (path.length >= 3 && path.charCodeAt(0) === 47 /* Slash */ && path.charCodeAt(2) === 58 /* Colon */) {
            var code = path.charCodeAt(1);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = "/" + String.fromCharCode(code + 32) + ":" + path.substr(3); // "/c:".length === 3
            }
        }
        else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
            var code = path.charCodeAt(0);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = String.fromCharCode(code + 32) + ":" + path.substr(2); // "/c:".length === 3
            }
        }
        // encode the rest of the path
        res += encoder(path, true);
    }
    if (query) {
        res += '?';
        res += encoder(query, false);
    }
    if (fragment) {
        res += '#';
        res += !skipEncoding ? vscode_uri_encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
}
var vscode_uri_a;

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlLinks.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/





function normalizeRef(url, languageId) {
    var first = url[0];
    var last = url[url.length - 1];
    if (first === last && (first === '\'' || first === '\"')) {
        url = url.substr(1, url.length - 2);
    }
    return url;
}
function validateRef(url, languageId) {
    if (!url.length) {
        return false;
    }
    if (languageId === 'handlebars' && /{{.*}}/.test(url)) {
        return false;
    }
    try {
        return !!vscode_uri.parse(url);
    }
    catch (e) {
        return false;
    }
}
function getWorkspaceUrl(documentUri, tokenContent, documentContext, base) {
    if (/^\s*javascript\:/i.test(tokenContent) || /^\s*\#/i.test(tokenContent) || /[\n\r]/.test(tokenContent)) {
        return null;
    }
    tokenContent = tokenContent.replace(/^\s*/g, '');
    if (/^https?:\/\//i.test(tokenContent) || /^file:\/\//i.test(tokenContent)) {
        // Absolute link that needs no treatment
        return tokenContent;
    }
    if (/^\/\//i.test(tokenContent)) {
        // Absolute link (that does not name the protocol)
        var pickedScheme = strings_startsWith(documentUri, 'https://') ? 'https' : 'http';
        return pickedScheme + ':' + tokenContent.replace(/^\s*/g, '');
    }
    if (documentContext) {
        return documentContext.resolveReference(tokenContent, base || documentUri);
    }
    return tokenContent;
}
function createLink(document, documentContext, attributeValue, startOffset, endOffset, base) {
    var tokenContent = normalizeRef(attributeValue, document.languageId);
    if (!validateRef(tokenContent, document.languageId)) {
        return null;
    }
    if (tokenContent.length < attributeValue.length) {
        startOffset++;
        endOffset--;
    }
    var workspaceUrl = getWorkspaceUrl(document.uri, tokenContent, documentContext, base);
    if (!workspaceUrl || !isValidURI(workspaceUrl)) {
        return null;
    }
    return {
        range: main_Range.create(document.positionAt(startOffset), document.positionAt(endOffset)),
        target: workspaceUrl
    };
}
function isValidURI(uri) {
    try {
        vscode_uri.parse(uri);
        return true;
    }
    catch (e) {
        return false;
    }
}
function findDocumentLinks(document, documentContext) {
    var newLinks = [];
    var rootAbsoluteUrl = null;
    var scanner = createScanner(document.getText(), 0);
    var token = scanner.scan();
    var afterHrefOrSrc = false;
    var afterBase = false;
    var base = void 0;
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.StartTag:
                if (!base) {
                    var tagName = scanner.getTokenText().toLowerCase();
                    afterBase = tagName === 'base';
                }
                break;
            case TokenType.AttributeName:
                var attributeName = scanner.getTokenText().toLowerCase();
                afterHrefOrSrc = attributeName === 'src' || attributeName === 'href';
                break;
            case TokenType.AttributeValue:
                if (afterHrefOrSrc) {
                    var attributeValue = scanner.getTokenText();
                    if (!afterBase) { // don't highlight the base link itself
                        var link = createLink(document, documentContext, attributeValue, scanner.getTokenOffset(), scanner.getTokenEnd(), base);
                        if (link) {
                            newLinks.push(link);
                        }
                    }
                    if (afterBase && typeof base === 'undefined') {
                        base = normalizeRef(attributeValue, document.languageId);
                        if (base && documentContext) {
                            base = documentContext.resolveReference(base, document.uri);
                        }
                    }
                    afterBase = false;
                    afterHrefOrSrc = false;
                }
                break;
        }
        token = scanner.scan();
    }
    return newLinks;
}
//# sourceMappingURL=htmlLinks.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlHighlighting.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/



function findDocumentHighlights(document, position, htmlDocument) {
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    if (!node.tag) {
        return [];
    }
    var result = [];
    var startTagRange = htmlHighlighting_getTagNameRange(TokenType.StartTag, document, node.start);
    var endTagRange = typeof node.endTagStart === 'number' && htmlHighlighting_getTagNameRange(TokenType.EndTag, document, node.endTagStart);
    if (startTagRange && covers(startTagRange, position) || endTagRange && covers(endTagRange, position)) {
        if (startTagRange) {
            result.push({ kind: main_DocumentHighlightKind.Read, range: startTagRange });
        }
        if (endTagRange) {
            result.push({ kind: main_DocumentHighlightKind.Read, range: endTagRange });
        }
    }
    return result;
}
function isBeforeOrEqual(pos1, pos2) {
    return pos1.line < pos2.line || (pos1.line === pos2.line && pos1.character <= pos2.character);
}
function covers(range, position) {
    return isBeforeOrEqual(range.start, position) && isBeforeOrEqual(position, range.end);
}
function htmlHighlighting_getTagNameRange(tokenType, document, startOffset) {
    var scanner = createScanner(document.getText(), startOffset);
    var token = scanner.scan();
    while (token !== TokenType.EOS && token !== tokenType) {
        token = scanner.scan();
    }
    if (token !== TokenType.EOS) {
        return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
    }
    return null;
}
//# sourceMappingURL=htmlHighlighting.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlSymbolsProvider.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

function findDocumentSymbols(document, htmlDocument) {
    var symbols = [];
    htmlDocument.roots.forEach(function (node) {
        provideFileSymbolsInternal(document, node, '', symbols);
    });
    return symbols;
}
function provideFileSymbolsInternal(document, node, container, symbols) {
    var name = nodeToName(node);
    var location = Location.create(document.uri, main_Range.create(document.positionAt(node.start), document.positionAt(node.end)));
    var symbol = {
        name: name,
        location: location,
        containerName: container,
        kind: main_SymbolKind.Field
    };
    symbols.push(symbol);
    node.children.forEach(function (child) {
        provideFileSymbolsInternal(document, child, name, symbols);
    });
}
function nodeToName(node) {
    var name = node.tag;
    if (node.attributes) {
        var id = node.attributes['id'];
        var classes = node.attributes['class'];
        if (id) {
            name += "#" + id.replace(/[\"\']/g, '');
        }
        if (classes) {
            name += classes.replace(/[\"\']/g, '').split(/\s+/).map(function (className) { return "." + className; }).join('');
        }
    }
    return name || '?';
}
//# sourceMappingURL=htmlSymbolsProvider.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlFolding.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/




function limitRanges(ranges, rangeLimit) {
    ranges = ranges.sort(function (r1, r2) {
        var diff = r1.startLine - r2.startLine;
        if (diff === 0) {
            diff = r1.endLine - r2.endLine;
        }
        return diff;
    });
    // compute each range's nesting level in 'nestingLevels'.
    // count the number of ranges for each level in 'nestingLevelCounts'
    var top = void 0;
    var previous = [];
    var nestingLevels = [];
    var nestingLevelCounts = [];
    var setNestingLevel = function (index, level) {
        nestingLevels[index] = level;
        if (level < 30) {
            nestingLevelCounts[level] = (nestingLevelCounts[level] || 0) + 1;
        }
    };
    // compute nesting levels and sanitize
    for (var i = 0; i < ranges.length; i++) {
        var entry = ranges[i];
        if (!top) {
            top = entry;
            setNestingLevel(i, 0);
        }
        else {
            if (entry.startLine > top.startLine) {
                if (entry.endLine <= top.endLine) {
                    previous.push(top);
                    top = entry;
                    setNestingLevel(i, previous.length);
                }
                else if (entry.startLine > top.endLine) {
                    do {
                        top = previous.pop();
                    } while (top && entry.startLine > top.endLine);
                    if (top) {
                        previous.push(top);
                    }
                    top = entry;
                    setNestingLevel(i, previous.length);
                }
            }
        }
    }
    var entries = 0;
    var maxLevel = 0;
    for (var i = 0; i < nestingLevelCounts.length; i++) {
        var n = nestingLevelCounts[i];
        if (n) {
            if (n + entries > rangeLimit) {
                maxLevel = i;
                break;
            }
            entries += n;
        }
    }
    var result = [];
    for (var i = 0; i < ranges.length; i++) {
        var level = nestingLevels[i];
        if (typeof level === 'number') {
            if (level < maxLevel || (level === maxLevel && entries++ < rangeLimit)) {
                result.push(ranges[i]);
            }
        }
    }
    return result;
}
function getFoldingRanges(document, context) {
    var scanner = createScanner(document.getText());
    var token = scanner.scan();
    var ranges = [];
    var stack = [];
    var lastTagName = null;
    var prevStart = -1;
    function addRange(range) {
        ranges.push(range);
        prevStart = range.startLine;
    }
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.StartTag: {
                var tagName = scanner.getTokenText();
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                stack.push({ startLine: startLine, tagName: tagName });
                lastTagName = tagName;
                break;
            }
            case TokenType.EndTag: {
                lastTagName = scanner.getTokenText();
                break;
            }
            case TokenType.StartTagClose:
                if (!lastTagName || !isVoidElement(lastTagName)) {
                    break;
                }
            // fallthrough
            case TokenType.EndTagClose:
            case TokenType.StartTagSelfClose: {
                var i = stack.length - 1;
                while (i >= 0 && stack[i].tagName !== lastTagName) {
                    i--;
                }
                if (i >= 0) {
                    var stackElement = stack[i];
                    stack.length = i;
                    var line = document.positionAt(scanner.getTokenOffset()).line;
                    var startLine = stackElement.startLine;
                    var endLine = line - 1;
                    if (endLine > startLine && prevStart !== startLine) {
                        addRange({ startLine: startLine, endLine: endLine });
                    }
                }
                break;
            }
            case TokenType.Comment: {
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                var text = scanner.getTokenText();
                var m = text.match(/^\s*#(region\b)|(endregion\b)/);
                if (m) {
                    if (m[1]) { // start pattern match
                        stack.push({ startLine: startLine, tagName: '' }); // empty tagName marks region
                    }
                    else {
                        var i = stack.length - 1;
                        while (i >= 0 && stack[i].tagName.length) {
                            i--;
                        }
                        if (i >= 0) {
                            var stackElement = stack[i];
                            stack.length = i;
                            var endLine = startLine;
                            startLine = stackElement.startLine;
                            if (endLine > startLine && prevStart !== startLine) {
                                addRange({ startLine: startLine, endLine: endLine, kind: FoldingRangeKind.Region });
                            }
                        }
                    }
                }
                else {
                    var endLine = document.positionAt(scanner.getTokenOffset() + scanner.getTokenLength()).line;
                    if (startLine < endLine) {
                        addRange({ startLine: startLine, endLine: endLine, kind: FoldingRangeKind.Comment });
                    }
                }
                break;
            }
        }
        token = scanner.scan();
    }
    var rangeLimit = context && context.rangeLimit || Number.MAX_VALUE;
    if (ranges.length > rangeLimit) {
        return limitRanges(ranges, rangeLimit);
    }
    return ranges;
}
//# sourceMappingURL=htmlFolding.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/services/htmlSelectionRange.js
/**
 * Until SelectionRange lands in LSP, we'll return Range from server and convert it to
 * SelectionRange on client side
 */




function getSelectionRanges(document, positions) {
    function getSelectionRange(position) {
        var applicableRanges = getApplicableRanges(document, position);
        var ranges = applicableRanges
            /**
             * Filter duplicated ranges
             */
            .filter(function (pair, i) {
            if (i === 0) {
                return true;
            }
            var prev = applicableRanges[i - 1];
            if (pair[0] === prev[0] && pair[1] === prev[1]) {
                return false;
            }
            return true;
        })
            .map(function (pair) {
            return {
                range: main_Range.create(document.positionAt(pair[0]), document.positionAt(pair[1])),
                kind: SelectionRangeKind.Declaration
            };
        });
        return ranges;
    }
    return positions.map(getSelectionRange);
}
function getApplicableRanges(document, position) {
    var htmlDoc = parse(document.getText());
    var currOffset = document.offsetAt(position);
    var currNode = htmlDoc.findNodeAt(currOffset);
    var result = getAllParentTagRanges(currNode);
    // Self-closing or void elements
    if (currNode.startTagEnd && !currNode.endTagStart) {
        var closeRange = main_Range.create(document.positionAt(currNode.startTagEnd - 2), document.positionAt(currNode.startTagEnd));
        var closeText = document.getText(closeRange);
        // Self-closing element
        if (closeText === '/>') {
            result.unshift([currNode.start + 1, currNode.startTagEnd - 2]);
        }
        // Void element
        else {
            result.unshift([currNode.start + 1, currNode.startTagEnd - 1]);
        }
        var attributeLevelRanges = getAttributeLevelRanges(document, currNode, currOffset);
        result = attributeLevelRanges.concat(result);
        return result;
    }
    if (!currNode.startTagEnd || !currNode.endTagStart) {
        return result;
    }
    /**
     * For html like
     * `<div class="foo">bar</div>`
     */
    result.unshift([currNode.start, currNode.end]);
    /**
     * Cursor inside `<div class="foo">`
     */
    if (currNode.start < currOffset && currOffset < currNode.startTagEnd) {
        result.unshift([currNode.start + 1, currNode.startTagEnd - 1]);
        var attributeLevelRanges = getAttributeLevelRanges(document, currNode, currOffset);
        result = attributeLevelRanges.concat(result);
        return result;
    }
    /**
     * Cursor inside `bar`
     */
    else if (currNode.startTagEnd <= currOffset && currOffset <= currNode.endTagStart) {
        result.unshift([currNode.startTagEnd, currNode.endTagStart]);
        return result;
    }
    /**
     * Cursor inside `</div>`
     */
    else {
        // `div` inside `</div>`
        if (currOffset >= currNode.endTagStart + 2) {
            result.unshift([currNode.endTagStart + 2, currNode.end - 1]);
        }
        return result;
    }
}
function getAllParentTagRanges(initialNode) {
    var currNode = initialNode;
    var getNodeRanges = function (n) {
        if (n.startTagEnd && n.endTagStart && n.startTagEnd < n.endTagStart) {
            return [
                [n.startTagEnd, n.endTagStart],
                [n.start, n.end]
            ];
        }
        return [
            [n.start, n.end]
        ];
    };
    var result = [];
    while (currNode.parent) {
        currNode = currNode.parent;
        getNodeRanges(currNode).forEach(function (r) { return result.push(r); });
    }
    return result;
}
function getAttributeLevelRanges(document, currNode, currOffset) {
    var currNodeRange = main_Range.create(document.positionAt(currNode.start), document.positionAt(currNode.end));
    var currNodeText = document.getText(currNodeRange);
    var relativeOffset = currOffset - currNode.start;
    /**
     * Tag level semantic selection
     */
    var scanner = createScanner(currNodeText);
    var token = scanner.scan();
    /**
     * For text like
     * <div class="foo">bar</div>
     */
    var positionOffset = currNode.start;
    var result = [];
    var isInsideAttribute = false;
    var attrStart = -1;
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.AttributeName: {
                if (relativeOffset < scanner.getTokenOffset()) {
                    isInsideAttribute = false;
                    break;
                }
                if (relativeOffset <= scanner.getTokenEnd()) {
                    // `class`
                    result.unshift([scanner.getTokenOffset(), scanner.getTokenEnd()]);
                }
                isInsideAttribute = true;
                attrStart = scanner.getTokenOffset();
                break;
            }
            case TokenType.AttributeValue: {
                if (!isInsideAttribute) {
                    break;
                }
                var valueText = scanner.getTokenText();
                if (relativeOffset < scanner.getTokenOffset()) {
                    // `class="foo"`
                    result.push([attrStart, scanner.getTokenEnd()]);
                    break;
                }
                if (relativeOffset >= scanner.getTokenOffset() && relativeOffset <= scanner.getTokenEnd()) {
                    // `"foo"`
                    result.unshift([scanner.getTokenOffset(), scanner.getTokenEnd()]);
                    // `foo`
                    if ((valueText[0] === "\"" && valueText[valueText.length - 1] === "\"") || (valueText[0] === "'" && valueText[valueText.length - 1] === "'")) {
                        if (relativeOffset >= scanner.getTokenOffset() + 1 && relativeOffset <= scanner.getTokenEnd() - 1) {
                            result.unshift([scanner.getTokenOffset() + 1, scanner.getTokenEnd() - 1]);
                        }
                    }
                    // `class="foo"`
                    result.push([attrStart, scanner.getTokenEnd()]);
                }
                break;
            }
        }
        token = scanner.scan();
    }
    return result.map(function (pair) {
        return [pair[0] + positionOffset, pair[1] + positionOffset];
    });
}
//# sourceMappingURL=htmlSelectionRange.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/_deps/vscode-html-languageservice/htmlLanguageService.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/














function getLanguageService(options) {
    var htmlCompletion = new htmlCompletion_HTMLCompletion();
    if (options && options.customDataProviders) {
        handleCustomDataProviders(options.customDataProviders);
    }
    return {
        createScanner: createScanner,
        parseHTMLDocument: function (document) { return parse(document.getText()); },
        doComplete: htmlCompletion.doComplete.bind(htmlCompletion),
        setCompletionParticipants: htmlCompletion.setCompletionParticipants.bind(htmlCompletion),
        doHover: doHover,
        format: htmlFormatter_format,
        findDocumentHighlights: findDocumentHighlights,
        findDocumentLinks: findDocumentLinks,
        findDocumentSymbols: findDocumentSymbols,
        getFoldingRanges: getFoldingRanges,
        getSelectionRanges: getSelectionRanges,
        doTagComplete: htmlCompletion.doTagComplete.bind(htmlCompletion),
    };
}
function newHTMLDataProvider(id, customData) {
    return new HTMLDataProvider(id, customData);
}
//# sourceMappingURL=htmlLanguageService.js.map
// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/fillers/polyfills.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function polyfills_polyfill() {
    // Object.assign, for IE11
    if (typeof Object['assign'] != 'function') {
        Object.defineProperty(Object, "assign", {
            value: function assign(destination, sources) {
                'use strict';
                if (destination !== null) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i];
                        if (source) {
                            for (var key in source) {
                                if (Object.prototype.hasOwnProperty.call(source, key)) {
                                    destination[key] = source[key];
                                }
                            }
                        }
                    }
                    ;
                }
                return destination;
            },
            writable: true,
            configurable: true
        });
    }
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/htmlWorker.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/




polyfills_polyfill();
var htmlWorker_HTMLWorker = /** @class */ (function () {
    function HTMLWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = getLanguageService();
    }
    HTMLWorker.prototype.doValidation = function (uri) {
        // not yet suported
        return Promise.resolve([]);
    };
    HTMLWorker.prototype.doComplete = function (uri, position) {
        var document = this._getTextDocument(uri);
        var htmlDocument = this._languageService.parseHTMLDocument(document);
        return Promise.resolve(this._languageService.doComplete(document, position, htmlDocument, this._languageSettings && this._languageSettings.suggest));
    };
    HTMLWorker.prototype.format = function (uri, range, options) {
        var document = this._getTextDocument(uri);
        var textEdits = this._languageService.format(document, range, this._languageSettings && this._languageSettings.format);
        return Promise.resolve(textEdits);
    };
    HTMLWorker.prototype.doHover = function (uri, position) {
        var document = this._getTextDocument(uri);
        var htmlDocument = this._languageService.parseHTMLDocument(document);
        var hover = this._languageService.doHover(document, position, htmlDocument);
        return Promise.resolve(hover);
    };
    HTMLWorker.prototype.findDocumentHighlights = function (uri, position) {
        var document = this._getTextDocument(uri);
        var htmlDocument = this._languageService.parseHTMLDocument(document);
        var highlights = this._languageService.findDocumentHighlights(document, position, htmlDocument);
        return Promise.resolve(highlights);
    };
    HTMLWorker.prototype.findDocumentLinks = function (uri) {
        var document = this._getTextDocument(uri);
        var links = this._languageService.findDocumentLinks(document, null);
        return Promise.resolve(links);
    };
    HTMLWorker.prototype.findDocumentSymbols = function (uri) {
        var document = this._getTextDocument(uri);
        var htmlDocument = this._languageService.parseHTMLDocument(document);
        var symbols = this._languageService.findDocumentSymbols(document, htmlDocument);
        return Promise.resolve(symbols);
    };
    HTMLWorker.prototype.provideFoldingRanges = function (uri, context) {
        var document = this._getTextDocument(uri);
        var ranges = this._languageService.getFoldingRanges(document, context);
        return Promise.resolve(ranges);
    };
    HTMLWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return HTMLWorker;
}());

function htmlWorker_create(ctx, createData) {
    return new htmlWorker_HTMLWorker(ctx, createData);
}

// CONCATENATED MODULE: ./node_modules/monaco-editor/esm/vs/language/html/html.worker.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/



self.onmessage = function () {
    // ignore the first message
    initialize(function (ctx, createData) {
        return new htmlWorker_HTMLWorker(ctx, createData);
    });
};


/***/ })

/******/ });