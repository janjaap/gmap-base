'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _apiLoader = require('../api-loader');

var _apiLoader2 = _interopRequireDefault(_apiLoader);

var _service = require('../service');

var _service2 = _interopRequireDefault(_service);

var _observable = require('../observable');

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var Gmap = function (_Observable) {
    _inherits(Gmap, _Observable);

    _createClass(Gmap, null, [{
        key: 'getLatLng',

        /**
         * Get a LatLng object from GeocoderResult
         *
         * @param   {GeocoderResult} location
         * @returns {Object} Object with keys 'lat' and 'lng'
         * @see {@link https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingResults|GeocodingResults}
         */
        value: function getLatLng(location) {
            var coords = location.geometry.location;


            if (!coords) {
                throw new Error('[Gmap] Location object invalid; cannot extract coordinates.');
            }

            var lat = coords.lat();
            var lng = coords.lng();
            return { lat: lat, lng: lng };
        }
    }]);

    function Gmap() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            rootElement = _ref.rootElement,
            apiKey = _ref.apiKey,
            center = _ref.center,
            _ref$callbacks = _ref.callbacks,
            callbacks = _ref$callbacks === undefined ? {} : _ref$callbacks,
            _ref$renderMapOnApiRe = _ref.renderMapOnApiReady,
            renderMapOnApiReady = _ref$renderMapOnApiRe === undefined ? true : _ref$renderMapOnApiRe,
            _ref$options = _ref.options,
            options = _ref$options === undefined ? { zoom: 9, mapTypeControl: false } : _ref$options;

        _classCallCheck(this, Gmap);

        var events = [
        // custom events
        'API_READY', 'MAP_READY',
        // geocode API events
        'UNKNOWN_ERROR', 'OVER_QUERY_LIMIT', 'REQUEST_DENIED', 'INVALID_REQUEST', 'ZERO_RESULTS', 'ERROR'];

        var _this = _possibleConstructorReturn(this, (Gmap.__proto__ || Object.getPrototypeOf(Gmap)).call(this, { callbacks: callbacks, events: events }));

        _this.api = null;
        _this.apiKey = apiKey;
        _this.defaultMapOptions = options;
        _this.infoWindows = [];
        _this.location = center;
        _this.locationCache = {};
        _this.mapServices = {};
        _this.markers = [];
        _this.renderMapOnApiReady = renderMapOnApiReady;
        _this.rootElement = rootElement;

        _this.activateInfoWindow = _this.activateInfoWindow.bind(_this);
        _this.addInfoWindow = _this.addInfoWindow.bind(_this);
        _this.closeInfoWindows = _this.closeInfoWindows.bind(_this);
        _this.fitBoundsToVisibleMarkers = _this.fitBoundsToVisibleMarkers.bind(_this);
        _this.init = _this.init.bind(_this);

        (0, _apiLoader2.default)({
            key: '' + _this.apiKey,
            callback: _this.init
        });
        return _this;
    }

    /**
     * Initialise the API and optionally render the map
     * The event 'API_READY' is dispatched when the API is ready to be used
     *
     * @param {Object} apiInstance
     * @param {Object} apiInstance.maps - object containing references to all available Google APIs
     */


    _createClass(Gmap, [{
        key: 'init',
        value: function init(_ref2) {
            var maps = _ref2.maps;

            this.api = maps;
            this.dispatch('API_READY');

            if (this.renderMapOnApiReady) {
                this.renderMap();
            }
        }
    }, {
        key: 'activateInfoWindow',


        /**
         * Show an infoWindow at the given position
         *
         * @param {InfoWindow} infoWindow - google.maps.InfoWindow instance
         * @param {LatLgn}     position - google.maps.LatLng instance
         */
        value: function activateInfoWindow(infoWindow, options) {
            infoWindow.setOptions(options);
            infoWindow.setMap(this.map);
        }

        /**
         * Push an InfoWindow object onto the stack
         *
         * @param {InfoWindo} infoWindow - google.maps.InfoWindow instance
         */

    }, {
        key: 'addInfoWindow',
        value: function addInfoWindow(infoWindow) {
            this.infoWindows.push(infoWindow);
        }

        /**
         * Add a marker for a specific address to the map
         *
         * @param {String}   address - Location for which the marker has to be centered
         * @param {Function} cb - Callback function that is called when the async geocode process is done and the marker is
         *                        available. The function will be called with the marker instance as parameter.
         */

    }, {
        key: 'addMarker',
        value: function addMarker(address, cb) {
            var api = this.api,
                map = this.map,
                markers = this.markers;


            this.retrieveLocationInformation({
                address: address,
                callback: function callback(location) {
                    var markerPosition = Gmap.getLatLng(location);
                    var marker = new api.Marker({
                        position: markerPosition,
                        animation: api.Animation.DROP,
                        map: map
                    });

                    markers.push(marker);

                    if (typeof cb === 'function') {
                        cb(marker);
                    }
                }
            });
        }

        /**
         * Store an addres and the location information in cache to prevent extraneous calls to the API
         *
         * @param {String} address
         * @param {Object} locationInformation
         */

    }, {
        key: 'addLocationToCache',
        value: function addLocationToCache(address, locationInformation) {
            this.locationCache[address] = locationInformation;
        }

        /**
         * Register a service
         *
         * @param  {Service} ServiceInstance - Instantiated Service class
         * @throws {Error} when the instance is not a Service class
         */

    }, {
        key: 'addService',
        value: function addService(ServiceInstance) {
            if (ServiceInstance instanceof _service2.default === false) {
                throw new Error('[Gmap] service must be an instance of Service class');
            }

            var ServiceClass = ServiceInstance;
            ServiceClass.setCoreInstance(this);
            this.mapServices[ServiceInstance.name] = ServiceClass;
        }

        /**
         * Close all InfoWindow instances that have be registered
         */

    }, {
        key: 'closeInfoWindows',
        value: function closeInfoWindows() {
            this.infoWindows.forEach(function (infoWindow) {
                return infoWindow.close();
            });
        }

        /**
         * Resize and recenter the core map instance taken the bounds of all visible markers
         */

    }, {
        key: 'fitBoundsToVisibleMarkers',
        value: function fitBoundsToVisibleMarkers() {
            var bounds = new this.api.LatLngBounds();

            this.markers.filter(function (marker) {
                return marker.getVisible();
            }).forEach(function (marker) {
                return bounds.extend(marker.getPosition());
            });

            this.map.fitBounds(bounds);
        }

        /**
         * Retrieve location information for a stored addess
         *
         * @param   {String} address
         * @returns {Object}
         */

    }, {
        key: 'getLocationFromCache',
        value: function getLocationFromCache(address) {
            return this.locationCache[address];
        }

        /**
         * Get a registered service instance
         *
         * @param   {String} serviceName - Name of the service with which it is registered with Core
         * @returns {Service}
         * @throws  {Error} when requested service has not been registered
         */

    }, {
        key: 'getService',
        value: function getService(serviceName) {
            if (serviceName in this.mapServices === false) {
                throw new Error('[Gmap] service ' + serviceName + ' is not registered');
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

    }, {
        key: 'renderMap',
        value: function renderMap() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (options.center) {
                this.center = options.center;
            }

            var api = this.api,
                defaultMapOptions = this.defaultMapOptions,
                rootElement = this.rootElement;

            var self = this;

            this.retrieveLocationInformation({
                address: this.center,
                callback: function callback(location) {
                    var center = Gmap.getLatLng(location);
                    var mapOptions = Object.assign({}, defaultMapOptions, options);
                    var mapInstance = new api.Map(rootElement, _extends({
                        center: center
                    }, mapOptions));

                    api.event.addListenerOnce(mapInstance, 'idle', function () {
                        self.dispatch('MAP_READY');
                    });

                    self.map = mapInstance;
                }
            });
        }

        /**
         * Remove a marker from the map by unsetting its reference to the Core map instance
         *
         * @param {Marker} marker - google.maps.Marker instance
         */

    }, {
        key: 'removeMarker',
        value: function removeMarker(marker) {
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

    }, {
        key: 'retrieveLocationInformation',
        value: function retrieveLocationInformation(_ref3) {
            var _this2 = this;

            var address = _ref3.address,
                callback = _ref3.callback;

            if (!address) {
                throw new Error('[Gmap] address cannot be empty');
            }

            if (typeof callback !== 'function') {
                throw new Error('[Gmap] cb must be a function');
            }

            var cached = this.getLocationFromCache(address);
            if (cached) {
                callback(cached);
                return;
            }

            var geocoder = process.env.NODE_ENV === 'test' ? this.api.Geocoder : new this.api.Geocoder();

            geocoder.geocode({ address: address }, function (results, status) {
                switch (status) {
                    case 'OK':
                        if (results.length >= 0) {
                            var location = results[0];
                            _this2.addLocationToCache(address, location);
                            callback(location);
                        }

                        break;

                    default:
                        _this2.dispatch(status, results);
                        break;
                }
            });
        }

        /**
         * Center the map on a given address
         *
         * @param {String} address - The address to center the map on
         */

    }, {
        key: 'setCenter',
        value: function setCenter(address) {
            var map = this.map;

            var self = this;

            this.retrieveLocationInformation({
                address: address,
                callback: function callback(location) {
                    self.center = address;
                    map.setCenter(Gmap.getLatLng(location));
                }
            });
        }

        /**
         * Remove all markers from the map
         */

    }, {
        key: 'unsetMarkers',
        value: function unsetMarkers() {
            this.markers.forEach(function (marker) {
                return marker.setMap(null);
            });
        }
    }, {
        key: 'location',
        set: function set(center) {
            if (typeof center !== 'string') {
                throw new Error('[Gmap] center is required');
            }

            this.center = center;
        },
        get: function get() {
            return this.center;
        }
    }, {
        key: 'apiKey',
        set: function set(key) {
            if (!key) {
                throw new Error('[Gmap] API key is required');
            }

            this.key = key;
        },
        get: function get() {
            return this.key;
        }
    }, {
        key: 'rootElement',
        set: function set(node) {
            if (!(node && node.nodeType && node.nodeType === 1)) {
                throw new Error('[Gmap] root element must be an HTML Element');
            }

            this.rootNode = node;
        },
        get: function get() {
            return this.rootNode;
        }
    }]);

    return Gmap;
}(_observable2.default);

exports.default = Gmap;