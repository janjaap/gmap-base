'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/* global document,window */

/**
 * Turn an object into a query string
 *
 * @param  {Object} obj
 * @return {String}
 */
var objectToQueryParams = function objectToQueryParams(obj) {
    return Object.keys(obj).reduce(function (acc, key) {
        var val = obj[key];
        var strVal = Array.isArray(val) ? val.join(',') : val;

        return val ? '' + acc + (acc ? '&' : '') + key + '=' + strVal : acc;
    }, '');
};

/**
 * Create a <script> element and return it
 *
 * @param   {String} src
 * @param   {Function} onload
 * @returns {Element}
 */
var createScript = function createScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = onload;

    return script;
};

/**
 * Load the Google Maps API and notify the caller when done
 *
 * @param  {Object}   options - configuration options
 * @param  {String}   [options.base='https://maps.googleapis.com/maps/api/js'] - API base URL
 * @param  {Number}   options.timeout - timeout in ms after which an error is thrown
 * @param  {Function} options.callback - callback function that is called with the value of window.google on script load
 * @param  {String[]} options.libraries - list of library names ({@link https://developers.google.com/maps/documentation/javascript/libraries})
 * @param  {String}   options.key - valid API key (provide if there's no client ID) ({@link https://developers.google.com/maps/documentation/javascript/get-api-key#premium-auth})
 * @param  {String}   options.client - valid client ID (provide this if there's no API key)
 * @param  {String}   options.language - Override the browser's language settings ({@link https://developers.google.com/maps/faq#languagesupport})
 * @param  {String}   options.region - Region setting (required when setting the language)
 * @param  {String}   options.v - Version
 *
 * @throws {Error} when, after the script has loaded, the global window.google object is empty
 * @throws {Error} when the timeout limit has exceeded before the global window.google object is populated
 */
var apiLoader = function apiLoader() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _ref$base = _ref.base,
        base = _ref$base === undefined ? 'https://maps.googleapis.com/maps/api/js' : _ref$base,
        callback = _ref.callback,
        timeout = _ref.timeout,
        rest = _objectWithoutProperties(_ref, ['base', 'callback', 'timeout']);

    var src = base + '?' + objectToQueryParams(rest);
    var hasCallback = !!callback && typeof callback === 'function';
    var onload = hasCallback ? function () {
        if (!window.google) {
            throw new Error('Failed to load the API');
        }

        callback(window.google);
    } : null;

    var script = createScript(src, onload);

    document.body.appendChild(script);

    if (timeout) {
        setTimeout(function () {
            if (!window.google) {
                throw new Error('Loading timed out after ' + timeout + 'ms');
            }
        }, timeout);
    }
};

exports.default = apiLoader;
exports.createScript = createScript;
exports.objectToQueryParams = objectToQueryParams;