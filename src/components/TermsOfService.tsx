import React from 'react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            📜 Termos de Uso – NailAgenda
          </h1>
          <button
            onClick={onBack}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Objetivo do Serviço</h2>
            <p>
              O NailAgenda é uma plataforma de agendamento online voltada para profissionais Nail Designers, 
              permitindo que clientes marquem horários de atendimento de forma prática e organizada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Consentimento para envio de mensagens</h2>
            <p className="mb-3">
              Ao realizar um agendamento no NailAgenda, você concorda em receber mensagens automáticas de 
              confirmação e lembrete do seu agendamento via <strong>WhatsApp</strong>, exclusivamente com as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Confirmar o agendamento realizado;</li>
              <li>Notificar alterações no horário ou serviço;</li>
              <li>Enviar lembretes próximos à data e horário agendados.</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="font-semibold text-yellow-800">⚠️ Importante:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-yellow-700">
                <li>O envio de mensagens é restrito ao contexto do agendamento.</li>
                <li>Não utilizaremos seu WhatsApp para propaganda, spam ou mensagens não relacionadas ao serviço.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Uso de dados pessoais</h2>
            <p className="mb-3">
              O NailAgenda coleta apenas os dados necessários para a realização do agendamento:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
              <li>Nome;</li>
              <li>Número de telefone (WhatsApp);</li>
              <li>Data e hora do serviço;</li>
              <li>Serviço escolhido.</li>
            </ul>
            <p className="mb-3">
              Esses dados são utilizados <strong>exclusivamente</strong> para:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Controle da agenda da Nail Designer;</li>
              <li>Envio de mensagens automáticas relacionadas ao agendamento;</li>
              <li>Relatórios internos de gestão (ex.: total de atendimentos).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Proteção de dados</h2>
            <p className="mb-3">
              Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018)</strong>:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Seus dados não serão vendidos, compartilhados ou utilizados para fins diferentes do informado.</li>
              <li>Você pode solicitar a exclusão dos seus dados a qualquer momento, entrando em contato diretamente com a Nail Designer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Responsabilidade</h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>O NailAgenda atua apenas como sistema de agendamento e envio de lembretes.</li>
              <li>O cumprimento do horário, a prestação do serviço e demais questões do atendimento são de responsabilidade exclusiva da Nail Designer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Alterações</h2>
            <p>
              Este termo pode ser atualizado para se adequar a novas funcionalidades ou legislações. 
              Sempre que houver alterações relevantes, notificaremos no aplicativo ou site do NailAgenda.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}