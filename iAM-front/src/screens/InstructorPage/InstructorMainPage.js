import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '../../storage';

const InstructorMainPage = ({ navigation }) => {
  const [poolName, setPoolName] = useState('');

  useEffect(() => {
    const fetchPoolName = async () => {
      try {
        const storedPoolData = await AsyncStorage.getItem('poolData');
        if (storedPoolData) {
          const parsedData = JSON.parse(storedPoolData);
          setPoolName(parsedData.poolName);
          console.log('Loaded pool name:', parsedData.poolName);
        }
      } catch (error) {
        console.error('Failed to load pool name:', error);
      }
    };

    fetchPoolName();
  }, []);

  return (
    <ImageBackground 
      source={require('../../../assets/aquaBackground.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>i AM</Text>
        <Text style={styles.subtitle}>Aqua Monitor</Text>
        {poolName ? <Text style={styles.poolName}>'{poolName}'에 어서오세요!</Text> : null}
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.navigate('InstructorScheduleScreen')}
          >
            <FontAwesome name="calendar" size={30} color="#fff" />
            <Text style={styles.menuText}>강의 스케줄</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.navigate('AddLecturePage')}
          >
            <FontAwesome name="plus" size={30} color="#fff" />
            <Text style={styles.menuText}>강의 추가</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '90%'
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  poolName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  menuButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  menuText: {
    color: '#fff',
    marginTop: 5,
  },
});

export default InstructorMainPage;
