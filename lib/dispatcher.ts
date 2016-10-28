import { Action } from './action';
import { DispatcherError } from './dispatcher-error';

export type DispatchToken = string;
export type DispatcherCallback<TPayload> = (action: Action<TPayload>) => Promise<void>;

export class Dispatcher<TPayload> {
  private _callbacks: { [key: string]: DispatcherCallback<TPayload> };
  private _lastId: number;

  constructor() {
    this._callbacks = { };
    this._lastId = 1;
  }

  register(callback: DispatcherCallback<TPayload>): DispatchToken {
    let id = this._lastId;
    this._lastId += 1;
    this._callbacks[id] = callback;
    return `${id}`;
  }

  unregister(id: DispatchToken): void {
    if(!this._callbackExists(id)) {
      throw this._callbackNotFoundError(id);
    }
    delete this._callbacks[id];
  }

  waitFor(ids: Array<DispatchToken>, action: Action<TPayload>): Promise<void> {
    return Promise.all(ids.map(id => {
      if (!this._callbackExists(id)) {
        return Promise.reject(this._callbackNotFoundError(id));
      }
      return this._executeCallback(id, action);
    }));
  }

  dispatch(payload: TPayload): Promise<void> {
    let action = this._buildAction(payload);
    return Promise.all(Object.getOwnPropertyNames(this._callbacks).map(id => {
      return this._executeCallback(id, action);
    }));
  }

  private _buildAction(payload: TPayload): Action<TPayload> {
    return {
      payload,
      _callbacks: { }
    };
  }

  private _callbackExists(id: DispatchToken): boolean {
    return !!this._callbacks[id];
  }

  private _callbackNotFoundError(id: DispatchToken): DispatcherError {
    let msg = `'${id}' does not map to a registered callback.`;
    return new DispatcherError(msg);
  }

  private _executeCallback(key: string, action: Action<TPayload>): Promise<void> {
    if (action._callbacks[key]) {
      return action._callbacks[key];
    }
    return new Promise((resolve, reject) => {
      let promise = this._callbacks[key](action);
      action._callbacks[key] = promise;
      return promise.then(() => resolve()).catch(reject);
    });
  }
}
