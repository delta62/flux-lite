export class Action<TPayload> {
  payload: TPayload;

  /** @internal */
  _callbacks: { [key: string]: Promise<void> };
}
