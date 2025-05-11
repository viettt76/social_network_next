'use client';

import { Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePasswordService, deleteAccountService } from '@/lib/services/authService';
import { useRouter } from '@/i18n/routing';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppDispatch } from '@/lib/hooks';
import { resetInfo } from '@/lib/slices/userSlice';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export default function AccountSettings() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [openModal, setOpenModal] = useState(false);
    const [changePasswordFormData, setChangePasswordFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [isNotMatchNewPassword, setIsNotMatchNewPassword] = useState(false);
    const [isOldPasswordIncorrect, setIsOldPasswordIncorrect] = useState(false);

    const [passwordToDeleteAccount, setPasswordToDeleteAccount] = useState('');
    const [passwordToDeleteAccountIncorrect, setPasswordToDeleteAccountIncorrect] = useState(false);

    const handleChangeForm = (e) => {
        const { name, value } = e.target;

        if (name === 'oldPassword') {
            setIsOldPasswordIncorrect(false);
        }

        if (name === 'newPassword' || name === 'confirmNewPassword') {
            setIsNotMatchNewPassword(false);
        }

        setChangePasswordFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangePassword = async () => {
        if (changePasswordFormData.newPassword !== changePasswordFormData.confirmNewPassword) {
            setIsNotMatchNewPassword(true);
            return;
        }

        try {
            await changePasswordService({
                oldPassword: changePasswordFormData.oldPassword,
                newPassword: changePasswordFormData.newPassword,
            });
            dispatch(resetInfo());
            toast.success('Cập nhật mật khẩu thành công');

            router.push('/login');
        } catch (error) {
            console.error(error);
            setIsOldPasswordIncorrect(true);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccountService(passwordToDeleteAccount);
            dispatch(resetInfo());
            toast.info('Tài khoản của bạn đã bị xoá');
            router.push('/login');
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError && (error.status === 400 || error.status === 422)) {
                setPasswordToDeleteAccountIncorrect(true);
            }
        }
    };

    return (
        <div className="bg-background w-fit py-3 px-6 rounded-lg space-y-3">
            <Modal className="bg-foreground/50" dismissible show={openModal} onClose={() => setOpenModal(false)}>
                <ModalHeader>Đổi mật khẩu</ModalHeader>
                <ModalBody className="py-3 space-y-2">
                    <div className="grid grid-cols-[max-content,1fr] gap-x-3 gap-y-4 items-center">
                        <Label className="text-base">Mật khẩu cũ</Label>
                        <Input type="password" name="oldPassword" onChange={handleChangeForm} />

                        {isOldPasswordIncorrect && (
                            <>
                                <div className="w-1 h-1"></div>
                                <div className="text-destructive -mt-3 text-xs">Mật khẩu cũ không chính xác</div>
                            </>
                        )}

                        <Label className="text-base">Mật khẩu mới</Label>
                        <Input type="password" name="newPassword" onChange={handleChangeForm} />

                        <Label className="text-base">Nhập lại mật khẩu mới</Label>
                        <Input type="password" name="confirmNewPassword" onChange={handleChangeForm} />

                        {isNotMatchNewPassword && (
                            <>
                                <div className="w-1 h-1"></div>
                                <div className="text-destructive -mt-3 text-xs">Mật khẩu nhập lại chưa khớp</div>
                            </>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter className="justify-end">
                    <Button variant="destructive" onClick={() => setOpenModal(false)}>
                        Huỷ
                    </Button>
                    <Button className="bg-yellow-400 hover:bg-yellow-500" onClick={handleChangePassword}>
                        Cập nhật
                    </Button>
                </ModalFooter>
            </Modal>
            <div className="cursor-pointer" onClick={() => setOpenModal(true)}>
                Đổi mật khẩu
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <div className="text-destructive cursor-pointer">Xoá tài khoản</div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Xoá tài khoản</DialogTitle>
                    </DialogHeader>
                    <div>
                        <p>
                            &bull; Không ai có thể nhìn thấy tài khoản của bạn, bao gồm tất cả nội dung được lưu trữ
                            trong đó.
                        </p>
                        <p>&bull; Bạn có thể khôi phục lại tài khoản của mình và tất cả nội dung bất cứ lúc nào.</p>
                        <p className="mt-4 fz-15">
                            **{' '}
                            <span className="">
                                Nếu bạn xác nhận xoá tài khoản vui lòng <b className="text-black">nhập mật khẩu</b> và
                                nhấn nút
                            </span>{' '}
                            <b className="text-black">&quot;Xoá tài khoản&quot;</b> <span>để xác nhận xoá</span> **
                        </p>
                        <Input
                            className="mt-3"
                            name="password"
                            type="password"
                            placeholder="Mật khẩu"
                            onChange={(e) => setPasswordToDeleteAccount(e.target.value)}
                        />
                        {passwordToDeleteAccountIncorrect && (
                            <p className="text-sm text-destructive">Mật khẩu xác nhận không chính xác</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            Xoá tài khoản
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
