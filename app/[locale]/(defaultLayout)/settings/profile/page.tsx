'use client';

import { useAppSelector } from '@/lib/hooks';
import { Gender, selectUserInfo, BasicUserInformation } from '@/lib/slices/userSlice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from '@/app/components/DatePicker';
import { Radio } from 'flowbite-react';
import { changeInformationService } from '@/lib/services/userService';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const GENDER_OPTIONS = [
    { label: 'Nam', value: Gender.MALE },
    { label: 'Nữ', value: Gender.FEMALE },
    { label: 'Khác', value: Gender.OTHER },
];

export default function ProfileSettings() {
    const userInfo = useAppSelector(selectUserInfo);

    const [basicInformation, setBasicInformation] = useState<BasicUserInformation>({
        firstName: '',
        lastName: '',
        hometown: '',
        workplace: '',
        school: '',
        birthday: null,
        gender: null,
        avatar: null,
        isPrivate: null,
    });

    // Set basic information from redux store
    useEffect(() => {
        const { firstName, lastName, hometown, workplace, school, birthday, gender, avatar, isPrivate } = userInfo;
        setBasicInformation({
            firstName,
            lastName,
            hometown,
            workplace,
            school,
            birthday,
            gender,
            avatar,
            isPrivate,
        });
    }, [userInfo]);

    const handleChangeBasicInformation = (e) => {
        const { name, value } = e.target;
        setBasicInformation((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveBasicInformationChange = async () => {
        try {
            await changeInformationService(basicInformation);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            toast.error('Cập nhật thông tin thất bại');
            console.error(error);
        }
    };

    return (
        <div className="bg-background p-4 flex flex-col gap-y-4">
            <div className="flex gap-x-6">
                <div className="flex-1">
                    <Label className="font-semibold block mb-2">Tên</Label>
                    <Input
                        className="flex-1"
                        value={basicInformation.firstName}
                        name="firstName"
                        onChange={handleChangeBasicInformation}
                    />
                </div>
                <div className="flex-1">
                    <Label className="font-semibold block mb-2">Họ</Label>
                    <Input
                        className="flex-1"
                        value={basicInformation.lastName}
                        name="lastName"
                        onChange={handleChangeBasicInformation}
                    />
                </div>
            </div>
            <div className="flex items-center gap-x-4">
                <Label className="font-semibold">Giới tính</Label>
                {GENDER_OPTIONS.map((option) => (
                    <div key={`gender-${option.value}`} className="flex items-center gap-2">
                        <Radio
                            name="gender"
                            value={option.value}
                            checked={basicInformation.gender === option.value}
                            onChange={handleChangeBasicInformation}
                        />
                        <Label>{option.label}</Label>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-x-4">
                <Label className="font-semibold">Ngày sinh</Label>
                <DatePicker
                    value={basicInformation.birthday}
                    onChange={(date) =>
                        handleChangeBasicInformation({
                            target: {
                                name: 'birthday',
                                value: date,
                            },
                        })
                    }
                />
            </div>
            <div>
                <Label className="font-semibold block mb-2">Quê quán</Label>
                <Input
                    className="flex-1"
                    value={basicInformation.hometown ?? ''}
                    name="hometown"
                    onChange={handleChangeBasicInformation}
                />
            </div>
            <div>
                <Label className="font-semibold block mb-2">Nơi làm việc</Label>
                <Input
                    className="flex-1"
                    value={basicInformation.workplace ?? ''}
                    name="workplace"
                    onChange={handleChangeBasicInformation}
                />
            </div>
            <div>
                <Label className="font-semibold block mb-2">Trường học</Label>
                <Input
                    className="flex-1"
                    value={basicInformation.school ?? ''}
                    name="school"
                    onChange={handleChangeBasicInformation}
                />
            </div>
            <Button onClick={handleSaveBasicInformationChange}>Lưu thay đổi</Button>
        </div>
    );
}
