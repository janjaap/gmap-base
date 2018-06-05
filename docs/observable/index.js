'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Exposes events that can be subscribed to
 *
 * @param {Object} options
 * @param {Object} [options.callbacks={}]
 * @param {Object} events
 */
var Observable = function () {
    function Observable(_ref) {
        var _ref$callbacks = _ref.callbacks,
            callbacks = _ref$callbacks === undefined ? {} : _ref$callbacks,
            events = _ref.events;

        _classCallCheck(this, Observable);

        this.callbacks = callbacks;
        this.events = events;
        this.register(callbacks);
    }

    /**
     * Register a collection of callback functions
     *
     * @param  {Object} callbacks - List of callbacks where the object's keys are the event names
     * @throws {Error} when any of the provided callbacks is not a function
     */


    _createClass(Observable, [{
        key: 'register',
        value: function register(callbacks) {
            var _this = this;

            if (!Object.values(callbacks).every(function (cb) {
                return typeof cb === 'function';
            })) {
                throw new Error('[' + this.constructor.name + '] callbacks need to be of type \'function\'');
            }

            Object.keys(callbacks).forEach(function (event) {
                _this.setEventCallback(event, callbacks[event]);
            });
        }

        /**
         * Send a payload to an event's callback
         *
         * @param {String} event - Event name for which callback needs to be executed
         * @param {Any} payload - Callback parameter value
         */

    }, {
        key: 'dispatch',
        value: function dispatch(event, payload) {
            var cb = this.callbacks[event];

            if (typeof cb === 'function') {
                cb(payload);
            }
        }

        /**
         * Register a callback for a specific event
         *
         * @param  {String} event - Event name for which callback needs to be registered
         * @param  {Function} callback - Callable that takes one parameter; payload
         * @throws {Error} when a callback for a non-existing event is provided
         */

    }, {
        key: 'setEventCallback',
        value: function setEventCallback(event, callback) {
            if (!this.events.includes(event)) {
                throw new Error('[' + this.constructor.name + '] event should be one of ' + this.events.toString());
            }

            this.callbacks[event] = callback;
        }

        /**
         * Get the function that has been registered for an event
         *
         * @param   {String} event - Name of the event
         * @returns {Function}
         * @throws  {Error} when there is no event callback registered for the event
         */

    }, {
        key: 'getEventCallback',
        value: function getEventCallback(event) {
            if (!this.callbacks[event]) {
                throw new Error('[' + this.constructor.name + '] There is no callback registered for event ' + event);
            }

            return this.callbacks[event];
        }
    }]);

    return Observable;
}();

exports.default = Observable;