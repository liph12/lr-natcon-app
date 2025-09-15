import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { Switch, Divider, Text as MUIText } from "@react-native-material/core";
import { useSelector, useDispatch } from "react-redux";
import { UpdateSettings, CurrentSettings } from "../store/actions";
import { defaultSettings } from "../constants/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const currentSettings = useSelector(
    (state) => state.ScannedReducer.defaultSettings
  );
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [hasSavedData, setHasSavedData] = useState(false);

  const dispatch = useDispatch();
  const resetSettings = () => {
    for (let i in settings) {
      settings[i].active = false;
    }

    setSettings(settings);
  };

  const defined = (obj) => {
    return obj !== null && obj !== undefined;
  };

  const getCurrentSettings = () => {
    dispatch(CurrentSettings());
  };

  const updateSettings = (idx, checked) => {
    resetSettings();

    const tmp = Object.assign({}, settings[idx]);

    tmp.active = checked;

    const updatedSettings = settings.slice();
    updatedSettings[idx] = tmp;

    setSettings(updatedSettings);
    dispatch(UpdateSettings(JSON.stringify(updatedSettings)));
  };

  const clearDataStorage = async () => {
    await AsyncStorage.removeItem("awardees");
    await AsyncStorage.removeItem("awardeesRaw");
    await AsyncStorage.removeItem("photoBoothAwardees");
    await AsyncStorage.removeItem("settings");
  };

  const showClearDataAlert = () => {
    Alert.alert(
      "Warning",
      "Are you sure you want to clear the data saved on this device?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            clearDataStorage();
            alert("Storage cleared! Please restart the app for changes.");
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (defined(currentSettings) && !loaded) {
    const tmpSettings = JSON.parse(currentSettings);
    setLoaded(true);
    setSettings([...tmpSettings]);
  }

  useEffect(() => {
    const checkSavedData = async () => {
      const awardees = await AsyncStorage.getItem("awardees");
      const photoBoothAwardees = await AsyncStorage.getItem(
        "photoBoothAwardees"
      );

      if (awardees !== null || photoBoothAwardees !== null) {
        // console.log(awardees);
        setHasSavedData(true);
      }
    };

    getCurrentSettings();
    checkSavedData();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      {settings !== null &&
        settings.map((s, key) => {
          return (
            <View key={key}>
              <View style={{ flexDirection: "row" }}>
                <View>
                  <MUIText variant="h6">Scan QR within {s.title}?</MUIText>
                  <MUIText variant="body2" color="gray">
                    Detect scanning within {s.title} only.
                  </MUIText>
                </View>
                <Switch
                  key={key}
                  value={s.active}
                  onValueChange={(checked) => updateSettings(key, checked)}
                  style={{ marginLeft: 30 }}
                />
              </View>
              <Divider style={{ marginTop: 20, marginBottom: 20 }} />
            </View>
          );
        })}
      <TouchableOpacity
        style={{
          backgroundColor: hasSavedData ? "#c42d2d" : "#d1d1d1",
          borderRadius: 20,
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={() => showClearDataAlert()}
        disabled={!hasSavedData}
      >
        <Text
          style={{ color: hasSavedData ? "#fff" : "#e6e6e6", fontSize: 17 }}
        >
          Clear Data
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Settings;
