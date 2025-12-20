export enum ApiKeyPermission {
  TRANSACOES = 'transacoes',
  SAQUE = 'saque',
  TODOS = 'todos'
}

export const PERMISSION_DESCRIPTIONS = {
  [ApiKeyPermission.TRANSACOES]: 'Permite criar e consultar transações',
  [ApiKeyPermission.SAQUE]: 'Permite realizar e consultar saques',
  [ApiKeyPermission.TODOS]: 'Acesso completo a todas as funcionalidades'
} as const;