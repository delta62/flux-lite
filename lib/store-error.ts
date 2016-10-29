import ExtendableError from 'es6-error';

export class StoreError extends ExtendableError {
  constructor(message: string) {
    super(message);
  }
}
