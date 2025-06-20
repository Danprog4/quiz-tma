import { proxy } from "valtio";

export const store = proxy<{
  isSubscribed: boolean;
  showWarning: boolean;
  openQuizId: number | null;
}>({
  isSubscribed: true,
  showWarning: false,
  openQuizId: null,
});

export const setIsSubscribed = (isSubscribed: boolean) => {
  store.isSubscribed = isSubscribed;
};

export const setShowWarning = (showWarning: boolean) => {
  store.showWarning = showWarning;
};

export const setOpenQuizId = (openQuizId: number | null) => {
  store.openQuizId = openQuizId;
};
