import { combineReducers, applyMiddleware } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import ScannedReducer from "./reducers";

const RootReducers = combineReducers({
  ScannedReducer,
});

export const store = configureStore({ reducer: RootReducers });
