export class AppError extends Error {
    statusCode = 500;
}

export class NaoEncontradoError extends AppError {
    statusCode = 404;

    constructor(mensagem = "Recurso não encontrado") {
        super(mensagem);
        this.name = "NaoEncontradoError";
    }
}

export class ValidacaoError extends AppError {
    statusCode = 400;

    constructor(mensagem = "Dados inválidos") {
        super(mensagem);
        this.name = "ValidacaoError";
    }
}