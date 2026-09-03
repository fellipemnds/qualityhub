# SETUP de Instalação do Ambiente de Desenvolvimento 

## Ferramentas utilizados: 
- Visual Studio Code
- Node.js
- npm
- Docker
- Git
- GitHub
- Windows Subsystem for Linux (WSL)
- Ubuntu

# Passos de Instalação

## 0. Verificação de softwares
Antes de fazer a instalação dos softwares, verifique se a máquina Windows já possui os itens instalados. Apesar de instalados, iremos instalá-los novamente no subsistema Linux.

Para isso, digite os seguintes comandos no PowerShell (eu usei o PS 7).

```powershell
node --version
npm --version
docker --version
git --version
wsl --version
```

Se algum desses comandos trouxer a mensagem `command not found` ou `não é reconhecido como comando`, fique tranquilo. O objetivo é verificar se eles estão - ou não - instalados na máquina Windows, para que você saiba caso exista algum conflito durante a instalação no ambiente Linux. 

## 1. Instalação do WSL e do Ubuntu
Abra o PowerShell como Administrador e digite o comando: 

```powershell
wsl --install -d Ubuntu
```

Este comando instalará o WSL (caso sua máquina não tenha) e instalará o Ubuntu como uma distribuição Linux. Quando a instalação finalizar, um prompt do Terminal do Ubuntu abre (numa nova janela ou na mesma) e ele pede duas coisas: 
1. **Um nome de usuário:** Use letras minúsculas, sem espaços e nem acentos. 
2. **Uma senha:** A senha do usuário que será solicitada toda vez que você usar o `sudo`.

### IMPORTANTE!
Após a finalização, é possível que o Terminal do WSL herde o diretório atual do PowerShell (geralmente aquele `C:\Users\<usuário>`). Isso é identificável quando vemos o caminho do Terminal dessa forma: `<usuário do Linux>@PC:/mnt/c/Users/<usuário do Windows>`. 

Para ir para o seu diretório raiz no Linux, digite:

```bash
cd ~
```

Para confirmar aonde você está, digite: 

```bash
pwd
```

Ao digitar, ele deve responder `home/<seu user>`

## 2. Atualize o Ubuntu
Para rodar a atualização dos pacotes do Linux, digite: 

```bash
sudo apt update && sudo apt upgrade -y
```

O comando `update` lista todas as atualizações, enquanto o `upgrade` atualiza tudo que for possível. A flag `-y` é para que você não precise responder "yes" toda vez que um pacote for atualizado. Quando solicitado, digite a senha que você cadastrou no Linux.

## 3. nvm e Node.js no Ubuntu. 
Se você já tinha o Node instalado no Windows, no Linux ele não existe. Para verificar isso, digite no Terminal Linux: 

```bash
node --version
```

Ele deve responder como `command not found`, o que é esperado.

Agora, vamos instalar o **nvm** para que possamos instalar o Node. 

