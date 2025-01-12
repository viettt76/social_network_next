'use client';

import { LockKeyhole, User } from 'lucide-react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    username: z
        .string()
        .min(6, {
            message: 'Username must be at least 6 characters.',
        })
        .max(30, {
            message: 'Username must not exceed 30 characters',
        }),
    password: z
        .string()
        .min(2, {
            message: 'Password must be at least 2 characters.',
        })
        .max(32, {
            message: 'Password must not exceed 32 characters',
        })
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
        .regex(/\d/, 'Password must contain at least one number.')
        .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&).'),
});

export default function Login() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <div className="h-screen w-screen bg-input flex justify-center items-center">
            <div className="bg-background w-[40rem] -translate-y-10 flex min-h-96 rounded-lg">
                <div className="flex-1 flex flex-col justify-center items-center relative">
                    <Image className="absolute top-4 left-6" src="/images/logo.png" width={60} height={60} alt="logo" />
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
                                                <LockKeyhole className="w-5 h-5 me-2" />
                                                <input
                                                    type="password"
                                                    className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                    placeholder="Type your password"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-3/5 mt-6 py-1 bg-primary text-background rounded-full" type="submit">
                                Submit
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
