import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ImageBackground, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LectureManagementScreen = ({ navigation }) => {
  const [lectures, setLectures] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [newLecture, setNewLecture] = useState({ lectureName: '', instructorID: '', lectureDate: '', lectureTime: '', location: '', capacity: '', facilityID: '', poolID: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [facilityModalVisible, setFacilityModalVisible] = useState(false);
  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');

  useEffect(() => {
    fetchLectures();
    fetchInstructors();
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

  const fetchLectures = async () => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        const response = await axios.get(`http://localhost:3000/lectures/${parsedPoolData.poolID}`);
        setLectures(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        const response = await axios.get(`http://localhost:3000/users/instructors/${parsedPoolData.poolID}`);
        setInstructors(response.data);
      }
    } catch (error) {
      console.error(error);
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
      await axios.post('http://localhost:3000/lectures', newLecture);
      Alert.alert('강의가 추가되었습니다!');
      setNewLecture({ lectureName: '', instructorID: '', lectureDate: '', lectureTime: '', location: '', capacity: '', facilityID: '', poolID: '' });
      fetchLectures();
    } catch (error) {
      console.error(error);
      Alert.alert('강의 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteLecture = async (id) => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        await axios.delete(`http://localhost:3000/lectures/${id}/${parsedPoolData.poolID}`);
        Alert.alert('강의가 삭제되었습니다!');
        fetchLectures();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('강의 삭제 중 오류가 발생했습니다.');
    }
  };

  const selectInstructor = (id) => {
    setNewLecture({ ...newLecture, instructorID: id });
    setModalVisible(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // 날짜 부분만 추출
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>강의 관리</Text>
        <FlatList
          data={lectures}
          keyExtractor={(item) => item.lectureID.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>강의명: {item.lectureName}</Text>
              <Text>강사: {item.instructorID}</Text>
              <Text>강의날짜: {formatDate(item.lectureDate)} </Text>
              <Text>강의시간: {item.lectureTime}</Text>
              <Text>강의 위치: {item.location}</Text>
              <Text>정원: {item.reservedCount}/{item.capacity}</Text>
              <Button title="삭제" onPress={() => handleDeleteLecture(item.lectureID)} />
            </View>
          )}
        />
        <TextInput
          style={styles.input}
          placeholder="강의 이름"
          value={newLecture.lectureName}
          onChangeText={(text) => setNewLecture({ ...newLecture, lectureName: text })}
        />
        <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
          <Text>{newLecture.instructorID ? newLecture.instructorID : '강사 선택'}</Text>
        </TouchableOpacity>
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
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>강사 선택</Text>
              <FlatList
                data={instructors}
                keyExtractor={(item) => item.userID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.instructorItem} onPress={() => selectInstructor(item.userID)}>
                    <Text>{item.userName}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="취소" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

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

export default LectureManagementScreen;
