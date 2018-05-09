import 'babel-polyfill';
import GoogleMapsApiLoader from '../api-loader';
import Service from '../service';
import Observable from '../observable';

/**
 * Google Maps core module
 *
 * This module can render a map and add markers and infowindows to it
 *
 * @param   {Object}      props - class instantiation props
 * @param   {HTMLElement} props.rootElement - Node in which the map instance should be rendered
 * @param   {String}      props.apiKey - Google API key (has to have acces to ...)
 * @param   {String}      props.center - location on which the map has to be centered on instantiation
 * @param   {Object}      props.callbacks - object containing callback functions for the Core events that are dispatched
 * @param   {Boolean}     [props.renderMapOnApiReady=true] - When false, the map won't be rendered when the API is ready
 * @param   {Object}      [props.options={ zoom: 9, mapTypeControl: false }] - google.maps.MapOptions instance
 * @see {@link https://developers.google.com/maps/documentation/javascript/reference/3.exp/map#MapOptions|MapOptions}
*/
class Gmap extends Observable {
    /**
     * Get a LatLng object from GeocoderResult
     *
     * @param   {GeocoderResult} location
     * @returns {Object} Object with keys 'lat' and 'lng'
     * @see {@link https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingResults|GeocodingResults}
     */
    static getLatLng(location) {
        const { geometry: { location: coords } } = location;

        if (!coords) {
            throw new Error('[Gmap] Location object invalid; cannot extract coordinates.');
        }

        const lat = coords.lat();
        const lng = coords.lng();
        return { lat, lng };
    }

    constructor({
        rootElement,
        apiKey,
        center,
        callbacks = {},
        renderMapOnApiReady = true,
        options = { zoom: 9, mapTypeControl: false },
    } = {}) {
        const events = [
            // custom events
            'API_READY',
            'MAP_READY',
            // geocode API events
            'UNKNOWN_ERROR',
            'OVER_QUERY_LIMIT',
            'REQUEST_DENIED',
            'INVALID_REQUEST',
            'ZERO_RESULTS',
            'ERROR',
        ];

        super({ callbacks, events });

        this.api = null;
        this.apiKey = apiKey;
        this.defaultMapOptions = options;
        this.infoWindows = [];
        this.location = center;
        this.locationCache = {};
        this.mapServices = {};
        this.markers = [];
        this.renderMapOnApiReady = renderMapOnApiReady;
        this.rootElement = rootElement;

        this.activateInfoWindow = this.activateInfoWindow.bind(this);
        this.addInfoWindow = this.addInfoWindow.bind(this);
        this.closeInfoWindows = this.closeInfoWindows.bind(this);
        this.fitBoundsToVisibleMarkers = this.fitBoundsToVisibleMarkers.bind(this);
        this.init = this.init.bind(this);

        GoogleMapsApiLoader({
            key: `${this.apiKey}`,
            callback: this.init,
        });
    }

    /**
     * Initialise the API and optionally render the map
     * The event 'API_READY' is dispatched when the API is ready to be used
     *
     * @param {Object} apiInstance
     * @param {Object} apiInstance.maps - object containing references to all available Google APIs
     */
    init({ maps }) {
        this.api = maps;
        this.dispatch('API_READY');

        if (this.renderMapOnApiReady) {
            this.renderMap();
        }
    }

    set location(center) {
        if (typeof center !== 'string') {
            throw new Error('[Gmap] center is required');
        }

        this.center = center;
    }

    get location() {
        return this.center;
    }

    set apiKey(key) {
        if (!key) {
            throw new Error('[Gmap] API key is required');
        }

        this.key = key;
    }

    get apiKey() {
        return this.key;
    }

    set rootElement(node) {
        if (!(node && node.nodeType && node.nodeType === 1)) {
            throw new Error('[Gmap] root element must be an HTML Element');
        }

        this.rootNode = node;
    }

    get rootElement() {
        return this.rootNode;
    }

    /**
     * Show an infoWindow at the given position
     *
     * @param {InfoWindow} infoWindow - google.maps.InfoWindow instance
     * @param {LatLgn}     position - google.maps.LatLng instance
     */
    activateInfoWindow(infoWindow, options) {
        infoWindow.setOptions(options);
        infoWindow.setMap(this.map);
    }

    /**
     * Push an InfoWindow object onto the stack
     *
     * @param {InfoWindo} infoWindow - google.maps.InfoWindow instance
     */
    addInfoWindow(infoWindow) {
        this.infoWindows.push(infoWindow);
    }

    /**
     * Add a marker for a specific address to the map
     *
     * @param {String}   address - Location for which the marker has to be centered
     * @param {Function} cb - Callback function that is called when the async geocode process is done and the marker is
     *                        available. The function will be called with the marker instance as parameter.
     */
    addMarker(address, cb) {
        const { api, map, markers } = this;

        this.retrieveLocationInformation({
            address,
            callback: ((location) => {
                const markerPosition = Gmap.getLatLng(location);
                const marker = new api.Marker({
                    position: markerPosition,
                    animation: api.Animation.DROP,
                    map,
                });

                markers.push(marker);

                if (typeof cb === 'function') {
                    cb(marker);
                }
            }),
        });
    }

