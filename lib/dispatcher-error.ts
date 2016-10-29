import ExtendableError from 'es6-error';

export class DispatcherError extends ExtendableError {
  constructor(message: string) {
    super(message);
  }
}
