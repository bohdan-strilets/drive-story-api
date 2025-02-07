// Regular expression for password validation.
// Requirements:
// - Contains at least one letter (uppercase or lowercase)
// - Contains at least one digit
// - Contains at least one special character (non-alphanumeric)

export const passwordRegex: RegExp =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
