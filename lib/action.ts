export class Action<TPayload> {
  payload: TPayload;

  _callbacks: { [key: string]: Promise<void> };
}
