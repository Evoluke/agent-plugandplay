export function isValidCompanyName(name: string) {
  const len = name.trim().length;
  return len >= 4 && len <= 80;
}

export function isValidEmail(email: string) {
  if (email.length > 320) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidPassword(password: string) {
  // At least 8 characters, one upper, one lower, one number and one special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
}

export function isValidCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return validateCPF(digits);
  if (digits.length === 14) return validateCNPJ(digits);
  return false;
}

function validateCPF(cpf: string) {
  if (/^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf.charAt(10));
}

function validateCNPJ(cnpj: string) {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  const calc = (x: number) => {
    let n = 0;
    let y = x - 7;
    for (let i = 0; i < x; i++) {
      n += parseInt(cnpj.charAt(i)) * y--;
      if (y < 2) y = 9;
    }
    const r = n % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(12);
  const d2 = calc(13);
  return d1 === parseInt(cnpj.charAt(12)) && d2 === parseInt(cnpj.charAt(13));
}

export function isValidAddress(address: string) {
  const len = address.trim().length;
  return len >= 3 && len <= 200;
}

export function isValidResponsible(name: string) {
  const len = name.trim().length;
  return len >= 4 && len <= 80;
}

export function isValidCep(cep: string) {
  return /^\d{8}$/.test(cep.replace(/\D/g, ""));
}

export function isValidPhone(phone: string) {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ""));
}

export function isValidAgentName(name: string) {
  const len = name.trim().length;
  return len >= 3 && len <= 80;
}

export function isValidAgentObjective(text: string) {
  const len = text.trim().length;
  return len >= 10 && len <= 200;
}

export function isValidAgentLimit(text: string) {
  const len = text.trim().length;
  return len >= 10 && len <= 200;
}
