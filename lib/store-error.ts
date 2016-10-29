import ExtendableError from 'es6-error';

export class StoreError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
