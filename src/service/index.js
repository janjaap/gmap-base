import Observable from '../observable';

/**
 * Defines event types specific for Google Maps API services
 */
class Service extends Observable {
    constructor(args) {
        /**
         * Default service events
         */
        const events = [
            'REQUEST_PENDING',
            // maps API events
            'OK',
            'UNKNOWN_ERROR',
            'NOT_FOUND',
            'REQUEST_DENIED',
            'INVALID_REQUEST',
            'ZERO_RESULTS',
        ];
        super({ ...args, events });

        /**
         * Extending class name
         */
        this.name = this.constructor.name;
        /**
         * Reference to Google Maps API service
         */
        this.service = null;
    }

    /**
     * Inject the Core class instance so that its API can be referenced
     * Note that, when instantiating the Core class, the API isn't ready; it is loaded asynchronously and can be hooked
     * into when the API_READY event has been dispatched.
     *
     * @param {Gmap} coreInstance
     */
    setCoreInstance(coreInstance) {
        this.coreInstance = coreInstance;

        if (!this.coreInstance.api) {
            throw new Error(`[${this.constructor.name}] core instance API not ready. Consider assigning a callback to the Core API_READY event`);
        }

        // reference the appropriate Google Maps API instance
        const ServiceClass = `${this.name}Service`;
        this.service = new this.coreInstance.api[ServiceClass]();
    }
}

export default Service;
