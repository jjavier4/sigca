'use client'
import React, { useEffect, useState } from 'react'
import RowConvocatorie from '@/components/ui/utils/rowConvocatorie'
import Alert from '@/components/ui/utils/alert'
import FormLabelInput from '@/components/ui/form/FormLabelInput'
import FormTextArea from '@/components/ui/form/FormTextArea'
import { FileText, Calendar, ListChecks } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Loading from '@/components/ui/utils/loading'
import LoadingError from '@/components/ui/utils/loadingError'
export default function ManageConvocatories() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false) // Estado de carga inicial
    const [errorLoading, setErrorLoading] = useState(false) // Estado de error de carga inicial
    const [isLoading, setIsLoading] = useState(false) // Estado de carga para las operaciones de actualización
    const [convocatories, setConvocatories] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [onEdit, setOnEdit] = useState(false)
    const [selectedConvocatorieEdit, setSelectedConvocatorieEdit] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const deleteConvocatorie = async (id) => {
        try {
            const response = await fetch(`/api/convocatories/deleteone?id=${id}`, {
                method: 'DELETE',
            })
            const data = await response.json()
            if (response.ok) {
                setSuccess(data.message)
            } else {
                setError(data.error)
            }
            setTimeout(() => {
                setSuccess('')
                setError('')
            }, 3000)
        } catch (error) {
            console.error('Error al eliminar convocatoria:', error)
            setError('Error al eliminar convocatoria')
        }
    }

    const findConvocatories = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/convocatories/findall', {
                method: 'GET',
            })
            const data = await response.json()
            if (response.ok) {
                console.log(data.convocatorias)
                setConvocatories(data.convocatorias)
            } else {
                setError(data.error)
            }
            setTimeout(() => {
                setSuccess('')
                setError('')
            }, 3000)
        } catch (error) {
            console.error('Error al traer convocatorias:', error)
            setErrorLoading(true)
        } finally {
            setLoading(false)
        }
    }

    const updateConvocatorie = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/convocatories/updateone', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedConvocatorieEdit.id,
                    titulo: selectedConvocatorieEdit.titulo,
                    descripcion: selectedConvocatorieEdit.descripcion,
                    fecha_inicio: selectedConvocatorieEdit.fecha_inicio,
                    fecha_cierre: selectedConvocatorieEdit.fecha_cierre,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(data.message)
                findConvocatories()
            } else {
                setError(data.error)
            }



            setTimeout(() => {
                setSuccess('')
                setError('')
                setOnEdit(false)
                setSelectedConvocatorieEdit(null)
            }, 3000)
        } catch (err) {
            setError('Error al actualizar convocatoria')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredConvocatories = convocatories.filter((conv) =>
        conv.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        findConvocatories()
    }, [error, success])
    if (loading) {
        return (
            <Loading />
        )
    }
    if (errorLoading) {
        return (
            <LoadingError error="Error al cargar las convocatorias." />
        )
    }
    return (
        <div>
            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
                onClose={() => {
                    setTimeout(() => {
                        setShowAlert(!showAlert)
                    }, 3000)
                }}
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Gestionar Convocatorias
            </h2>
            {onEdit ? (
                <>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Actualizar Convocatoria: {selectedConvocatorieEdit?.titulo}
                    </h2>
                    <form onSubmit={updateConvocatorie} className="space-y-4">
                        <FormLabelInput
                            title={'Título'}
                            children={<FileText className="absolute left-3 top-3 text-black" size={20} />
                            }
                            type={'text'}
                            value={selectedConvocatorieEdit.titulo}
                            change={(e) =>
                                setSelectedConvocatorieEdit({
                                    ...selectedConvocatorieEdit,
                                    titulo: e.target.value,
                                })
                            }
                            placeholder={'Título de la convocatoria'}
                            required={true}
                        />
                        <FormTextArea
                            title={'Descripción'}
                            children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
                            formData={selectedConvocatorieEdit.descripcion || ''}
                            change={(e) =>
                                setSelectedConvocatorieEdit({
                                    ...selectedConvocatorieEdit,
                                    descripcion: e.target.value,
                                })}
                            rows={5}
                            placeholder="Descripción de la convocatoria"
                            requiered={false}
                        />

                        <FormLabelInput
                            title={'Fecha de Inicio'}
                            children={<Calendar className="absolute left-3 top-3 text-black" size={20} />
                            }
                            type={'date'}
                            value={selectedConvocatorieEdit.fecha_inicio?.split('T')[0]}
                            change={(e) =>
                                setSelectedConvocatorieEdit({
                                    ...selectedConvocatorieEdit,
                                    fecha_inicio: e.target.value,
                                })
                            }
                            placeholder={''}
                            required={true}
                        />

                        <FormLabelInput
                            title={'Fecha de Cierre'}
                            children={<Calendar className="absolute left-3 top-3 text-black" size={20} />
                            }
                            type={'date'}
                            value={selectedConvocatorieEdit.fecha_cierre?.split('T')[0]}
                            change={(e) =>
                                setSelectedConvocatorieEdit({
                                    ...selectedConvocatorieEdit,
                                    fecha_cierre: e.target.value,
                                })
                            }
                            placeholder={''}
                            required={true}
                        />

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                            >
                                {isLoading
                                    ? 'Actualizando...'
                                    : success
                                        ? 'Actualizado !!!'
                                        : 'Actualizar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setOnEdit(false)
                                    setSelectedConvocatorieEdit(null)
                                }}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </>
            ) : (

                filteredConvocatories.length === 0 ? (
                    <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                        <div className="text-center py-12 px-6">
                            <ListChecks className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <p className="text-gray-500 text-lg">
                                No hay convocatorias registradas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Título
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Fecha Inicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Fecha Fin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredConvocatories?.map((convocatorie) => (
                                        <RowConvocatorie
                                            key={convocatorie.id}
                                            titulo={convocatorie.titulo}
                                            fecha_inicio={convocatorie.fecha_inicio}
                                            fecha_cierre={convocatorie.fecha_cierre}
                                            onEdit={() => {
                                                setOnEdit(true)
                                                setSelectedConvocatorieEdit(convocatorie)
                                            }}
                                            onDelete={() => deleteConvocatorie(convocatorie.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )


            )}
        </div>
    )
}