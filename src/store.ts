import { proxy } from "valtio";

export const store = proxy<{ isSubscribed: boolean }>({
  isSubscribed: false,
});

export const setIsSubscribed = (isSubscribed: boolean) => {
  store.isSubscribed = isSubscribed;
};
