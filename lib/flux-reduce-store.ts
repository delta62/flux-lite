import { Dispatcher } from './dispatcher';
import { FluxStore, StoreError } from './flux-store';

export abstract class FluxReduceStore<TState> extends FluxStore {
  private _state: TState;

  constructor(dispatcher: Dispatcher<any>) {
    super(dispatcher);
    this._state = this.getInitialState();
  }

  getState(): TState {
    return this._state;
  }

  abstract getInitialState(): TState;

  abstract reduce(state: TState, action: any): TState;

  areEqual(x: TState, y: TState): boolean {
    return x === y;
  }

  protected _invokeOnDispatch(payload: any): void {
    this._changed = false;
    const startingState = this._state;
    const endingState = this.reduce(startingState, payload);

    if (endingState === undefined) {
      throw new StoreError('undefined returned from reduce(...), did you forget to return state in the default case? (use null if this was intentional)');
    }

    if (!this.areEqual(startingState, endingState)) {
      this._state = endingState;
      this._emitChange();
    }

    if (this._changed) {
      this._emitter.emit(this._changeEvent);
    }
  }
}
