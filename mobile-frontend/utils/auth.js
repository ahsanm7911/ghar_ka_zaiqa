import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";
const USER_TYPE_KEY = "user_type";

// Save authentication data
export const saveAuthData = async (token, userType) => {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_TYPE_KEY, userType],
    ]);
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

// Retrieve auth data
export const getAuthData = async () => {
  try {
    const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_TYPE_KEY]);
    const token = values[0][1];
    const userType = values[1][1];
    return { token, userType };
  } catch (error) {
    console.error("Error retrieving auth data:", error);
    return { token: null, userType: null };
  }
};

// Remove tokens on logout
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_TYPE_KEY]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};
