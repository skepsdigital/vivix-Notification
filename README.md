# schedule-notification


## Instalação

Instale:

* AWS CLI - [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) 
* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 18](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)
* VS code plugin - [Install Docker community edition](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-toolkit-vscode) 

Configure a AWS CLI:

* Gere as credenciais no AWS IAM
* no terminal: `aws configure`
* entre com as credenciais

Código e dependências:

- Clone o repositório
- Instale os módulos: `npm install` e depois  `npm install --save-dev`

## Rodar localmente

Existem algumas maneiras:

### Rodar localmente todas as APIs

Similar ao express. Funciona somente em terminais Unix, não usar no Prompt do windows. Para rodar no Prompt, você precisará de 2 terminais, 1 rodando o typescript e outro rodar o SAM.

```bash
schedule-notification$ npm run start:local
```

### Debugar 1 Lambda específica

Use as configurações de debug como template, lá você especifica o nome da lambda que quer chamar e os parâmetros.

### Invokar 1 Lambda específica

Similar ao método anterior, mas sem o debug.

```bash
schedule-notification$ sam local invoke HelloWorldFunction --event events/event.json
```

# Adicionando novas funções

Cada função é descrita no arquivo template.yaml. Basta copiar uma existente e ajustar a rota e o nome. Exemplo:


```yaml
  TriggerFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: dist/
      Handler: trigger/index.handler
      Events:
        Trigger:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello
            Method: get
```

## Deploy

Build - Compila o Typescript em JS e depois compila todas as configs da Lambda.

```bash
schedule-notification$ npm run build
```


Deploy - Compila o Typescript em JS e depois compila todas as configs da Lambda. Em seguida inicia o deploy guiado, onde algumas informações serão definidas.

```bash
schedule-notification$ npm run deploy
```

Parâmetros do deploy:

* **Stack Name**: Nome da stack que será usada para o deploy. Deve ser único para cada região.
* **AWS Region**: Região da AWS. usar sa-east-1
* **Confirm changes before deploy**: Check duplo antes do deploy
* **Allow SAM CLI IAM role creation**: Permitir criação das permissões na AWS automaticamente
* **Save arguments to samconfig.toml**: Salvar todos os parametros usados para execuções futuras.
* **may not have authorization defined, Is this okay?**: Aviso de que a função não tem segurança explícita.

## Pastas

* .vscode - pasta com as configurações do VSCode
* .aws-sam - não commitar, pasta com builds finais
* dist - não commitar, pasta com builds Typescript
* src - código fonte
* events - pasta com eventos para teste das lambdas
* src/commom - pasta com bibliotecas comuns entre as lambdas
* src/tests - pasta com testes Jest
* src/*nome* - pasta de cada lambda
* src/*nome*/index.ts - arquivo inicial de cada lambda
* src/*nome*/services - pasta com as regras de negócio de cada lambda

