export default function RootLayout({ children }) {
    return (
        <div className='min-h-screen p-10 bg-blue-900 text-black'>
            {children}
        </div>
    );
}