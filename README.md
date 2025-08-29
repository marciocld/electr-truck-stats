# Sistema de Estatísticas de Frota Elétrica

Sistema web para monitoramento e geração de relatórios de consumo de veículos elétricos.

## Funcionalidades Principais

- 📊 **Dashboard de Monitoramento**: Visualização em tempo real dos dados da frota
- 📈 **Gráficos de Performance**: Análise de consumo e eficiência
- 🚛 **Seleção de Dispositivos**: Filtragem por veículos específicos
- 📄 **Geração de Relatórios PDF**: Dois métodos disponíveis
  - **PDF com Imagem**: Captura HTML como imagem (método tradicional)
  - **PDF Template Nativo**: Geração vetorial com elementos nativos do jsPDF (novo)
- 🔄 **Integração com API**: Dados em tempo real da frota

## Project info

**URL**: https://lovable.dev/projects/353769cf-9fc5-40c9-8d2b-bfa1da8540a2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/353769cf-9fc5-40c9-8d2b-bfa1da8540a2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.

## Sistema de Geração de PDF

O projeto oferece duas opções para geração de relatórios em PDF:

### 1. PDF com Imagem (Método Tradicional)
- Captura o HTML renderizado como imagem
- Mantém a aparência exata do design web
- Arquivos maiores devido às imagens
- Texto não selecionável

### 2. PDF Template Nativo (Novo Método)
- Usa elementos nativos do jsPDF
- Arquivos menores e mais eficientes
- Texto selecionável e vetorial
- Melhor performance e acessibilidade
- Layout otimizado para impressão

### Como Usar

1. Acesse o **Gerador de Relatórios**
2. Configure período e dispositivos
3. Clique em **"Gerar Preview"**
4. Escolha entre:
   - **"PDF com Imagem"**: Método tradicional
   - **"PDF Template Nativo"**: Novo método recomendado

### Documentação Técnica

- [Guia do Template PDF](./docs/PDF_TEMPLATE_GUIDE.md): Documentação completa
- [Guia do Serviço PDF](./docs/PDF_SERVICE_GUIDE.md): Documentação do serviço original
- [Exemplos de Uso](./src/lib/pdf/pdf-template-example.ts): Código de exemplo

## Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **PDF**: jsPDF + html2canvas
- **Gráficos**: Recharts
- **Estado**: React Query
- **Formatação**: Intl API (padrão brasileiro)
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/353769cf-9fc5-40c9-8d2b-bfa1da8540a2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
