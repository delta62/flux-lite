import ExtendableError from 'es6-error';
import { Action, CallbackStatus } from './action';

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
    let callbacks = Object.keys(this._callbacks).reduce((acc, key) => {
      acc[key] = CallbackStatus.NotStarted;
      return acc;
    }, { });

    return {
      payload,
      _callbacks: callbacks
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
    return new Promise((resolve, reject) => {
      switch (action._callbacks[key]) {
        case CallbackStatus.Awaiting:
          return reject(new DispatcherError(`Circular dependency detected while waiting for ${key}`));
        case CallbackStatus.Completed:
          return resolve();
        case CallbackStatus.NotStarted:
          action._callbacks[key] = CallbackStatus.Awaiting;
          return this._callbacks[key](action)
            .then(() => action._callbacks[key] = CallbackStatus.Completed)
            .then(() => resolve())
            .catch(err => reject(err));
      }
    });
  }
}

export class DispatcherError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
