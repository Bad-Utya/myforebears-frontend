export class PasswordHardnessDTO {
  hardness: number = 1;
  hint: string = '';
}

export default function getPasswordHardnessLevel(
  password: string,
  t: (key: string) => string
): PasswordHardnessDTO {

  if (password.length < 8) {
    return {
      hardness: 0,
      hint: t('auth.validation.password.too_short')
    };
  }

  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUpper = password !== password.toLowerCase();

  let score = 1;
  let lastMissingKey = '';

  if (hasNumbers) score++;
  else lastMissingKey = 'auth.validation.password.add_numbers';

  if (hasSpecial) score++;
  else lastMissingKey = 'auth.validation.password.add_special';

  if (hasUpper) score++;
  else lastMissingKey = 'auth.validation.password.add_uppercase';

  return {
    hardness: score,
    hint: score === 4
      ? t('auth.validation.password.perfect')
      : t(lastMissingKey)
  };
}
