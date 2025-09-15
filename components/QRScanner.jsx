import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Box } from "@react-native-material/core";
import moment from "moment/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { StoreScanned, CurrentSettings } from "../store/actions";
import { defaultSettings } from "../constants/settings";
import Icon from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const QRScannner = ({ navigation }) => {
  const { navigate } = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [previousTimeIn, setPreviousTimeIn] = useState("");
  const currentSettings = useSelector(
    (state) => state.ScannedReducer.defaultSettings
  );
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [tmpAwardees, setTmpAwardees] = useState([]);
  const [onFetchProgress, setOnFetchProgress] = useState(false);
  const dispatch = useDispatch();

  const getMatchSetting = (title, str) => {
    switch (title) {
      case "A-B":
        return str.match(/[^a-b]/g);
      case "C-E":
        return str.match(/[^c-e]/g);
      case "F-L":
        return str.match(/[^f-l]/g);
      case "M-R":
        return str.match(/[^m-r]/g);
      case "S-Z":
        return str.match(/[^s-z]/g);
    }
  };

  const showClearDataAlert = () => {
    Alert.alert(
      "Alert",
      "Please set-up your settings first.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            navigate("Settings");
          },
        },
      ],
      { cancelable: false }
    );
  };

  function defined(obj) {
    return obj !== null && obj !== undefined;
  }

  if (defined(currentSettings) && !loaded) {
    const tmpSettings = JSON.parse(currentSettings);
    setLoaded(true);
    setSettings([...tmpSettings]);
  }

  const fetchAwardees = async () => {
    setOnFetchProgress(true);
    const jsonAwardeesRaw = await AsyncStorage.getItem("awardeesRaw");
    let resData = [];

    if (jsonAwardeesRaw === null) {
      const response = await fetch(
        `https://api.leuteriorealty.com/natcon/v1/public/api/get-awardees`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer 3|laravel_sanctum_r742RP3AZ13Sooms9CxUIuXIqOzySm7lzWXkiL5298529448`,
            "Content-Type": "application/json",
          },
        }
      );
      resData = await response.json();
      const jsonAwardeesStr = JSON.stringify(resData);

      await AsyncStorage.setItem("awardeesRaw", jsonAwardeesStr);
    } else {
      resData = JSON.parse(jsonAwardeesRaw);
    }

    const actualData = resData.map((el, idx) => {
      return {
        ...el,
        timeIn: "",
        vvip: el?.vvip === 1,
        photo: `https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/${el.photo}`,
      };
    });

    setTmpAwardees(actualData);
    setOnFetchProgress(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setPreviousTimeIn("");
      setScanned(true);
      setHasPermission(false);
      setLoaded(false);
      dispatch(CurrentSettings());
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    });

    fetchAwardees();

    return unsubscribe;
  }, [navigation]);

  const registrationQR = async (data) => {
    const result = data.split("|");

    try {
      if (result.length > 0) {
        const index = parseInt(result[result.length - 1]);
        const res = tmpAwardees.find((obj) => obj.id === index);

        if (res !== null) {
          const settingIdx = settings.findIndex((obj) => obj.active === true);
          setScanned(true);

          if (settingIdx > -1) {
            if (settings[settingIdx].title === "VVIP") {
              const isVVIP = res.vvip;

              if (!isVVIP) {
                alert(`This Station is for VVIP only!`);
                setScannedData(null);
                return true;
              }
            } else {
              const isVVIP = res.vvip;

              if (res.team !== "Guest") {
                const setting = settings[settingIdx].title;
                const str = res.lastName[0].toLowerCase();
                const match = getMatchSetting(setting, str) === null;

                if (!match || isVVIP) {
                  alert(`This Station is for ${setting} only!`);
                  setScannedData(null);
                  return true;
                }
              } else {
                if (isVVIP) {
                  const setting = settings[settingIdx].title;
                  alert(`This Station is for ${setting} only!`);
                  setScannedData(null);
                  return true;
                }
              }
            }
          }

          res.timeIn = moment().format("lll");
          setPreviousTimeIn("");

          const jsonAwardees = await AsyncStorage.getItem("awardees");
          let jsonInit = [];

          if (jsonAwardees !== null) {
            const tmpAwardees = JSON.parse(jsonAwardees);
            const tmpIndex = tmpAwardees.findIndex((obj) => obj.id === index);

            if (tmpIndex > -1) {
              setPreviousTimeIn(tmpAwardees[tmpIndex].timeIn);
              tmpAwardees[tmpIndex].timeIn = moment().format("lll");
            } else {
              tmpAwardees.push(res);
            }

            jsonInit = [...tmpAwardees];
          } else {
            jsonInit.push(res);
          }

          const jsonAwardeesStr = JSON.stringify(jsonInit);
          await AsyncStorage.setItem("awardees", jsonAwardeesStr);

          setScannedData(res);
          return true;
        }
      }
    } catch (err) {
      alert(`Invalid QR Code!`);
      setScannedData(null);
    }
  };

  const photoBoothQR = async (data) => {
    try {
      setPreviousTimeIn("");
      setScanned(true);

      const jsonPhotoBoothAwardees = await AsyncStorage.getItem(
        "photoBoothAwardees"
      );
      const res = {
        id: 0,
        name: data,
        timeIn: moment().format("lll"),
      };

      let jsonInit = [];

      if (jsonPhotoBoothAwardees !== null) {
        const tmpAwardees = JSON.parse(jsonPhotoBoothAwardees);
        const tmpIndex = tmpAwardees.findIndex((obj) => obj.name === res.name);

        if (tmpIndex > -1) {
          setPreviousTimeIn(tmpAwardees[tmpIndex].timeIn);
          tmpAwardees[tmpIndex].timeIn = moment().format("lll");
        } else {
          let lastIndex = tmpAwardees.length - 1;

          res.id = lastIndex++;
          res.timeIn = moment().format("lll");

          tmpAwardees.push(res);
        }

        jsonInit = [...tmpAwardees];
      } else {
        jsonInit.push(res);
      }

      const jsonPhotoBoothAwardeesStr = JSON.stringify(jsonInit);
      await AsyncStorage.setItem(
        "photoBoothAwardees",
        jsonPhotoBoothAwardeesStr
      );

      setScannedData(res);

      return true;
    } catch (err) {
      alert("Invalid QR Code!");
      setScannedData(null);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    const scannedStr = data.split("-");
    const charChecker = scannedStr[scannedStr.length - 1];
    const isRegistration = charChecker !== "pb";

    if (isRegistration) {
      registrationQR(data);
    } else {
      if (charChecker === "pb") {
        console.log(scannedStr[0]);

        photoBoothQR(scannedStr[0]);
      } else {
        alert("Invalid QR Code!");
      }
    }
  };

  const handleStartScan = () => {
    const activeSettings = settings.some((obj) => obj.active === true);

    if (!activeSettings) {
      showClearDataAlert();

      return true;
    }

    setScanned(false);
    setPreviousTimeIn("");
  };

  if (hasPermission === null) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, textAlign: "center" }}>
          Requesting for camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, textAlign: "center" }}>
          No access to camera.
        </Text>
      </View>
    );
  }

  return (
    <>
      {onFetchProgress ? (
        <>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              Getting data ready...
            </Text>
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {scanned && scannedData !== null && (
              <View>
                <Image
                  style={{
                    resizeMode: "contain",
                    height: 380,
                    width: 360,
                  }}
                  height={380}
                  width={360}
                  source={{ uri: scannedData.photo }}
                />
                <Box style={{ marginTop: 0 }}>
                  <Box
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 25,
                        textAlign: "center",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        color: "#ffdc73",
                        borderBottomColor: "#ffdc73",
                        borderBottomWidth: 4,
                        paddingBottom: 10,
                        marginBottom: 10,
                      }}
                    >
                      {scannedData?.firstName ?? scannedData?.name}{" "}
                      {scannedData?.lastName ?? ""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        textAlign: "center",
                        color: "#ffdc73",
                        fontWeight: "bold",
                      }}
                    >
                      {scannedData.team === "Guest"
                        ? "GUEST"
                        : "NATIONAL AWARDEE"}
                      {scannedData.vvip ? " VVIP" : ""}
                      {"\n\n"}
                      {/* Table# {scannedData.seatNumber} */}
                    </Text>
                  </Box>
                </Box>
              </View>
            )}
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={!scanned ? StyleSheet.absoluteFillObject : null}
            />
          </View>
          {previousTimeIn !== "" && (
            <Box style={{ padding: 15, backgroundColor: "gray" }}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Already Scanned on {previousTimeIn}
              </Text>
            </Box>
          )}
          {scanned ? (
            <TouchableOpacity
              style={{ padding: 20, backgroundColor: "#ffdc73" }}
              onPress={handleStartScan}
            >
              <Text
                style={{
                  color: "#000",
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                TAP HERE TO SCAN <Icon name="scan-sharp" size={15} />
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ padding: 20, backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              onPress={() => {
                setScanned(true);
                setPreviousTimeIn("");
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                STOP SCANNING <Icon name="stop-sharp" size={15} />
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
};

export default QRScannner;
