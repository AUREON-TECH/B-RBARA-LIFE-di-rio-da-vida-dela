# CONEXÃO ELA — Especificação de Produto e Arquitetura

**Data:** 02/10/2026  
**Status:** Design aprovado em conversa; aguardando revisão do documento antes do plano de implementação.  
**Origem:** evolução do aplicativo BÁRBARA LIFE.  
**Objetivo:** transformar o produto em uma plataforma feminina multiusuária, gratuita e permanente, combinando rede social, comunidades, mensagens, eventos e um espaço pessoal privado.

---

## 1. Visão do produto

O CONEXÃO ELA será uma plataforma digital para mulheres com duas dimensões complementares:

1. **Vida social:** feed, perfis, conexões, comunidades, comentários, curtidas, notificações, eventos e conversas.
2. **Vida privada:** diário, metas, bem-estar, autocuidado, evolução, lembranças e demais registros pessoais.

A proposta não é copiar Instagram, Facebook ou Orkut. O produto usa referências conhecidas dessas redes para criar uma experiência própria centrada em **pertencimento, apoio, desenvolvimento pessoal, conexão feminina e privacidade**.

A entrada será aberta: qualquer mulher com o link poderá criar uma conta usando e-mail e senha. O acesso será gratuito e permanente.

---

## 2. Princípios obrigatórios

- O nome **BÁRBARA LIFE** deve desaparecer da experiência pública, PWA, títulos, textos e navegação.
- O produto passa a se chamar **CONEXÃO ELA**.
- A conta atual da Bárbara continua existindo e preserva os dados já cadastrados.
- Bárbara passa a ser uma usuária comum dentro da nova plataforma, sem perder seus dados pessoais existentes.
- Cada usuária possui uma identidade própria e um espaço privado separado.
- Nenhuma usuária pode acessar diário, metas, bem-estar, foto privada, registros pessoais ou dados internos de outra usuária.
- O cadastro é aberto por link, com e-mail + senha.
- Acesso padrão do projeto CONEXÃO ELA: **lifetime/gratuito permanente**.
- O cadastro público deve ser habilitado apenas para este projeto, sem abrir outros produtos do AUREON Base.
- O sistema deve funcionar bem no celular e continuar instalável como PWA.
- A experiência deve ser simples para pessoas não técnicas.

---

## 3. Estratégias consideradas

### Opção A — transformar o aplicativo atual em rede social
Reaproveitar o front-end atual e ir adicionando funcionalidades sociais diretamente.

**Vantagem:** menor custo inicial.  
**Risco:** o código atual foi desenhado para uma única pessoa e tende a ficar confuso conforme feed, mensagens e comunidades crescerem.

### Opção B — criar um aplicativo totalmente novo
Criar outro repositório e outro produto separado.

**Vantagem:** arquitetura limpa desde o início.  
**Risco:** duplicação de funcionalidades, migração mais difícil e risco de perder continuidade dos dados atuais da Bárbara.

### Opção C — evolução estruturada do produto atual
Renomear o produto, preservar dados privados existentes e separar o front-end em módulos: autenticação, social, comunidades, mensagens, eventos e espaço privado.

**Escolha de design:** Opção C.

Ela preserva o que já existe, evita uma migração destrutiva e permite construir a rede social em módulos independentes.

---

## 4. Arquitetura geral

### Front-end

Tecnologia atual mantida:

- React 18
- TypeScript
- Vite
- React Router
- PWA

O aplicativo será reorganizado por domínios:

- auth
- onboarding
- social
- profiles
- connections
- communities
- messages
- events
- private-space
- notifications
- moderation
- shared

A navegação principal mobile deverá priorizar:

1. Início
2. Comunidades
3. Criar
4. Mensagens
5. Perfil

O **Meu Espaço** ficará disponível pelo perfil e/ou atalho próprio.

### Back-end

O AUREON Base continua como backend central.

O projeto lógico continuará inicialmente no slug existente para preservar dados, mas o design deve permitir a migração controlada para um slug de marca, por exemplo:

`conexao-ela`

Essa alteração só deve ocorrer se a migração puder preservar memberships, subscriptions e owner_user_id dos registros existentes.

### Banco e autorização

O modelo multiusuária continuará usando:

