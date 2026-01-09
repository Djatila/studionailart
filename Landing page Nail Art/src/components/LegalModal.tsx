import React from 'react';
import { X } from 'lucide-react';

type LegalDocType = 'terms' | 'privacy' | 'lgpd' | 'cookies' | null;

interface LegalModalProps {
    isOpen: boolean;
    type: LegalDocType;
    onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
    if (!isOpen || !type) return null;

    const getContent = () => {
        switch (type) {
            case 'terms':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Termos de Uso</h2>
                        <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <h3 className="text-xl font-semibold mt-4">1. Aceitação dos Termos</h3>
                        <p>Ao acessar e usar o Studio Nail Art, você concorda em cumprir e ficar vinculado a estes Termos de Uso.</p>

                        <h3 className="text-xl font-semibold mt-4">2. Uso do Serviço</h3>
                        <p>Nossa plataforma oferece ferramentas de agendamento e gestão para profissionais de beleza. Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.</p>

                        <h3 className="text-xl font-semibold mt-4">3. Contas e Assinaturas</h3>
                        <p>Para acessar certos recursos, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais. As assinaturas são cobradas conforme o plano selecionado.</p>

                        <h3 className="text-xl font-semibold mt-4">4. Cancelamento</h3>
                        <p>Você pode cancelar sua assinatura a qualquer momento. O cancelamento entrará em vigor no final do período de faturamento atual.</p>

                        <h3 className="text-xl font-semibold mt-4">5. Propriedade Intelectual</h3>
                        <p>Todo o conteúdo, marcas e tecnologia do serviço são propriedade exclusiva do Studio Nail Art.</p>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Política de Privacidade</h2>
                        <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <h3 className="text-xl font-semibold mt-4">1. Coleta de Informações</h3>
                        <p>Coletamos informações que você nos fornece diretamente (como nome, email, dados de pagamento) e dados de uso automático quando você interage com nossa plataforma.</p>

                        <h3 className="text-xl font-semibold mt-4">2. Uso das Informações</h3>
                        <p>Usamos suas informações para operar, manter e melhorar nossos serviços, processar transações e comunicar novidades.</p>

                        <h3 className="text-xl font-semibold mt-4">3. Compartilhamento</h3>
                        <p>Não vendemos seus dados pessoais. Compartilhamos dados apenas com prestadores de serviço essenciais para nossa operação (como processadores de pagamento).</p>

                        <h3 className="text-xl font-semibold mt-4">4. Segurança</h3>
                        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados.</p>
                    </div>
                );
            case 'lgpd':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">LGPD (Lei Geral de Proteção de Dados)</h2>
                        <p>O Studio Nail Art está comprometido com a conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

                        <h3 className="text-xl font-semibold mt-4">Seus Direitos</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Confirmação e Acesso:</strong> Você pode solicitar a confirmação da existência de tratamento e acesso aos seus dados.</li>
                            <li><strong>Correção:</strong> Você pode solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
                            <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Você pode solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                            <li><strong>Portabilidade:</strong> Você tem o direito à portabilidade dos dados a outro fornecedor de serviço.</li>
                            <li><strong>Revogação do Consentimento:</strong> Você pode revogar seu consentimento a qualquer momento.</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-4">Encarregado de Dados (DPO)</h3>
                        <p>Para exercer seus direitos ou tirar dúvidas sobre o tratamento de seus dados, entre em contato conosco através do canal de suporte.</p>
                    </div>
                );
            case 'cookies':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Política de Cookies</h2>
                        <p>Utilizamos cookies para melhorar sua experiência em nossa plataforma.</p>

                        <h3 className="text-xl font-semibold mt-4">O que são Cookies?</h3>
                        <p>Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site.</p>

                        <h3 className="text-xl font-semibold mt-4">Como usamos os Cookies</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Essenciais:</strong> Necessários para o funcionamento do site (ex: manter você logado).</li>
                            <li><strong>Analíticos:</strong> Nos ajudam a entender como os visitantes interagem com o site.</li>
                            <li><strong>Marketing:</strong> Usados para fornecer anúncios mais relevantes.</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-4">Gerenciamento</h3>
                        <p>Você pode controlar e/ou excluir cookies conforme desejar através das configurações do seu navegador.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-10">
                    <span className="text-sm text-white/50 uppercase tracking-wider font-semibold">Documento Legal</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="p-6 text-white/80 leading-relaxed">
                    {getContent()}
                </div>
            </div>
        </div>
    );
};
