export type DispatchToken = string;

export class Dispatcher<TPayload> {
  private static _prefix: string = 'ID_';

  private _callbacks: {[key: string]: (payload: any) => void};
  private _lastId: number;
  private _isDispatching: boolean;
  private _isPending: {[key: string]: boolean};
  private _pendingPayload: TPayload;
  private _isHandled: {[key: string]: boolean};

  constructor() {
    this._callbacks = { };
    this._isPending = { };
    this._isHandled = { };
    this._lastId = 1;
    this._isDispatching = false;
  }

  register(callback: (payload: TPayload) => void): DispatchToken {
    if (this._isDispatching) {
      throw new DispatcherError('Dispatcher.register(...): Cannot register in the middle of a dispatch.');
    }

    let id = `${Dispatcher._prefix}${this._lastId}`;
    this._lastId += 1;
    this._callbacks[id] = callback;
    return id;
  }

  unregister(id: DispatchToken): void {
    if (this._isDispatching) {
      throw new DispatcherError('Dispatcher.unregister(...): Cannot unregister in the middle of a dispatch.');
    }
    if (!this._callbacks[id]) {
      throw new DispatcherError(`Dispatcher.unregister(...): '${id}' does not map to a registered callback.`);
    }
    delete this._callbacks[id];
  }

  waitFor(ids: Array<DispatchToken>): void {
    if (!this._isDispatching) {
      throw new DispatcherError('Dispatcher.waitFor(...): Must be invoked while dispatching.');
    }
    for (let ii = 0; ii < ids.length; ii += 1) {
      let id = ids[ii];
      if (!this._isPending[id]) {
        throw new DispatcherError(`Dispatcher.waitFor(...): Circular dependency detected while waiting for ${id}`);
      }
      if (!this._callbacks[id]) {
        throw new DispatcherError(`Dispatcher.waitFor(...): '${id}' does not map to a registered callback.`);
      }
      this._invokeCallback(id);
    }
  }

  dispatch(payload: TPayload): void {
    if (this._isDispatching) {
      throw new DispatcherError('Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.');
    }
    this._startDispatching(payload);
    try {
      for (let id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  }

  isDispatching(): boolean {
    return this._isDispatching;
  }

  private _invokeCallback(id: DispatchToken): void {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  }

  private _startDispatching(payload: TPayload): void {
    for (let id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  }

  private _stopDispatching(): void {
    delete this._pendingPayload;
    this._isDispatching = false;
  }
}

export class DispatcherError extends Error { }
