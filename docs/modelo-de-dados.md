# Diagrama de Entidade-Relacionamento

```mermaid
erDiagram
    SETOR ||--o{ USUARIO : "lotado em"
    SETOR ||--o{ NAO_CONFORMIDADE : "ocorreu em"

    NAO_CONFORMIDADE ||--o{ CONTENCAO : possui
    NAO_CONFORMIDADE ||--o{ INVESTIGACAO : possui
    NAO_CONFORMIDADE ||--o{ APROVACAO : possui
    NAO_CONFORMIDADE ||--o{ COMENTARIO : possui
    NAO_CONFORMIDADE ||--o{ ANEXO : possui

    INVESTIGACAO ||--o{ ACAO : gera
    INVESTIGACAO ||--o{ ANEXO : possui

    ACAO ||--o{ VERIFICACAO : "verificada por"
    ACAO ||--o{ ANEXO : possui

    CONTENCAO ||--o{ ANEXO : possui
    VERIFICACAO ||--o{ ANEXO : possui

    USUARIO ||--o{ CONTENCAO : responsavel
    USUARIO ||--o{ INVESTIGACAO : responsavel
    USUARIO ||--o{ ACAO : responsavel
    USUARIO ||--o{ VERIFICACAO : responsavel
    USUARIO ||--o{ APROVACAO : aprovador
    USUARIO ||--o{ ANEXO : enviou
    USUARIO ||--o{ COMENTARIO : autor
    USUARIO ||--o{ TRILHA_AUDITORIA : autor

    SETOR {
        int id PK
        string nome UK
    }

    USUARIO {
        int id PK
        string nome
        string email UK
        int setorId FK
    }

    NAO_CONFORMIDADE {
        int id PK
        string numero UK
        string titulo
        string descricao
        string requisitoViolado
        enum classificacao
        string analiseCausa
        enum tipo
        enum origem
        enum estado
        string cliente
        datetime dataOcorrencia
        datetime dataRegistro
        int reaberturas
        int setorId FK
    }

    CONTENCAO {
        int id PK
        string descricao
        datetime prazo
        datetime concluidaEm
        int naoConformidadeId FK
        int responsavelId FK
    }

    INVESTIGACAO {
        int id PK
        string causaRaiz
        string metodologia
        string abrangencia
        int naoConformidadeId FK
        int responsavelId FK
    }

    ACAO {
        int id PK
        string descricao
        string efeitoEsperado
        datetime prazo
        datetime concluidaEm
        int investigacaoId FK
        int responsavelId FK
    }

    VERIFICACAO {
        int id PK
        enum resultado
        string conclusao
        datetime dataAlvo
        datetime verificadoEm
        int acaoId FK
        int responsavelId FK
    }

    APROVACAO {
        int id PK
        enum portao
        boolean autoaprovacao
        string justificativa
        int naoConformidadeId FK
        int aprovadorId FK
    }

    ANEXO {
        int id PK
        string nomeArquivo
        string caminho
        string tipoMime
        int tamanhoBytes
        int naoConformidadeId FK
        int contencaoId FK
        int investigacaoId FK
        int acaoId FK
        int verificacaoId FK
        int enviadoPorId FK
    }

    COMENTARIO {
        int id PK
        string texto
        int naoConformidadeId FK
        int autorId FK
    }

    TRILHA_AUDITORIA {
        int id PK
        string entidade
        int entidadeId
        string acao
        string campo
        string valorAnterior
        string valorNovo
        int usuarioId FK
    }
```

## Valores dos enums

| Enum            | Valores                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `classificacao` | `MINOR`, `MAJOR`                                                                               |
| `tipo`          | `NAO_CONFORMIDADE`, `CONCESSAO`                                                                |
| `origem`        | `AUDITORIA_INTERNA`, `AUDITORIA_EXTERNA`, `OPERACAO`, `RECLAMACAO_CLIENTE`                     |
| `estado`        | `ABERTA`, `ANALISE`, `IMPROCEDENTE`, `CONTENCAO`, `ACAO_CORRETIVA`, `VERIFICACAO`, `ENCERRADA` |
| `resultado`     | `PENDENTE`, `EFICAZ`, `PARCIALMENTE_EFICAZ`, `NAO_EFICAZ`                                      |
| `portao`        | `CLASSIFICACAO`, `ENCERRAMENTO_INVESTIGACAO`, `ENCERRAMENTO_NC`, `AUTORIZACAO_CONCESSAO`       |

## Notas de modelagem

- **`NAO_CONFORMIDADE` → `INVESTIGACAO` é 1:N**. Uma NC pode ter várias investigações — simultâneas, quando há mais de uma frente de apuração, ou sequenciais, quando uma reabertura exige nova análise de causa raiz. O modelo 1:1 impediria ambos os casos.
- **`ANEXO` tem cinco chaves estrangeiras opcionais**, das quais exatamente uma deve estar preenchida. Essa regra é garantida pela aplicação, não pelo banco.
- **`TRILHA_AUDITORIA` é polimórfica**: `entidade` guarda o nome do model e `entidadeId` o registro. Não há chave estrangeira, o que permite auditar qualquer entidade da plataforma — inclusive de módulos futuros.
- **`reaberturas` é um contador**, incrementado apenas quando uma verificação retorna `NAO_EFICAZ`.
- Os campos `criadoEm` e `atualizadoEm` foram omitidos do diagrama por brevidade; a maioria das entidades os possui.
