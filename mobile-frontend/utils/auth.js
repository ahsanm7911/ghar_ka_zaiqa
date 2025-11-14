import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

const TOKEN_KEY = "token";
const USER_KEY = "user";
const USER_TYPE_KEY = "user_type";

// Save authentication data
export const saveAuthData = async (token, user, userType) => {
  try {
    if(Platform.OS === 'web') {
        console.log("Saving data into localStorage.")
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, user);
        localStorage.setItem(USER_TYPE_KEY, userType);
    } else {
      console.log("Saving data into asyncStorage.")
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, user],
        [USER_TYPE_KEY, userType],
      ]);
    }
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

// Retrieve auth data
export const getAuthData = async () => {
  try {
    if(Platform.OS === 'web') {
      console.log("Trying to retrieve data from localStorage.")
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      const userType = localStorage.getItem(USER_TYPE_KEY);
      return { token, user, userType };
    } else {
      console.log("Trying to retrieve data from localStorage.")
      const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY, USER_TYPE_KEY]);
      const token = values[0][1];
      const user = values[1][1];
      const userType = values[2][1];
      return { token, user, userType };
    }
    
  } catch (error) {
    console.error("Error retrieving auth data:", error);
    return { token: null, user: null, userType: null };
  }
};

// Remove tokens on logout
export const clearAuthData = async () => {
  try {
    if(Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
    } else {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, USER_TYPE_KEY]);
    }
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};
