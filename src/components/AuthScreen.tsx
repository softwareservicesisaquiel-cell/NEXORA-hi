import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ShieldCheck,
  Lock,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, recoverAccount, loginWithGoogle, addToast, t } = useApp();

  const [activeScreen, setActiveScreen] = useState<'signin' | 'signup' | 'recover'>('signup');

  // Sign up fields (Username, Password, Confirm Password - NO email or phone required)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Sign in fields
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Recovery fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);

  // Registration Success Card
  const [createdAccountData, setCreatedAccountData] = useState<{
    nexoraId: string;
    recoveryCode: string;
    username: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    const success = await loginWithGoogle();
    setIsLoading(false);
    if (!success) {
      setErrorMessage('Não foi possível autenticar com o Google. Tente novamente.');
    }
  };

  const handleCopyRecoveryCode = () => {
    if (createdAccountData?.recoveryCode) {
      navigator.clipboard.writeText(createdAccountData.recoveryCode);
      setCopiedCode(true);
      addToast('Código de recuperação copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupUsername.trim()) {
      setErrorMessage('Defina um nome de utilizador único.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('As palavras-passe introduzidas não coincidem.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      username: signupUsername.trim(),
      displayName: signupDisplayName.trim() || signupUsername.trim(),
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    setIsLoading(false);

    if (result.success && result.recoveryCode && result.nexoraId) {
      setCreatedAccountData({
        nexoraId: result.nexoraId,
        recoveryCode: result.recoveryCode,
        username: signupUsername.trim().toLowerCase(),
      });
    } else {
      setErrorMessage(result.error || 'Erro ao criar conta no Firebase.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signinIdentifier.trim()) {
      setErrorMessage('Indique o seu nome de utilizador ou NEXORA ID (ex: NX-849271).');
      return;
    }

    if (!signinPassword) {
      setErrorMessage('Introduza a sua palavra-passe.');
      return;
    }

    setIsLoading(true);
    const success = await login(signinIdentifier.trim(), signinPassword);
    setIsLoading(false);

    if (!success) {
      setErrorMessage('Não foi possível iniciar sessão. Verifique as suas credenciais.');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!recoveryIdentifier.trim() || !recoveryCode.trim() || !recoveryNewPassword) {
      setErrorMessage('Preencha todos os campos do formulário de recuperação.');
      return;
    }

    if (recoveryNewPassword.length < 6) {
      setErrorMessage('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setErrorMessage('A confirmação da nova palavra-passe não coincide.');
      return;
    }

    setIsLoading(true);
    const res = await recoverAccount(recoveryIdentifier.trim(), recoveryCode.trim(), recoveryNewPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Palavra-passe redefinida com sucesso! Pode agora iniciar sessão com a nova senha.');
      setRecoveryIdentifier('');
      setRecoveryCode('');
      setRecoveryNewPassword('');
      setRecoveryConfirmPassword('');
      setTimeout(() => {
        setActiveScreen('signin');
        setSuccessMessage('');
      }, 3500);
    } else {
      setErrorMessage(res.error || 'Falha na validação do código de recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            NEXORA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rede Social Soberana & Autenticação Criptografada
          </p>
        </div>

        {/* Success Modal for Newly Created Account (Shows Recovery Code & NEXORA ID) */}
        {createdAccountData ? (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <Check className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-center text-white mb-1">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-xs text-center text-slate-400 mb-6">
              A sua conta foi registada no Cloud Firestore com criptografia Firebase.
            </p>

            {/* Permanent NEXORA ID */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase block mb-1">
                O seu NEXORA ID Permanente
              </span>
              <div className="text-2xl font-mono font-bold tracking-widest text-white">
                {createdAccountData.nexoraId}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Identificador exclusivo de utilizador (@{createdAccountData.username}).
              </p>
            </div>

            {/* Secure Recovery Code (Never stored readable) */}
            <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Código de Recuperação Seguro
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                  Guarde Agora
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/90 rounded-xl px-3.5 py-2.5 border border-amber-500/20 font-mono text-sm font-bold text-amber-200">
                <span className="select-all tracking-wider">{createdAccountData.recoveryCode}</span>
                <button
                  type="button"
                  onClick={handleCopyRecoveryCode}
                  className="ml-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-300/80 mt-2 leading-relaxed">
                <strong className="text-amber-200">Importante:</strong> Este código é a única forma de recuperar a sua conta caso esqueça a palavra-passe. Nunca é guardado em formato legível nos nossos servidores.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedAccountData(null);
                // Active session already populated by Firebase Auth listener
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Entrar no NEXORA</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
            
            {/* Screen Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('signup');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                  activeScreen === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.signUp')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('signin');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                  activeScreen === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.signIn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('recover');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                  activeScreen === 'recover'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.recover')}
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
                {(errorMessage.includes('Firebase Console') || errorMessage.includes('operation-not-allowed') || errorMessage.includes('Email/Password')) && (
                  <div className="pt-2 border-t border-rose-500/20 text-slate-300 text-[11px] space-y-1">
                    <p className="text-amber-300 font-semibold">
                      💡 Solução recomendada:
                    </p>
                    <p className="text-slate-400">
                      O Google Login já está ativo no Firebase. Clique no botão branco <strong className="text-white">"Continuar com Conta Google"</strong> abaixo para criar conta ou entrar instantaneamente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Google Authentication Quick Button (Enabled by default in Firebase) */}
            {activeScreen !== 'recover' && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-sm rounded-2xl shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 border border-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continuar com Conta Google</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                    <span className="bg-slate-900 px-3 text-slate-500">ou com credenciais nexora</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 1: CREATE ACCOUNT */}
            {activeScreen === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome de Utilizador único (ex: alex, sophia)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="escolha_um_username"
                      required
                      className="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Não requer e-mail real nem número de telefone.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome de Exibição (opcional)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signupDisplayName}
                      onChange={(e) => setSignupDisplayName(e.target.value)}
                      placeholder="Como deseja ser chamado"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirmar Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repita a sua palavra-passe"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>A criar conta segura...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Criar Conta NEXORA</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-500 pt-1">
                  Ao criar conta, receberá um <strong className="text-cyan-400">NEXORA ID permanente</strong> e uma chave criptográfica de recuperação.
                </p>
              </form>
            )}

            {/* SCREEN 2: SIGN IN */}
            {activeScreen === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome de Utilizador ou NEXORA ID
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signinIdentifier}
                      onChange={(e) => setSigninIdentifier(e.target.value)}
                      placeholder="@username ou NX-849271"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Palavra-passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('recover');
                        setErrorMessage('');
                      }}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSigninPassword ? 'text' : 'password'}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="A sua palavra-passe"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>A autenticar no Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Iniciar Sessão Segura</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveScreen('signup')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Ainda não tem conta? <span className="text-cyan-400 font-semibold underline">Criar agora</span>
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 3: RECOVER ACCOUNT */}
            {activeScreen === 'recover' && (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 mb-2">
                  <span className="text-[11px] font-semibold text-cyan-400 block mb-0.5">
                    Sistema de Recuperação Segura
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Utilize o seu código de recuperação recebido no momento do registo para redefinir a palavra-passe. O código é validado via hash SHA-256 no Firestore.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome de Utilizador ou NEXORA ID
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="@username ou NX-849271"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Código de Recuperação (NXREC-XXXX-XXXX-XXXX)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="NXREC-XXXX-XXXX-XXXX"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRecoveryPassword ? 'text' : 'password'}
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirmar Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRecoveryPassword ? 'text' : 'password'}
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      placeholder="Repita a nova palavra-passe"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>A validar código criptográfico...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Restaurar Palavra-passe</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveScreen('signin')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Lembrou-se da senha? <span className="text-cyan-400 font-semibold underline">Iniciar Sessão</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Footer Details */}
        <div className="mt-8 text-center text-[11px] text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Criptografia SHA-256
          </span>
          <span>•</span>
          <span>Cloud Firestore Real-Time</span>
          <span>•</span>
          <span>Sessão Segura</span>
        </div>
      </div>
    </div>
  );
};
