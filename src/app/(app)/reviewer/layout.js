export default function RootLayout({ children }) {
    return (
        <div className='min-h-screen p-10 bg-amber-50 text-black'>
            {children}
        </div>
    );
}