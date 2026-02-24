"use client";
import { useState } from "react";
import {
  LayoutDashboard, TrendingUp, CheckSquare, Coins, StickyNote,
  ChevronDown, ChevronRight, Wallet, Target, PiggyBank, Repeat,
  BarChart2, Flame, Calendar, GripVertical, Tag, Pin, List,
  RefreshCw, TrendingDown, HelpCircle, Keyboard,
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  topics: Topic[];
}

interface Topic {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard size={16} />,
    title: "Dashboard",
    color: "#6366f1",
    topics: [
      {
        title: "O que é o Dashboard?",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>O Dashboard é a tela principal do Segna. Ele mostra um resumo de tudo em um só lugar:</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#6366f1] mt-0.5">•</span><span><strong className="text-white">Saldo do mês</strong> — receitas menos despesas, com barra de orçamento</span></li>
              <li className="flex gap-2"><span className="text-[#6366f1] mt-0.5">•</span><span><strong className="text-white">Hábitos hoje</strong> — quantos você marcou de quantos totais</span></li>
              <li className="flex gap-2"><span className="text-[#6366f1] mt-0.5">•</span><span><strong className="text-white">Portfolio DeFi</strong> — valor total dos seus tokens em R$</span></li>
              <li className="flex gap-2"><span className="text-[#6366f1] mt-0.5">•</span><span><strong className="text-white">Notas</strong> — quantas notas e tags você tem</span></li>
            </ul>
          </div>
        ),
      },
      {
        title: "Marcar hábitos pelo Dashboard",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Na seção "Hábitos de hoje", clique em qualquer hábito para marcá-lo como concluído — sem precisar ir até a página de Hábitos. O círculo fica verde e o nome aparece riscado. Clique novamente para desmarcar.
          </p>
        ),
      },
      {
        title: "Widget de clima",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            O clima é exibido automaticamente no canto superior direito usando sua localização. Se o navegador pedir permissão de localização, aceite para o widget funcionar. Exibe temperatura atual e condição do tempo.
          </p>
        ),
      },
    ],
  },
  {
    id: "financas",
    icon: <TrendingUp size={16} />,
    title: "Finanças",
    color: "#22c55e",
    topics: [
      {
        title: "Adicionar receitas e despesas",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Clique em <strong className="text-white">Adicionar</strong> no canto superior direito da página de Finanças.</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span>Escolha <strong className="text-white">Receita</strong> (dinheiro que entrou) ou <strong className="text-white">Despesa</strong> (dinheiro que saiu)</span></li>
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span>Digite o valor, descrição, categoria e data</span></li>
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span>Marque <strong className="text-white">"Lançar automaticamente todo mês"</strong> para despesas fixas (aluguel, plano, etc.)</span></li>
            </ul>
          </div>
        ),
      },
      {
        title: "Categorias disponíveis",
        content: (
          <div className="space-y-3 text-sm text-[#9ca3af]">
            <div>
              <p className="text-white font-medium mb-1.5">Receitas:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Salário", "Bico / Freelance", "Rendimento", "Presente / Doação", "Outra receita"].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-[#22c55e]/10 text-[#22c55e] text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-medium mb-1.5">Despesas:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Moradia", "Alimentação", "Transporte", "Saúde", "Entretenimento", "Educação", "Compras", "Investimentos", "Outros"].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-[#ef4444]/10 text-[#ef4444] text-xs">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Editar e excluir transações",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Passe o mouse sobre uma transação (ou toque nela no celular) para ver os botões:</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span><strong className="text-white">Lápis</strong> — edita descrição, valor, data e categoria inline</span></li>
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span><strong className="text-white">Lixeira</strong> — pede confirmação antes de excluir</span></li>
            </ul>
            <p>Para salvar a edição: clique no ✓ verde. Para cancelar: clique no ✗.</p>
          </div>
        ),
      },
      {
        title: "Orçamento mensal",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Defina um limite total de gastos para o mês. A barra de progresso muda de cor conforme você gasta:</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span><strong className="text-[#22c55e]">Verde</strong> — dentro do orçamento</span></li>
              <li className="flex gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span><strong className="text-[#f59e0b]">Amarelo</strong> — acima de 80% do limite</span></li>
              <li className="flex gap-2"><span className="text-[#ef4444] mt-0.5">•</span><span><strong className="text-[#ef4444]">Vermelho</strong> — orçamento estourado</span></li>
            </ul>
          </div>
        ),
      },
      {
        title: "Metas por categoria",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Defina um limite de gasto para cada categoria (ex: R$500 em Alimentação). O app calcula automaticamente quanto você já gastou naquele mês naquela categoria e mostra o progresso. Aparece em vermelho quando você passa do limite.
          </p>
        ),
      },
      {
        title: "Meta de economia",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Define quanto você quer economizar no mês. Clique em <strong className="text-white">⚙ Categorias</strong> para escolher quais tipos de receita contam para o cálculo (ex: só Salário, ou Salário + Freelance).</p>
            <p>O progresso é calculado como: <code className="bg-[#1f1f1f] px-1.5 py-0.5 rounded text-xs text-[#a78bfa]">receitas selecionadas − despesas do mês</code></p>
          </div>
        ),
      },
      {
        title: "Transações recorrentes",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Marque "Lançar automaticamente todo mês" ao criar uma transação. No início de cada mês, ao abrir a página de Finanças, o app copia automaticamente as transações recorrentes do mês anterior para o mês atual.</p>
            <p>Aparecem com badge roxo <span className="inline-block px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#a78bfa] text-xs">recorrente</span> na lista.</p>
          </div>
        ),
      },
      {
        title: "Gráficos",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span><strong className="text-white">Linha mensal</strong> — evolução de receitas e despesas pelos últimos meses</span></li>
              <li className="flex gap-2"><span className="text-[#22c55e] mt-0.5">•</span><span><strong className="text-white">Pizza de despesas</strong> — distribuição dos gastos por categoria no mês atual</span></li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "habitos",
    icon: <CheckSquare size={16} />,
    title: "Hábitos",
    color: "#a78bfa",
    topics: [
      {
        title: "Criar um hábito",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Clique em <strong className="text-white">Novo hábito</strong>. Configure:</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#a78bfa] mt-0.5">•</span><span><strong className="text-white">Nome</strong> — ex: "Beber 2L de água"</span></li>
              <li className="flex gap-2"><span className="text-[#a78bfa] mt-0.5">•</span><span><strong className="text-white">Ícone</strong> — emoji que representa o hábito</span></li>
              <li className="flex gap-2"><span className="text-[#a78bfa] mt-0.5">•</span><span><strong className="text-white">Cor</strong> — cor do hábito no histórico e heatmap</span></li>
              <li className="flex gap-2"><span className="text-[#a78bfa] mt-0.5">•</span><span><strong className="text-white">Tag</strong> — categoria: saúde, trabalho, pessoal, aprendizado ou finanças</span></li>
            </ul>
          </div>
        ),
      },
      {
        title: "Marcar conclusão diária",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Clique em qualquer hábito na lista para marcar como concluído hoje. O fundo fica verde e o nome aparece riscado. Clique novamente para desmarcar. Você também pode marcar hábitos direto pelo Dashboard.
          </p>
        ),
      },
      {
        title: "Streak (sequência)",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>O streak conta quantos dias consecutivos você completou um hábito. Aparece com o ícone 🔥 ao lado do hábito.</p>
            <p>O <strong className="text-white">melhor streak</strong> (recorde pessoal) aparece logo abaixo, em cinza, para referência.</p>
          </div>
        ),
      },
      {
        title: "Histórico da semana",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            O grid semanal mostra os últimos 7 dias com letras <strong className="text-white">S T Q Q S S D</strong>. Os quadrados coloridos indicam os dias em que o hábito foi concluído. O dia de hoje tem um contorno destacado. Passe o mouse sobre um quadrado para ver a data e o status.
          </p>
        ),
      },
      {
        title: "Heatmap anual",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            O heatmap mostra os últimos 365 dias. Cada célula representa um dia — quanto mais escura, mais hábitos foram concluídos naquele dia. É uma visão geral da sua consistência ao longo do ano.
          </p>
        ),
      },
      {
        title: "Meta de frequência",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Defina quantas vezes por semana quer realizar um hábito (ex: 3x por semana). O app conta as conclusões da semana atual e mostra o progresso. Útil para hábitos que não precisam ser diários.
          </p>
        ),
      },
      {
        title: "Nota diária por hábito",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Abaixo do nome de cada hábito, clique em <strong className="text-white">"nota de hoje"</strong> para adicionar uma anotação referente àquele dia (ex: "Corri 5km"). A nota fica salva para aquela data específica.
          </p>
        ),
      },
      {
        title: "Reordenar hábitos",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Segure e arraste o ícone <span className="inline-block"><GripVertical size={12} className="inline text-[#6b7280]" /></span> à esquerda de cada hábito para mudar a ordem da lista.
          </p>
        ),
      },
    ],
  },
  {
    id: "defi",
    icon: <Coins size={16} />,
    title: "DeFi / Cripto",
    color: "#f59e0b",
    topics: [
      {
        title: "Adicionar um token",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Clique em <strong className="text-white">Adicionar Token</strong>. Digite o símbolo (ex: BTC, ETH, SOL) e o app busca o preço atual automaticamente via CoinGecko.</p>
            <p>Informe a <strong className="text-white">quantidade</strong> que você possui. O valor total é calculado automaticamente.</p>
          </div>
        ),
      },
      {
        title: "Atualizar preço manualmente",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Clique no botão <strong className="text-white">Lápis</strong> ao lado do token para editar o preço atual e a quantidade. Use quando quiser registrar um preço específico ou o app não encontrar o token automaticamente.
          </p>
        ),
      },
      {
        title: "Atualizar preços automaticamente",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Clique no botão <RefreshCw size={12} className="inline text-[#f59e0b] mx-0.5" /> abaixo do resumo do portfolio para buscar os preços atuais de todos os tokens via CoinGecko. Os preços são em BRL.
          </p>
        ),
      },
      {
        title: "Preço médio (PM)",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>O preço médio é o custo médio de aquisição do token. Para calcular, clique em <strong className="text-white">PM</strong> ao lado do token e adicione entradas com data, quantidade e preço pago.</p>
            <p>O app calcula automaticamente o <strong className="text-white">P&L</strong> (lucro ou prejuízo) comparando o preço médio com o preço atual.</p>
          </div>
        ),
      },
      {
        title: "Preço base (referência)",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Clique no ícone <TrendingUp size={12} className="inline text-[#f59e0b] mx-0.5" /> para salvar o preço atual como referência. A variação % mostrada no token compara o preço atual com esse valor salvo — útil para acompanhar a valorização desde quando você começou a monitorar.
          </p>
        ),
      },
      {
        title: "Histórico de preços",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Em cada token, clique em <strong className="text-white">Histórico</strong> para adicionar registros manuais de preço por data. Isso gera um gráfico de evolução do preço ao longo do tempo.
          </p>
        ),
      },
      {
        title: "Gráficos do portfolio",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span><strong className="text-white">Pizza</strong> — distribuição percentual de cada token no portfolio</span></li>
              <li className="flex gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span><strong className="text-white">Linha</strong> — evolução do valor total do portfolio ao longo do tempo (baseado nos snapshots salvos)</span></li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "notas",
    icon: <StickyNote size={16} />,
    title: "Notas",
    color: "#06b6d4",
    topics: [
      {
        title: "Criar uma nota",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Digite no campo de texto no topo da página. Pressione <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Ctrl</kbd> + <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Enter</kbd> ou clique em <strong className="text-white">Salvar</strong>.</p>
            <p>Selecione uma tag antes de salvar para organizar a nota.</p>
          </div>
        ),
      },
      {
        title: "Markdown (formatação de texto)",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af]">
            <p className="leading-relaxed">As notas suportam markdown básico:</p>
            <div className="space-y-1.5 bg-[#141414] rounded-lg p-3 font-mono text-xs">
              <div className="flex gap-4 items-center">
                <span className="text-[#4a4a4a] w-32">**negrito**</span>
                <span className="text-white font-bold">negrito</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-[#4a4a4a] w-32">_itálico_</span>
                <span className="text-white italic">itálico</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-[#4a4a4a] w-32">`código`</span>
                <code className="bg-[#2a2a2a] text-[#a78bfa] px-1 rounded">código</code>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-[#4a4a4a] w-32"># Título</span>
                <span className="text-white font-bold text-base">Título</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-[#4a4a4a] w-32">## Subtítulo</span>
                <span className="text-white font-semibold">Subtítulo</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Modo checklist",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Para criar uma lista de tarefas, comece cada linha com <code className="bg-[#1f1f1f] px-1.5 py-0.5 rounded text-xs text-[#a78bfa]">[ ] </code> (item pendente) ou <code className="bg-[#1f1f1f] px-1.5 py-0.5 rounded text-xs text-[#a78bfa]">[x] </code> (item feito). O app detecta automaticamente e renderiza como checklist interativo.</p>
            <div className="bg-[#141414] rounded-lg p-3 font-mono text-xs space-y-1 text-[#4a4a4a]">
              <p>[ ] Comprar leite</p>
              <p>[x] Pagar conta de luz</p>
              <p>[ ] Ligar pro dentista</p>
            </div>
            <p>Na visualização, clique em cada item para marcar/desmarcar.</p>
          </div>
        ),
      },
      {
        title: "Fixar notas",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Clique no ícone <Pin size={12} className="inline text-[#a78bfa] mx-0.5" /> para fixar uma nota no topo da lista. Notas fixadas aparecem com borda roxa e badge "fixada". Clique novamente para desafixar.
          </p>
        ),
      },
      {
        title: "Tags",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Tags organizam suas notas por tema. As tags padrão são: <strong className="text-white">Ideias</strong>, <strong className="text-white">Filmes/Séries</strong> e <strong className="text-white">Livros</strong>.</p>
            <p>Crie tags personalizadas clicando em <strong className="text-white">+ Nova tag</strong> — escolha nome e cor. Para excluir uma tag, passe o mouse sobre ela e clique no ✕.</p>
          </div>
        ),
      },
      {
        title: "Buscar e filtrar",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Use a barra de busca para encontrar notas pelo conteúdo. Clique em uma tag para filtrar apenas as notas daquela tag.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "geral",
    icon: <HelpCircle size={16} />,
    title: "Geral",
    color: "#9ca3af",
    topics: [
      {
        title: "Onde ficam os dados?",
        content: (
          <div className="space-y-2 text-sm text-[#9ca3af] leading-relaxed">
            <p>Todos os dados ficam salvos no <strong className="text-white">localStorage</strong> do seu navegador — diretamente no dispositivo, sem servidor. Isso significa:</p>
            <ul className="space-y-1.5 pl-3">
              <li className="flex gap-2"><span className="text-[#9ca3af] mt-0.5">•</span><span>Funciona offline</span></li>
              <li className="flex gap-2"><span className="text-[#9ca3af] mt-0.5">•</span><span>Os dados do celular ficam no celular, e os do PC ficam no PC (separados)</span></li>
              <li className="flex gap-2"><span className="text-[#ef4444] mt-0.5">•</span><span>Limpar os dados do navegador apaga tudo — não faça isso</span></li>
            </ul>
          </div>
        ),
      },
      {
        title: "Instalar no celular (PWA)",
        content: (
          <div className="space-y-3 text-sm text-[#9ca3af] leading-relaxed">
            <div>
              <p className="text-white font-medium mb-1">Android (Chrome):</p>
              <ol className="space-y-1 pl-3 list-decimal list-inside">
                <li>Abra o app no Chrome</li>
                <li>Toque no banner "Instalar Segna" ou no menu ⋮ → "Instalar app"</li>
                <li>Confirme — o ícone roxo S aparece na sua home</li>
              </ol>
            </div>
            <div>
              <p className="text-white font-medium mb-1">iPhone (Safari):</p>
              <ol className="space-y-1 pl-3 list-decimal list-inside">
                <li>Abra o app no Safari (obrigatório)</li>
                <li>Toque no botão Compartilhar ↑</li>
                <li>Role e toque "Adicionar à Tela de Início"</li>
                <li>Toque "Adicionar"</li>
              </ol>
            </div>
          </div>
        ),
      },
      {
        title: "Atalhos de teclado",
        content: (
          <div className="space-y-1.5 text-sm text-[#9ca3af]">
            <div className="flex items-center justify-between py-1 border-b border-[#1f1f1f]">
              <span>Salvar nota</span>
              <div className="flex gap-1">
                <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Ctrl</kbd>
                <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Enter</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#1f1f1f]">
              <span>Cancelar edição de nota</span>
              <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Esc</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Salvar edição de nota</span>
              <div className="flex gap-1">
                <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Ctrl</kbd>
                <kbd className="bg-[#1f1f1f] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-xs text-white">Enter</kbd>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Notificações e atualizações",
        content: (
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            O app é atualizado automaticamente quando há novas versões — basta reabrir o app. Nenhuma ação necessária da sua parte. O service worker cuida de tudo em segundo plano.
          </p>
        ),
      },
    ],
  },
];

function TopicItem({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#141414] transition-colors cursor-pointer group"
      >
        <span className="text-sm text-[#d1d5db] group-hover:text-white transition-colors">{topic.title}</span>
        {open
          ? <ChevronDown size={14} className="text-[#4a4a4a] flex-shrink-0" />
          : <ChevronRight size={14} className="text-[#4a4a4a] flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4">
          {topic.content}
        </div>
      )}
    </div>
  );
}

export default function AjudaPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Como funciona?</h1>
        <p className="text-sm text-[#6b7280]">Guia completo do Segna</p>
      </div>

      {/* Quick nav pills */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(activeSection === s.id ? null : s.id);
              setTimeout(() => {
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border"
            style={
              activeSection === s.id
                ? { background: s.color + "20", color: s.color, borderColor: s.color + "50" }
                : { background: "transparent", color: "#6b7280", borderColor: "#2a2a2a" }
            }
          >
            {s.icon}
            {s.title}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-[#1d1d1d] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: section.color + "20", color: section.color }}
                >
                  {section.icon}
                </div>
                <span className="text-sm font-medium text-white">{section.title}</span>
                <span className="text-xs text-[#4a4a4a]">{section.topics.length} tópicos</span>
              </div>
              {activeSection === section.id
                ? <ChevronDown size={15} className="text-[#4a4a4a]" />
                : <ChevronRight size={15} className="text-[#4a4a4a]" />
              }
            </button>

            {/* Topics */}
            {activeSection === section.id && (
              <div className="border-t border-[#1f1f1f]">
                {section.topics.map((topic) => (
                  <TopicItem key={topic.title} topic={topic} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-[#3a3a3a]">
        Segna v1.0 · Feito por Mateus Segna
      </div>
    </div>
  );
}
