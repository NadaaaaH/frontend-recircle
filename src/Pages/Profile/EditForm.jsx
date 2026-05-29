import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { User, Camera, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ProfileEditForm() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        bio: '',
        kampus: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.title = 'Edit Profil | ReCircle';
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                kampus: user.kampus || '',
            });
            setAvatarPreview(
                user.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=43552c&color=fff`
            );
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess('');
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('_method', 'PATCH');
            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('bio', form.bio);
            formData.append('kampus', form.kampus);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await api.post('/profile', formData);

            await refreshUser();
            setSuccess('Profil berhasil diperbarui!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            console.error('[EditForm] Submit error:', err.response?.data || err.message);
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(data.errors);
            } else {
                setErrors({ general: data?.message || 'Terjadi kesalahan, coba lagi.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${
            errors[field]
                ? 'border-red-300 focus:ring-red-200'
                : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-500'
        }`;

    return (
        <MainLayout>
            <div className="min-h-screen bg-secondary">
                <div className="max-w-2xl mx-auto px-4 py-8 pt-28">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 rounded-xl hover:bg-white/70 transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Profil</h1>
                    </div>

                    {/* Success Banner */}
                    {success && (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-6 font-semibold text-sm">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* Error Banner */}
                    {errors.general && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 font-semibold text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Avatar Upload */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <p className="text-sm font-bold text-gray-700 mb-4">Foto Profil</p>
                            <div className="flex items-center gap-5">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full shadow-md hover:bg-emerald-700 transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {avatarFile ? avatarFile.name : 'Belum ada foto baru'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, maks 2MB</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                                    >
                                        Pilih foto baru
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Pribadi */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                            <p className="text-sm font-bold text-gray-700">Informasi Pribadi</p>

                            {/* Nama */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Nama lengkapmu"
                                    className={inputClass('name')}
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className={inputClass('email')}
                                    required
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                            </div>

                            {/* Kampus */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Kampus
                                </label>
                                <input
                                    type="text"
                                    name="kampus"
                                    value={form.kampus}
                                    onChange={handleChange}
                                    placeholder="Contoh: IPB University"
                                    className={inputClass('kampus')}
                                />
                                {errors.kampus && <p className="text-xs text-red-500 mt-1">{errors.kampus[0]}</p>}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Ceritakan sedikit tentang dirimu..."
                                    rows={3}
                                    className={`${inputClass('bio')} resize-none`}
                                />
                                {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio[0]}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#40534C] hover:bg-[#2e3c36] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <User className="w-4 h-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
