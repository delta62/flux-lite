export class Action<TPayload> {
  payload: TPayload;

  _callbacks: { [key: string]: CallbackStatus };
}

export enum CallbackStatus {
  NotStarted,
  Awaiting,
  Completed
}
