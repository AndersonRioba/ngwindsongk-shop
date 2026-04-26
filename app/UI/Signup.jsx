import { useState } from "react"
import useUser from "@/app/lib/hooks/useUser"

export default function Signup({control}){
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { signUp, isLoading } = useUser()
    const router = useRouter()

    const handleSignup = (e) => {
        e.preventDefault()
        signUp(name, phone, password, confirmPassword, (response) => {
            if(response.success && response.token) {
                control('')
                if (response.user?.role === 'admin' || response.user?.role === 'super_admin') {
                    window.location.href = `http://localhost:3001/login?token=${response.token}`;
                } else {
                    router.push('/');
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
                <h2 className="text-2xl font-bold text-gray-800">Join Us</h2>
                <p className="text-gray-500 text-sm mt-1">Create your account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

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
                        placeholder="Create a password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold rounded-xl py-3 mt-4 hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={() => control('/login')} className="text-primary font-bold hover:underline cursor-pointer">
                    Sign In
                </button>
            </div>
        </div>
    )
}