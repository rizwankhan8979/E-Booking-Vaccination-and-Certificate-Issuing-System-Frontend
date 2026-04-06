"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, X, Mail, Lock, LogIn, ShieldCheck, UserPlus, User } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '../../lib/axios';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

const forgotPasswordRequestSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register' | 'forgot-password'
    const [step, setStep] = useState('register'); // 'register' | 'otp' (for signup)
    const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
    const [forgotEmail, setForgotEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setStep('register');
        }
    }, [isOpen, initialTab]);

    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', password: '' },
    });

    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const forgotRequestForm = useForm({
        resolver: zodResolver(forgotPasswordRequestSchema),
        defaultValues: { email: '' },
    });

    const resetPasswordForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { otp: '', newPassword: '' },
    });

    const onLoginSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userRole', response.data.role);
            }
            toast.success(response.data?.message || 'Login successful!');
            handleClose();
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid email or password';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onRegisterSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', data);
            toast.success(response.data?.message || 'OTP sent to your email!');
            setRegisteredEmail(data.email);
            setStep('otp');
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/verify-email', {
                email: registeredEmail,
                otp: parseInt(data.otp),
            });
            toast.success(response.data?.message || 'Verification successful! You can now log in.');
            setActiveTab('login');
            setStep('register');
        } catch (error) {
            console.error('OTP error:', error);
            const message = error.response?.data?.message || 'Invalid OTP.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onForgotPasswordRequest = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/forgot-password-request', data);
            toast.success(response.data?.message || 'OTP sent to your email!');
            setForgotEmail(data.email);
            setForgotStep('reset');
        } catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || 'Failed to send OTP.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onResetPasswordSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                email: forgotEmail,
                otp: parseInt(data.otp),
                newPassword: data.newPassword,
            });
            toast.success(response.data?.message || 'Password reset successful!');
            setActiveTab('login');
            setForgotStep('request');
        } catch (error) {
            console.error('Reset error:', error);
            const message = error.response?.data?.message || 'Invalid OTP or failed to reset.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        loginForm.reset();
        registerForm.reset();
        otpForm.reset();
        forgotRequestForm.reset();
        resetPasswordForm.reset();
        setStep('register');
        setForgotStep('request');
    };

    if (!isMounted) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent 
                className="fixed left-0 top-0 !translate-x-0 !translate-y-0 z-50 w-screen h-screen max-w-none sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none border-none bg-gradient-to-b from-[#18c6f2] to-[#6d30e3] p-0 flex flex-col items-center justify-center m-0 rounded-none focus:outline-none"
                showCloseButton={false}
                overlayClassName="hidden"
            >
                <button 
                    onClick={handleClose}
                    className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors p-2"
                >
                    <X size={28} />
                </button>

                <div className="w-full max-w-[320px] flex flex-col items-center px-4">
                    {/* User Icon top */}
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border-2 border-white/40 shadow-xl">
                        <User size={48} className="text-white drop-shadow-md" />
                    </div>

                    {activeTab === 'login' ? (
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5 w-full">
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <FormControl>
                                                <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                    <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                        <User size={18} />
                                                    </div>
                                                    <Input 
                                                        className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                        placeholder="Username" 
                                                        {...field} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <FormControl>
                                                <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                    <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                        <Lock size={18} />
                                                    </div>
                                                    <Input 
                                                        type="password" 
                                                        className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                        placeholder="Password" 
                                                        {...field} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                        </FormItem>
                                    )}
                                />
                                
                                <Button 
                                    type="submit" 
                                    className="w-full h-[48px] rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-[#1a202c] font-bold text-[16px] mt-6 shadow-lg transition-transform active:scale-[0.98]" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Login Now'}
                                </Button>

                                <div className="flex items-center justify-between w-full mt-3 text-xs text-white/90 font-medium px-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-[14px] h-[14px] rounded-sm border-white bg-transparent text-[#fbbc05] focus:ring-0 focus:ring-offset-0 accent-[#fbbc05]" />
                                        <span className="group-hover:text-white transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => setActiveTab('forgot-password')} className="hover:text-white hover:underline transition-all">Forgot password?</button>
                                </div>

                                <div className="mt-8 text-center text-white flex flex-col items-center gap-2">
                                    <p className="text-[11px] text-white/80 font-medium">Not a member?</p>
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTab('register')} 
                                        className="min-w-[180px] px-8 py-3 border border-white/60 rounded-full text-[12px] tracking-wide font-bold hover:bg-white/10 hover:border-white transition-all shadow-sm flex items-center justify-center"
                                    >
                                        Register Account
                                    </button>
                                </div>
                            </form>
                        </Form>
                    ) : activeTab === 'register' ? (
                        <div className="w-full">
                            {step === 'register' ? (
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5 w-full">
                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                            <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                                <User size={18} />
                                                            </div>
                                                            <Input 
                                                                className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                                placeholder="Email or Phone" 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                            <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                                <Lock size={18} />
                                                            </div>
                                                            <Input 
                                                                type="password" 
                                                                className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                                placeholder="Create Password" 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button 
                                            type="submit" 
                                            className="w-full h-[48px] rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-[#1a202c] font-bold text-[16px] mt-6 shadow-lg transition-transform active:scale-[0.98]" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Register Now'}
                                        </Button>

                                        <div className="mt-8 text-center text-white flex flex-col items-center gap-2">
                                            <p className="text-[11px] text-white/80 font-medium">Already a member?</p>
                                            <button 
                                                type="button" 
                                                onClick={() => setActiveTab('login')} 
                                                className="min-w-[180px] px-8 py-3 border border-white/60 rounded-full text-[12px] tracking-wide font-bold hover:bg-white/10 hover:border-white transition-all shadow-sm flex items-center justify-center"
                                            >
                                                Login account
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <Form {...otpForm}>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const otpVal = otpForm.getValues('otp');
                                        if (otpVal && otpVal.length === 6) {
                                            otpForm.clearErrors('otp');
                                            onOtpSubmit({ otp: otpVal });
                                        } else {
                                            otpForm.setError('otp', { type: 'manual', message: 'OTP must be 6 digits' });
                                        }
                                    }} className="space-y-5 w-full">
                                        <div className="text-center mb-5">
                                            <p className="text-[13px] text-white/90 font-medium drop-shadow-md">Enter the OTP sent to <br/><span className="font-bold text-white text-[16px]">{registeredEmail}</span></p>
                                        </div>
                                            <FormField
                                            control={otpForm.control}
                                            name="otp"
                                            render={() => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <input 
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={otpForm.watch('otp') || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                otpForm.setValue('otp', val, { shouldValidate: true, shouldDirty: true });
                                                                if(val.length === 0) otpForm.clearErrors('otp');
                                                            }}
                                                            className="w-full h-[50px] border-[1.5px] border-white rounded-full bg-white/10 text-white text-center text-xl tracking-[0.4em] font-bold focus:outline-none focus:ring-1 focus:ring-white placeholder:text-white/40 shadow-sm" 
                                                            placeholder="000000" 
                                                            maxLength={6}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-2 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button 
                                            type="submit" 
                                            className="w-full h-[48px] rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-[#1a202c] font-bold text-[16px] mt-6 shadow-lg transition-transform active:scale-[0.98]" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Register'}
                                        </Button>

                                        <div className="mt-6 text-center text-white flex flex-col items-center gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setStep('register')}
                                                className="min-w-[180px] px-8 py-3 border border-white/60 rounded-full text-[12px] tracking-wide font-bold hover:bg-white/10 hover:border-white transition-all flex items-center justify-center"
                                            >
                                                Change Email Address
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </div>
                    ) : (
                        <div className="w-full">
                            {forgotStep === 'request' ? (
                                <Form {...forgotRequestForm}>
                                    <form onSubmit={forgotRequestForm.handleSubmit(onForgotPasswordRequest)} className="space-y-5 w-full">
                                        <div className="text-center mb-5">
                                            <p className="text-[13px] text-white/90 font-medium drop-shadow-md">Enter your registered email to receive a password reset OTP.</p>
                                        </div>
                                        <FormField
                                            control={forgotRequestForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                            <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                                <Mail size={18} />
                                                            </div>
                                                            <Input 
                                                                className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                                placeholder="Enter your email" 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button 
                                            type="submit" 
                                            className="w-full h-[48px] rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-[#1a202c] font-bold text-[16px] mt-6 shadow-lg transition-transform active:scale-[0.98]" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Send Reset OTP'}
                                        </Button>

                                        <div className="mt-8 text-center flex flex-col items-center gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setActiveTab('login')} 
                                                className="min-w-[180px] px-8 py-3 border border-white/60 rounded-full text-[12px] tracking-wide text-white/90 font-bold hover:bg-white/10 hover:border-white transition-all shadow-sm flex items-center justify-center"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <Form {...resetPasswordForm}>
                                    <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-5 w-full">
                                        <div className="text-center mb-5">
                                            <p className="text-[13px] text-white/90 font-medium drop-shadow-md">Enter the OTP sent to <br/><span className="font-bold text-white text-[16px]">{forgotEmail}</span></p>
                                        </div>
                                        <FormField
                                            control={resetPasswordForm.control}
                                            name="otp"
                                            render={() => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <input 
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={resetPasswordForm.watch('otp') || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                resetPasswordForm.setValue('otp', val, { shouldValidate: true, shouldDirty: true });
                                                                if(val.length === 0) resetPasswordForm.clearErrors('otp');
                                                            }}
                                                            className="w-full h-[50px] border-[1.5px] border-white rounded-full bg-white/10 text-white text-center text-xl tracking-[0.4em] font-bold focus:outline-none focus:ring-1 focus:ring-white placeholder:text-white/40 shadow-sm" 
                                                            placeholder="000000" 
                                                            maxLength={6}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-2 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={resetPasswordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0 mt-4">
                                                    <FormControl>
                                                        <div className="relative flex items-center w-full h-[48px] border-[1.5px] border-white rounded-full bg-white/5 focus-within:bg-white/10 transition-colors shadow-sm">
                                                            <div className="absolute left-1 top-1 bottom-1 w-[40px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white bg-transparent">
                                                                <Lock size={18} />
                                                            </div>
                                                            <Input 
                                                                type="password"
                                                                className="w-full h-full border-none bg-transparent text-white text-center text-[15px] placeholder:text-white/80 focus-visible:ring-0 px-[50px]" 
                                                                placeholder="Enter New Password" 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-200 mt-1 text-center font-medium drop-shadow-md" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button 
                                            type="submit" 
                                            className="w-full h-[48px] rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-[#1a202c] font-bold text-[16px] mt-6 shadow-lg transition-transform active:scale-[0.98]" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm New Password'}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
