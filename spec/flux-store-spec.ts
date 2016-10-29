import { Action } from '../lib/action';
import { FluxStore } from '../lib/flux-store';
import { StoreError } from '../lib/store-error';
import { DispatcherCallback } from '../lib/dispatcher';

fdescribe('FluxStore', () => {
  let store: TestStore;
  let registeredCallback: DispatcherCallback<any>;

  beforeEach(() => {
    let dispatcher: any = {
      register: callback => registeredCallback = callback
    };
    store = new TestStore(dispatcher);
  });

  describe('#state', () => {
    it('should return the initial state', () => {
      expect(store.state).toEqual({ foo: 'initial' });
    });

    it('should return up-to-date state after modifications', () => {
      registeredCallback(action({ foo: 'bar' }));
      expect(store.state).toEqual({ foo: 'bar' });
    });
  });

  describe('#dispatcher', () => {
    it('should return the dispatcher');
  });

  describe('#dispatchToken', () => {
    it('should return the dispatch token provided by the dispatcher');
  });

  describe('#addListener', () => {
    it('should invoke the callback when a change occurs');
    it('should not invoke the callback when a change does not occur');
    it('should return a removal method');
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

  xdescribe('#_invokeOnDispatch', () => {
    it('should throw if reduce returns undefined', () => {
      registeredCallback(undefined);
      expect(() => registeredCallback(action(42))).toThrowError(StoreError);
    });

    it('should take no action if no change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      registeredCallback(action(store.state));
      store.addListener(cb);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should invoke callbacks if change has occurred', () => {
      let cb = jasmine.createSpy('cb');
      registeredCallback(action({ foo: 'changed' }));
      store.addListener(cb);
      expect(cb).toHaveBeenCalled();
    });

    it('should re-throw exceptions raised during the reduce', () => {
      // let failStore = new ExplodingStore(dispatcher);
      // expect(() => registeredCallback(action(42))).toThrowError(Error);
    })
  });
});

class TestStore extends FluxStore<TestObj> {
  getInitialState(): TestObj {
    return { foo: 'initial' };
  }

  reduce(state: TestObj, action: Action<TestObj>): Promise<void> {
    return Promise.resolve(action.payload);
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

function action<T>(payload: T): Action<T> {
  return <any>{ payload };
}
