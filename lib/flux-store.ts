import { EventEmitter } from 'eventemitter3';
import { Action } from './action';
import { Dispatcher, DispatchToken } from './dispatcher';
import { StoreError } from './store-error';

export type ListenerMeta = { remove: () => void };

export abstract class FluxStore<TState> {
  private static CHANGE_EVENT: string = 'change';
  private _state: TState;
  private _dispatchToken: DispatchToken;
  private _initialized: boolean;
  protected _emitter: EventEmitter;

  constructor(private _dispatcher: Dispatcher<any>) {
    this._initialized = false;
    this._emitter = new EventEmitter();
    this._dispatchToken = this._dispatcher.register(payload => {
      return this._invokeOnDispatch(payload);
    });
  }

  protected abstract getInitialState(): TState;

  protected abstract reduce(state: TState, action: Action<any>): Promise<TState> | TState;

  get state(): TState {
    if (!this._initialized) {
      this._state = this.getInitialState();
      this._initialized = true;
    }
    return this._state;
  }

  get dispatcher(): Dispatcher<any> {
    return this._dispatcher;
  }

  get dispatchToken(): string {
    return this._dispatchToken;
  }

  addListener(callback: () => void): ListenerMeta {
    this._emitter.on(FluxStore.CHANGE_EVENT, callback);
    return {
      remove: () => this._emitter.removeListener(FluxStore.CHANGE_EVENT, callback)
    }
  }

  areEqual(x: TState, y: TState): boolean {
    return x === y;
  }

  private _invokeOnDispatch(payload: any): Promise<void> {
    let result = this.reduce(this.state, payload);
    let promise = result instanceof Promise
      ? result
      : Promise.resolve(result);

    return promise.then(this._resolveDispatchResult.bind(this));
  }

  private _resolveDispatchResult(endingState: TState): void {
    if (endingState === undefined) {
      throw new StoreError('undefined returned from reduce(...), did you forget to return state in the default case? (use null if this was intentional)');
    }

    if (!this.areEqual(this.state, endingState)) {
      this._state = endingState;
      this._emitter.emit(FluxStore.CHANGE_EVENT);
    }
  }
}
