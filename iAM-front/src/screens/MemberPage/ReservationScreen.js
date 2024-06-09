import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, Alert, TouchableOpacity, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '../../storage';
import moment from 'moment-timezone';

const ReservationScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [userId, setUserId] = useState(null);
  const [poolID, setPoolID] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userIDData = await AsyncStorage.getItem('userID');
        const poolData = await AsyncStorage.getItem('poolData');
        if (userIDData && poolData) {
          const parsedUserIDData = JSON.parse(userIDData);
          const parsedPoolData = JSON.parse(poolData);
          setUserId(parsedUserIDData.userID);
          setPoolID(parsedPoolData.poolID);
          console.log('로딩된 userID:', parsedUserIDData.userID);
          console.log('로딩된 poolID:', parsedPoolData.poolID);
        } else {
          console.log('userID 또는 poolID를 찾을 수 없음');
        }
      } catch (error) {
        console.error('userID 또는 poolID 로드 오류:', error);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (userId && poolID) {
      fetchAvailableLectures(userId, poolID);
      fetchReservations(userId, poolID);
    }
  }, [userId, poolID]);

  const fetchReservations = async (userId, poolID) => {
    try {
      const response = await axios.get(`http://localhost:3000/reservations/${userId}`);
      setReservations(response.data);
      console.log('예약 목록 로드됨:', response.data);
    } catch (error) {
      console.error('예약 로딩 오류:', error);
    }
  };

  const fetchAvailableLectures = async (userId, poolID) => {
    try {
      const response = await axios.get(`http://localhost:3000/lectures/available-lectures/${userId}/${poolID}`);
      setLectures(response.data);
      console.log('강의 목록 로드됨:', response.data);
    } catch (error) {
      console.error('강의 로딩 오류:', error);
    }
  };

  const handleCreateReservation = async (lecture) => {
    try {
      const koreaTime = moment().tz('Asia/Seoul');
      const formattedDate = koreaTime.format('YYYY-MM-DD');
      const formattedTime = koreaTime.format('HH:mm:ss');

      await axios.post('http://localhost:3000/reservations/create', {
        userID: userId,
        reservationDate: formattedDate,
        reservationTime: formattedTime,
        lectureID: lecture.lectureID,
        poolID: poolID
      });
      Alert.alert('예약이 생성되었습니다!');
      fetchReservations(userId, poolID);
      fetchAvailableLectures(userId, poolID);  // 예약이 추가된 후에 강의 목록을 다시 로드
    } catch (error) {
      console.error('예약 생성 오류:', error);
      Alert.alert('예약 생성 오류.');
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/reservations/cancel/${id}?poolID=${poolID}`);
      Alert.alert('예약이 취소되었습니다!');
      fetchReservations(userId, poolID);
      fetchAvailableLectures(userId, poolID);  // 예약이 취소된 후에 강의 목록을 다시 로드
    } catch (error) {
      console.error('예약 취소 오류:', error);
      Alert.alert('예약 취소 오류.');
    }
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>이용 가능한 강의</Text>
        {lectures.length === 0 ? (
          <Text style={styles.emptyText}>이용 가능한 강의가 없습니다.</Text>
        ) : (
          <FlatList
            data={lectures}
            keyExtractor={(item) => item.lectureID.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.lecture} onPress={() => handleCreateReservation(item)}>
                <Text style={styles.lectureText}>수업명: {item.lectureName}</Text>
                <Text style={styles.lectureText}>강사: {item.instructorID}</Text>
                <Text style={styles.lectureText}>시간: {item.lectureTime}</Text>
                <Text style={styles.lectureText}>강의장소: {item.location}</Text>
                <Text style={styles.lectureText}>정원: {item.reservedCount}/{item.capacity}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
          />
        )}

        <Text style={styles.title}>당신의 예약</Text>
        {reservations.length === 0 ? (
          <Text style={styles.emptyText}>예약된 강의가 없습니다.</Text>
        ) : (
          <FlatList
            data={reservations}
            keyExtractor={(item) => item.reservationID.toString()}
            renderItem={({ item }) => (
              <View style={styles.reservation}>
                <Text style={styles.reservationText}>수업명: {item.lectureName}</Text>
                <Text style={styles.reservationText}>강사: {item.instructorName}</Text>
                <Text style={styles.reservationText}>시간: {item.lectureTime}</Text>
                <Text style={styles.reservationText}>강의장소: {item.location}</Text>
                <Text style={styles.reservationText}>정원: {item.reservedCount}/{item.capacity}</Text>
                <Button title="취소" onPress={() => handleCancelReservation(item.reservationID)} />
              </View>
            )}
            style={styles.list}
          />
        )}
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
  list: {
    marginBottom: 20,
  },
  lecture: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  lectureText: {
    fontSize: 16,
    color: '#333',
  },
  reservation: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reservationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReservationScreen;
