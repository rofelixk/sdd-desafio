import { describe, expect, it } from 'vitest';
import { lerCambio } from '../../src/io/cambio.ts';

describe('RN-017 — Moeda e conversão para reais', () => {
  it('RN-017 › câmbio: "usd" no arquivo é indexado como USD', () => {
    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"usd": 5.42, " Eur ": 5.91}}}');
    expect([...c.keys()]).toEqual(['USD', 'EUR']);
    expect(c.get('USD')?.[0]?.taxa.texto).toBe('5.42');
  });

  it('RN-017 › câmbio: "USD": 5.42 e depois "usd": 5.50 na mesma data → vale 5.50, sem erro', () => {
    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"USD": 5.42, "usd": 5.50}}}');
    expect(c.get('USD')).toEqual([{ data: '2026-07-13', taxa: expect.objectContaining({ texto: '5.50' }) }]);
    const inverso = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"usd": 5.50, "USD": 5.42}}}');
    expect(inverso.get('USD')?.[0]?.taxa.texto).toBe('5.42');
  });

  it('RN-017 › câmbio: datas fora de ordem no arquivo ficam em ordem crescente no índice', () => {
    const c = lerCambio(
      '{"moeda_base": "BRL", "taxas": {"2026-07-20": {"USD": 5.50}, "2026-07-13": {"USD": 5.42}, "2026-07-17": {"USD": 5.47, "EUR": 5.96}}}',
    );
    expect(c.get('USD')?.map((k) => k.data)).toEqual(['2026-07-13', '2026-07-17', '2026-07-20']);
    expect(c.get('EUR')?.map((k) => k.data)).toEqual(['2026-07-17']);
  });
});