- `users`
- `projects`
- `project_users`
- `subscriptions`
- registros de projeto com `owner_user_id`
- storage com `owner_user_id`

Para o CONEXÃO ELA:

- cadastro público habilitado por configuração do projeto;
- assinatura criada automaticamente com status `lifetime`;
- dados privados continuam owner-scoped;
- dados sociais recebem políticas próprias de visibilidade.

---

## 5. Cadastro e autenticação

### Tela inicial

A usuária verá:

- logo CONEXÃO ELA;
- “Entrar”;
- “Criar minha conta”.

### Cadastro

Campos mínimos:

- Nome
- E-mail
- Senha
- Confirmar senha
- Aceite dos termos e regras da comunidade

Regras:

- e-mail válido;
- senha entre 10 e 128 caracteres;
- e-mail único;
- cadastro direto, sem confirmação por e-mail nesta primeira fase;
- acesso gratuito permanente;
- login imediato após cadastro.

### Segurança arquitetural

Não abrir o cadastro global do AUREON Base para todos os projetos.

O backend deve possuir configuração por projeto, por exemplo:

- `public_registration_enabled`
- `default_access_status`

Para CONEXÃO ELA:

- `public_registration_enabled = true`
- `default_access_status = lifetime`

Para os demais projetos, manter comportamento atual.

### Login

- e-mail + senha;
- Google permanece opcional para o futuro;
- sessão persistente;
- logout;
- alterar senha.

A recuperação de senha por e-mail continua dependente de infraestrutura de envio válida e não deve bloquear o lançamento inicial.

---

## 6. Onboarding

No primeiro acesso, a usuária completa o perfil.

Campos sugeridos:

- foto;
- nome de exibição;
- cidade;
- estado;
- data de nascimento opcional;
- bio;
- interesses;
- áreas que deseja desenvolver;
- temas que gostaria de acompanhar.

Interesses iniciais:

- Maternidade
- Carreira
- Empreendedorismo
- Autoestima
- Saúde
- Beleza
- Relacionamentos
- Estudos
- Espiritualidade
- Organização
- Finanças
- Bem-estar
- Viagens
- Propósito

O onboarding também alimenta sugestões de conteúdo e comunidades.

---

## 7. Perfil social

Cada usuária terá um perfil público/social contendo:

- foto;
- capa;
- nome;
- username;
- bio;
- cidade opcional;
- interesses;
- quantidade de conexões;
- comunidades;
- publicações;
- conquistas públicas opcionais.

### Privacidade

A usuária escolhe quais informações sociais ficam visíveis.

O sistema deve diferenciar claramente:

- **perfil social**
- **dados privados**

Nunca mostrar dados de diário, saúde, metas privadas ou registros pessoais no perfil social sem uma ação explícita da própria usuária para compartilhar algo.

---

## 8. Feed

O feed será o centro social do aplicativo.

### Publicações

Tipos iniciais:

- texto;
- foto;
- texto + foto.

Futuro:

- vídeo;
- enquete;
- publicação de evento;
- compartilhamento de conquista.

Cada publicação possui:

- autora;
- data/hora;
- conteúdo;
- mídia;
- audiência;
- curtidas;
- comentários;
- quantidade de interações.

### Audiência

Primeira versão:

- público dentro da plataforma;
- somente conexões.

Futuro:

- comunidade;
- lista personalizada.

### Ordenação

Primeira fase:

- cronológica com conteúdo recente.

Não criar algoritmo complexo de recomendação na primeira versão.

---

## 9. Curtidas, comentários e interações

Funcionalidades:

- curtir;
- retirar curtida;
- comentar;
- excluir próprio comentário;
- excluir própria publicação;
- denunciar conteúdo.

Comentários devem manter referência a:

- post;
- autora;
- timestamp;
- conteúdo;
- status de moderação.

---

## 10. Conexões

Referência conceitual: amizade do Orkut/Facebook com simplicidade moderna.

Estados:

- nenhuma relação;
- solicitação enviada;
- solicitação recebida;
- conectadas;
- bloqueada.

Funcionalidades:

- enviar solicitação;
- aceitar;
- recusar;
- remover conexão;
- bloquear;
- visualizar conexões em comum.

Não haverá acesso automático a conteúdo privado por serem conexões.

---

