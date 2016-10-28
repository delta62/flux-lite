import { Action } from '../lib/action';
import { DispatcherError } from '../lib/dispatcher-error';
import {
  Dispatcher,
  DispatcherCallback,
  DispatchToken
} from '../lib/dispatcher';

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
    it('should not invoke callback after unregistration', done => {
      let cb = jasmine.createSpy('cb');
      let token = dispatcher.register(resolveWith(cb));
      dispatcher.unregister(token);
      dispatcher.dispatch(42)
        .then(() => expect(cb).not.toHaveBeenCalled())
        .then(done);
    });

    it('should throw when unregistering a non-registered callback', () => {
      expect(() => dispatcher.unregister('foo')).toThrowError(DispatcherError);
    });
  });

  describe('#waitFor', () => {
    it('should reject when waiting for a non-registered callback', done => {
      let token = 'abc';
      dispatcher.register(waitFor(() => token, dispatcher));
      dispatcher.dispatch(42)
        .then(done.fail)
        .catch(err => expect(err).toEqual(jasmine.any(DispatcherError)))
        .then(done);
    });

    it('should invoke awaited callbacks before awaiting callbacks', done => {
      let calls = [ ];
      let cb = () => calls.push(1);
      let token = dispatcher.register(resolveAfter(1, cb));
      dispatcher.register(waitFor(() => token, dispatcher));
      dispatcher.dispatch(42)
        .then(() => expect(calls).toEqual([ 1, 2 ]))
        .catch(done.fail)
        .then(done);
    });

    it('should reject when deadlock occurs', done => {
      let token1 = dispatcher.register(waitFor(() => token2, dispatcher));
      let token2 = dispatcher.register(waitFor(() => token1, dispatcher));
      dispatcher.dispatch(42)
        .then(done.fail)
        .catch(err => expect(err).toEqual(jasmine.any(DispatcherError)))
        .then(done);
    });

    it('should not re-run callbacks awaited twice', done => {
      let cb = jasmine.createSpy('runOnce');
      let runOnceToken = dispatcher.register(resolveAfter(1, cb));
      dispatcher.register(waitFor(() => runOnceToken, dispatcher));
      dispatcher.register(waitFor(() => runOnceToken, dispatcher));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalledTimes(1))
        .catch(done.fail)
        .then(done);
    });
  });

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
      dispatcher.register(resolveAfter(1, cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalled())
        .then(done);
    });

    it('should provide the correct value to async callbacks', done => {
      let cb = jasmine.createSpy('cb');
      dispatcher.register(resolveAfter(1, cb));
      dispatcher.dispatch(42)
        .then(() => expect(cb).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 42 })))
        .then(done);
    });

    it('should reject when a store rejects its promise', done => {
      dispatcher.register(rejectAfter(1));
      dispatcher.dispatch(42)
        .then(done.fail)
        .catch(err => expect(err).toEqual(jasmine.any(Error)))
        .then(done);
    });

    it('should reject when a store throws', done => {
      dispatcher.register(failingStoreCallback);
      dispatcher.dispatch(42)
        .then(done.fail)
        .catch(err => expect(err).toEqual(jasmine.any(Error)))
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

function rejectAfter(millis: number): DispatcherCallback<number> {
  return action => new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Error resolving store promise')), millis);
  });
}

function waitFor(
    token: () => DispatchToken,
    dispatcher: Dispatcher<number>): DispatcherCallback<number> {

  return action => new Promise((resolve, reject) => {
    setTimeout(() => {
      dispatcher.waitFor([ token() ], action)
        .then(() => resolve())
        .catch(reject);
    }, 1);
  });
}

function failingStoreCallback(action): Promise<void> {
  throw new Error('Error in store callback');
}
