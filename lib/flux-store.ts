import { Dispatcher, DispatchToken } from './dispatcher';
import { EventEmitter } from 'eventemitter3';
import ExtendableError from 'es6-error';

export type ListenerMeta = { remove: () => void };

export abstract class FluxStore<TState> {
  private static CHANGE_EVENT: string = 'change';
  private _state: TState;
  private _dispatchToken: DispatchToken;
  protected _emitter: EventEmitter;

  constructor(private _dispatcher: Dispatcher<any>) {
    this._emitter = new EventEmitter();
    this._dispatchToken = this._dispatcher.register(payload => {
      return this._invokeOnDispatch(payload);
    });
    this._state = this.getInitialState();
  }

  abstract getInitialState(): TState;

  abstract reduce(state: TState, action: any): Promise<TState>;

  get state(): TState {
    return this._state;
  }

  get dispatcher(): Dispatcher<any> {
    return this._dispatcher;
  }

  get dispatchToken(): string {
    return this._dispatchToken;
  }

  addListener(callback: (eventType?: string) => void): ListenerMeta {
    this._emitter.on(FluxStore.CHANGE_EVENT, callback);
    return {
      remove: () => this._emitter.removeListener(FluxStore.CHANGE_EVENT, callback)
    }
  }

  areEqual(x: TState, y: TState): boolean {
    return x === y;
  }

  private _invokeOnDispatch(payload: any): Promise<TState> {
    return this.reduce(this._state, payload)
      .then(endingState => {
        if (endingState === undefined) {
          throw new StoreError('undefined returned from reduce(...), did you forget to return state in the default case? (use null if this was intentional)');
        }

        if (!this.areEqual(this._state, endingState)) {
          this._state = endingState;
          this._emitter.emit(FluxStore.CHANGE_EVENT);
        }
      });
  }
}

export class StoreError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
