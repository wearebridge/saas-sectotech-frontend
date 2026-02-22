const PhoneFormatter = (phone: string) => {
  if (!phone) return phone;

  phone = phone.replace(/\D/g, "");

  if (phone.length <= 2) {
    return `(${phone}`;
  } else if (phone.length <= 6) {
    return phone.replace(/(\d{2})(\d{1,4})/, "($1) $2");
  } else if (phone.length <= 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3");
  } else {
    return phone.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
  }
};

export { PhoneFormatter };
