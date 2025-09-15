import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import { Table, Row, Rows } from "react-native-reanimated-table";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ScannedAwardees = () => {
  const columns = ["Name", "Time In"];
  const [refreshing, setRefreshing] = useState(true);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const compare = (a, b) => {
    if (a.lastName < b.lastName) {
      return -1;
    }
    if (a.lastName > b.lastName) {
      return 1;
    }
    return 0;
  };

  const fetchAwardees = async () => {
    const data = await AsyncStorage.getItem("awardees");

    if (data !== null) {
      const tmpScanned = JSON.parse(data);
      tmpScanned.sort(compare);
      const tmpRows = tmpScanned.map((res) => {
        return [
          `${res.lastName.toUpperCase()}, ${res.firstName.toUpperCase()}`,
          res.timeIn,
          // res.seatNumber ?? "",
        ];
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

  const onRefresh = useCallback(() => {
    fetchAwardees();
  }, []);

  useEffect(() => {
    fetchAwardees();
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={{ marginVertical: 10 }}
      >{`Total: ${filteredRows.length}`}</Text>
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
            <Rows data={filteredRows} textStyle={styles.text} />
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

export default ScannedAwardees;
