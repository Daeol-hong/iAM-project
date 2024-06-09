import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '../../storage';

const InstructorScheduleScreen = () => {
  const [schedule, setSchedule] = useState([]);
  const [userId, setUserId] = useState(null);
  const [poolID, setPoolID] = useState(null);

  useEffect(() => {
    console.log('InstructorScheduleScreen 마운트됨'); // 마운트 확인을 위한 로그 추가
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
        console.error('userID 또는 poolID 로딩 오류:', error);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    console.log('userId:', userId); // userId 로그 추가
    console.log('poolID:', poolID); // poolID 로그 추가
    if (userId && poolID) {
      console.log('fetchSchedule 호출됨'); // fetchSchedule 호출 확인을 위한 로그 추가
      fetchSchedule(userId, poolID);
    }
  }, [userId, poolID]);

  const fetchSchedule = async (instructorID, poolID) => {
    try {
      const response = await axios.get(`http://localhost:3000/schedule/instructor/${encodeURIComponent(instructorID)}/${encodeURIComponent(poolID)}`);
      setSchedule(response.data);
      console.log('로딩된 스케줄:', response.data); // 디버깅 출력
    } catch (error) {
      console.error('스케줄 로딩 오류:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // 날짜 부분만 추출
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[1].split('.')[0]; // 시간 부분만 추출
  };

  return (
    <ImageBackground source={require('../../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>강사 스케줄</Text>
        <FlatList
          data={schedule}
          keyExtractor={(item) => item.lectureID.toString()}
          renderItem={({ item }) => (
            <View style={styles.lecture}>
              <Text style={styles.lectureText}>강의명: {item.lectureName}</Text>
              <Text style={styles.lectureText}>날짜: {formatDate(item.lectureDate)}</Text>
              <Text style={styles.lectureText}>시간: {item.lectureTime}</Text>
              <Text style={styles.lectureText}>위치: {item.location}</Text>
              <Text style={styles.lectureText}>정원: {item.reservedCount}/{item.capacity}</Text>
            </View>
          )}
          style={styles.list}
        />
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
});

export default InstructorScheduleScreen;
