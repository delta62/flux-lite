import { Dispatcher, DispatcherError } from '../lib/dispatcher';

describe('Dispatcher', () => {
  let dispatcher: Dispatcher<number>;
  let noop = (payload: any) => { };

  beforeEach(() => {
    dispatcher = new Dispatcher<number>();
  });

  describe('#register', () => {
    it('should return a dispatch token', () => {
      let token = dispatcher.register(noop);
      expect(token).toBeTruthy();
    });

    it('should return unique dispatch tokens to', () => {
      let token1 = dispatcher.register(noop);
      let token2 = dispatcher.register(noop);
      expect(token1).not.toEqual(token2);
    });

    it('should invoke the callback', () => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(cb);
      dispatcher.dispatch(42);
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('#unregister', () => {
    it('should not invoke callback after unregistration', () => {
      let cb = jasmine.createSpy('cb');
      let token = dispatcher.register(cb);
      dispatcher.unregister(token);
      dispatcher.dispatch(42);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should throw if unregistering during dispatch', () => {
      let token = dispatcher.register((payload: any) => {
        dispatcher.unregister(token);
      });
      expect(() => dispatcher.dispatch(42)).toThrowError(DispatcherError);
    });

    it('should throw when unregistering a non-registered callback', () => {
      expect(() => dispatcher.unregister('foo')).toThrowError(DispatcherError);
    });
  });
});
