export class InternalServerError extends Error {
  action: string;
  statusCode: number;

  constructor({ cause, statusCode }: { cause?: unknown; statusCode?: number }) {
    super("Um erro interno não esperado aconteceu", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  action: string;
  statusCode: number;

  constructor({ cause, message }: { cause?: unknown; message?: string }) {
    super(message || "Serviço indisponível no momento", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "Usuario não autenticado.", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Realize a autenticação.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "Ocorreu um erro de validação.", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Ajuste os dados da requisição";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "Não foi possível encontrar o recurso solicitado.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Ajuste os parâmetros da requisição";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowed extends Error {
  action: string;
  statusCode: number;

  constructor() {
    super("Método não permitido para este endpoint");
    this.name = "MethodNotAllowed";
    this.action = "Utilize o método correto";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
