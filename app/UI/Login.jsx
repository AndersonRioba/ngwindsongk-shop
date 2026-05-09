'use client'
import { useState } from "react"
import useUser from "@/app/lib/hooks/useUser"
import { getAdminUrl } from "@/app/lib/urls"

export default function Login({control}){
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading } = useUser()
    const router = useRouter()

    const handleLogin = (e) => {
        e.preventDefault()
        login(phone, password, (response) => {
            if(response.success && response.token) {
                control('')
                if (response.user?.role === 'admin' || response.user?.role === 'super_admin') {
                    window.location.href = `${getAdminUrl()}/login?token=${response.token}`
                } else {
                    router.push('/')
                }
            }
        })
    }

    return(
        <div className="bg-white w-[90%] md:w-96 rounded-2xl p-6 relative shadow-xl">
            <button onClick={e=>control('')} className="w-8 h-8 absolute right-4 top-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="icon-[material-symbols-light--close] w-5 h-5 text-gray-600"/>
            </button>
            
            <div className="mb-8 mt-2 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold rounded-xl py-4 mt-4 hover:bg-[#5b26c7] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="icon-[tabler--loader-2] animate-spin w-5 h-5" />
                            <span>Signing in...</span>
                        </>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => control('/signup')} className="text-primary font-bold hover:underline cursor-pointer">
                    Join Us
                </button>
            </div>
        </div>
    )
}