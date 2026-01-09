import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { designerService } from '../utils/supabaseUtils';
import { generateSlug } from '../utils/slugUtils';

const DesignerSignup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome completo é obrigatório';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'WhatsApp é obrigatório';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'WhatsApp inválido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 4) {
            newErrors.password = 'Senha deve ter no mínimo 4 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Generate slug from name
            const slug = generateSlug(formData.name);

            // Check if email already exists
            const existingDesigners = await designerService.getAll();
            const emailExists = existingDesigners.some(d => d.email.toLowerCase() === formData.email.toLowerCase());

            if (emailExists) {
                setErrors({ email: 'Este e-mail já está cadastrado' });
                setIsLoading(false);
                return;
            }

            // Create new designer
            const newDesigner = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                is_active: true,
                slug: slug,
                bio: '',
                pix_key: '',
                photo_url: ''
            };

            const createdDesigner = await designerService.create(newDesigner);

            if (createdDesigner) {
                setSuccessMessage('Conta criada com sucesso! Redirecionando...');

                // Save to localStorage for auto-login
                localStorage.setItem('currentDesigner', JSON.stringify({
                    id: createdDesigner.id,
                    name: createdDesigner.name,
                    email: createdDesigner.email,
                    phone: createdDesigner.phone,
                    password: createdDesigner.password,
                    isActive: createdDesigner.is_active,
                    is_active: createdDesigner.is_active,
                    createdAt: createdDesigner.created_at,
                    created_at: createdDesigner.created_at,
                    updated_at: createdDesigner.updated_at,
                    pixKey: createdDesigner.pix_key,
                    pix_key: createdDesigner.pix_key,
                    slug: createdDesigner.slug,
                    bio: createdDesigner.bio,
                    photoUrl: createdDesigner.photo_url,
                    photo_url: createdDesigner.photo_url
                }));

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Nail Designer</h1>
                        <p className="text-white/70">Crie sua conta e comece a transformar seu negócio</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                            <p className="text-green-100 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-red-100 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-white/90 font-medium mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border ${errors.name ? 'border-red-500/50' : 'border-white/20'
                                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all`}
                                placeholder="Seu nome completo"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-white/90 font-medium mb-2">
                                WhatsApp
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                    const formatted = formatPhone(e.target.value);
                                    setFormData(prev => ({ ...prev, phone: formatted }));
                                    if (errors.phone) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.phone;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={`w-full px-4 py-3 bg-white/10 border ${errors.phone ? 'border-red-500/50' : 'border-white/20'
                                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all`}
                                placeholder="(11) 99999-9999"
                                disabled={isLoading}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-red-400 text-sm">{errors.phone}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-white/90 font-medium mb-2">
                                E-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-500/50' : 'border-white/20'
                                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all`}
                                placeholder="seu@email.com"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-white/90 font-medium mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border ${errors.password ? 'border-red-500/50' : 'border-white/20'
                                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all`}
                                placeholder="Mínimo 4 caracteres"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-red-400 text-sm">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-white/90 font-medium mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all`}
                                placeholder="Digite a senha novamente"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Criando conta...
                                </span>
                            ) : (
                                'Cadastrar'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-white/70 text-sm">
                            Já tem uma conta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
                            >
                                Fazer login
                            </button>
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 text-center text-white/60 text-sm">
                    <p>Ao criar uma conta, você concorda com nossos</p>
                    <p>Termos de Uso e Política de Privacidade</p>
                </div>
            </div>
        </div>
    );
};

export default DesignerSignup;
