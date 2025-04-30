'use client';

import { Eye, EyeSlash, GenderIntersex, LockKey, User, UserCircle } from '@phosphor-icons/react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { signUpService } from '@/lib/services/authService';
import { AxiosError } from 'axios';
import { Link, useRouter } from '@/i18n/routing';

const formSchema = z
    .object({
        username: z
            .string()
            .min(6, {
                message: 'Username must be at least 6 characters.',
            })
            .max(30, {
                message: 'Username must not exceed 30 characters.',
            }),
        password: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters.',
            })
            .max(32, {
                message: 'Password must not exceed 32 characters.',
            })
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
            .regex(/\d/, 'Password must contain at least one number.')
            .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&).'),
        confirmPassword: z.string(),
        firstName: z.string().min(1, {
            message: 'Please enter your first name.',
        }),
        lastName: z.string().min(1, {
            message: 'Please enter your last name.',
        }),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    })
    .refine(
        ({ password, confirmPassword }) => {
            return password === confirmPassword;
        },
        {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        },
    );

export default function Signup() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            gender: undefined,
        },
    });

    const router = useRouter();

    const [isShowPassword, setIsShowPassword] = useState(false);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await signUpService(values);
            router.push('/login');
        } catch (error) {
            if (error instanceof AxiosError && error?.response?.data.message === 'Username already exists') {
                form.setError('username', {
                    type: 'manual',
                    message: 'Username already exists',
                });
            }
            console.error(error);
        } finally {
        }
    };

    return (
        <div className="h-screen w-screen bg-input flex justify-center items-center">
            <div className="bg-background w-[44rem] min-h-96 rounded-lg">
                <div className="flex-1 flex flex-col justify-center items-center relative">
                    <Image className="absolute top-4 left-6" src="/images/logo.png" width={60} height={60} alt="logo" />
                </div>
                <div className="flex flex-col justify-center md:min-h-[28rem] sm:min-h-96 min-h-96 translate-y-3">
                    <div className="font-semibold text-2xl text-center text-primary">Signup</div>
                    <Form {...form}>
                        <form
                            method="post"
                            className="w-full space-y-1 flex flex-col items-center"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className="flex w-full">
                                <div className="flex-1 flex flex-col items-center">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem className="w-4/5">
                                                <FormControl className="w-4/5">
                                                    <div className="w-full border-b pb-2 flex items-center mt-4">
                                                        <User className="w-5 h-5 me-2" />
                                                        <input
                                                            className="w-4/5 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                            placeholder="Type your username"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="!mt-1" />
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
                                                <FormMessage className="!mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="w-4/5">
                                                <FormControl className="w-4/5">
                                                    <div className="w-full border-b pb-2 flex items-center mt-3">
                                                        <LockKey className="w-5 h-5 me-2" />
                                                        <input
                                                            type={isShowPassword ? 'text' : 'password'}
                                                            className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                            placeholder="Type your confirm password"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="w-4/5">
                                                <FormControl className="w-4/5">
                                                    <div className="w-full border-b pb-2 flex items-center mt-4">
                                                        <UserCircle className="w-5 h-5 me-2" />
                                                        <input
                                                            className="w-4/5 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                            placeholder="Type your first name"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="!mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem className="w-4/5">
                                                <FormControl className="w-4/5">
                                                    <div className="w-full border-b pb-2 flex items-center mt-3">
                                                        <UserCircle className="w-5 h-5 me-2" />
                                                        <input
                                                            className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                            placeholder="Type your last name"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="!mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem className="w-4/5">
                                                <FormControl className="w-4/5">
                                                    <div className="w-full border-b pb-2 flex items-center mt-3">
                                                        <GenderIntersex className="w-5 h-5 me-2" />
                                                        <div className="flex justify-around flex-1 items-center">
                                                            <span className="flex items-center">
                                                                <input
                                                                    className="me-1"
                                                                    type="radio"
                                                                    {...field}
                                                                    value="MALE"
                                                                />{' '}
                                                                Male
                                                            </span>
                                                            <span className="flex items-center">
                                                                <input
                                                                    className="me-1"
                                                                    type="radio"
                                                                    {...field}
                                                                    value="FEMALE"
                                                                />{' '}
                                                                Female
                                                            </span>
                                                            <span className="flex items-center">
                                                                <input
                                                                    className="me-1"
                                                                    type="radio"
                                                                    {...field}
                                                                    value="OTHER"
                                                                />{' '}
                                                                Other
                                                            </span>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-40 !mt-6 py-2 bg-primary text-background rounded-full text-lg"
                                type="submit"
                            >
                                Signup
                            </Button>
                        </form>
                    </Form>
                    <div className="flex justify-center">
                        <Link href="/login" className="text-primary underline mt-2">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