## 11. Comunidades

As comunidades são parte central do produto.

Cada comunidade terá:

- nome;
- imagem;
- descrição;
- categoria;
- regras;
- criadora;
- moderadoras;
- membros;
- feed próprio;
- status pública/privada.

Ações:

- entrar;
- sair;
- publicar;
- comentar;
- denunciar;
- moderar.

Comunidades iniciais podem ser oficiais do CONEXÃO ELA para evitar uma plataforma vazia no lançamento.

Exemplos:

- Mulheres que Empreendem
- Mães que se Apoiam
- Autocuidado sem Culpa
- Carreira & Propósito
- Finanças para Elas
- Saúde e Bem-estar
- Beleza & Estilo
- Conexões da Serra

---

## 12. Messenger Ela

O módulo de mensagens privadas deve ser separado do feed.

Primeira versão:

- conversa 1:1;
- texto;
- histórico;
- lista de conversas;
- última mensagem;
- não lidas;
- data/hora;
- bloqueio.

Segunda evolução:

- imagens;
- áudio;
- reações;
- grupos;
- anexos.

### Modelo

Entidades principais:

- conversations
- conversation_members
- messages
- message_reads

Toda consulta deve validar participação na conversa.

Nenhuma usuária pode buscar uma conversa da qual não seja membro.

---

## 13. Eventos

O módulo de eventos reaproveita a visão já criada para o CONEXÃO ELA.

Cada evento possui:

- título;
- descrição;
- imagem;
- data;
- horário;
- local;
- gratuito/pago;
- capacidade;
- organizadora;
- status.

A usuária pode:

- visualizar evento;
- inscrever-se;
- cancelar inscrição;
- receber convite digital;
- gerar convite com nome;
- gerar QR Code;
- salvar/compartilhar convite.

Futuro:

- check-in;
- lista de presença;
- certificado;
- pagamento.

---

## 14. Meu Espaço — área privada

Esta área preserva a essência do antigo BÁRBARA LIFE, mas agora é individual por usuária.

Módulos:

- Hoje
- Diário
- Metas
- Bem-estar
- Beleza & Autocuidado
- Evolução
- Lembranças
- Carta para o Futuro
- Pequenas Vitórias

### Regra absoluta

Nada do Meu Espaço aparece na rede social por padrão.

Compartilhar uma conquista no feed deve ser uma ação explícita.

---

## 15. Dados atuais da Bárbara

Os dados existentes serão preservados.

A migração deve:

1. manter o mesmo user_id da Bárbara;
2. manter registros owner-scoped atuais;
3. converter o perfil atual para o novo formato social;
4. manter diário, metas, wellness e demais dados privados;
5. trocar somente textos e identidade visual ligados à marca antiga.

Nenhuma migração destrutiva será aceita.

---

## 16. Modelo de dados social

Novas coleções/tabelas esperadas:

### profiles
- owner_user_id
- display_name
- username
- bio
- city
- state
- avatar_key
- cover_key
- interests
- onboarding_completed
- visibility

### posts
- id
- author_user_id
- body
- media_key
- media_type
- audience
- community_id nullable
- created_at
- updated_at
- deleted_at

### post_likes
- post_id
- user_id
- created_at

Restrição única: post_id + user_id.

### comments
- id
- post_id
- author_user_id
- body
- created_at
- updated_at
- deleted_at

### connections
- requester_user_id
- addressee_user_id
- status
- created_at
- updated_at

### blocks
- blocker_user_id
- blocked_user_id
- created_at

### communities
- id
- name
- slug
- description
- image_key
- category
- visibility
- owner_user_id
- created_at

### community_members
- community_id
- user_id
- role
- status
- joined_at

### conversations
- id
- type
- created_at
- updated_at

### conversation_members
- conversation_id
- user_id
- joined_at
- last_read_at

### messages
- id
- conversation_id
- sender_user_id
- body
- media_key nullable
- created_at
- deleted_at

### notifications
- id
- user_id
- actor_user_id nullable
- type
- entity_type
- entity_id
- read_at
- created_at

### reports
- id
- reporter_user_id
- entity_type
- entity_id
- reason
- status
- created_at

### events
- id
- title
- description
- image_key
- starts_at
- ends_at
- location
- is_paid
- capacity
- owner_user_id
- status

