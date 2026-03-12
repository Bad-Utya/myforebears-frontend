export default function isEmailCorrect(password: string): boolean {
  const EmailRegex = new RegExp("^[a-zA-Zа-яА-Я0-9._%+-]+@[а-яА-Яa-zA-Z0-9.-]+\\.[а-яА-Яa-zA-Z]{2,}$");
  return EmailRegex.test(password);
}
