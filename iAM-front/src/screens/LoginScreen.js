import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '../storage';

const LoginScreen = ({ navigation }) => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/users/login', {
        userID,
        password
      });
      const { role, poolID, poolName } = response.data;

      // Save userID, role, and poolData to storage
      await AsyncStorage.setItem('userID', JSON.stringify({ userID }));
      await AsyncStorage.setItem('role', JSON.stringify({ role }));
      await AsyncStorage.setItem('poolData', JSON.stringify({ poolID, poolName }));

      // Logging for debugging
      console.log('Login successful:', response.data);
      console.log('Navigating to appropriate main page based on role');

      // Navigate to appropriate main page based on role
      if (role === 'member') {
        console.log('Navigating to MemberMainPage');
        navigation.navigate('MemberMainPage');
      } else if (role === 'admin') {
        console.log('Navigating to AdminMainPage');
        navigation.navigate('AdminMainPage');
      } else if (role === 'instructor') {
        console.log('Navigating to InstructorMainPage');
        navigation.navigate('InstructorMainPage');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Login Failed", "Check your credentials");
    }
  };

  return (
    <ImageBackground source={require('../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          value={userID}
          onChangeText={setUserID}
          placeholder="ID"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={true}
        />
        <Button title="로그인" onPress={handleLogin} />
        <Button title="회원가입" onPress={() => navigation.navigate('Register')} />
        <Button title="아이디찾기" onPress={() => navigation.navigate('FindUsername')} />
        <Button title="비밀번호찾기" onPress={() => navigation.navigate('ResetPassword')} />
        <Button title="신규 수영장 신청" onPress={() => navigation.navigate('AddPool')} />
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
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
});

export default LoginScreen;
