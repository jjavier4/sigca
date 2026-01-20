'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FormLabelInput from '@/components/ui/form/FormLabelInput'
import Alert from '@/components/ui/utils/alert'
import Loading from '@/components/ui/utils/loading'
import LoadingError from '@/components/ui/utils/loadingError'
import { Mail, IdCard, User, ArrowLeft } from 'lucide-react'

export default function PerfilPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [errorLoading, setErrorLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    numeroControl: '',
    nombre: ''
  })

  // Cargar datos del usuario
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (!session?.user?.email) return

      try {
        setLoading(true)
        const response = await fetch(`/api/user/findone?email=${session.user.email}`)
        const data = await response.json()

        if (response.ok) {
          setFormData({
            email: data.usuario.email || '',
            numeroControl: data.usuario.numero_control || '',
            nombre: data.usuario.nombre || ''
          })
        } else {
          setErrorLoading(true)
          setError(data.error)
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error)
        setErrorLoading(true)
      } finally {
        setLoading(false)
      }
    }

    cargarDatosUsuario()
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Formato de email inválido')
        setIsLoading(false)
        return
      }

      // Validar número de control (opcional, solo si se proporciona)
      if (formData.numeroControl && !/^\d{8}$/.test(formData.numeroControl)) {
        setError('El número de control debe tener 8 dígitos')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/user/updateone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailActual: session.user.email,
          email: formData.email,
          numeroControl: formData.numeroControl || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        
        // Actualizar la sesión con el nuevo email si cambió
        if (formData.email !== session.user.email) {
          await update({
            ...session,
            user: {
              ...session.user,
              email: formData.email
            }
          })
        }

      } else {
        setError(data.error)
      }

      setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)

    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      setError('Error al actualizar perfil')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (errorLoading) {
    return <LoadingError error="Error al cargar el perfil del usuario" />
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <Alert
        type={error ? 'error' : 'success'}
        message={error || success}
        isVisible={!!(error || success)}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <div className="max-w-2xl mx-auto px-4">
        
        <form onSubmit={handleSubmit} className=" p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Información Editable
          </h2>
          <p className="text-gray-600 mt-1">
            Actualiza tu información personal
          </p>

          <FormLabelInput
            title="Correo Electrónico"
            children={<Mail className="absolute left-3 top-3 text-gray-500" size={20} />}
            type="email"
            value={formData.email}
            change={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tu@email.com"
            required={true}
          />

          <FormLabelInput
            title="Número de Control (opcional)"
            children={<IdCard className="absolute left-3 top-3 text-gray-500" size={20} />}
            type="text"
            value={formData.numeroControl}
            change={(e) => setFormData({ ...formData, numeroControl: e.target.value })}
            placeholder="12345678"
            required={false}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              {isLoading
                ? 'Actualizando...'
                : success
                  ? '¡Actualizado!'
                  : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}