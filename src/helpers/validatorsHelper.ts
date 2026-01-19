const _calcDigit = (cpf: string, length: number): number => {
  const sum = cpf
    .slice(0, length)
    .split("")
    .reduce((acc, digit, idx) => acc + Number(digit) * (length + 1 - idx), 0);

  const result = (sum * 10) % 11;
  return result === 10 ? 0 : result;
};

const isValidCpf = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  return (
    _calcDigit(cleaned, 9) === Number(cleaned[9]) &&
    _calcDigit(cleaned, 10) === Number(cleaned[10])
  );
};

const isValidEmail = (email: string): boolean => {
  return email.includes("@") && email.includes(".");
};

const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 11;
};

export {
  isValidCpf,
  isValidEmail,
  isValidPhone
}
