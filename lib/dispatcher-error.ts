import ExtendableError from 'es6-error';

export class DispatcherError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
