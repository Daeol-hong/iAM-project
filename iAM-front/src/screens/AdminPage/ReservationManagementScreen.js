import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ImageBackground, Alert, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReservationManagementScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [poolID, setPoolID] = useState('');
  const [newReservation, setNewReservation] = useState({
    userID: '',
    reservationDate: '',
    reservationTime: '',
    reservationArea: '',
    lectureID: '',
    poolID: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [lectureModalVisible, setLectureModalVisible] = useState(false);

  useEffect(() => {
    fetchPoolID();
  }, []);

  useEffect(() => {
    if (poolID) {
      fetchReservations();
      fetchLectures();
      fetchUsers();
      fetchFacilities();
    }
  }, [poolID]);

  const fetchPoolID = async () => {
    try {
      const poolData = await AsyncStorage.getItem('poolData');
      if (poolData) {
        const parsedPoolData = JSON.parse(poolData);
        setPoolID(parsedPoolData.poolID);
      }
    } catch (error) {
      console.error('Error fetching pool ID:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/reservations/${poolID}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/lectures/${poolID}`);
      setLectures(response.data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/members/${poolID}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/facilities/${poolID}`);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleAddReservation = async () => {
    try {
      const now = new Date();
      const reservationData = {
        ...newReservation,
        reservationDate: now.toISOString().split('T')[0],
        reservationTime: now.toTimeString().split(' ')[0],
        poolID
      };
      await axios.post('http://localhost:3000/reservations/create', reservationData);
      Alert.alert('예약이 추가되었습니다!');
      setNewReservation({
        userID: '',
        reservationDate: '',
        reservationTime: '',
        reservationArea: '',
        lectureID: '',
      });
      fetchReservations();
    } catch (error) {
      console.error('예약 추가 중 오류가 발생했습니다.', error);
      Alert.alert('예약 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteReservation = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/reservations/cancel/${id}?poolID=${poolID}`);
      Alert.alert('예약이 삭제되었습니다!');
      fetchReservations();
    } catch (error) {
      console.error('예약 삭제 중 오류가 발생했습니다.', error);
      Alert.alert('예약 삭제 중 오류가 발생했습니다.');
    }
  };

  const selectUser = (userID) => {
    setNewReservation({ ...newReservation, userID });
    setModalVisible(false);
  };

  const selectLecture = (lecture) => {
    setNewReservation({
      ...newReservation,
      lectureID: lecture.lectureID,
      reservationArea: lecture.location,
    });
    setLectureModalVisible(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // 날짜 부분만 추출
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>예약 관리</Text>
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.reservationID.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>예약자: {item.userID}</Text>
              <Text>예약날짜: {formatDate(item.reservationDate)}</Text>
              <Text>예약시간: {item.reservationTime}</Text>
              <Text>강의날짜: {formatDate(item.lectureDate)}</Text>
              <Text>강의시간: {item.lectureTime}</Text>
              <Text>강의 장소: {item.location}</Text>
              <Text>강의명: {item.lectureName}</Text>
              <Button title="삭제" onPress={() => handleDeleteReservation(item.reservationID)} />
            </View>
          )}
        />
        <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
          <Text>{newReservation.userID ? newReservation.userID : '사용자 선택'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.input} onPress={() => setLectureModalVisible(true)}>
          <Text>{newReservation.lectureID ? `강의 ID: ${newReservation.lectureID}` : '강의 선택'}</Text>
        </TouchableOpacity>
        <Button title="예약 추가" onPress={handleAddReservation} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>사용자 선택</Text>
              <FlatList
                data={users}
                keyExtractor={(item) => item.userID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.instructorItem} onPress={() => selectUser(item.userID)}>
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
          visible={lectureModalVisible}
          onRequestClose={() => setLectureModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>강의 선택</Text>
              <FlatList
                data={lectures}
                keyExtractor={(item) => item.lectureID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.instructorItem} onPress={() => selectLecture(item)}>
                    <Text>강의명: {item.lectureName}</Text>
                    <Text>강의 날짜: {formatDate(item.lectureDate)}</Text>
                    <Text>강의 시간: {item.lectureTime}</Text>
                    <Text>강사: {item.instructorID}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="취소" onPress={() => setLectureModalVisible(false)} />
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
    borderWidth: 1,
    borderColor: 'gray',
    width: '100%',
    alignItems: 'center'
  }
});

export default ReservationManagementScreen;
