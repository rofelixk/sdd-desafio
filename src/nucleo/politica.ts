// Única fonte dos valores da política (plan §4). Mudar um valor exige mudar a
// spec antes.

export const POLITICA = {
  limites: {
    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true  }, // RN-009
    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true  }, // RN-009
    hospedagem:        { diario: 250_00n, ampliaEmViagem: false }, // RN-009, AMB-020
  },
  fatorViagem: { num: 3n, den: 2n },                               // RN-011
  limiarNotaFiscal: 100_00n,                                       // RN-008 (estritamente maior)
} as const;
