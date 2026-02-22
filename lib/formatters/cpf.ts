export const CPFFormatter = (cpf: string) => {
  if (!cpf) return cpf;

  cpf = cpf.replace(/\D/g, "");

  if (cpf.length <= 3) {
    return cpf;
  } else if (cpf.length <= 6) {
    return cpf.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  } else if (cpf.length <= 9) {
    return cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  }
};
