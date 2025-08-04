import { Suspense } from 'react';
import UpdatePasswordForm from './update-password-form';

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center">Carregando...</div>}>
      <UpdatePasswordForm />
    </Suspense>
  );
}

