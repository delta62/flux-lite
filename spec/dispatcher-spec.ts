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
      let token = dispatcher.register(payload => {
        dispatcher.unregister(token);
      });
      expect(() => dispatcher.dispatch(42)).toThrowError(DispatcherError);
    });

    it('should throw when unregistering a non-registered callback', () => {
      expect(() => dispatcher.unregister('foo')).toThrowError(DispatcherError);
    });
  });

  describe('#waitFor', () => {
    it('should throw if not dispatching', () => {
      let token = dispatcher.register(noop);
      expect(() => dispatcher.waitFor([ token ])).toThrowError(DispatcherError);
    });

    it('should throw when a circular dependency is created', () => {
      let token1 = dispatcher.register(payload => {
        dispatcher.waitFor([ token2 ]);
      });
      let token2 = dispatcher.register(payload => {
        dispatcher.waitFor([ token1 ]);
      })

      expect(() => dispatcher.dispatch(42)).toThrowError(DispatcherError);
    });

    it('should throw when waiting for a non-registered callback', () => {
      dispatcher.register(payload => {
        dispatcher.waitFor([ 'foo' ]);
      });
      expect(() => dispatcher.dispatch(42)).toThrowError(DispatcherError);
    });

    it('should invoke all awaited callbacks', () => {
      let cb1 = jasmine.createSpy('cb1');
      let cb2 = jasmine.createSpy('cb2');
      let token1 = dispatcher.register(cb1);
      let token2 = dispatcher.register(cb2);

      dispatcher.register(payload => {
        dispatcher.waitFor([ token1, token2 ]);
      });

      dispatcher.dispatch(42);

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    it('should invoke awaited callbacks in order', () => {
      let cb1 = jasmine.createSpy('cb1');
      let cb2 = payload => expect(cb1).toHaveBeenCalled();
      let token1 = dispatcher.register(cb1);
      let token2 = dispatcher.register(cb2);

      dispatcher.register(payload => {
        dispatcher.waitFor([ token1, token2 ]);
      });

      dispatcher.dispatch(42);
    });
  });

  describe('#dispatch', () => {
    it('should throw if already dispatching', () => {
      dispatcher.register(payload => {
        dispatcher.dispatch(99);
      });
      expect(() => dispatcher.dispatch(11)).toThrowError(DispatcherError);
    });

    it('should invoke a single registered callback', () => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(cb);
      dispatcher.dispatch(42);
      expect(cb).toHaveBeenCalled();
    });

    it('should invoke multiple registered calblacks', () => {
      let cb1 = jasmine.createSpy('cb1');
      let cb2 = jasmine.createSpy('cb2');
      dispatcher.register(cb1);
      dispatcher.register(cb2);
      dispatcher.dispatch(42);
      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    it('should provide the correct value to callbacks', () => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(cb);
      dispatcher.dispatch(42);
      expect(cb).toHaveBeenCalledWith(42);
    });
  });

  describe('#isDispatching', () => {
    it('should return true when dispatching', () => {
      dispatcher.register(payload => {
        expect(dispatcher.isDispatching()).toEqual(true);
      });
      dispatcher.dispatch(13);
    });

    it('should return false when not dispatching', () => {
      expect(dispatcher.isDispatching()).toEqual(false);
    });
  });
});
