import * as types from "../actions/ActionTypes";

interface AppState {
  count: number;
}

interface Action {
  type: string;
  payload?: <T>(args: T) => T;
}

const initialState: AppState = {
  count: 0,

};

const AppReducer = (state = initialState, action: Action): AppState => {
  switch (action.type) {
    case types.INCREMENT_COUNT:
      return {
        ...state,
        count: state.count + 1,
      };
    default:
      return state;
  }
};

export default AppReducer;
