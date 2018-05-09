/**
 * Exposes events that can be subscribed to
 *
 * @param {Object} options
 * @param {Object} [options.callbacks={}]
 * @param {Object} events
 */
class Observable {
    constructor({ callbacks = {}, events }) {
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
    register(callbacks) {
        if (!Object.values(callbacks).every(cb => typeof cb === 'function')) {
            throw new Error(`[${this.constructor.name}] callbacks need to be of type 'function'`);
        }

        Object.keys(callbacks).forEach((event) => {
            this.setEventCallback(event, callbacks[event]);
        });
    }

    /**
     * Send a payload to an event's callback
     *
     * @param {String} event - Event name for which callback needs to be executed
     * @param {Any} payload - Callback parameter value
     */
    dispatch(event, payload) {
        const cb = this.callbacks[event];

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
    setEventCallback(event, callback) {
        if (!this.events.includes(event)) {
            throw new Error(`[${this.constructor.name}] event should be one of ${this.events.toString()}`);
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
    getEventCallback(event) {
        if (!this.callbacks[event]) {
            throw new Error(`[${this.constructor.name}] There is no callback registered for event ${event}`);
        }

        return this.callbacks[event];
    }
}

export default Observable;
