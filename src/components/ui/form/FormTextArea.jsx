import React from 'react'

export default function FormTextArea({ title, children, formData, change, rows, placeholder,requiered }) {
    return (
        <div>
            {children}
            <label className="block text-sm font-medium text-black mb-2">
                {title}

            </label>

            <div className='relative'>
                {children}
                <textarea
                    required={requiered}
                    value={formData}
                    onChange={change}
                    rows={rows}
                    className="w-full pl-10 pr-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder={placeholder}
                />
            </div>


        </div>
    )
}