    /**
     * Store an addres and the location information in cache to prevent extraneous calls to the API
     *
     * @param {String} address
     * @param {Object} locationInformation
     */
    addLocationToCache(address, locationInformation) {
        this.locationCache[address] = locationInformation;
    }

    /**
     * Register a service
     *
     * @param  {Service} ServiceInstance - Instantiated Service class
     * @throws {Error} when the instance is not a Service class
     */
    addService(ServiceInstance) {
        if (ServiceInstance instanceof Service === false) {
            throw new Error('[Gmap] service must be an instance of Service class');
        }

        const ServiceClass = ServiceInstance;
        ServiceClass.setCoreInstance(this);
        this.mapServices[ServiceInstance.name] = ServiceClass;
    }

    /**
     * Close all InfoWindow instances that have be registered
     */
    closeInfoWindows() {
        this.infoWindows.forEach(infoWindow => infoWindow.close());
    }

    /**
     * Resize and recenter the core map instance taken the bounds of all visible markers
     */
    fitBoundsToVisibleMarkers() {
        const bounds = new this.api.LatLngBounds();

        this.markers
            .filter(marker => marker.getVisible())
            .forEach(marker => bounds.extend(marker.getPosition()));

        this.map.fitBounds(bounds);
    }

    /**
     * Retrieve location information for a stored addess
     *
     * @param   {String} address
     * @returns {Object}
     */
    getLocationFromCache(address) {
        return this.locationCache[address];
    }

    /**
     * Get a registered service instance
     *
     * @param   {String} serviceName - Name of the service with which it is registered with Core
     * @returns {Service}
     * @throws  {Error} when requested service has not been registered
     */
    getService(serviceName) {
        if (serviceName in this.mapServices === false) {
            throw new Error(`[Gmap] service ${serviceName} is not registered`);
        }

        return this.mapServices[serviceName];
    }

    /**
     * Render an instance of the map in the given rootElement
     * The event 'MAP_READY' is dispatched when the map is instantiated and rendered in the root element
     *
     * @param {Object} [options={}] - MapOptions
     * @see {@link https://developers.google.com/maps/documentation/javascript/reference/3.exp/map#MapOptions|MapOptions}
     */
    renderMap(options = {}) {
        if (options.center) {
            this.center = options.center;
        }

        const { api, defaultMapOptions, rootElement } = this;
        const self = this;

        this.retrieveLocationInformation({
            address: this.center,
            callback: (location) => {
                const center = Gmap.getLatLng(location);
                const mapOptions = Object.assign({}, defaultMapOptions, options);
                const mapInstance = new api.Map(rootElement, {
                    center,
                    ...mapOptions,
                });

                api.event.addListenerOnce(mapInstance, 'idle', () => {
                    self.dispatch('MAP_READY');
                });

                self.map = mapInstance;
            },
        });
    }

    /**
     * Remove a marker from the map by unsetting its reference to the Core map instance
     *
     * @param {Marker} marker - google.maps.Marker instance
     */
    removeMarker(marker) {
        marker.setMap(null);
        delete this.markers[marker];
    }

    /**
     * Request location information from the Geocode API
     * When the result status code is other than 'OK', the corresponding event is dispatched
     *
     * @param  {Object}   options
     * @param  {String}   options.address - The address to get the location for
     * @param  {Function} options.callback - Function that will be called with GeocoderResult as its parameter
     * @throws {Error} when address option is not provided
     * @throws {Error} when callback option is not provided
     */
    retrieveLocationInformation({ address, callback }) {
        if (!address) {
            throw new Error('[Gmap] address cannot be empty');
        }

        if (typeof callback !== 'function') {
            throw new Error('[Gmap] cb must be a function');
        }

        const cached = this.getLocationFromCache(address);
        if (cached) {
            callback(cached);
            return;
        }

        const geocoder = process.env.NODE_ENV === 'test' ?
            this.api.Geocoder :
            new this.api.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
            switch (status) {
                case 'OK':
                    if (results.length >= 0) {
                        const location = results[0];
                        this.addLocationToCache(address, location);
                        callback(location);
                    }

                    break;

                default:
                    this.dispatch(status, results);
                    break;
            }
        });
    }

    /**
     * Center the map on a given address
     *
     * @param {String} address - The address to center the map on
     */
    setCenter(address) {
        const { map } = this;
        const self = this;

        this.retrieveLocationInformation({
            address,
            callback: ((location) => {
                self.center = address;
                map.setCenter(Gmap.getLatLng(location));
            }),
        });
    }

    /**
     * Remove all markers from the map
     */
    unsetMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
    }
}

export default Gmap;
