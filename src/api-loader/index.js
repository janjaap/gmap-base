/* global document,window */

/**
 * Turn an object into a query string
 *
 * @param  {Object} obj
 * @return {String}
 */
const objectToQueryParams = obj => Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];
    const strVal = Array.isArray(val) ? val.join(',') : val;

    return val ? `${acc}${acc ? '&' : ''}${key}=${strVal}` : acc;
}, '');

/**
 * Create a <script> element and return it
 *
 * @param   {String} src
 * @param   {Function} onload
 * @returns {Element}
 */
const createScript = (src, onload) => {
    const script = document.createElement('script');
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
const apiLoader = ({ base = 'https://maps.googleapis.com/maps/api/js', callback, timeout, ...rest } = {}) => {
    const src = `${base}?${objectToQueryParams(rest)}`;
    const hasCallback = !!callback && typeof callback === 'function';
    const onload = hasCallback ? () => {
        if (!window.google) {
            throw new Error('Failed to load the API');
        }

        callback(window.google);
    } : null;

    const script = createScript(src, onload);

    document.body.appendChild(script);

    if (timeout) {
        setTimeout(() => {
            if (!window.google) {
                throw new Error(`Loading timed out after ${timeout}ms`);
            }
        }, timeout);
    }
};

export {
    apiLoader as default,
    createScript,
    objectToQueryParams,
};
