// Tipos de recursos do JSON presentes no Node >= 24 (V8) e ainda ausentes do
// lib do TypeScript 5.9 e do @types/node (R-01, R-03, R-04).

interface RawJSON {
  readonly rawJSON: string;
}

interface ContextoReviverJson {
  /** Texto original do valor primitivo no JSON de entrada. */
  readonly source?: string;
}

interface JSON {
  rawJSON(texto: string): RawJSON;
  isRawJSON(valor: unknown): valor is RawJSON;
  parse(
    texto: string,
    reviver: (this: any, chave: string, valor: any, contexto: ContextoReviverJson) => any,
  ): any;
}
