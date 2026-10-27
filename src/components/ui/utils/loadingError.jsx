import React from 'react'

export default function LoadingError({error}) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-800 font-medium">{error}</p>
            </div>
        </div>
    )
}
