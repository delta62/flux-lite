import { Dispatcher, DispatchToken } from './dispatcher';
import { EventEmitter } from 'fbemitter';

export abstract class FluxStore {

  private _dispatchToken: DispatchToken;

  protected _changed: boolean;
  protected _changeEvent: string;
  protected _emitter: EventEmitter;

  constructor(protected _dispatcher: Dispatcher<any>) {
    this._changed = false;
    this._changeEvent = 'change';
    this._emitter = new EventEmitter();

    this._dispatchToken = this._dispatcher.register(payload => {
      this._invokeOnDispatch(payload);
    });
  }

  addListener(callback: (eventType?: string) => void): {remove: () => void} {
    return this._emitter.addListener(this._changeEvent, callback);
  }

  getDispatcher(): Dispatcher<any> {
    return this._dispatcher;
  }

  getDispatchToken(): string {
    return this._dispatchToken;
  }

  hasChanged(): boolean {
    return this._changed;
  }

  protected _emitChange(): void {
    if (!this._dispatcher.isDispatching()) {
      throw new StoreError(`FlexStore.hasChanged(): Must be invoked while dispatching.`);
    }
    this._changed = true;
  }

  protected _invokeOnDispatch(payload: any): void {
    this._changed = false;
    this._onDispatch(payload);
    if (this._changed) {
      this._emitter.emit(this._changeEvent);
    }
  }

  protected abstract _onDispatch(payload: any): void;
}

export class StoreError extends Error { }
