import React from 'react'

export default function FormLabelInput({ title, children, type,required, value, change, placeholder,...rest  }) {
    return (
        <div>
            <label className="block text-sm font-medium text-black mb-2">
                {title}
            </label>

            <div className="relative">
                {children}
                <input
                    type={type}
                    required={required}
                    value={value}
                    //onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    onChange={change}
                    className="w-full pl-10 pr-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder={placeholder}
                    {...rest}
                />
            </div></div>
    )
}
