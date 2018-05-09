import Service from '../';

/**
 * Facade for Google Maps Directions Service
 */
class Directions extends Service {
    constructor(args) {
        super(args);

        /**
         * Function that will be called to retrieve a route's infoWindow contents
         */
        this.infoWindowContentFunc = null;
        /**
         * Address from which routes have to be calculated
         */
        this.origin = '';
        /**
         * Reference to origin address marker
         */
        this.originMarker = null;
        /**
         * Default route options
         */
        this.routeDefaults = {
            strokeIdle: '#cccccc',
            strokeActive: '#17b2fa',
            strokeWeight: 5,
            showOriginMarker: true,
            fitBoundsToRoutes: true,
        };
        /**
         * List of routes retrieved by the service
         */
        this.routes = [];

        return this;
    }

    /**
     * Display a route with the active stroke color
     *
     * @param {Polygon} route - google.maps.Polygon instance
     */
    activateRoute(route) {
        route.setOptions({
            strokeColor: this.routeDefaults.strokeActive,
            zIndex: 2,
        });
    }

    /**
     * Push a Route object onto the stack
     *
     * @param {Polygon} route - google.maps.Polygon instance
     */
    addRoute(route) {
        this.routes.push(route);
    }

    /**
     * Display routes with the idle stroke color
     */
    deactivateRoutes() {
        this.routes.forEach(route => route.setOptions({
            strokeColor: this.routeDefaults.strokeIdle,
            zIndex: 1,
        }), this);
    }

    /**
     * Calling this will re-center the map with all routes in the viewport
     */
    fitBoundsToRoutes() {
        const bounds = new this.coreInstance.api.LatLngBounds();

        this.routes.forEach((route) => {
            route.getPath().forEach((pathPart) => {
                bounds.extend(new this.coreInstance.api.LatLng(pathPart.lat(), pathPart.lng()));
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
    getRoutes(options = {}, callback) {
        this.service.route(options, (response, status) => {
            this.dispatch(status, response);
            callback(response);
        });
    }

    /**
     * Set the InfoWindow content generation function
     *
     * @returns {Directions}
     */
    setInfoWindowContentFunc(infoWindowContentFunc) {
        this.infoWindowContentFunc = infoWindowContentFunc;
        return this;
    }

    /**
     * Remove the origin marker from the core map instance
     *
     * @returns {Directions}
     */
    removeOriginMarker() {
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
    resetDirections({ request }) {
        if (this.routes.length !== 0) {
            this.routes.forEach(route => route.setMap(null));
        }

        this.coreInstance.closeInfoWindows();

        const origin = request.origin.query;
        if (origin !== this.origin) {
            this.setOrigin(request.origin.query)
                .removeOriginMarker()
                .showOriginMarker();
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
    setDefaults(options) {
        this.routeDefaults = Object.assign({}, this.routeDefaults, options);
        return this;
    }

    /**
     * Set the origin for the routes
     *
     * @param {string} address - Address (will be geocoded)
     * @return {Directions}
     */
    setOrigin(address) {
        this.origin = address;
        return this;
    }

    /**
     * Place a marker on the map to indicate the origin for the routes
     *
     * @return {Directions}
     */
    showOriginMarker() {
        const { coreInstance } = this;

        coreInstance.addMarker(this.origin, (marker) => {
            this.originMarker = marker;
            coreInstance.fitBoundsToVisibleMarkers();
        });
        return this;
    }

    /**
     * Render routes directly on the core map instance
     *
     * @param {object} options - Options for query to be sent to the DirectionsService. See getRoutes() method.
     */
    showRoutes(options) {
        this.getRoutes(options, (response) => {
            const { status, routes } = response;

            if (status !== 'OK') {
                this.coreInstance.dispatch(status, response);
                return;
            }

            this.resetDirections(response);

            const { travelMode } = options;
            const { map, api, activateInfoWindow, closeInfoWindows, addInfoWindow } = this.coreInstance;
            const { strokeIdle, strokeWeight } = this.routeDefaults;

            routes.forEach(({ overview_path: path, legs }, routeIndex) => {
                const firstLeg = legs[0];
                const { distance, duration } = firstLeg;
                const isActive = routeIndex === 0;
                const { length } = path;
                const position = path[Math.round(length / 2)];
                const content = this.infoWindowContentFunc({
                    travelMode,
                    distance,
                    duration,
                });

                const route = new api.Polyline({ path, map, strokeColor: strokeIdle, strokeWeight });
                const infoWindow = new api.InfoWindow({ content });

                addInfoWindow(infoWindow);
                this.addRoute(route);

                if (isActive) {
                    this.activateRoute(route);
                    activateInfoWindow(infoWindow, { position });
                }

                route.addListener('click', ({ latLng }) => {
                    closeInfoWindows();
                    this.deactivateRoutes();

                    this.activateRoute(route);
                    activateInfoWindow(infoWindow, { position: latLng });
                });
            }, this);

            if (this.routeDefaults.fitBoundsToRoutes) {
                // debugger;
                this.fitBoundsToRoutes();
            }

            this.dispatch('OK', response);
        });
    }
}

export default Directions;
