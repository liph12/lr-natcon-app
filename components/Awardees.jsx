import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Table, Row, Rows } from "react-native-reanimated-table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment/moment";

export default function Awardees() {
  const columns = ["Id", "Name", "Team"];
  const [awardees, setAwardees] = useState([]);
  const [scannedAwardees, setScannedAwardees] = useState([]);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAwardees = async () => {
    setRefreshing(true);
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

    const jsonScannedAwardees = await AsyncStorage.getItem("awardees");
    if (jsonScannedAwardees !== null) {
      const scannedAwardeesData = JSON.parse(jsonScannedAwardees);

      setScannedAwardees(scannedAwardeesData);
    }

    const awardeesData = resData.map((el, idx) => {
      return {
        ...el,
        vvip: el?.vvip === 1,
        qrCode: `https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/${el.qrCode}`,
        photo: `https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/${el.photo}`,
      };
    });

    const awardeeRows = resData.map((el, idx) => {
      return [
        el?.id,
        `${el?.lastName.toUpperCase()}, ${el?.firstName.toUpperCase()}`,
        el?.team,
      ];
    });

    setAwardees(awardeesData);
    setRows(awardeeRows);
    setFilteredRows(awardeeRows);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    fetchAwardees();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    const filtered = rows.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredRows(filtered);
  };

  const updateAwardees = async (data) => {
    let exists = null;
    const jsonAwardees = await AsyncStorage.getItem("awardees");
    const tmpAwardee = awardees.find((awardee) => awardee.id === data[0]);

    const res = {
      ...tmpAwardee,
      timeIn: moment().format("lll"),
    };

    let jsonInit = [];

    if (jsonAwardees !== null) {
      const tmpAwardees = JSON.parse(jsonAwardees);
      const tmpIndex = tmpAwardees.findIndex((obj) => obj.id === res.id);

      if (tmpIndex > -1) {
        exists = tmpAwardees[tmpIndex];
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

    return exists;
  };

  const updatePhotoboothAwardees = async (data) => {
    let exists = null;

    const jsonPhotoBoothAwardees = await AsyncStorage.getItem(
      "photoBoothAwardees"
    );
    const tmpAwardee = awardees.find((awardee) => awardee.id === data[0]);
    const res = {
      id: 0,
      name: `${tmpAwardee.firstName} ${tmpAwardee.lastName}`,
      timeIn: moment().format("lll"),
    };

    let jsonInit = [];

    if (jsonPhotoBoothAwardees !== null) {
      const tmpAwardees = JSON.parse(jsonPhotoBoothAwardees);
      const tmpIndex = tmpAwardees.findIndex((obj) => obj.name === res.name);

      if (tmpIndex > -1) {
        exists = tmpAwardees[tmpIndex];
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
    await AsyncStorage.setItem("photoBoothAwardees", jsonPhotoBoothAwardeesStr);

    return exists;
  };

  const handleIdPress = (data) => {
    Alert.alert(
      `${data[1]}`,
      `Select where to enter.`,
      [
        {
          text: "Registration",
          onPress: async () => {
            const exists = await updateAwardees(data);

            if (exists !== null) {
              alert(`Already scanned at \n${exists?.timeIn}`);
            } else {
              alert(`Awardee successfully entered.`);
            }
          },
        },
        {
          text: "Photobooth",
          onPress: async () => {
            const exists = await updatePhotoboothAwardees(data);

            if (exists !== null) {
              alert(`Already scanned at \n${exists?.timeIn}`);
            } else {
              alert(`Awardee successfully entered.`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderRow = (rowData, index) => {
    const exists = scannedAwardees.some((s) => s.id === rowData[0]);

    return (
      <Row
        key={index}
        data={[
          <TouchableOpacity
            onPress={() => handleIdPress(rowData)}
            style={{ backgroundColor: exists ? "red" : "none" }}
          >
            <Text style={[styles.text, { color: exists ? "#fff" : "#000" }]}>
              {rowData[0]}
            </Text>
          </TouchableOpacity>,
          ...rowData
            .slice(1)
            .map((cellData, cellIndex) => (
              <Text key={cellIndex}>{cellData}</Text>
            )),
        ]}
      />
    );
  };

  useEffect(() => {
    fetchAwardees();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ marginVertical: 10 }}>{`Total: ${awardees.length}`}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Table style={{ height: 600 }}>
        <Row data={columns} style={styles.head} textStyle={styles.text} />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Table borderStyle={{ borderWidth: 2, borderColor: "gray" }}>
            {filteredRows.map((rowData, index) => renderRow(rowData, index))}
          </Table>
        </ScrollView>
      </Table>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#ffdc73" },
  text: { margin: 6 },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
