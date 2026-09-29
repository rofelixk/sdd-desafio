import { describe, expect, it } from 'vitest';
import { diasDeViagem } from '../../src/nucleo/viagem.ts';
import { elegivel } from '../apoio.ts';

const hospedagem = { categoria: 'hospedagem', data: '2026-07-14', valor: 200 };

describe('RN-011 — Colaborador em viagem', () => {
  it('RN-011 › hospedagem de 1 diária em D: só D é dia de viagem', () => {
    expect([...diasDeViagem([elegivel({ ...hospedagem, descricao: 'Hotel' })])]).toEqual(['2026-07-14']);
  });

  it('RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de viagem', () => {
    expect([...diasDeViagem([elegivel({ ...hospedagem, descricao: 'Hotel - 2 diarias' })])]).toEqual([
      '2026-07-14',
      '2026-07-15',
    ]);
  });

  it('RN-011 › sem hospedagem elegível não há dia de viagem', () => {
    expect(diasDeViagem([]).size).toBe(0);
    expect(diasDeViagem([elegivel({ categoria: 'alimentacao', descricao: '2 diarias' })]).size).toBe(0);
  });
});
