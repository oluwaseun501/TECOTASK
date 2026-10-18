export const SUPPORT_WIDGET_OPEN_EVENT = "tecotask:open-support";

export const openSupportWidget = (event) => {
  event?.preventDefault();
  window.dispatchEvent(new Event(SUPPORT_WIDGET_OPEN_EVENT));
};