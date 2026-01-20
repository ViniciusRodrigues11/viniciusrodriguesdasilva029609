// Rules
const _calcDigit = (cpf: string, length: number): number => {
  const sum = cpf
    .slice(0, length)
    .split("")
    .reduce((acc, digit, idx) => acc + Number(digit) * (length + 1 - idx), 0);

  const result = (sum * 10) % 11;
  return result === 10 ? 0 : result;
};

const _isValidCpf = (cpf: string): string => {
  const INVALID_MESSAGE = "CPF inválido";
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return "CPF deve conter 11 dígitos";
  if (/^(\d)\1{10}$/.test(cleaned)) return INVALID_MESSAGE;

  const isValid =
    _calcDigit(cleaned, 9) === Number(cleaned[9]) &&
    _calcDigit(cleaned, 10) === Number(cleaned[10]);

  return isValid ? '' : INVALID_MESSAGE;
};

const _isValidEmail = (email: string): string => {
  const value = email.trim();

  const regex =
    /^(?!\.)(?!.*\.\.)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  return regex.test(value) ? "" : "Email inválido";
};

const _isValidPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 11 ? '' : 'Telefone inválido';
};

const _isRequired = (value: string): string => {
  return !value.trim() ? "Campo obrigatório" : "";
};

const _minLength = (min: number): (value: string) => string => {
  return (value: string): string => {
    return value.length < min ? `Deve ter no mínimo ${min} caracteres` : "";
  };
};

const _maxLength = (max: number): (value: string) => string => {
  return (value: string): string => {
    return value.length > max ? `Deve ter no máximo ${max} caracteres` : "";
  };
};

const _onlyNumbers = (v: string): string => {
  return /^\d+$/.test(v) ? "" : "Deve conter apenas números";
};

const _numberMin = (min: number): (v: string) => string => {
  return (v: string): string => {
    const num = Number(v);
    return isNaN(num) || num < min ? `Deve ser no mínimo ${min}` : "";
  };
};

// Validator Composer
type ValidatorRule = (value: string) => string;
const createValidator = (...rules: ValidatorRule[]): ValidatorRule => {
  return (value: string) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return "";
  };
};

const validators = {
  required: _isRequired,
  name: createValidator(
    _isRequired,
    _minLength(3),
    _maxLength(100)
  ),
  email: createValidator(
    _isRequired,
    _isValidEmail
  ),
  password: createValidator(
    _isRequired,
    _minLength(6)
  ),
  cpf: createValidator(
    _isRequired,
    _isValidCpf
  ),
  phone: createValidator(
    _isRequired,
    _isValidPhone
  ),
  age: createValidator(
    _isRequired,
    _onlyNumbers,
    _numberMin(0)
  ),
  minLength: _minLength,
  maxLength: _maxLength,
};

export {
  createValidator,
  validators
}
