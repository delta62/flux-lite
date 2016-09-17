import { FluxStore, StoreError } from '../lib/flux-store';

describe('FluxStore', () => {
  let store: TestFluxStore;
  let dispatchToken = 'sometoken';
  let dispatcher;
  let registeredCallback;

  beforeEach(() => {
    dispatcher = {
      register: (cb) => {
        registeredCallback = cb;
        return dispatchToken;
      },
      isDispatching: () => false
    };
    store = new TestFluxStore(dispatcher);
  });

  describe('#addListener', () => {
    it('should register a callback with the dispatcher', () => {
      let cb = jasmine.createSpy('cb');
      store.addListener(cb);
      store.mockChanged = true;
      registeredCallback(42);
      expect(cb).toHaveBeenCalled();
    });

    it('should return a deregistration method', () => {
      let cb = jasmine.createSpy('cb');
      let res = store.addListener(cb);
      expect(typeof res.remove).toEqual('function');
    });

    it('should return a deregistration method', () => {
      let cb = jasmine.createSpy('cb');
      let res = store.addListener(cb);
      res.remove();
      registeredCallback(42);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('#getDispatcher', () => {
    it('should return the dispatcher', () => {
      expect(store.getDispatcher()).toEqual(dispatcher);
    });
  });

  describe('#getDispatchToken', () => {
    it('should return the dispatch token', () => {
      expect(store.getDispatchToken()).toEqual(dispatchToken);
    });
  });

  describe('#hasChanged', () => {
    it('should return false when no change has occurred', () => {
      expect(store.hasChanged()).toEqual(false);
    });

    it('should return true when an implementing class signals changes', () => {
      store.mockChanged = true;
      expect(store.hasChanged()).toEqual(true);
    });
  });

  describe('#_emitChange', () => {
    it('should throw if not currently dispatching', () => {
      spyOn(dispatcher, 'isDispatching').and.returnValue(false);
      expect(() => store.emitChange()).toThrowError(StoreError);
    });

    it('should mark store as changed', () => {
      spyOn(dispatcher, 'isDispatching').and.returnValue(true);
      store.emitChange();
      expect(store.hasChanged()).toEqual(true);
    });
  });

  describe('#_invokeOnDispatch', () => {
    it('should not trigger callbacks when no change occurred', () => {
      let cb = jasmine.createSpy('cb');
      store.addListener(cb);
      store.invokeOnDispatch(0);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should trigger callbacks on change', () => {
      let cb = jasmine.createSpy('cb');
      store.addListener(cb);
      store.mockChanged = true;
      store.invokeOnDispatch(0);
      expect(cb).toHaveBeenCalled();
    });
  });
});

class TestFluxStore extends FluxStore {

  private _mockChanged = false;

  set mockChanged(val: boolean) {
    this._changed = val;
    this._mockChanged = val
  }

  get mockChanged(): boolean {
    return this._mockChanged;
  }

  protected _onDispatch(payload: any): void {
    this._changed = this._mockChanged;
  }

  emitChange(): void {
    this._emitChange();
  }

  invokeOnDispatch(payload: any): void {
    this._invokeOnDispatch(payload);
  }
}
