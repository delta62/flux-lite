import { FluxReduceStore } from '../lib/flux-reduce-store';
import { StoreError } from '../lib/flux-store';

describe('FluxReduceStore', () => {
  let store: TestReduceStore;
  let dispatcher;

  beforeEach(() => {
    dispatcher = {
      register: () => { },
      isDispatching: () => true
    }
    store = new TestReduceStore(dispatcher);
  });

  describe('#getState', () => {
    it('should return the initial state', () => {
      expect(store.getState()).toEqual({ foo: 'initial' });
    });

    it('should return up-to-date state after modifications', () => {
      store.reduceResult = { foo: 'bar' };
      store.invokeOnDispatch({ foo: 'bar' });
      expect(store.getState()).toEqual({ foo: 'bar' });
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

  describe('#_invokeOnDispatch', () => {
    it('should throw if reduce returns undefined', () => {
      store.reduceResult = undefined;
      expect(() => store.invokeOnDispatch(42)).toThrowError(StoreError);
    });

    it('should take no action if no change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      store.reduceResult = store.getState();
      store.addListener(cb);
      store.invokeOnDispatch(store.reduceResult);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should invoke callbacks if change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      store.reduceResult = { foo: 'changed' };
      store.addListener(cb);
      store.invokeOnDispatch(store.reduceResult);
      expect(cb).toHaveBeenCalled();
    });

    it('should re-throw exceptions raised during the reduce', () => {
      let failStore = new ExplodingReduceStore(dispatcher);
      expect(() => failStore.invokeOnDispatch(42)).toThrowError(Error);
    })
  });
});

class TestReduceStore extends FluxReduceStore<TestObj> {

  reduceResult: TestObj;

  getInitialState(): TestObj {
    return { foo: 'initial' };
  }

  reduce(state: TestObj, action: any, cb): void {
    cb(null, this.reduceResult);
  }

  invokeOnDispatch(payload): void {
    this._invokeOnDispatch(payload);
  }
}

class ExplodingReduceStore extends FluxReduceStore<number> {
  getInitialState(): number {
    return 0;
  }

  reduce(state: number, action: any, cb): void {
    cb(new Error('Forgot to take out the trash'));
  }

  invokeOnDispatch(payload): void {
    this._invokeOnDispatch(payload);
  }
}

interface TestObj {
  foo: string;
}
