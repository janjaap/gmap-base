/* global document */
import Gmap from './';
import Service from '../service';

const rootElement = document.createElement('div');
const apiKey = 'AIzaSyDt3RFKC2m968_2F9UXowsANt_ydcr0Vd0';
const center = 'Asterweg 20 F-1, Amsterdam';
const gmap = new Gmap({ rootElement, apiKey, center });

describe('Gmap', () => {
    it('should match the snapshot', () => {
        expect(gmap.events).toMatchSnapshot();
    });

    describe('initialisation', () => {
        it('throw error when required parameters are missing', () => {
            expect(() => {
                // eslint-disable-next-line no-unused-vars
                const c = new Gmap({ rootElement, center });
            }).toThrowError('[Gmap] API key is required');

            expect(() => {
                // eslint-disable-next-line no-unused-vars
                const c = new Gmap({ apiKey, center });
            }).toThrowError('[Gmap] root element must be an HTML Element');

            expect(() => {
                // eslint-disable-next-line no-unused-vars
                const c = new Gmap({ apiKey, rootElement });
            }).toThrowError('[Gmap] center is required');
        });

        it('sets root element', () => {
            gmap.rootElement = rootElement;
            expect(gmap.rootElement).toBe(rootElement);
        });

        it('throws error when root element is not a valid element', () => {
            const notANode = 'text';

            expect(() => {
                gmap.rootElement = notANode;
            }).toThrowError();
        });

        it('set API key', () => {
            gmap.apiKey = apiKey;
            expect(gmap.apiKey).toBe(apiKey);
        });

        describe('retrieveLocationInformation', () => {
            it('should throw when missing options', () => {
                expect(() => {
                    gmap.retrieveLocationInformation();
                }).toThrow();

                expect(() => {
                    gmap.retrieveLocationInformation({ address: 'foo bar' });
                }).toThrow();

                expect(() => {
                    gmap.retrieveLocationInformation({ callback: () => {} });
                }).toThrow();

                expect(() => {
                    gmap.retrieveLocationInformation({ callback: null });
                }).toThrow();
            });

            const okResults = [{
                address_components: [
                    {
                        long_name: '1600',
                        short_name: '1600',
                        types: ['street_number'],
                    },
                    {
                        long_name: 'Amphitheatre Pkwy',
                        short_name: 'Amphitheatre Pkwy',
                        types: ['route'],
                    },
                    {
                        long_name: 'Mountain View',
                        short_name: 'Mountain View',
                        types: ['locality', 'political'],
                    },
                    {
                        long_name: 'Santa Clara County',
                        short_name: 'Santa Clara County',
                        types: ['administrative_area_level_2', 'political'],
                    },
                    {
                        long_name: 'California',
                        short_name: 'CA',
                        types: ['administrative_area_level_1', 'political'],
                    },
                    {
                        long_name: 'United States',
                        short_name: 'US',
                        types: ['country', 'political'],
                    },
                    {
                        long_name: '94043',
                        short_name: '94043',
                        types: ['postal_code'],
                    },
                ],
                formatted_address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
                geometry: {
                    location: {
                        lat: 37.4224764,
                        lng: -122.0842499,
                    },
                    location_type: 'ROOFTOP',
                    viewport: {
                        northeast: {
                            lat: 37.4238253802915,
                            lng: -122.0829009197085,
                        },
                        southwest: {
                            lat: 37.4211274197085,
                            lng: -122.0855988802915,
                        },
                    },
                },
                place_id: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
                types: ['street_address'],
            }];

            beforeEach(() => {
                gmap.api = {
                    Geocoder: {
                        geocode: jest.fn((options, cb) => cb(okResults, 'OK'))
                            .mockImplementationOnce((options, cb) => cb([], 'INVALID_REQUEST'))
                            .mockImplementationOnce((options, cb) => cb([], 'NO_RESULTS')),
                    },
                };
            });

            const callback = jest.fn();

            it('should execute callback', () => {
                gmap.dispatch = jest.fn();

                gmap.retrieveLocationInformation({ address: 'foo bar', callback });
                expect(gmap.dispatch).toHaveBeenCalledWith('INVALID_REQUEST', []);

                gmap.retrieveLocationInformation({ address: 'foo bar', callback });
                expect(gmap.dispatch).toHaveBeenLastCalledWith('NO_RESULTS', []);

                expect(callback).not.toHaveBeenCalled();

                gmap.retrieveLocationInformation({ address: 'foo bar', callback });
                expect(callback).toHaveBeenLastCalledWith(okResults[0]);
            });

            it('should retrieve from cache', () => {
                gmap.retrieveLocationInformation({ address: 'foo bar', callback });
                expect(callback).toHaveBeenLastCalledWith(gmap.getLocationFromCache('foo bar'));
            });
        });
    });

    describe('services', () => {
        class C {}

        beforeEach(() => {
            gmap.api = {
                FooBarService: C,
            };
        });

        class FooBar extends Service {}
        const service = new FooBar();

        it('should add a service', () => {
            gmap.addService(service);
            expect(gmap.getService('FooBar')).toBe(service);
        });

        it('should throw on invalid service registration', () => {
            class InvalidService {}
            const invalidService = new InvalidService();

            expect(() => {
                gmap.addService(invalidService);
            }).toThrowError();
        });
    });

    describe('event hooks', () => {
        it('sets callback', () => {
            const cb = message => message;
            gmap.setEventCallback('API_READY', cb);
            expect(gmap.getEventCallback('API_READY')).toBe(cb);
        });

        it('throws error for unregistered event', () => {
            expect(() => {
                const cb = message => message;
                gmap.setEventCallback('FOO', cb);
            }).toThrowError();
        });
    });
});
