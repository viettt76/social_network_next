'use client';

import { Eye, EyeSlash, LockKey, User } from '@phosphor-icons/react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Link, useRouter } from '@/i18n/routing';
import { loginService } from '@/lib/services/authService';
import { AxiosError } from 'axios';
import { useState } from 'react';

const formSchema = z.object({
    username: z.string().min(1, {
        message: 'Please type your username.',
    }),
    password: z.string().min(1, {
        message: 'Please type your password',
    }),
});

export default function Login() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const router = useRouter();

    const [isShowPassword, setIsShowPassword] = useState(false);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await loginService(values);
            router.push('/');
        } catch (error) {
            form.setError('password', {
                type: 'manual',
                message: error instanceof AxiosError && error.response?.data?.message,
            });
            console.log(error);
        }
    };

    return (
        <div className="h-screen w-screen bg-input flex justify-center items-center">
            <div className="bg-background w-[40rem] -translate-y-10 flex min-h-96 rounded-lg">
                <div className="flex-1 flex flex-col justify-center items-center relative">
                    <Image
                        className="absolute top-4 left-6"
                        priority
                        src="/images/logo.png"
                        width={60}
                        height={60}
                        alt="logo"
                    />
                    <div className="text-3xl text-center">
                        Welcome to <span className="text-primary">Heyoy</span>
                    </div>
                    <div className="text-xl text-primary/80 text-center">Connection place</div>
                </div>
                <div className="flex-1 flex flex-col justify-center -translate-y-4">
                    <div className="font-semibold text-2xl text-center">Login</div>
                    <Form {...form}>
                        <form className="w-full flex flex-col items-center" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="w-4/5">
                                        <FormControl className="w-4/5">
                                            <div className="w-full border-b pb-2 flex items-center mt-6">
                                                <User className="w-5 h-5 me-2" />
                                                <input
                                                    className="w-4/5 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                    placeholder="Type your username"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="w-4/5">
                                        <FormControl className="w-4/5">
                                            <div className="w-full border-b pb-2 flex items-center mt-3">
                                                <LockKey className="w-5 h-5 me-2" />
                                                <input
                                                    type={isShowPassword ? 'text' : 'password'}
                                                    className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                    placeholder="Type your password"
                                                    {...field}
                                                />
                                                {isShowPassword ? (
                                                    <EyeSlash onClick={() => setIsShowPassword(false)} />
                                                ) : (
                                                    <Eye onClick={() => setIsShowPassword(true)} />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-3/5 mt-6 py-1 bg-primary text-background rounded-full" type="submit">
                                Login
                            </Button>
                            <div className="text-sm mt-2">
                                Bạn chưa có tài khoản?
                                <Link href="signup" className="text-primary ms-1">
                                    Đăng ký
                                </Link>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
