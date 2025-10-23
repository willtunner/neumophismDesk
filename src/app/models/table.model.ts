
export interface TableHeader {
  label: string; // Nome que aparece na tabela
  field: string; // Caminho para o valor (ex: "operator.name")
}
export interface TableRow {
  [key: string]: any;
}
