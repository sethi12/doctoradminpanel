'use client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => router.push('/admin/appointments')}
          className="bg-white p-8 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
        >
          <h3 className="text-2xl font-semibold">Appointments</h3>
          <p className="text-gray-600 mt-2">View & Manage all bookings</p>
        </div>

        <div
          onClick={() => router.push('/admin/admins')}
          className="bg-white p-8 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
        >
          <h3 className="text-2xl font-semibold">Manage Admins</h3>
          <p className="text-gray-600 mt-2">Create, Edit, Delete Admins</p>
        </div>
      </div>
    </div>
  );
}