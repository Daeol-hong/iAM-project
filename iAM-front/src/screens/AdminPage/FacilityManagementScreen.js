import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ImageBackground, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FacilityManagementScreen = ({ navigation }) => {
  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState({ name: '', location: '', poolID: '' });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getPoolID();
  }, []);

  useEffect(() => {
    if (newFacility.poolID) {
      fetchFacilities();
    }
  }, [newFacility.poolID]);

  const getPoolID = async () => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        setNewFacility(prevState => ({ ...prevState, poolID: parsedPoolData.poolID }));
      }
    } catch (error) {
      console.error('Error fetching pool ID:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/facilities/${newFacility.poolID}`);
      setFacilities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFacility = async () => {
    try {
      await axios.post('http://localhost:3000/facilities', newFacility);
      Alert.alert('시설이 추가되었습니다!');
      setNewFacility({ name: '', location: '', poolID: newFacility.poolID });
      fetchFacilities();
    } catch (error) {
      console.error(error);
      Alert.alert('시설 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteFacility = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/facilities/${id}`);
      Alert.alert('시설이 삭제되었습니다!');
      fetchFacilities();
    } catch (error) {
      console.error(error);
      Alert.alert('시설 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>시설 관리</Text>
        <FlatList
          data={facilities}
          keyExtractor={(item) => item.facilityID.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.name} - {item.location}</Text>
              <Button title="삭제" onPress={() => handleDeleteFacility(item.facilityID)} />
            </View>
          )}
        />
        <TextInput
          style={styles.input}
          placeholder="시설 이름"
          value={newFacility.name}
          onChangeText={(text) => setNewFacility({ ...newFacility, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="시설 위치"
          value={newFacility.location}
          onChangeText={(text) => setNewFacility({ ...newFacility, location: text })}
        />
        <Button title="시설 추가" onPress={handleAddFacility} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  item: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default FacilityManagementScreen;
