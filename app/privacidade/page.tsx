"use client";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacidadePage() {
  const updated = "6 de março de 2025";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Voltar */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-white transition-colors mb-10 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Voltar para o início
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield size={18} className="text-[#a78bfa]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Política de Privacidade</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Última atualização: {updated}
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-8 text-sm text-[#9ca3af] leading-relaxed">
          O <strong className="text-white">Segna</strong> é um dashboard pessoal open source desenvolvido por Mateus
          (doravante &quot;nós&quot;). Esta política descreve como coletamos, usamos e protegemos suas informações
          em conformidade com a <strong className="text-white">Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
        </div>

        {/* Sections */}
        <div className="space-y-8">

          <Section num="1" title="Dados que coletamos">
            <p>Ao usar o Segna, coletamos apenas os dados que você mesmo insere:</p>
            <ul>
              <li><strong>Conta:</strong> endereço de e-mail e senha (armazenada com hash seguro pelo Supabase Auth)</li>
              <li><strong>Dados pessoais do app:</strong> transações financeiras, hábitos, notas, tarefas, investimentos e métricas corporais que você cadastra voluntariamente</li>
              <li><strong>Dados de uso:</strong> logs técnicos básicos gerados automaticamente pelo servidor (endereço IP, horário de acesso) — não usados para rastreamento individual</li>
            </ul>
            <p>Não coletamos dados de terceiros, não usamos cookies de rastreamento e não vendemos nenhuma informação.</p>
          </Section>

          <Section num="2" title="Como usamos seus dados">
            <p>Seus dados são usados exclusivamente para:</p>
            <ul>
              <li>Prestar o serviço do Segna (sincronizar seus dados entre dispositivos)</li>
              <li>Autenticar seu acesso à plataforma</li>
              <li>Melhorar a estabilidade e o desempenho do app</li>
            </ul>
            <p>Nunca usamos seus dados para publicidade, perfis comportamentais ou qualquer finalidade além do funcionamento do serviço.</p>
          </Section>

          <Section num="3" title="Onde seus dados ficam armazenados">
            <p>
              Seus dados são armazenados no <strong>Supabase</strong> (
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:text-white transition-colors">supabase.com</a>
              ), uma plataforma de banco de dados com servidores localizados nos <strong>Estados Unidos</strong>.
              A transferência internacional de dados é realizada com as garantias adequadas previstas pela LGPD
              (Art. 33, inciso I — países com nível adequado de proteção segundo a ANPD, ou cláusulas contratuais padrão).
            </p>
            <p>
              Localmente, o app usa o <strong>localStorage</strong> do seu navegador como cache para carregamento
              instantâneo. Esses dados ficam apenas no seu dispositivo.
            </p>
          </Section>

          <Section num="4" title="Compartilhamento de dados">
            <p>
              Seus dados <strong>não são compartilhados</strong> com terceiros, exceto pelos provedores
              de infraestrutura necessários ao funcionamento do serviço:
            </p>
            <ul>
              <li><strong>Supabase Inc.</strong> — banco de dados e autenticação</li>
              <li><strong>Vercel Inc.</strong> — hospedagem e entrega do app</li>
              <li><strong>CoinGecko API</strong> — consultas de preço de criptomoedas (sem envio de dados pessoais)</li>
            </ul>
            <p>
              Esses provedores têm suas próprias políticas de privacidade e processam dados apenas
              conforme necessário para fornecer seus serviços.
            </p>
          </Section>

          <Section num="5" title="Cookies e rastreamento">
            <p>
              O Segna utiliza apenas <strong>cookies funcionais essenciais</strong> para manter sua sessão
              autenticada (gerenciados pelo Supabase Auth). Não usamos cookies de análise, publicidade
              ou rastreamento de terceiros.
            </p>
          </Section>

          <Section num="6" title="Seus direitos (LGPD)">
            <p>Como titular dos dados, você tem direito a:</p>
            <ul>
              <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados — basta excluir sua conta nas Configurações, o que remove permanentemente todos os seus dados do banco de dados</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado (JSON)</li>
              <li><strong>Revogação do consentimento:</strong> cancelar o uso do app a qualquer momento</li>
              <li><strong>Informação:</strong> ser informado sobre com quem seus dados são compartilhados</li>
            </ul>
          </Section>

          <Section num="7" title="Retenção dos dados">
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta,
              todos os dados são permanentemente removidos dos nossos servidores em até <strong>30 dias</strong>.
              Logs técnicos são retidos por no máximo 90 dias por questões de segurança.
            </p>
          </Section>

          <Section num="8" title="Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul>
              <li>Senhas armazenadas com hash bcrypt (nunca em texto plano)</li>
              <li>Comunicação criptografada via HTTPS/TLS em todas as conexões</li>
              <li>Autenticação baseada em JWT com expiração automática</li>
              <li>Acesso ao banco de dados restrito por Row Level Security (RLS) — cada usuário acessa apenas seus próprios dados</li>
              <li>Código-fonte aberto e auditável em <a href="https://github.com/MateusR019/Segna" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:text-white transition-colors">github.com/MateusR019/Segna</a></li>
            </ul>
          </Section>

          <Section num="9" title="Menores de idade">
            <p>
              O Segna não é direcionado a menores de 18 anos e não coletamos intencionalmente
              dados de crianças ou adolescentes. Se você identificar que um menor cadastrou
              uma conta, entre em contato para que possamos excluí-la.
            </p>
          </Section>

          <Section num="10" title="Alterações nesta política">
            <p>
              Podemos atualizar esta política periodicamente. Quando houver alterações relevantes,
              notificaremos pelo e-mail cadastrado e exibiremos um aviso no app. A data de
              &quot;última atualização&quot; no topo desta página sempre refletirá a versão mais recente.
            </p>
          </Section>

          <Section num="11" title="Contato e DPO">
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
            </p>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 mt-3 space-y-1">
              <p className="text-white font-medium">Mateus — Responsável pelo Segna</p>
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:mateusrogerio777@gmail.com" className="text-[#a78bfa] hover:text-white transition-colors">
                  mateusrogerio777@gmail.com
                </a>
              </p>
              <p><strong>GitHub:</strong>{" "}
                <a href="https://github.com/MateusR019/Segna" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:text-white transition-colors">
                  github.com/MateusR019/Segna
                </a>
              </p>
            </div>
            <p className="mt-3">
              Respondemos solicitações em até <strong>15 dias úteis</strong>, conforme prazo previsto pela LGPD.
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] text-center text-xs text-[#3a3a3a]">
          Segna · Open source ·{" "}
          <Link href="/login" className="hover:text-[#6b7280] transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Componente auxiliar de seção ──────────────────────────────────────────────
function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-[#6366f1]/15 text-[#a78bfa] text-xs font-bold flex items-center justify-center flex-shrink-0">
          {num}
        </span>
        {title}
      </h2>
      <div className="text-sm text-[#9ca3af] leading-relaxed space-y-2 pl-8
        [&_ul]:space-y-1.5 [&_ul]:list-none [&_ul>li]:before:content-['•']
        [&_ul>li]:before:text-[#6366f1] [&_ul>li]:before:mr-2
        [&_strong]:text-white [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