### event_registrations
- event_id
- user_id
- status
- qr_token
- created_at

---

## 17. Visibilidade e autorização

### Dados privados
Sempre owner-scoped.

### Perfil social
Leitura conforme visibilidade definida.

### Posts
Leitura conforme audiência.

### Comunidades
Leitura conforme visibilidade e membership.

### Mensagens
Somente membros da conversa.

### Eventos
Conforme status do evento.

### Administração
Somente papéis administrativos explícitos.

Não confiar em filtros apenas no front-end. Toda autorização importante deve ser aplicada no backend.

---

## 18. Moderação e segurança social

Recursos mínimos:

- denunciar post;
- denunciar comentário;
- denunciar perfil;
- bloquear usuária;
- remover próprio conteúdo;
- painel de denúncias;
- desativação de usuário pelo admin.

O aplicativo deve possuir regras de comunidade claras.

Para o MVP, moderação pode ser manual pelo painel administrativo.

---

## 19. Painel administrativo

Área separada da experiência das usuárias.

Funções:

- total de contas;
- novas contas;
- usuárias ativas;
- listar usuárias;
- pesquisar e-mail/nome;
- suspender/reativar;
- visualizar denúncias;
- moderar posts;
- administrar comunidades oficiais;
- administrar eventos;
- acompanhar métricas básicas.

O painel não deve expor conteúdo privado do Meu Espaço.

---

## 20. Notificações

Tipos iniciais:

- solicitação de conexão;
- conexão aceita;
- curtida;
- comentário;
- nova mensagem;
- convite/evento;
- atividade de comunidade.

Primeira versão pode usar notificações internas.

Push notification entra em fase posterior.

---

## 21. Busca

Busca global por:

- pessoas;
- comunidades;
- eventos.

Futuro:

- posts;
- assuntos;
- hashtags.

---

## 22. Identidade visual

O nome BÁRBARA LIFE deve ser removido de:

- package metadata;
- manifest;
- title;
- PWA;
- cabeçalho;
- login;
- textos;
- rotas visíveis;
- mensagens de sistema.

Nova marca:

**CONEXÃO ELA**

Direção visual:

- feminina sem parecer infantil;
- elegante;
- acolhedora;
- humana;
- moderna;
- menos artificial;
- uso de rosa, vinho e tons quentes com contraste adequado;
- forte experiência mobile.

---

## 23. Navegação sugerida

### Barra inferior
- Início
- Comunidades
- Criar
- Mensagens
- Perfil

### Dentro de Perfil
- Meu Perfil
- Minhas Conexões
- Meus Eventos
- Meu Espaço
- Configurações
- Segurança
- Sair

---

## 24. Rotas principais

Sugestão:

- `/` — feed
- `/entrar`
- `/cadastro`
- `/onboarding`
- `/perfil/:username`
- `/comunidades`
- `/comunidades/:slug`
- `/mensagens`
- `/mensagens/:conversationId`
- `/eventos`
- `/eventos/:id`
- `/meu-espaco`
- `/meu-espaco/hoje`
- `/meu-espaco/diario`
- `/meu-espaco/metas`
- `/meu-espaco/bem-estar`
- `/meu-espaco/autocuidado`
- `/meu-espaco/evolucao`

---

## 25. Fases de implementação

### Fase 1 — Fundação multiusuária
- renomear produto;
- cadastro aberto;
- lifetime automático;
- remover bloqueio de e-mail fixo da Bárbara;
- preservar dados existentes;
- perfil social;
- onboarding;
- novo shell/navegação.

### Fase 2 — Feed social
- posts;
- fotos;
- curtidas;
- comentários;
- perfis;
- denúncias básicas.

### Fase 3 — Conexões e comunidades
- amizade/conexão;
- sugestões;
- comunidades;
- membership;
- feed de comunidade.

### Fase 4 — Messenger Ela
- conversas;
- mensagens;
- não lidas;
- bloqueio;
- realtime quando seguro.

### Fase 5 — Eventos
- catálogo;
- inscrição;
- convite;
- QR Code;
- administração.

### Fase 6 — Meu Espaço 2.0
- reorganizar diário/metas/bem-estar/autocuidado;
- lembranças;
- cartas futuras;
- pequenas vitórias;
- relatórios pessoais.

