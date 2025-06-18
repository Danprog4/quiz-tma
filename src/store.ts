import { proxy } from "valtio";

export const store = proxy<{ isSubscribed: boolean; showWarning: boolean }>({
  isSubscribed: false,
  showWarning: false,
});

export const setIsSubscribed = (isSubscribed: boolean) => {
  store.isSubscribed = isSubscribed;
};

export const setShowWarning = (showWarning: boolean) => {
  store.showWarning = showWarning;
};
