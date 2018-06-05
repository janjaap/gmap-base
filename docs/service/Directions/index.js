'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Facade for Google Maps Directions Service
 */
var Directions = function (_Service) {
    _inherits(Directions, _Service);

    function Directions(args) {
        var _ret;

        _classCallCheck(this, Directions);

        /**
         * Function that will be called to retrieve a route's infoWindow contents
         */
        var _this = _possibleConstructorReturn(this, (Directions.__proto__ || Object.getPrototypeOf(Directions)).call(this, args));

        _this.infoWindowContentFunc = null;
        /**
         * Address from which routes have to be calculated
         */
        _this.origin = '';
        /**
         * Reference to origin address marker
         */
        _this.originMarker = null;
        /**
         * Default route options
         */
        _this.routeDefaults = {
            strokeIdle: '#cccccc',
            strokeActive: '#17b2fa',
            strokeWeight: 5,
            showOriginMarker: true,
            fitBoundsToRoutes: true
        };
        /**
         * List of routes retrieved by the service
         */
        _this.routes = [];

        return _ret = _this, _possibleConstructorReturn(_this, _ret);
    }

    /**
     * Display a route with the active stroke color
     *
     * @param {Polygon} route - google.maps.Polygon instance
     */


    _createClass(Directions, [{
        key: 'activateRoute',
        value: function activateRoute(route) {
            route.setOptions({
                strokeColor: this.routeDefaults.strokeActive,
                zIndex: 2
            });
        }

        /**
         * Push a Route object onto the stack
         *
         * @param {Polygon} route - google.maps.Polygon instance
         */

    }, {
        key: 'addRoute',
        value: function addRoute(route) {
            this.routes.push(route);
        }

        /**
         * Display routes with the idle stroke color
         */

    }, {
        key: 'deactivateRoutes',
        value: function deactivateRoutes() {
            var _this2 = this;

            this.routes.forEach(function (route) {
                return route.setOptions({
                    strokeColor: _this2.routeDefaults.strokeIdle,
                    zIndex: 1
                });
            }, this);
        }

        /**
         * Calling this will re-center the map with all routes in the viewport
         */

    }, {
        key: 'fitBoundsToRoutes',
        value: function fitBoundsToRoutes() {
            var _this3 = this;

            var bounds = new this.coreInstance.api.LatLngBounds();

            this.routes.forEach(function (route) {
                route.getPath().forEach(function (pathPart) {
                    bounds.extend(new _this3.coreInstance.api.LatLng(pathPart.lat(), pathPart.lng()));
                });
            });

            this.coreInstance.map.fitBounds(bounds);
        }

        /* eslint-disable max-len */
        /**
         * Get all route and possible suggestions from the DirectionsService
         *
         * @param {Object} options - Options for query to be sent to the DirectionsService.
         * @param {(String|LatLng|Place|LatLngLiteral)} options.destination - Location of destination. This can be specified as either a string to be geocoded, or a LatLng, or a Place. Required.
         * @param {(String|LatLng|Place|LatLngLiteral)} options.origin - Location of origin. This can be specified as either a string to be geocoded, or a LatLng, or a Place. Required.
         * @param {TravelMode} options.travelMode - Type of routing requested. Required.
         * @param {Boolean} [options.avoidFerries=false] - If true, instructs the Directions service to avoid ferries where possible. Optional.
         * @param {Boolean} [options.avoidHighways=false] - If true, instructs the Directions service to avoid highways where possible. Optional.
         * @param {Boolean} [options.avoidTolls=false] - If true, instructs the Directions service to avoid toll roads where possible. Optional.
         * @param {Boolean} [options.optimizeWaypoints=false] - If set to true, the DirectionService will attempt to re-order the supplied intermediate waypoints to minimize overall cost of the route. If waypoints are optimized, inspect DirectionsRoute.waypoint_order in the response to determine the new ordering.
         * @param {Boolean} [options.provideRouteAlternatives=false] - Whether or not route alternatives should be provided. Optional.
         * @param {String} [options.region=undefined] - Region code used as a bias for geocoding requests. Optional.
         * @param {TransitOptions} options.transitOptions - Settings that apply only to requests where travelMode is TRANSIT. This object will have no effect for other travel modes.
         * @param {DrivingOptions} options.drivingOptions - Settings that apply only to requests where travelMode is DRIVING. This object will have no effect for other travel modes.
         * @param {UnitSystem} options.unitSystem - Preferred unit system to use when displaying distance. Defaults to the unit system used in the country of origin.
         * @param {DirectionsWaypoint[]} options.waypoints - Array of intermediate waypoints. Directions are calculated from the origin to the destination by way of each waypoint in this array. See the developer's guide for the maximum number of waypoints allowed. Waypoints are not supported for transit directions. Optional.
         * @param {Function} callback
         *
         * @see {@link https://developers.google.com/maps/documentation/javascript/reference/3.exp/directions#DirectionsRequest|DirectionsRequest}
         */
        /* eslint-enable max-len */

    }, {
        key: 'getRoutes',
        value: function getRoutes() {
            var _this4 = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var callback = arguments[1];

            this.service.route(options, function (response, status) {
                _this4.dispatch(status, response);
                callback(response);
            });
        }

        /**
         * Set the InfoWindow content generation function
         *
         * @returns {Directions}
         */

    }, {
        key: 'setInfoWindowContentFunc',
        value: function setInfoWindowContentFunc(infoWindowContentFunc) {
            this.infoWindowContentFunc = infoWindowContentFunc;
            return this;
        }

        /**
         * Remove the origin marker from the core map instance
         *
         * @returns {Directions}
         */

    }, {
        key: 'removeOriginMarker',
        value: function removeOriginMarker() {
            if (!this.originMarker) {
                return this;
            }

            this.coreInstance.removeMarker(this.originMarker);
            return this;
        }

        /**
         * Clear the core map instance, removing all routes and, when the origin has changed, removing the origin marker
         *
         * @param {DirectionsResult} response - google.maps.DirectionsResult instance
         * @param {DirectionsRequest} response.request - google.maps.DirectionsRequest instance
         */

    }, {
        key: 'resetDirections',
        value: function resetDirections(_ref) {
            var request = _ref.request;

            if (this.routes.length !== 0) {
                this.routes.forEach(function (route) {
                    return route.setMap(null);
                });
            }

            this.coreInstance.closeInfoWindows();

            var origin = request.origin.query;
            if (origin !== this.origin) {
                this.setOrigin(request.origin.query).removeOriginMarker().showOriginMarker();
            }
        }

        /**
         * Set routes properties
         *
         * @param   {Object}  options - route properties
         * @param   {String}  options.strokeIdle - route color when inactive
         * @param   {String}  options.strokeActive - route color when active
         * @param   {Number}  options.strokeWeight - route line thinkness
         * @param   {Boolean} options.showOriginMarker - Set to false to hide the origin's marker
         * @param   {Boolean} options.fitBoundsToRoutes - set to false to prevent map from resizing and recentering
         * @returns {Directions}
         */

    }, {
        key: 'setDefaults',
        value: function setDefaults(options) {
            this.routeDefaults = Object.assign({}, this.routeDefaults, options);
            return this;
        }

        /**
         * Set the origin for the routes
         *
         * @param {string} address - Address (will be geocoded)
         * @return {Directions}
         */

    }, {
        key: 'setOrigin',
        value: function setOrigin(address) {
            this.origin = address;
            return this;
        }

        /**
         * Place a marker on the map to indicate the origin for the routes
         *
         * @return {Directions}
         */

    }, {
        key: 'showOriginMarker',
        value: function showOriginMarker() {
            var _this5 = this;

            var coreInstance = this.coreInstance;


            coreInstance.addMarker(this.origin, function (marker) {
                _this5.originMarker = marker;
                coreInstance.fitBoundsToVisibleMarkers();
            });
            return this;
        }

        /**
         * Render routes directly on the core map instance
         *
         * @param {object} options - Options for query to be sent to the DirectionsService. See getRoutes() method.
         */

    }, {
        key: 'showRoutes',
        value: function showRoutes(options) {
            var _this6 = this;

            this.getRoutes(options, function (response) {
                var status = response.status,
                    routes = response.routes;


                if (status !== 'OK') {
                    _this6.coreInstance.dispatch(status, response);
                    return;
                }

                _this6.resetDirections(response);

                var travelMode = options.travelMode;
                var _coreInstance = _this6.coreInstance,
                    map = _coreInstance.map,
                    api = _coreInstance.api,
                    activateInfoWindow = _coreInstance.activateInfoWindow,
                    closeInfoWindows = _coreInstance.closeInfoWindows,
                    addInfoWindow = _coreInstance.addInfoWindow;
                var _routeDefaults = _this6.routeDefaults,
                    strokeIdle = _routeDefaults.strokeIdle,
                    strokeWeight = _routeDefaults.strokeWeight;


                routes.forEach(function (_ref2, routeIndex) {
                    var path = _ref2.overview_path,
                        legs = _ref2.legs;

                    var firstLeg = legs[0];
                    var distance = firstLeg.distance,
                        duration = firstLeg.duration;

                    var isActive = routeIndex === 0;
                    var length = path.length;

                    var position = path[Math.round(length / 2)];
                    var content = _this6.infoWindowContentFunc({
                        travelMode: travelMode,
                        distance: distance,
                        duration: duration
                    });

                    var route = new api.Polyline({ path: path, map: map, strokeColor: strokeIdle, strokeWeight: strokeWeight });
                    var infoWindow = new api.InfoWindow({ content: content });

                    addInfoWindow(infoWindow);
                    _this6.addRoute(route);

                    if (isActive) {
                        _this6.activateRoute(route);
                        activateInfoWindow(infoWindow, { position: position });
                    }

                    route.addListener('click', function (_ref3) {
                        var latLng = _ref3.latLng;

                        closeInfoWindows();
                        _this6.deactivateRoutes();

                        _this6.activateRoute(route);
                        activateInfoWindow(infoWindow, { position: latLng });
                    });
                }, _this6);

                if (_this6.routeDefaults.fitBoundsToRoutes) {
                    // debugger;
                    _this6.fitBoundsToRoutes();
                }

                _this6.dispatch('OK', response);
            });
        }
    }]);

    return Directions;
}(_2.default);

exports.default = Directions;