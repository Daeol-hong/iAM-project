import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, Alert, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddLecturePage = ({ navigation }) => {
  const [newLecture, setNewLecture] = useState({
    lectureName: '',
    instructorID: '',
    lectureDate: '',
    lectureTime: '',
    location: '',
    capacity: '',
    facilityID: '',
    poolID: ''
  });
  const [facilities, setFacilities] = useState([]);
  const [facilityModalVisible, setFacilityModalVisible] = useState(false);
  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');

  useEffect(() => {
    fetchFacilities();
    getLoggedInInstructorID();
  }, []);

  const getLoggedInInstructorID = async () => {
    try {
      const instructorData = await AsyncStorage.getItem('userID');
      const poolData = await AsyncStorage.getItem('poolData');
      if (instructorData && poolData) {
        const parsedInstructorData = JSON.parse(instructorData);
        const parsedPoolData = JSON.parse(poolData);
        const instructorID = parsedInstructorData.userID;
        const poolID = parsedPoolData.poolID;
        setNewLecture(prevState => ({ ...prevState, instructorID, poolID }));
      }
    } catch (error) {
      console.error('Error fetching instructor ID:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        const response = await axios.get(`http://localhost:3000/facilities/${parsedPoolData.poolID}`);
        setFacilities(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLecture = async () => {
    try {
      const lectureData = {
        ...newLecture,
        lectureDate: newLecture.lectureDate,
        lectureTime: newLecture.lectureTime
      };
      await axios.post('http://localhost:3000/lectures', lectureData);
      Alert.alert('강의가 추가되었습니다!');
      setNewLecture({ lectureName: '', instructorID: '', lectureDate: '', lectureTime: '', location: '', capacity: '', facilityID: '', poolID: '' });
      navigation.goBack();
    } catch (error) {
      console.error('강의 추가 중 오류가 발생했습니다.', error);
      Alert.alert('강의 추가 중 오류가 발생했습니다.');
    }
  };

  const selectFacility = (facility) => {
    setNewLecture({ ...newLecture, location: facility.name, facilityID: facility.facilityID });
    setFacilityModalVisible(false);
  };

  const showMode = (currentMode) => {
    setDateTimeModalVisible(true);
    setMode(currentMode);
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDateTimeModalVisible(Platform.OS === 'ios');
    setDate(currentDate);

    if (mode === 'date') {
      setNewLecture({ ...newLecture, lectureDate: currentDate.toISOString().split('T')[0] });
    } else {
      setNewLecture({ ...newLecture, lectureTime: currentDate.toTimeString().split(' ')[0] });
    }
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>강의 추가</Text>
        <TextInput
          style={styles.input}
          placeholder="강의 이름"
          value={newLecture.lectureName}
          onChangeText={(text) => setNewLecture({ ...newLecture, lectureName: text })}
        />
        <Text style={styles.input}>{newLecture.instructorID ? `강사 ID: ${newLecture.instructorID}` : '강사 선택 중...'}</Text>
        <TouchableOpacity style={styles.input} onPress={() => showMode('date')}>
          <Text>{newLecture.lectureDate ? newLecture.lectureDate : '날짜 선택'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.input} onPress={() => showMode('time')}>
          <Text>{newLecture.lectureTime ? newLecture.lectureTime : '시간 선택'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.input} onPress={() => setFacilityModalVisible(true)}>
          <Text>{newLecture.location ? newLecture.location : '위치 선택'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="정원"
          value={newLecture.capacity}
          onChangeText={(text) => setNewLecture({ ...newLecture, capacity: text })}
        />
        <Button title="강의 추가" onPress={handleAddLecture} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={facilityModalVisible}
          onRequestClose={() => setFacilityModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>위치 선택</Text>
              <FlatList
                data={facilities}
                keyExtractor={(item) => item.facilityID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.instructorItem} onPress={() => selectFacility(item)}>
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="취소" onPress={() => setFacilityModalVisible(false)} />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={dateTimeModalVisible}
          onRequestClose={() => setDateTimeModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                display="default"
                onChange={onChange}
              />
              <Button title="완료" onPress={() => setDateTimeModalVisible(false)} />
            </View>
          </View>
        </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10
  },
  instructorItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    width: '100%',
    alignItems: 'center'
  }
});

export default AddLecturePage;
