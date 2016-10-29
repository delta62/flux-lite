import { Action } from '../lib/action';
import { FluxStore } from '../lib/flux-store';
import { StoreError } from '../lib/store-error';
import { DispatcherCallback, DispatchToken } from '../lib/dispatcher';

describe('FluxStore', () => {
  let store: TestStore;
  let registeredCallback: DispatcherCallback<any>;

  beforeEach(() => {
    let dispatcher: any = {
      register: (callback: DispatcherCallback<any>) => registeredCallback = callback
    };
    store = new TestStore(dispatcher);
  });

  describe('#state', () => {
    it('should return the initial state', () => {
      expect(store.state).toEqual({ foo: 'initial' });
    });

    it('should return up-to-date state after modifications', done => {
      registeredCallback(action({ foo: 'bar' }))
        .then(() => expect(store.state).toEqual({ foo: 'bar' }))
        .then(done);
    });
  });

  describe('#dispatcher', () => {
    it('should return the dispatcher', () => {
      let dispatcher: any = { register: () => null };
      let store = new TestStore(dispatcher);
      expect(store.dispatcher).toBe(dispatcher);
    });
  });

  describe('#dispatchToken', () => {
    it('should return the dispatch token provided by the dispatcher', () => {
      let token: DispatchToken = 'myToken';
      let dispatcher: any = { register: () => token };
      let store = new TestStore(dispatcher);
      expect(store.dispatchToken).toEqual(token);
    });
  });

  describe('#addListener', () => {
    it('should invoke the callback when a change occurs', done => {
      let cb = jasmine.createSpy('cb');
      store.addListener(cb);
      registeredCallback(action({ foo: 'bar' }))
        .then(() => expect(cb).toHaveBeenCalled())
        .then(done);
    });

    it('should not invoke the callback when a change does not occur', done => {
      let cb = jasmine.createSpy('cb');
      store.addListener(cb);
      registeredCallback(action(store.state))
        .then(() => expect(cb).not.toHaveBeenCalled())
        .then(done);
    });

    it('should return a removal method', () => {
      let listenerMeta = store.addListener(() => null);
      expect(typeof listenerMeta.remove).toBe('function');
    });

    it('should not invoke the callback after removal method is called', done => {
      let cb = jasmine.createSpy('cb');
      let listenerMeta = store.addListener(cb);
      listenerMeta.remove();
      registeredCallback(action({ foo: 'bar' }))
        .then(() => expect(cb).not.toHaveBeenCalled())
        .then(done);
    });

    it('should throw if reduce returns undefined', done => {
      registeredCallback(action(undefined))
        .then(done.fail)
        .catch(err => expect(err).toEqual(jasmine.any(StoreError)))
        .then(done);
    });
  });

  describe('#areEqual', () => {
    it('should return true for reference equality', () => {
      let a = { foo: 'bar' };
      let b = a;
      expect(store.areEqual(a, b)).toEqual(true);
    });

    it('should return false for object equality', () => {
      let a = { foo: 'bar' };
      let b = { foo: 'bar' };
      expect(store.areEqual(a, b)).toEqual(false);
    });
  });
});

class TestStore extends FluxStore<TestObj> {
  getInitialState(): TestObj {
    return { foo: 'initial' };
  }

  reduce(state: TestObj, action: Action<TestObj>): Promise<void> {
    state = action.payload;
    return Promise.resolve(state);
  }
}

interface TestObj {
  foo: string;
}

function action<T>(payload: T): Action<T> {
  return <any>{ payload };
}
