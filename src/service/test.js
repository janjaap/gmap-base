import Service from './';

describe('Service', () => {
    it('should match the snapshot', () => {
        const s = new Service();
        expect(s.events).toMatchSnapshot();
    });
});
