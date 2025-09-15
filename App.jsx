import "react-native-gesture-handler";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import QRScannner from "./components/QRScanner";
import ScannedAwardees from "./components/ScannedAwardees";
import ScannedPhotoBoothAwardees from "./components/ScannedPhotoBoothAwardees";
import Awardees from "./components/Awardees";
import Settings from "./components/Settings";
import { Provider } from "react-redux";
import { store } from "./store/index";

const Drawer = createDrawerNavigator();

const ThemeProvider = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer theme={ThemeProvider}>
        <Drawer.Navigator initialRouteName="QR Scanner">
          <Drawer.Screen
            name="QR Scanner"
            component={QRScannner}
            options={{
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="Scanned Registration"
            component={ScannedAwardees}
            options={{
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="Scanned Photobooth"
            component={ScannedPhotoBoothAwardees}
            options={{
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="List of Awardees"
            component={Awardees}
            options={{
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="Settings"
            component={Settings}
            options={{
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
