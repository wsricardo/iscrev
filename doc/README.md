# Guia da Documentação do iScrev Notes

> **Propósito:** Este documento é o ponto de entrada central para toda a documentação técnica e conceitual do iScrev Notes. Ele serve como um mapa para ajudar desenvolvedores e mantenedores a encontrar a informação de que precisam de forma rápida e eficiente.

---

## 1. Estrutura da Documentação

A documentação está organizada em subdiretórios com base em sua finalidade. Manter essa estrutura é crucial para a clareza e a sustentabilidade do projeto.

### `/architecture`
Descreve a estrutura do sistema, tanto a atual quanto a planejada.
-   **`current-architecture.md`**: Uma análise detalhada da arquitetura monolítica atual, centrada em `diario.js`. **Leitura obrigatória para entender o ponto de partida.**
-   **`target-architecture.md`**: Descreve a arquitetura modular alvo, baseada em Módulos ES. **Leitura obrigatória para entender para onde estamos indo.** (Atualmente, `GUIDE-Migration.md` ou `SpecsModule.md` cumprem este papel).

### `/specs`
Contém especificações técnicas e contratos de API para os módulos.
-   **`modular-specs.md`**: Define as responsabilidades e as APIs públicas de cada novo módulo na arquitetura-alvo. (Atualmente, `SpecsModule.md` ou `GUIDEModules.md` contêm essa informação).

### `/guides`
Manuais e planos de ação "como fazer".
-   **`migration-plan.md`**: O roteiro de tarefas passo a passo para a refatoração da arquitetura monolítica para a modular. **Este é o guia principal para quem está trabalhando na migração.**
-   **`migration-guide.md`**: Um guia mais discursivo sobre a motivação, os objetivos e as estratégias da migração. (Atualmente, `GUIDE-Migration.md`).

### `/analysis`
Análises aprofundadas de partes específicas do código ou da arquitetura.
-   **`diario-js-analysis.md`**: Um "deep dive" no arquivo `diario.js`, explicando cada uma de suas seções e como elas se conectarão à nova arquitetura.
-   **`modularization-analysis.md`**: Um comparativo direto entre a arquitetura atual e a proposta, destacando os benefícios da migração.

### `/archive`
Documentos históricos, versões antigas de documentação e outros artefatos que são valiosos para o contexto, mas não descrevem o estado atual do projeto.
-   **`History.md`**: Um resumo da jornada de desenvolvimento do iScrev Notes, desde a concepção até os desafios técnicos superados.
-   **Outros arquivos `DOCUMENTACAO-v*.md`**: Versões legadas que devem ser mantidas aqui para referência histórica.

---

## 2. Como Usar Esta Documentação

-   **É novo no projeto?**
    1.  Comece lendo o `README.md` principal na raiz do projeto.
    2.  Leia `doc/archive/History.md` para entender a jornada.
    3.  Leia `doc/architecture/current-architecture.md` para entender como o sistema funciona hoje.
    4.  Leia `doc/architecture/target-architecture.md` para entender a visão de futuro.

-   **Vai trabalhar na migração para módulos?**
    -   Seu guia principal é o `doc/guides/migration-plan.md`. Use-o como um checklist.
    -   Consulte `doc/specs/modular-specs.md` para entender os contratos que cada novo módulo deve seguir.

-   **Precisa corrigir um bug no código atual?**
    -   `doc/analysis/diario-js-analysis.md` é o seu melhor recurso para navegar pelo monolito `diario.js`.

-   **Quer adicionar uma nova feature?**
    -   Se a arquitetura ainda for a monolítica, use `diario-js-analysis.md`.
    -   Se a arquitetura já for modular, consulte `target-architecture.md` e `modular-specs.md` para decidir onde a nova funcionalidade se encaixa.

---

## 3. Mantendo a Documentação Viva

A documentação só é útil se for confiável. Siga estes princípios:

-   **Documente antes ou durante, não depois:** Ao planejar uma mudança significativa, crie ou atualize o documento de especificação ou arquitetura correspondente.
-   **Atualize o plano:** Ao concluir uma tarefa do `migration-plan.md`, marque-a como concluída.
-   **Mova arquivos legados:** Quando um documento se tornar obsoleto (ex: uma análise de um código que foi completamente refatorado), mova-o para o diretório `/archive`. Não o exclua.

Manter esta organização ajudará o iScrev Notes a crescer de forma saudável e sustentável.