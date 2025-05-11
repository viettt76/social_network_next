'use client';

import { createUserService, getUsersService, lockUserService, unlockUserService } from '@/lib/services/adminService';
import { Role } from '@/lib/slices/userSlice';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { Pagination } from 'flowbite-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { AxiosError } from 'axios';
import { Eye, EyeSlash, UserGear, LockKey, User, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
        role: z.nativeEnum(Role),
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

export default function ManageUsers() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            role: Role.USER,
        },
    });

    const [users, setUsers] = useState<{
        users: {
            id: string;
            username: string;
            name: string;
            role: Role;
            isActive: boolean;
        }[];
        totalUsers: number;
        totalPages: number;
    }>({ users: [], totalUsers: 0, totalPages: 1 });

    const [currentPage, setCurrentPage] = useState(1);
    const [showDialogLockUser, setShowDialogLockUser] = useState(false);
    const [userInfoToLock, setUserInfoToLock] = useState<{
        id: string;
        name: string;
    }>();

    const [showDialogCreateAccount, setShowDialogCreateAccount] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getUsersService(currentPage);
                const { users, totalUsers, totalPages } = data;

                setUsers({
                    users: users.map((u) => ({
                        id: u.id,
                        username: u.username,
                        name: `${u.lastName} ${u.firstName}`,
                        role: u.role,
                        isActive: u.isActive,
                    })),
                    totalUsers,
                    totalPages,
                });
            } catch (error) {
                console.error(error);
            }
        })();
    }, [currentPage]);

    const onPageChange = (page: number) => setCurrentPage(page);

    const handleLockUser = async (userId: string) => {
        try {
            await lockUserService(userId);
            setUsers((prev) => ({
                ...prev,
                users: prev.users.map((u) => {
                    if (u.id === userId)
                        return {
                            ...u,
                            isActive: false,
                        };
                    return u;
                }),
            }));
            setShowDialogLockUser(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUnlockUser = async (userId: string) => {
        try {
            await unlockUserService(userId);
            setUsers((prev) => ({
                ...prev,
                users: prev.users.map((u) => {
                    if (u.id === userId)
                        return {
                            ...u,
                            isActive: true,
                        };
                    return u;
                }),
            }));
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createUserService(values);
            setShowDialogCreateAccount(false);
            toast.success('Tạo tài khoản thành công');
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
        <div className="overflow-x-auto">
            <div className="flex justify-end">
                <Dialog open={showDialogCreateAccount} onOpenChange={setShowDialogCreateAccount}>
                    <DialogTrigger asChild>
                        <Button>Tạo tài khoản</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Tạo tài khoản</DialogTitle>
                        </DialogHeader>
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
                                                                className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your password"
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
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <LockKey className="w-5 h-5 me-2" />
                                                            <input
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
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <UserGear className="w-5 h-5 me-2" />
                                                            <div className="flex justify-around flex-1 items-center">
                                                                {Object.values(Role).map((role) => (
                                                                    <span
                                                                        className="flex items-center"
                                                                        key={`role-${role}`}
                                                                    >
                                                                        <input
                                                                            className="me-1"
                                                                            type="radio"
                                                                            {...field}
                                                                            value={role}
                                                                        />{' '}
                                                                        {role}
                                                                    </span>
                                                                ))}
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
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="mt-3">
                <TableHead className="bg-background border-b">
                    <TableHeadCell>Username</TableHeadCell>
                    <TableHeadCell>Tên</TableHeadCell>
                    <TableHeadCell>Vai trò</TableHeadCell>
                    <TableHeadCell>Trạng thái</TableHeadCell>
                    <TableHeadCell></TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                    {users.users.map((u) => (
                        <TableRow
                            className={`${u.role === Role.ADMIN ? 'bg-primary/50' : 'bg-background'}`}
                            key={`user-${u.id}`}
                        >
                            <TableCell className="!table-cell line-clamp-1 break-all">{u.username}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                                <Checkbox checked={u.isActive} />
                            </TableCell>
                            <TableCell>
                                {u.isActive ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setUserInfoToLock({
                                                id: u.id,
                                                name: u.name,
                                            });
                                            setShowDialogLockUser(true);
                                        }}
                                    >
                                        <Lock className="w-5" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleUnlockUser(u.id)}>
                                        <Unlock className="w-5" />
                                    </Button>
                                )}
                                <Dialog open={showDialogLockUser} onOpenChange={setShowDialogLockUser}>
                                    <DialogContent className="sm:max-w-[550px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Bạn có chắc chắn muốn khoá tài khoản của {userInfoToLock?.name}?
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setShowDialogLockUser(false)}>
                                                Huỷ
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => userInfoToLock?.id && handleLockUser(userInfoToLock.id)}
                                            >
                                                Khoá
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex overflow-x-auto sm:justify-center">
                <Pagination currentPage={currentPage} totalPages={users.totalPages} onPageChange={onPageChange} />
            </div>
        </div>
    );
}
