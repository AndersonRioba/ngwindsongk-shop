'use client';

import PrivateRoute from "@/src/components/PrivateRoute";
import useAuth from "@/src/hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Profile Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-medium text-gray-900">{user?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mt-3">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-lg font-medium text-gray-900">{user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Settings</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                      <span className="font-medium text-gray-700">Order History</span>
                      <span className="icon-[solar--alt-arrow-right-linear] w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"/>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                      <span className="font-medium text-gray-700">Addresses</span>
                      <span className="icon-[solar--alt-arrow-right-linear] w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PrivateRoute>
  );
}
