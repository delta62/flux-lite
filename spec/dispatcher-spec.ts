import { Action } from '../lib/action';
import { Dispatcher, DispatcherError, DispatcherCallback } from '../lib/dispatcher';

fdescribe('Dispatcher', () => {
  let dispatcher: Dispatcher<number>;
  let noop = (payload: any) => Promise.resolve<void>(null);

  beforeEach(() => {
    dispatcher = new Dispatcher<number>();
  });

  describe('#register', () => {
    it('should return a dispatch token', () => {
      let token = dispatcher.register(noop);
      expect(token).toBeTruthy();
    });

    it('should return unique dispatch tokens to consumers', () => {
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

    it('should invoke callbacks with expected state', () => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(cb);
      dispatcher.dispatch(42);
      expect(cb).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 42 }));
    })
  });

  describe('#unregister', () => {
    it('should not invoke callback after unregistration', () => {
      let cb = jasmine.createSpy('cb');
      let token = dispatcher.register(cb);
      dispatcher.unregister(token);
      dispatcher.dispatch(42);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should throw when unregistering a non-registered callback', () => {
      expect(() => dispatcher.unregister('foo')).toThrowError(DispatcherError);
    });
  });

  // describe('#waitFor', () => {
  //   it('should throw when waiting for a non-registered callback', (done) => {
  //     dispatcher.register(payload => {
  //       dispatcher.waitFor([ 'foo' ], payload);
  //       return Promise.resolve<void>(null);
  //     });
  //     dispatcher.dispatch(42).catch(err => done());
  //   });

  //   it('should invoke all awaited callbacks', () => {
  //     let cb1 = jasmine.createSpy('cb1');
  //     let cb2 = jasmine.createSpy('cb2');
  //     let token1 = dispatcher.register(cb1);
  //     let token2 = dispatcher.register(cb2);

  //     dispatcher.register(payload => {
  //       dispatcher.waitFor([ token1, token2 ], payload);
  //       return Promise.resolve<void>(null);
  //     });

  //     dispatcher.dispatch(42);

  //     expect(cb1).toHaveBeenCalled();
  //     expect(cb2).toHaveBeenCalled();
  //   });

  //   it('should invoke awaited callbacks in order', () => {
  //     let cb1 = jasmine.createSpy('cb1');
  //     let cb2 = payload => {
  //       expect(cb1).toHaveBeenCalled();
  //       return Promise.resolve<void>(null);
  //     }
  //     let token1 = dispatcher.register(cb1);
  //     let token2 = dispatcher.register(cb2);

  //     dispatcher.register(payload => {
  //       dispatcher.waitFor([ token1, token2 ], payload);
  //       return Promise.resolve<void>(null);
  //     });

  //     dispatcher.dispatch(42);
  //   });
  // });

  describe('#dispatch', () => {
    it('should invoke a single registered callback', done => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(resolveWith(cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalled())
        .then(done);
    });

    it('should invoke callbacks with the correct payload', done => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(resolveWith(cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 42 })))
        .then(done);
    });

    it('should invoke multiple registered calblacks', done => {
      let cb1 = jasmine.createSpy('cb1');
      let cb2 = jasmine.createSpy('cb2');
      dispatcher.register(resolveWith(cb1));
      dispatcher.register(resolveWith(cb2));
      dispatcher.dispatch(42)
        .then(() => expect(cb1).toHaveBeenCalled())
        .then(() => expect(cb2).toHaveBeenCalled())
        .then(done);
    });

    it('should invoke async callbacks', done => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(resolveAfter(5, cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalled())
        .then(done);
    });

    it('should provide the correct value to async callbacks', done => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(resolveAfter(5, cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 42 })))
        .then(done);
    });
  });
});

function resolveWith(callback: (val) => void): DispatcherCallback<number> {
  return (action: Action<number>) => Promise.resolve(action).then(callback);
}

function resolveAfter(millis: number, callback: (val) => void): DispatcherCallback<number> {
  return action => new Promise(resolve => setTimeout(resolve, millis))
    .then(() => callback(action));
}
