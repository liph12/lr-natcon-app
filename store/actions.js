import AsyncStorage from "@react-native-async-storage/async-storage";

export const StoreScanned = (data) => {
  return async (dispatch) => {
    await AsyncStorage.setItem("awardees", data);
    dispatch({
      type: "SETSCANNED",
      payload: data,
    });
  };
};

export const CurrentScanned = () => {
  return async (dispatch) => {
    const data = await AsyncStorage.getItem("awardees");
    dispatch({
      type: "GETSCANNED",
      payload: data,
    });
  };
};

export const UpdateSettings = (data) => {
  return async (dispatch) => {
    await AsyncStorage.setItem("settings", data);
    dispatch({
      type: "SETSETTINGS",
      payload: data,
    });
  };
};

export const CurrentSettings = () => {
  return async (dispatch) => {
    const data = await AsyncStorage.getItem("settings");
    dispatch({
      type: "GETSETTINGS",
      payload: data,
    });
  };
};
