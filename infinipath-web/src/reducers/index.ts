import { combineReducers } from "redux";
import appReducer from "./AppReducer";
import zoomReducer from "./ZoomReducer";
import seekerReducer from "./SeekerReducer";
import AnalyticsReducer from "./AnalyticsReducer";
import ProgramReducer from "./ProgramReducer";
import FilterData from "./FilterReducer";

const rootReducer = combineReducers({
  appReducer,
  zoomReducer,
  seekerReducer,
  AnalyticsReducer,
  ProgramReducer,
  FilterData,


  // Add more reducers as needed
});

export default rootReducer;
