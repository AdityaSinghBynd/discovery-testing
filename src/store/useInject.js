import { useEffect } from "react";
import { useStore } from "react-redux";
import { combineReducers } from "redux";

export const useInject = (key, reducer) => {
  const store = useStore();

  useEffect(() => {
    if (store.asyncReducers && !store.asyncReducers[key]) {
      store.asyncReducers[key] = reducer;
      store.replaceReducer(combineReducers({ ...store.asyncReducers }));
    }
  }, [key, reducer, store]);
};
