export function isValidCompanyName(name: string): boolean {
  return name.length >= 4 && name.length <= 80;
}

export function isValidEmail(email: string): boolean {
  return (
    email.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function isValidPassword(password: string): boolean {
  // mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (x: number) => {
    let n = 0;
    for (let i = 0; i < x; i++) {
      n += parseInt(cnpj.charAt(i)) * ((x + 1 - i) % 8 || 9);
    }
    return n % 11 < 2 ? 0 : 11 - (n % 11);
  };
  const d1 = calc(12);
  if (d1 !== parseInt(cnpj.charAt(12))) return false;
  const d2 = calc(13);
  return d2 === parseInt(cnpj.charAt(13));
}

export function isValidCpfCnpj(value: string): boolean {
  const numbers = value.replace(/\D/g, "");
  return numbers.length === 11 ? isValidCPF(numbers) : numbers.length === 14 ? isValidCNPJ(numbers) : false;
}

export function isValidAddress(address: string): boolean {
  return address.length >= 3 && address.length <= 200;
}

export function isValidResponsible(name: string): boolean {
  return name.length >= 4 && name.length <= 80;
}
