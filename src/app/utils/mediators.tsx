"use client";

import * as React from "react";
import { useEffect } from "react";

type EventHandlerArgs<T, PayloadT> = {
  type: T;
  payload: PayloadT;
};

type Mediator = [any, any?];

export const useMediator = <T extends Mediator>(
  eventType: T[0],
  eventHandler: (event: EventHandlerArgs<T[0], T[1]>) => unknown,
  ref: React.RefObject<any>,
) => {
  useEffect(() => {
    const currentRef = ref.current;

    if (!currentRef) {
      return;
    }

    function listener(e: CustomEvent) {
      e.stopImmediatePropagation();
      eventHandler({
        type: eventType,
        payload: e.detail,
      });
    }

    currentRef.addEventListener(eventType, listener, {
      useCapture: true,
    });

    return () => {
      currentRef.removeEventListener(eventType, listener);
    };
  }, [eventHandler, eventType, ref]);
};

export function dispatchMediatedEvent<T extends [string, Record<string, unknown>?]>(target: EventTarget | null, event: T) {
  const [eventType, eventPayload] = event;

  if (!target) {
    console.warn("No specified target for bubble event, no possibility to dispatch!");
    return;
  }

  target.dispatchEvent(
    new CustomEvent(eventType, {
      detail: eventPayload,
      cancelable: true,
      bubbles: true,
    }),
  );
}
