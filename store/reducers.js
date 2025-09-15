import { defaultSettings } from "../constants/settings";

const initialState = {
  scannedData: null,
  defaultSettings: JSON.stringify(defaultSettings),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SETSCANNED":
      return {
        ...state,
        scannedData: action.payload,
      };
    case "GETSCANNED":
      return {
        scannedData: action.payload,
      };
    case "GETSETTINGS":
      return {
        defaultSettings: action.payload,
      };
    case "SETSETTINGS":
      return {
        defaultSettings: action.payload,
      };
    default:
      return state;
  }
};
