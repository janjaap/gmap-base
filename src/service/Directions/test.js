import Service from '../';
import DirectionsService from './';

describe('DirectionsService', () => {
    it('extends Service', () => {
        const dS = new DirectionsService();
        expect(dS instanceof Service).toBe(true);
    });

    describe('instance', () => {
        it('registers callbacks with the core module', () => {});

        describe('hooks', () => {
            it('sets onNotFound callback', () => {});

            it('sets onZeroResults callback', () => {});

            it('sets onError callback', () => {});
        });
    });

    describe('origin', () => {
        it('sets origin', () => {});

        it('gets origin', () => {});
    });

    describe('destination', () => {
        it('sets destination', () => {});

        it('gets destination', () => {});
    });

    describe('travel mode', () => {
        it('sets travel mode', () => {});

        it('get travel mode', () => {});

        // request.travelMode: google.maps.TravelMode[(TRANSIT|BICYCLING|WALKING|DRIVING)]
        it('throws an error when wrong travel mode is set', () => {});
    });

    describe('Google API', () => {
        // mock request and response
        it('requests directions from the Google API', () => {});

        it('throws an error when required request parameters are missing', () => {});
    });

    describe('callbacks', () => {
        it('calls onOk', () => {});

        it('calls onNotFound', () => {});

        it('calls onZeroResults', () => {});

        it('calls onInvalidRequest', () => {});

        it('calls onError', () => {});
    });
});
