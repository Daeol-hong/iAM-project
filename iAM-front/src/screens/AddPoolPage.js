import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground } from 'react-native';
import axios from 'axios';

const AddPoolPage = ({ navigation }) => {
  const [poolName, setPoolName] = useState('');
  const [poolAddress, setPoolAddress] = useState('');

  const handleAddPool = async () => {
    if (poolName === '' || poolAddress === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await axios.post('http://localhost:3000/pools/add', {
        name: poolName,
        address: poolAddress,
      });
      Alert.alert('Success', 'Pool added successfully');
      setPoolName('');
      setPoolAddress('');
      navigation.goBack(); // Return to previous screen
    } catch (error) {
      console.error('Error adding pool:', error);
      Alert.alert('Error', 'Failed to add pool');
    }
  };

  return (
    <ImageBackground source={require('../../assets/aquaBackground.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>신규 수영장 신청</Text>
        <TextInput
          style={styles.input}
          placeholder="Pool Name"
          value={poolName}
          onChangeText={setPoolName}
        />
        <TextInput
          style={styles.input}
          placeholder="Pool Address"
          value={poolAddress}
          onChangeText={setPoolAddress}
        />
        <Button title="Add Pool" onPress={handleAddPool} />
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
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
});

export default AddPoolPage;
