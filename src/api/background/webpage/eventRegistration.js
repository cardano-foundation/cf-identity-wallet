import { TARGET } from '../config';

/**
 * @param {string} eventName
 * @param {Function} callback
 */
export const on = (eventName, callback) => {

  console.log("on");
  const handler = (event) => callback(event.detail);

  const events = window.cardano.idwallet._events[eventName] || [];

  window.cardano.idwallet._events[eventName] = [...events, [callback, handler]];

  window.addEventListener(`${TARGET}${eventName}`, handler);
};

/**
 * @param {string} eventName
 * @param {Function} callback
 */
export const off = (eventName, callback) => {
  const filterHandlersBy = (predicate) => (handlers) =>
    handlers.filter(([savedCallback]) => predicate(savedCallback));

  const filterByMatchingHandlers = filterHandlersBy((cb) => cb === callback);
  const filterByNonMatchingHandlers = filterHandlersBy((cb) => cb !== callback);

  const eventHandlers = window.cardano.idwallet._events[eventName];

  if (typeof eventHandlers !== 'undefined') {
    const matchingHandlers = filterByMatchingHandlers(eventHandlers);

    for (const [, handler] of matchingHandlers) {
      window.removeEventListener(`${TARGET}${eventName}`, handler);
    }

    window.cardano.idwallet._events[eventName] =
      filterByNonMatchingHandlers(eventHandlers);
  }
};

