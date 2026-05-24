import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Checkbox from "@/Components/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

export default function Login({ status: propStatus, canResetPassword = true }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(propStatus || "");

    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    useEffect(() => {
        document.title = "Masuk | ReCircle";
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Post to login endpoint
            const response = await api.post('/login', { email, password, remember });

            // Extract user and token from ApiResponse structure
            const responseData = response.data?.data;
            const user = responseData?.user;
            const token = responseData?.token;

            if (token && user) {
                // Simpan dulu dengan data minimal dari login response
                loginSuccess(token, user);

                // Langsung fetch profil lengkap (dengan role, is_seller, dsb)
                try {
                    const profileRes = await api.get('/profile');
                    const fullUser = profileRes.data?.data;
                    if (fullUser) {
                        loginSuccess(token, fullUser);
                        // Redirect berdasarkan role dari data lengkap
                        if (fullUser.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else if (fullUser.is_seller) {
                            navigate('/seller/dashboard');
                        } else {
                            navigate('/');
                        }
                    } else {
                        navigate('/');
                    }
                } catch {
                    // Fallback ke data minimal dari login jika fetch profil gagal
                    if (user?.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (user?.is_seller) {
                        navigate('/seller/dashboard');
                    } else {
                        navigate('/');
                    }
                }
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (err) {
            console.error('Login error:', err);
            setErrors(err.response?.data?.errors || {
                email: err.response?.data?.message || err.message || 'Email atau kata sandi salah.'
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Selamat Datang Kembali!
                </h1>
                <p className="text-gray-500">
                    Masuk untuk melanjutkan hunting barang impian.
                </p>
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email Kampus / Pribadi"
                        className="text-gray-700 font-bold mb-2"
                    />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="w-full px-5 py-4 bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-2xl text-gray-900 placeholder-gray-400 transition-all font-medium"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@mahasiswa.ipb.ac.id"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi"
                            className="text-gray-700 font-bold"
                        />
                        {canResetPassword && (
                            <Link
                                to="/forgot-password"
                                className="text-xs text-primary font-bold hover:underline"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="w-full px-5 py-4 bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-2xl text-gray-900 transition-all font-medium"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all"
                        />
                        <span className="ml-3 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <PrimaryButton
                    className="w-full justify-center py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-full text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all"
                    disabled={processing}
                >
                    {processing ? "Memproses..." : "Masuk Sekarang"} <ArrowRight className="w-5 h-5 ml-2" />
                </PrimaryButton>

                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Belum punya akun?{" "}
                        <Link
                            to="/register"
                            className="font-bold text-primary hover:text-primary-hover hover:underline transition-all"
                        >
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
