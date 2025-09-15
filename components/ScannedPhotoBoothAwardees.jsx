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
import { Table, Row } from "react-native-reanimated-table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

const ScannedPhotoBoothAwardees = () => {
  const columns = ["Name", "Time In"];
  const [refreshing, setRefreshing] = useState(true);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAwardees = async () => {
    const data = await AsyncStorage.getItem("photoBoothAwardees");

    if (data !== null) {
      const tmpScanned = JSON.parse(data);
      const sortedRows = tmpScanned.sort((a, b) => b.name - a.name);
      const tmpRows = sortedRows.map((res) => {
        return [`${res.name.toUpperCase()}`, res.timeIn];
      });
      setRows(tmpRows);
      setFilteredRows(tmpRows);
    }

    setRefreshing(false);
  };

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

  const handleCopyStr = async (str) => {
    Clipboard.setStringAsync(str);
    Alert.alert("Copied to clipboard!", str);
  };

  const onRefresh = useCallback(() => {
    fetchAwardees();
  }, []);

  const renderRow = (rowData, index) => {
    return (
      <Row
        key={index}
        data={[
          <TouchableOpacity onPress={() => handleCopyStr(rowData[0])}>
            <Text style={styles.text}>{rowData[0]}</Text>
          </TouchableOpacity>,
          ...rowData.slice(1).map((cellData, cellIndex) => (
            <Text key={cellIndex} style={styles.text}>
              {cellData}
            </Text>
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
      <Text style={{ marginVertical: 10 }}>{`Total: ${rows.length}`}</Text>
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
};

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

export default ScannedPhotoBoothAwardees;
