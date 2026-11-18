import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterFormInputs {
  name: string;
  email: string;
  plantName: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      name: 'Sarah Jenkins, PE',
      email: 's.jenkins@predictx.factory.io',
      plantName: 'Munich Gigaplant (Precision Tooling Bay A)',
      password: 'password123',
      confirmPassword: 'password123',
      terms: true,
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    const success = await registerUser(data.name, data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">Provision Gateway Node</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-sans">
          Commission a dedicated predictive telemetry station for an industrial plant.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Lead Engineer / Plant Director
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              placeholder="Sarah Jenkins, PE"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
            />
          </div>
          {errors.name && (
            <span className="text-[11px] text-rose-500 mt-0.5 block font-mono">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              {...register('email', {
                required: 'Work email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Valid email required' },
              })}
              placeholder="s.jenkins@predictx.factory.io"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-rose-500 mt-0.5 block font-mono">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturing Plant Facility</label>
          <div className="relative">
            <Building className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              {...register('plantName', { required: 'Plant name is required' })}
              placeholder="Munich Gigaplant (Precision Tooling Bay A)"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                {...register('password', {
                  required: 'Password required',
                  minLength: { value: 6, message: 'Min 6 chars' },
                })}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-rose-500 mt-0.5 block font-mono">{errors.password.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                {...register('confirmPassword', {
                  validate: (val, formValues) => val === formValues.password || 'Passwords do not match',
                })}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-[#111827] dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-[10px] text-rose-500 mt-0.5 block font-mono">{errors.confirmPassword.message}</span>
            )}
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              {...register('terms', { required: 'You must agree to factory safety protocols' })}
              className="mt-0.5 rounded border-[#E5E5DE] dark:border-slate-800 text-[#EA580C] focus:ring-[#EA580C]"
            />
            <span>I acknowledge compliance with DIN EN ISO 13374 Condition Monitoring and SCADA access governance.</span>
          </label>
          {errors.terms && (
            <span className="text-[11px] text-rose-500 mt-0.5 block font-mono">{errors.terms.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <span>{isLoading ? 'Configuring Station...' : 'Provision Node & Open Dashboard'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>
          Existing terminal?{' '}
          <Link to="/login" className="text-[#EA580C] font-semibold hover:underline">
            Authenticate
          </Link>
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ISO-13374
        </span>
      </div>
    </div>
  );
};
