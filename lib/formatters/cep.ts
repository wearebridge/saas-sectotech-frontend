const CepFormatter = (cep: string) => {
  if (!cep) return cep;

  cep = cep.replace(/\D/g, "");

  if (cep.length <= 5) {
    return cep;
  } else {
    return cep.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  }
};

const isValidCEP = (cep: string): boolean => {
  const onlyNumbers = cep.replace(/\D/g, "");
  return /^\d{8}$/.test(onlyNumbers);
};

export { isValidCEP, CepFormatter };
