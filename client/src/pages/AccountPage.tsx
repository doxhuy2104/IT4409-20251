import React, { useState, useEffect } from 'react';
import profileService, { UpdateUserProfileParams } from '../services/profile.service';
import locationService, { Province, Ward } from '../services/location.service';
import { UserProfile } from '../types/user';

type ProfileFormFields = Pick<UpdateUserProfileParams, 'fullName' | 'phone'>;

const AccountPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState<ProfileFormFields>({
        fullName: '',
        phone: '',
    });
    const [addressDetail, setAddressDetail] = useState('');
    const [provinceOptions, setProvinceOptions] = useState<Province[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [wardOptions, setWardOptions] = useState<Ward[]>([]);
    const [selectedWardCode, setSelectedWardCode] = useState('');
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await profileService.getUserProfile();
                setProfile(data);
                setFormData({
                    fullName: data.fullName,
                    phone: data.phone,
                });
                setAddressDetail(data.address || '');
            } catch (err) {
                setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
                console.error('Error fetching profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const data = await locationService.getNewProvinces();
                setProvinceOptions(data);
            } catch (err) {
                setError('Không thể tải danh sách tỉnh/thành. Vui lòng thử lại sau.');
                console.error('Error fetching provinces:', err);
            }
        };

        fetchProvinces();
    }, []);

    const handleProvinceSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedProvinceCode(code);
        setSelectedWardCode('');
        setWardOptions([]);

        if (!code) {
            return;
        }

        try {
            setIsLoadingWards(true);
            const wards = await locationService.getWardsByProvince(code);
            setWardOptions(wards);
        } catch (err) {
            setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
            console.error('Error fetching wards:', err);
        } finally {
            setIsLoadingWards(false);
        }
    };

    const handleWardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWardCode(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedProvinceCode || !selectedWardCode || !addressDetail.trim()) {
            setError('Vui lòng nhập chi tiết địa chỉ.');
            return;
        }

        try {
            const trimmedDetail = addressDetail.trim();
            const provinceName = provinceOptions.find(item => item.code === selectedProvinceCode)?.name;
            const wardName = wardOptions.find(item => item.code === selectedWardCode)?.name;

            const addressParts = [trimmedDetail, wardName, provinceName].filter(Boolean);

            const payload: UpdateUserProfileParams = {
                fullName: formData.fullName,
                phone: formData.phone,
                address: addressParts.join(', '),
            };

            const updatedProfile = await profileService.updateUserProfile(payload);
            setProfile(updatedProfile);
            setFormData({
                fullName: updatedProfile.fullName,
                phone: updatedProfile.phone,
            });
            setAddressDetail(trimmedDetail);
            setIsEditing(false);
            setSuccess('Cập nhật thông tin thành công!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
            console.error('Error updating profile:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">


                    {/* Account Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md border border-green-200">
                                {success}
                            </div>
                        )}

                        {/* Profile Info */}
                        {!isEditing ? (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Chỉnh sửa
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                                        <p className="text-gray-800 font-medium">{profile?.fullName}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-800 font-medium">{profile?.email}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                        <p className="text-gray-800 font-medium">{profile?.phone || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                                        <p className="text-gray-800 font-medium">{profile?.address || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>


                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa thông tin cá nhân</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form data
                                                if (profile) {
                                                    setFormData({
                                                        fullName: profile.fullName,
                                                        phone: profile.phone,
                                                    });
                                                    setAddressDetail(profile.address || '');
                                                }
                                                setSelectedProvinceCode('');
                                                setSelectedWardCode('');
                                                setWardOptions([]);
                                            }}
                                            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition duration-300 ease-in-out"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out"
                                            placeholder="Nhập họ và tên của bạn"
                                            required
                                        />
                                    </div>



                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out"
                                            placeholder="Nhập số điện thoại của bạn"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700">
                                            Địa chỉ chi tiết
                                        </label>
                                        <input
                                            type="text"
                                            id="addressDetail"
                                            name="addressDetail"
                                            value={addressDetail}
                                            onChange={(e) => setAddressDetail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out"
                                            placeholder="Số nhà, đường..."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                                            Tỉnh/ Thành phố
                                        </label>
                                        <select
                                            id="province"
                                            value={selectedProvinceCode}
                                            onChange={handleProvinceSelect}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out"
                                            required
                                        >
                                            <option value="">Chọn tỉnh</option>
                                            {provinceOptions.map(province => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="ward" className="block text-sm font-medium text-gray-700">
                                            Phường/ Xã
                                        </label>
                                        <select
                                            id="ward"
                                            value={selectedWardCode}
                                            onChange={handleWardSelect}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out"
                                            disabled={!selectedProvinceCode || isLoadingWards}
                                            required
                                        >
                                            <option value="">
                                                {isLoadingWards ? 'Đang tải...' :!selectedProvinceCode?'Vui lòng chọn tỉnh': 'Chọn phường'}
                                            </option>
                                            {wardOptions.map(ward => (
                                                <option key={ward.code} value={ward.code}>
                                                    {ward.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Order History Section (Preview) */}
                        {!isEditing ?
                            (<div className="mt-8 border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Lịch sử đơn hàng gần đây</h2>
                                    <a href="/orders" className="text-green-600 hover:text-green-800 flex items-center">
                                        Xem tất cả
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>

                                <div className="bg-gray-50 rounded-md p-6 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {/* <p className="mt-2 text-gray-600">Bạn chưa có đơn hàng nào</p> */}
                                    <a href="/" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out">
                                        Mua sắm ngay
                                    </a>
                                </div>
                            </div>) : (<div></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
