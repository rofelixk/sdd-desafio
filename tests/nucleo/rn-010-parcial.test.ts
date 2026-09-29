import { describe, expect, it } from 'vitest';
import { alocarDespesas } from '../apoio.ts';

describe('RN-010 — Reembolso parcial e distribuição do limite no dia', () => {
  it('RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESGOTADO', () => {
    const [d001, d002] = alocarDespesas([
      { id: 'd-001', valor: 72.5, fornecedor: 'Restaurante Tavola' },
      { id: 'd-002', valor: 38, fornecedor: 'Cantina do Porto' },
    ]);
    expect(d001).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 6000n, limiteAplicado: 6000n, saldoDisponivel: 6000n });
    expect(d002).toMatchObject({ codigo: 'LIMITE_DIARIO_ESGOTADO', reembolsavel: 0n, saldoDisponivel: 0n });
  });

  it('RN-010 › d-014 (61,00) → PARCIAL 60,00', () => {
    const [d014] = alocarDespesas([{ id: 'd-014', data: '2026-07-31', valor: 61 }]);
    expect(d014).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 6000n, solicitado: 6100n });
  });

  it('RN-010 › despesa que usa exatamente o saldo restante → APROVADO_INTEGRAL', () => {
    const [a, b, c] = alocarDespesas([{ valor: 45 }, { valor: 15 }, { valor: 0.01 }]);
    expect(a).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reembolsavel: 4500n, saldoApos: 1500n });
    expect(b).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reembolsavel: 1500n, saldoDisponivel: 1500n, saldoApos: 0n });
    expect(c).toMatchObject({ codigo: 'LIMITE_DIARIO_ESGOTADO', reembolsavel: 0n });
  });

  it('RN-010 › a ordem da entrada decide quem consome o saldo', () => {
    const [a, b] = alocarDespesas([{ valor: 38 }, { valor: 72.5 }]);
    expect(a).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reembolsavel: 3800n });
    expect(b).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 2200n });
  });
});
