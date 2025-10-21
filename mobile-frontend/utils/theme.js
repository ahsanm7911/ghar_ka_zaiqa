const colors = {
  // canonical keys (what components should use)
  background: "#F5E8C7", // Warm Beige
  card: "#FDFDFD",       // Creamy White
  primary: "#E07A5F",    // Rustic Orange
  secondary: "#81B29A",  // Olive Green
  accent: "#F2C94C",     // Golden Yellow
  text: "#3D405B",       // Charcoal Gray
  error: "#D94F3D",      // Tomato Red
  border: "#E5E5E5",     // Soft Gray
};

// Backwards-compatible alias map (if older code used these names)
const aliases = {
  warmBeige: colors.background,
  creamyWhite: colors.card,
  rusticOrange: colors.primary,
  oliveGreen: colors.secondary,
  goldenYellow: colors.accent,
  charcoalGray: colors.text,
  tomatoRed: colors.error,
  softGray: colors.border,
};

const theme = {
  colors: {
    ...colors,
    // also expose legacy names
    ...aliases,
  },

  // small helpers (optional)
  button: {
    backgroundColor: colors.primary,
    textColor: colors.card,
  },
};

export default theme;
