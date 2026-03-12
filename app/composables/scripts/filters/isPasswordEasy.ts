class PasswordHardnessDTO {
  hardness: number = 1;
  hint: string = 'Your password is great';
}

// TODO: CHANGE FUNCTION TO WEIGHTS DISTRIBUTION
export default function getPasswordHardnessLevel(password: string): PasswordHardnessDTO {
  const NumbersRegex = new RegExp("\\d");
  const SpecialSymbolsRegex = new RegExp("[^A-Za-z0-9]");

  if (password.length < 8) {
    return {hardness: 0, hint: "Try longer passwords"};
  }

  let res = new PasswordHardnessDTO();

  if (NumbersRegex.test(password)) {res.hardness++} else res.hint = "Add numbers to your password";
  if (SpecialSymbolsRegex.test(password)) {res.hardness++} else res.hint = "Add special symbols to your password";
  if (password !== password.toLowerCase()) {res.hardness++} else res.hint = "Add uppercase letters to your password";

  return res;
}
