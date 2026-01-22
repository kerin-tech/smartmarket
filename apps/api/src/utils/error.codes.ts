export const ERROR_CODES = {
  BAD_REQUEST: {
    code: 400,
    message: "Solicitud inválida",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "No autorizado",
  },
  FORBIDDEN: {
    code: 403,
    message: "Acceso denegado",
  },
  NOT_FOUND: {
    code: 404,
    message: "Recurso no encontrado",
  },
  CONFLICT: {
    code: 409,
    message: "Conflicto con el estado actual",
  },
  INTERNAL_SERVER: {
    code: 500,
    message: "Error interno del servidor",
  },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;