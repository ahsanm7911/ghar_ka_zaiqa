import Toast from "react-native-toast-message";
import theme from "./theme";

export const showSuccessToast = (message, heading=null) => {
  Toast.show({
    type: "success",
    text1: heading ? heading : "Success",
    text2: message,
    position: "top",
    visibilityTime: 5000,
    topOffset: 60,
    text1Style: { fontWeight: "600" },
    text2Style: { color: theme.colors.text },
  });
};

export const showErrorToast = (message, heading=null) => {
  Toast.show({
    type: "error",
    text1: heading ? heading : "Error",
    text2: message,
    position: "top",
    visibilityTime: 5000,
    topOffset: 60,
    text1Style: { fontWeight: "600" },
    text2Style: { color: theme.colors.text },
  });
};

export const showInfoToast = (message, heading=null) => {
  Toast.show({
    type: "info",
    text1: heading ? heading : "Info",
    text2: message,
    position: "top",
    visibilityTime: 5000,
    topOffset: 60,
  });
};