> BAIXE O NVM SOMENTE DE FONTES SEGURAS. PARA ISSO, USE A [PÁGINA DO GITHUB DO NVM](https://github.com/nvm-sh/nvm)

Na página do nvm, vá no README, procure por "Installing and Updating" e procure por um comando parecido com esse: 

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

Execute-o para instalar o nvm no Linux. 

### IMPORTANTE: 

Durante a instalação, o script faz uma verificação rodando `npm list -g` para ver se você tem pacotes instalados globalmente que poderiam conflitar. É possível que ele mostre um erro pois encontrou o npm que está instalado no Windows. Isso acontece pois o WSL junta o PATH do Windows com o PATH do Linux. Não se preocupe caso esse erro apareça, pois instalaremos o Node direto no Linux para evitar esse conflito. 

Depois de ter instalado o nvm, recarregue o Terminal usando o seguinte comando: 

```bash
source ~/.bashrc
```

Em seguida, verifique se foi instalado usando:

```bash
nvm --version
``` 

Se responder com a versão, isso significa que está pronto. Agora vamos instalar o Node: 

```bash
nvm install --lts
```

Ele vai instalar a versão LTS mais recente. Depois de instalado, rode esses dois comandos para verificar de onde o comando está vindo: 

```bash
which node
which npm
```

O correto é que ele venha do Linux. Caso ele mostre `/mnt/c/...` e não `/home/<seu usuário>/.nvm`, isso significa que ele ainda está pegando o do Windows.

## 4. Git no Linux
Provavelmente o Git já vem com o Ubuntu, mas para confirmar, digite no Terminal Linux:

```bash
git --version
```

Caso não esteja instalado, instale usando o seguinte comando: 

```bash
sudo apt install git -y
```

## 5. Docker
O Docker Desktop precisa estar instalado no Windows. Para isso, abra uma nova instância do PowerShell como Administrador e execute: 

```powershell
winget install -e --id Docker.DockerDesktop
```

Reinicie o computador caso necessário. Em seguida, faça o login.

Em seguida, abra novamente o Terminal do Linux, e digite: 

```bash
docker --version
```

Se der erro, é necessário ajustar a integração no Docker Desktop: 
1. Abra o Docker Desktop.
2. Clique em "Configurações" (ícone de engrenagem).
3. Procure por "Resources", e em seguida, procure a aba "WSL Integration".
4. Caso a opção "Enable integration with my default WSL distro" esteja desabilitada, habilite-a. Em seguida, ative o Toggle do Ubuntu.
5. Clique em Apply & Restart. 

Encerre o Docker Desktop no ícone da Barra de Tarefas e encerre o Terminal do Ubuntu. Depois, abra o Terminal e abra o Docker Desktop novamente. 

Digite o comando para verificar se está funcionando: 

```bash
docker ps
```

### IMPORTANTE!
É possível que dê este erro: 

```
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock"
```

Caso isso aconteça, é porque o usuário do Linux não possui a permissão para falar com o serviço do Docker. Para corrigir isso: 

Verifique se o Docker está nos grupos do seu usuário com o comando: 

```bash
groups
```

Provavelmente `docker` não vai aparecer. Para corrigir, digite o comando: 

```bash
sudo usermod -aG docker $USER
```

> O "-a" é crítico, pois sem ele, -G substitui todos os grupos, incluindo o SUDO. DOR DE CABEÇA! 

O grupo só entra numa sessão nova. Para isso, encerre o WSL. Abra o PowerShell, e digite: 

```powershell
wsl --shutdown
```
ou
```powershell
wsl --terminate Ubuntu
```

Ambos os comandos encerram o WSL, e nos dois casos, o Docker Desktop é derrubado junto, pois ele também roda sobre o WSL. Para corrigir, encerre-o na Barra de Tarefas e abra o Ubuntu antes de iniciá-lo novamente. 

Quando reabrir o Ubuntu e o Docker, e ele estiver com o status *"Engine running"*, digite: 

```bash
groups
```

Verifique se `docker` está lá. Em seguida, digite: 

```bash
docker ps
```

Deve aparecer só o cabeçalho das colunas. Se apareceu, isso significa que funcionou.

## 6. Instalar o VS Code e o VS Code Server
Antes de executar este passo, garanta que o VS Code está instalado na máquina. Para isso, abra o PowerShell e instale via WinGet: 

```powershell
winget install Microsoft.VisualStudioCode
```

Quando finalizar, volte ao terminal Linux e digite: 

```bash
code .
```

Caso o VS Code não esteja instalado, ele vai instalar, e em seguida, o Visual Studio abrirá no Windows se conectando ao WSL Ubuntu. 

## 7. Pasta do Projeto
Para criar a pasta que vai abrigar os projetos, primeiro, garanta que você está na pasta raiz: 

```bash
pwd
```

Ao digitar, ele deve responder `home/<seu user>`. Caso você não esteja na pasta raiz, digite o seguinte comando: 

```bash
cd ~
```

E confirme novamente com `pwd`.

Agora, para criar a pasta, digite o seguinte comando: 

```bash
mkdir -p ~/projects/
```

E entre na pasta: 

```bash
cd ~/projects
```

## 8. Configurando o Git
Primeiro, configure seu nome e e-mail do Git através dos seguintes comandos: 

```bash
git config --global user.name "<seu nome>"
git config --global user.email "<seu email>"
``` 

Use o mesmo e-mail do GitHub para que o GitHub consiga associar seu perfil nos commits. Confira depois: 

```bash
git config --global --list
```

## 9. Gerando e cadastrando chave SSH no GitHub
Para facilitar a comunicação com o GitHub, vamos gerar uma chave SSH para garantir que o Git se comunique com o GitHub sem interrupções. 

No terminal do Ubuntu, digite: 

```bash
ssh-keygen -t ed25519 -C "<seu email>"
```

Ele vai te perguntar aonde salvar. Dê Enter para aceitar o local padrão. Em seguida, ele pede para gerar uma passphrase e confirmá-la.

Esse comando vai criar dois arquivos id_ed25519 (chave privada local do Git) e id_ed25519.pub (chave pública que você entrega ao GitHub).

Agora, copie a chave pública imprimindo ela no Terminal: 

```bash
cat ~/.ssh/id_ed25519.pub
```

Em seguida, cadastre-a no GitHub: 
1. No GitHub, vá em *Settings → SSH and GPG Keys*.
2. Clique em *New SSH key*
3. Digite um nome que identifique a máquina.
4. Em "Key Type", escolha *Authentication Key*
5. Cole a chave que você copiou do Terminal no campo *Key*.
6. Clique em *Add SSH key*.

Agora, vamos testar. Digite no Terminal do Linux: 

```bash
ssh -T git@github.com
```

Se der certo, ele vai gerar uma key fingerprint, uma randomart, e como é a primeira conexão, ele vai perguntar se você confia no host. 

Para garantir que você está conectando corretamente no servidor do GitHub, vá no site do [GitHub Docs](https://docs.github.com/) e, no campo de busca, digite "Key fingerprint". Usamos o algoritmo "ed25519" para gerar a key, então onde mostra "ed25519", verifique a fingerprint e compare com a do Terminal. Se forem iguais, digite **yes**.

Se aparecer `Hi <seu user>!`, significa que a chave está funcionando.

### IMPORTANTE!

Para evitar que toda vez o Git solicite a passphrase, digite esses comandos no Terminal: 

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

## 10. Clonando o projeto do GitHub
Para clonar o projeto do GitHub, abra a [página do projeto](https://github.com/fellipemnds/qualityhub), procure o botão "Code", clique em "SSH" e copie o endereço do repositório. 

Em seguida, no Terminal do Linux, digite o comando para clonar: 

```bash
git clone <endereço>
```

Em seguida, entre na pasta: 

```bash
cd <projeto>
```

Confira se o histórico veio e se os arquivos estão lá com os seguintes comandos: 

```bash
git log --oneline
ls -la
```

Com tudo isso confirmado, digite no Terminal: 

```bash
code .
```

Se tudo estiver certo, o VS Code irá abrir a pasta do projeto.

## 11. Digitando a senha só uma vez com ssh-agent
Para que você não precise digitar a senha toda vez que executa um commit, vamos configurar o "ssh-agent". Com ele, você só precisará digitar a senha na primeira requisição SSH com o servidor do GitHub em cada sessão do Ubuntu. 

Primeiro, vamos criar o arquivo de configuração do SSH. Digite no Terminal: 

```bash
code ~/.ssh/config
```

Quando o arquivo abrir no VS Code, cole o seguinte código: 

```
Host github.com
    AddKeysToAgent yes
    IdentityFile ~/.ssh/id_ed25519
```

Em seguida, salve o arquivo e ajuste a permissão no Terminal: 

```bash
chmod 600 ~/.ssh/config
```

O 600 significa que só o dono pode ler e escrever, mais ninguém — como proteção. 

Em seguida, vamos editar o `.bashrc`. Digite no Terminal: 

```bash
code ~/.bashrc
```

No fim do arquivo, coloque: 

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" > /dev/null
fi
```
Essa condição verifica se já existe um agente ativo. Sem ela, cada aba nova do terminal iniciaria um agente novo, e a chave carregada em um deles não valeria nos outros. 

Salve o arquivo, volte ao Terminal e recarregue-o com o comando: 

```bash
source ~/.bashrc
```

Em seguida, teste duas vezes com o comando: 

```bash
ssh -T git@github.com
```

É esperado que na primeira vez, peça a passphrase. Em seguida, rode o comando de novo e verifique que ele não pede mais a senha. 

Durante o uso comum, geralmente o primeiro push, pull ou clone do dia pede a passphrase e os seguintes não pedem mais. Isso ajuda no fluxo de desenvolvimento. 

---

**Se você chegou até aqui, você terá configurado tudo corretamente! PARABÉNS!** 