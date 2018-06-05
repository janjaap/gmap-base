'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observable = require('../observable');

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Defines event types specific for Google Maps API services
 */
var Service = function (_Observable) {
  _inherits(Service, _Observable);

  function Service(args) {
    _classCallCheck(this, Service);

    /**
     * Default service events
     */
    var events = ['REQUEST_PENDING',
    // maps API events
    'OK', 'UNKNOWN_ERROR', 'NOT_FOUND', 'REQUEST_DENIED', 'INVALID_REQUEST', 'ZERO_RESULTS'];

    /**
     * Extending class name
     */
    var _this = _possibleConstructorReturn(this, (Service.__proto__ || Object.getPrototypeOf(Service)).call(this, _extends({}, args, { events: events })));

    _this.name = _this.constructor.name;
    /**
     * Reference to Google Maps API service
     */
    _this.service = null;
    return _this;
  }

  /**
   * Inject the Core class instance so that its API can be referenced
   * Note that, when instantiating the Core class, the API isn't ready; it is loaded asynchronously and can be hooked
   * into when the API_READY event has been dispatched.
   *
   * @param {Gmap} coreInstance
   */


  _createClass(Service, [{
    key: 'setCoreInstance',
    value: function setCoreInstance(coreInstance) {
      this.coreInstance = coreInstance;

      if (!this.coreInstance.api) {
        throw new Error('[' + this.constructor.name + '] core instance API not ready. Consider assigning a callback to the Core API_READY event');
      }

      // reference the appropriate Google Maps API instance
      var ServiceClass = this.name + 'Service';
      this.service = new this.coreInstance.api[ServiceClass]();
    }
  }]);

  return Service;
}(_observable2.default);

exports.default = Service;