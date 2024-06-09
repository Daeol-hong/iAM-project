import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [userID, setUserID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [poolID, setPoolID] = useState('');
  const [poolName, setPoolName] = useState(''); // 선택한 수영장 이름
  const [pools, setPools] = useState([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [poolModalVisible, setPoolModalVisible] = useState(false);

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      const response = await axios.get('http://localhost:3000/pools');
      setPools(response.data);
      console.log(pools);
    } catch (error) {
      console.error('수영장 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  const validateInput = () => {
    if (password.length < 8) {
      Alert.alert("검증 오류", "비밀번호는 최소 8자 이상이어야 합니다.");
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert("검증 오류", "유효한 이메일 주소를 입력해주세요.");
      return false;
    }
    if (poolID === '') {
      Alert.alert("검증 오류", "수영장을 선택해주세요.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInput()) return;
    try {
      const response = await axios.post('http://localhost:3000/users/register', {
        userID,
        password,
        role,
        age,
        phone,
        userName: username,
        email,
        poolID
      });
      console.log(response.data);
      Alert.alert("회원가입이 완료되었습니다.");
      navigation.navigate('Login');
    } catch (error) {
      if(error.response.status === 400){
        Alert.alert("이미 존재하는 아이디입니다!");
      }
      else{
        Alert.alert("회원가입에 실패했습니다.", error.message);
      }
    }
  };

  return (
    <ImageBackground source={require('../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>회원가입</Text>
        <TextInput
          style={styles.input}
          value={userID}
          onChangeText={setUserID}
          placeholder="아이디"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
        />
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="나이"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="이름"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="전화번호"
        />

        <TouchableOpacity style={styles.roleButton} onPress={() => setRoleModalVisible(true)}>
          <Text style={styles.roleButtonText}>역할: {role}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleButton} onPress={() => setPoolModalVisible(true)}>
          <Text style={styles.roleButtonText}>{poolName ? `수영장: ${poolName}` : '수영장 선택'}</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={roleModalVisible}
          animationType="slide"
          onRequestClose={() => setRoleModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>역할을 선택해주세요</Text>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="회원" value="member" />
                <Picker.Item label="관리자" value="admin" />
                <Picker.Item label="강사" value="instructor" />
              </Picker>
              <Button title="완료" onPress={() => setRoleModalVisible(false)} />
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={poolModalVisible}
          animationType="slide"
          onRequestClose={() => setPoolModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>수영장을 선택해주세요</Text>
              <FlatList
                data={pools}
                keyExtractor={(item) => item.poolID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.poolItem} onPress={() => {
                    setPoolID(item.poolID);
                    setPoolName(item.poolName); // 선택한 수영장 이름 설정
                    setPoolModalVisible(false);
                  }}>
                    <Text>{item.poolName}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="완료" onPress={() => setPoolModalVisible(false)} />
            </View>
          </View>
        </Modal>

        <Button title="회원가입" onPress={handleRegister} />
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
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
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
  roleButton: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  poolItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    width: '100%',
    alignItems: 'center'
  },
});

export default RegisterScreen;
