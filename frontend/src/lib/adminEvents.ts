const EVENT = 'admin:data-changed';

export function emitAdminRefresh() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onAdminRefresh(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
