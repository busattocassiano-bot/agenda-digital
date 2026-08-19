export const maskCpf = (value) => {
  if (!value) return '';
  value = value.replace(/\D/g, ''); // strip non-digits
  if (value.length > 11) value = value.slice(0, 11);
  
  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  }
  return value;
};

export const maskTelefone = (value) => {
  if (!value) return '';
  value = value.replace(/\D/g, ''); // strip non-digits
  if (value.length > 11) value = value.slice(0, 11);
  
  if (value.length > 10) {
    // (XX) XXXXX-XXXX
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (value.length > 6) {
    // (XX) XXXX-XXXX
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    // (XX) XXXX
    value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else if (value.length > 0) {
    // (XX
    value = value.replace(/(\d{0,2})/, "($1");
    // Only append closing parenthesis if length >= 2
    if (value.length === 3) value = value + ")";
  }
  return value;
};

export const maskCep = (value) => {
  if (!value) return '';
  value = value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);
  
  if (value.length > 5) {
    value = value.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  }
  return value;
};
