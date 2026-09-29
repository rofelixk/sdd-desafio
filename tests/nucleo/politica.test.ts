import { describe, expect, expectTypeOf, it } from 'vitest';
import { POLITICA } from '../../src/nucleo/politica.ts';
import type { Categoria } from '../../src/nucleo/tipos.ts';

describe('Infra › política', () => {
  it('Infra › política: categorias reconhecidas são exatamente as chaves de POLITICA.limites', () => {
    expect(Object.keys(POLITICA.limites).sort()).toEqual(['alimentacao', 'hospedagem', 'transporte_urbano']);
    expectTypeOf<Categoria>().toEqualTypeOf<'alimentacao' | 'transporte_urbano' | 'hospedagem'>();
  });
});
