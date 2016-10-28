import { FluxStore, StoreError } from '../lib/flux-store';

describe('FluxStore', () => {
  let store: TestStore;
  let dispatcher;

  beforeEach(() => {
    dispatcher = {
      cb: null,
      dispatch: data => dispatcher.cb(data),
      register: cb => dispatcher.cb = cb,
      isDispatching: () => true
    };
    store = new TestStore(dispatcher);
  });

  describe('#getState', () => {
    it('should return the initial state', () => {
      expect(store.state).toEqual({ foo: 'initial' });
    });

    it('should return up-to-date state after modifications', () => {
      store.reduceResult = { foo: 'bar' };
      expect(store.state).toEqual({ foo: 'bar' });
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
      expect(() => dispatcher.dispatch(42)).toThrowError(StoreError);
    });

    it('should take no action if no change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      store.reduceResult = store.state;
      store.addListener(cb);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should invoke callbacks if change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      store.reduceResult = { foo: 'changed' };
      store.addListener(cb);
      expect(cb).toHaveBeenCalled();
    });

    it('should re-throw exceptions raised during the reduce', () => {
      let failStore = new ExplodingStore(dispatcher);
      expect(() => dispatcher.dispatch(42)).toThrowError(Error);
    })
  });
});

class TestStore extends FluxStore<TestObj> {

  reduceResult: TestObj;

  getInitialState(): TestObj {
    return { foo: 'initial' };
  }

  reduce(state: TestObj, action: any): Promise<TestObj> {
    return Promise.resolve(this.reduceResult);
  }
}

class ExplodingStore extends FluxStore<number> {
  getInitialState(): number {
    return 0;
  }

  reduce(state: number, action: any): Promise<number> {
    return Promise.reject(new Error('Forgot to take out the trash'));
  }
}

interface TestObj {
  foo: string;
}
