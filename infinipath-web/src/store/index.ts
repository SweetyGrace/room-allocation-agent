// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers";

const store = configureStore({
  reducer: rootReducer,
  // Add middleware or other configurations if needed
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
