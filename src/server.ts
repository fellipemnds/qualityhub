import { app } from "./app.js";

app.listen({ port: 3333 }, (erro, endereco) => {
    if (erro) {
        app.log.error(erro);
        process.exit(1);
    }
    console.log(`Servidor rodando em: ${endereco}`);
});

