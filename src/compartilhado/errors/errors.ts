export class AppError extends Error {
    statusCode = 500;
}

export class ValidacaoError extends AppError {
    statusCode = 400;

    constructor(mensagem = "Dados inválidos") {
        super(mensagem);
        this.name = "ValidacaoError";
    }
}

export class NaoAutenticadoError extends AppError {
    statusCode = 401;

    constructor(mensagem = "401 Unauthorized") {
        super(mensagem);
        this.name = "NaoAutenticadoError";
    }
}

export class CredenciaisInvalidasError extends NaoAutenticadoError {
    constructor(mensagem = "Credenciais inválidas") {
        super(mensagem);
        this.name = "CredenciaisInvalidasError";
    }
}
export class SemPermissaoError extends AppError {
    statusCode = 403;

    constructor(mensagem = "403 Forbidden") {
        super(mensagem);
        this.name = "SemPermissaoError";
    }
}

export class NaoEncontradoError extends AppError {
    statusCode = 404;

    constructor(mensagem = "Recurso não encontrado") {
        super(mensagem);
        this.name = "NaoEncontradoError";
    }
}

export class TransicaoInvalidaError extends AppError {
    statusCode = 409;

    constructor(mensagem = "Transição inválida") {
        super(mensagem);
        this.name = "TransicaoInvalidaError";
    }
}
