'use client';

import { Eye, EyeSlash, LockKey, User } from '@phosphor-icons/react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Link, useRouter } from '@/i18n/routing';
import { loginService, recoverAccountService } from '@/lib/services/authService';
import { AxiosError } from 'axios';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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

    const [isAccountDeleted, setIsAccountDeleted] = useState(false);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await loginService(values);
            router.push('/');
        } catch (error) {
            form.setError('password', {
                type: 'manual',
                message: error instanceof AxiosError && error.response?.data?.message,
            });
            console.error(error);
            if (
                error instanceof AxiosError &&
                error.status === 403 &&
                error.response?.data?.code === 'ACCOUNT_SOFT_DELETED'
            ) {
                setIsAccountDeleted(true);
            }
        }
    };

    const handleRecoverAccount = async () => {
        try {
            const values = form.getValues();
            await recoverAccountService({ username: values.username, password: values.password });
            setIsAccountDeleted(false);
            form.clearErrors();
        } catch (error) {
            console.error(error);
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
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        setIsAccountDeleted(false);
                                                    }}
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
                            {isAccountDeleted && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="text-primary text-sm underline mt-2 cursor-pointer">
                                            Khôi phục tài khoản
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Khôi phục tài khoản</DialogTitle>
                                            <DialogDescription>
                                                <span className="block mt-3">
                                                    Khôi phục lại toàn bộ thông tin của bạn, bao gồm cả tin nhắn, bài
                                                    viết và các lượt tương tác.
                                                </span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button onClick={handleRecoverAccount}>Khôi phục</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Button className="w-3/5 mt-6 py-1 bg-primary text-background rounded-full" type="submit">
                                Đăng nhập
                            </Button>
                            <div className="text-sm mt-2">
                                Bạn chưa có tài khoản?
                                <Link href="/signup" className="text-primary ms-1">
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
