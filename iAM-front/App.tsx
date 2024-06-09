import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FindUsernameScreen from './src/screens/FindUsernameScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ReservationScreen from './src/screens/MemberPage/ReservationScreen';
import FacilityManagementScreen from './src/screens/AdminPage/FacilityManagementScreen';
import AdminMainPage from './src/screens/AdminPage/AdminMainPage';
import MemberMainPage from './src/screens/MemberPage/MemberMainPage';
import InstructorMainPage from './src/screens/InstructorPage/InstructorMainPage';
import InstructorScheduleScreen from './src/screens/InstructorPage/InstructorScheduleScreen';
import LectureManagementScreen from './src/screens/AdminPage/LectureManagementScreen';
import ReservationManagementScreen from './src/screens/AdminPage/ReservationManagementScreen';
import AddLecturePage from './src/screens/InstructorPage/AddLecturePage';
import AddPoolPage from './src/screens/AddPoolPage';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AddPool" component={AddPoolPage} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="FindUsername" component={FindUsernameScreen} />
        <Stack.Screen name="AdminMainPage" component={AdminMainPage} />
        <Stack.Screen name="MemberMainPage" component={MemberMainPage} />
        <Stack.Screen name="InstructorMainPage" component={InstructorMainPage} />
        <Stack.Screen name="FacilityManagement" component={FacilityManagementScreen} />
        <Stack.Screen name="Reservations" component={ReservationScreen} />
        <Stack.Screen name="InstructorScheduleScreen" component={InstructorScheduleScreen} />
        <Stack.Screen name="LectureManagement" component={LectureManagementScreen} />
        <Stack.Screen name="ReservationManagement" component={ReservationManagementScreen} />
        <Stack.Screen name="AddLecturePage" component={AddLecturePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
