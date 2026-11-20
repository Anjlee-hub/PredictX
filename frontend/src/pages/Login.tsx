import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { demoUsers } from '../data';

interface LoginFormInputs {
  email: string;
  password?: string;
  rememberMe: boolean;
}

export const Login: React.FC = () => {
  const { login, loginAsDemoUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'm.vance@predictx.factory.io',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoFill = (idx: number) => {
    loginAsDemoUser(idx);
    navigate('/dashboard');
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">Operator Authentication</h2>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
          Enter authorized engineering credentials to establish secure telemetry session.
        </p>
      </div>

      {/* Quick Persona Selector: Clean, high-density technical cards */}
      <div className="mb-6 p-3.5 rounded-xl border border-[#E5E5DE] dark:border-slate-800 bg-[#F8F7F4] dark:bg-slate-900/60 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <UserCheck className="h-3.5 w-3.5 text-[#EA580C]" />
          <span>FAST DEMO PERSONA:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoUsers.slice(0, 2).map((item, idx) => (
            <button
              key={item.user.id}
              type="button"
              onClick={() => handleDemoFill(idx)}
              className="text-left p-2 rounded-lg bg-white dark:bg-slate-950 border border-[#E5E5DE] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-[11px] shadow-2xs"
            >
              <div className="font-semibold text-[#111827] dark:text-slate-200">{item.user.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{item.user.role}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              {...register('email', {
                required: 'Work email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Enter a valid email address',
                },
              })}
              placeholder="m.vance@predictx.factory.io"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-rose-500 mt-1 block font-mono">{errors.email.message}</span>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Master Password</label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Reset key?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
            />
          </div>
          {errors.password && (
            <span className="text-[11px] text-rose-500 mt-1 block font-mono">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-[#E5E5DE] dark:border-slate-800 text-[#EA580C] focus:ring-[#EA580C]"
            />
            <span>Retain station authorization</span>
          </label>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            QoS-1
          </span>
        </div>

        {/* The single decisive button: Diego Aranda's Burnt Orange signature */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <span>{isLoading ? 'Verifying SCADA Handshake...' : 'Authenticate & Enter Gateway'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
        New plant installation?{' '}
        <Link to="/register" className="text-[#EA580C] font-semibold hover:underline">
          Provision Node
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 p-6 text-[#111827] dark:text-white shadow-2xl">
            <h3 className="text-base font-bold">Reset Station Access</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              For facility security compliance, credential tokens can be regenerated through your Reliability Administrator or by selecting a pre-authorized demo persona.
            </p>
            <button
              onClick={() => {
                setValue('email', 'm.vance@predictx.factory.io');
                setValue('password', 'password123');
                setShowForgotModal(false);
              }}
              className="mt-5 w-full py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Load Demo Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
