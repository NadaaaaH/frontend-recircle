import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function ForgotPassword({ status }) {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverStatus, setServerStatus] = useState(status || '');

    useEffect(() => {
        document.title = "Forgot Password | ReCircle";
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setServerStatus('');

        try {
            // Because auth routes are in web.php, use absolute URL to bypass /api/v1
            const response = await api.post('http://localhost:8000/forgot-password', { email });
            setServerStatus(response.data.status || 'Email sent successfully.');
        } catch (err) {
            setErrors(err.response?.data?.errors || { email: 'Failed to send reset link.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>


            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {serverStatus && (
                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                    {serverStatus}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
