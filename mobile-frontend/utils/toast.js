import Toast from "react-native-toast-message";
import theme from "./theme";

export const showSuccessToast = (message) => {
  Toast.show({
    type: "success",
    text1: "Success",
    text2: message,
    position: "top",
    visibilityTime: 2500,
    topOffset: 60,
    text1Style: { fontWeight: "600" },
    text2Style: { color: theme.colors.text },
  });
};

export const showErrorToast = (message) => {
  Toast.show({
    type: "error",
    text1: "Error",
    text2: message,
    position: "top",
    visibilityTime: 3000,
    topOffset: 60,
    text1Style: { fontWeight: "600" },
    text2Style: { color: theme.colors.text },
  });
};

export const showInfoToast = (message) => {
  Toast.show({
    type: "info",
    text1: "Info",
    text2: message,
    position: "top",
    visibilityTime: 2500,
    topOffset: 60,
  });
};
