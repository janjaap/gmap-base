/* global document,HTMLScriptElement */
import loader, { createScript, objectToQueryParams } from './';

describe('api-loader', () => {
    beforeEach(() => {
        global.window.google = undefined;

        const scripts = Array.from(document.body.getElementsByTagName('script'));

        scripts.forEach(script => script.parentNode.removeChild(script));
    });

    describe('createScript', () => {
        const folder = 'https://url-be-here';
        const file = 'https://url-be-here/index.js';

        it('should return a script element', () => {
            const cb = () => {};
            const script1 = createScript(folder, cb);

            expect(script1).toBeInstanceOf(HTMLScriptElement);
            expect(script1.src).toBe(`${folder}/`);
            expect(script1.onload).toBe(cb);

            const script2 = createScript(file, cb);

            expect(script2.src).toBe(file);
        });

        it('should accept a function as callback', () => {
            expect(createScript(file, false).onload).toBeNull();
            expect(createScript(file, '').onload).toBeNull();
            expect(createScript(file, null).onload).toBeNull();
            expect(createScript(file, undefined).onload).toBeNull();
        });
    });

    describe('objectToQueryParams', () => {
        it('should return a string', () => {
            const obj = {
                r: 3,
                c: 'foo',
                a: ['bar', 'baz', 'qux'],
                p: null,
            };

            const str = 'r=3&c=foo&a=bar,baz,qux';
            const paramStr = objectToQueryParams(obj);

            expect(paramStr).toBe(str);
        });
    });

    it('should append script tag to body', () => {
        loader();
        expect(document.body.getElementsByTagName('script')).toHaveLength(1);
    });

    it('should execute callback', () => {
        const callback = jest.fn();
        global.window.google = {};
        loader({ callback });

        document.body.getElementsByTagName('script')[0].onload();
        expect(callback).toHaveBeenCalled();
    });

    describe('timeout', () => {
        jest.useFakeTimers();
        const timeout = 10;

        it('should throw when expired', () => {
            expect(() => {
                loader({ timeout });
                jest.runAllTimers();
            }).toThrow(`Loading timed out after ${timeout}ms`);
        });

        it('should NOT throw when is set', () => {
            global.window.google = {};
            expect(() => {
                loader({ timeout });
                jest.runAllTimers();
            }).not.toThrow(`Loading timed out after ${timeout}ms`);
        });
    });
});
