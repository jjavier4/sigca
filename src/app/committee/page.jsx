'use client'
import React, { useEffect, useState } from 'react'
import Alert from '@/components/ui/alert'
import { href } from '@/utils/route'
import { useSession } from 'next-auth/react';

export default function page() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  return (
    <div>
      <Alert
        type={error ? 'error' : 'success'}
        message={error || success}
        isVisible={error || success}
        onClose={() => {
          setTimeout(() => { setShowAlert(!showAlert); }, 300)
        }}
      />
      pagecomite</div>
  )
}
