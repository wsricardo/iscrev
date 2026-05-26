# Especificação Técnica do iScrev Notes — Visão Geral

> **Produto:** iScrev Notes  
> **Escopo:** Aplicação principal do diário (`diario.html` e scripts associados)  
> **Metodologia:** Documentação retroativa seguindo princípios de Specification-Driven Development (SDD)

---

## 1. Introdução

Este conjunto de documentos descreve as especificações técnicas do núcleo da aplicação iScrev Notes. O objetivo é formalizar o comportamento, as estruturas de dados, as APIs internas e os protocolos que governam o funcionamento do diário digital.

A documentação foi criada para servir como uma fonte canônica da verdade para manutenção, desenvolvimento de novos recursos e garantia de consistência arquitetural.

## 2. Filosofia Arquitetural

As especificações refletem a filosofia central do projeto:

-   **Local-First:** A fonte da verdade dos dados do usuário é o dispositivo local. A persistência é primariamente no navegador.
-   **Zero Build Step:** O código-fonte é executado diretamente no navegador, sem a necessidade de transpiladores, bundlers ou compiladores.
-   **Tecnologia Web Pura:** A aplicação é construída sobre APIs nativas de HTML5, CSS3 e JavaScript, com o mínimo de dependências externas.

## 3. Índice de Especificações

-   **01 - Modelo de Dados**: Descreve as interfaces `Entry` e `Stroke` e as chaves de armazenamento.
-   **02 - Camada de Persistência**: Especifica a API do módulo `Storage` e sua estratégia de fallback.
-   **03 - Pipeline de Renderização**: Detalha o processo de conversão de Markdown e LaTeX para HTML.
-   **04 - Módulo de Caneta (Pen)**: Especifica a API, os algoritmos e o comportamento do módulo de desenho SVG.
-   **05 - Protocolo de Importação e Exportação**: Define os formatos de arquivo `.md` e os fluxos de exportação para PDF.
-   **06 - Shell da UI e Modos de Operação**: Descreve a estrutura de layout, os modos de uso e a responsividade.
-   **07 - Sistema de Internacionalização (i18n)**: Especifica o funcionamento do sistema de tradução.