### Fase 7 — Administração e escala
- moderação;
- métricas;
- observabilidade;
- otimizações;
- push;
- storage social expandido.

---

## 26. Estratégia de testes

### Autenticação
- cadastro público permitido somente no projeto CONEXÃO ELA;
- acesso criado como lifetime;
- outros projetos não mudam;
- login e logout;
- e-mail duplicado;
- senha inválida.

### Isolamento
Criar pelo menos duas usuárias de teste.

Validar que:

- A não lista diário de B;
- A não altera metas de B;
- A não acessa storage privado de B;
- A não lê conversa sem membership;
- A não altera post de B;
- bloqueios são respeitados.

### Social
- criar post;
- curtir/descurtir;
- comentar;
- excluir conteúdo próprio;
- audiência.

### Comunidades
- entrar/sair;
- papel de moderadora;
- comunidade privada.

### Mensagens
- iniciar conversa;
- enviar mensagem;
- marcar leitura;
- negar acesso a não membro.

### Migração
- dados da Bárbara permanecem intactos;
- perfil dela continua acessível;
- conteúdo privado permanece associado ao mesmo user_id.

---

## 27. Critérios de aceite do MVP

O MVP está pronto quando:

1. não existe mais identidade BÁRBARA LIFE na interface;
2. qualquer nova usuária consegue criar conta pelo link;
3. nova conta recebe acesso gratuito permanente;
4. login funciona com e-mail + senha;
5. Bárbara mantém os dados atuais;
6. duas usuárias não conseguem acessar dados privados uma da outra;
7. cada usuária possui perfil;
8. usuária consegue publicar no feed;
9. usuária consegue curtir e comentar;
10. usuária consegue conectar-se com outra;
11. usuária consegue entrar em comunidade;
12. usuária consegue trocar mensagens privadas;
13. área Meu Espaço continua privada;
14. app continua instalável como PWA;
15. build e testes passam;
16. versão publicada é verificada no Vercel.

---

## 28. Fora do MVP

Não incluir na primeira entrega:

- lives;
- stories;
- reels completos;
- marketplace;
- pagamentos entre usuárias;
- algoritmo avançado de recomendação;
- chamadas de áudio/vídeo;
- criptografia ponta a ponta de mensagens;
- streaming;
- criação automática de conteúdo por IA;
- gamificação complexa.

Esses recursos podem ser avaliados depois que a base social estiver estável.

---

## 29. Riscos principais

### Cadastro público afetar outros produtos
Mitigação: configuração por projeto, nunca alteração global indiscriminada.

### Vazamento de dados privados
Mitigação: autorização no backend, testes multiusuária e owner scope.

### Crescimento do front-end monolítico
Mitigação: separar por módulos/domínios desde a Fase 1.

### Messenger aumentar complexidade
Mitigação: iniciar com texto 1:1 e somente depois adicionar mídia/grupos.

### Rede vazia no lançamento
Mitigação: comunidades oficiais, eventos iniciais e conteúdo de boas-vindas.

### Moderação
Mitigação: denúncias, bloqueio e painel administrativo desde as primeiras fases sociais.

---

## 30. Decisões fechadas

- Nome: CONEXÃO ELA.
- Origem: evolução do BÁRBARA LIFE.
- Cadastro: aberto para qualquer mulher com o link.
- Autenticação inicial: e-mail + senha.
- Confirmação de e-mail: não obrigatória no MVP.
- Preço: gratuito.
- Duração: acesso permanente.
- Área privada: preservada.
- Dados da Bárbara: preservados.
- Rede social: feed + perfis + conexões + comunidades.
- Mensagens: Messenger Ela.
- Eventos: integrados ao produto.
- Backend: AUREON Base.
- PWA: mantido.
- Construção: modular e em fases.

---

## 31. Próxima etapa

Após a revisão e aprovação deste documento, criar um plano de implementação detalhado com:

- ordem de migrações;
- testes RED → GREEN;
- mudanças no AUREON Base;
- mudanças no front-end;
- migração segura da Bárbara;
- criação do feed;
- criação das comunidades;
- criação do Messenger;
- publicação e verificação no Vercel.

Nenhuma implementação arquitetural deve começar antes da aprovação desta especificação.
