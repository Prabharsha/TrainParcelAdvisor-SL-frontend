import Link from 'next/link';
import { FaTrain, FaBox, FaTicketAlt, FaSearch, FaUserCircle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-railway-red-700 to-railway-blue-900 text-white">
        <div className="container-custom py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Welcome to TrainParcelAdvisor SL
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Your one-stop solution for Sri Lankan Railway ticket booking and parcel services.
              Fast, reliable, and convenient.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/tickets/book"
                className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
              >
                <FaTicketAlt />
                Book Train Ticket
              </Link>
              <Link
                href="/parcels/book"
                className="btn bg-white text-railway-red-700 hover:bg-gray-100 flex items-center gap-2 text-lg px-8 py-3"
              >
                <FaBox />
                Send Parcel
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-railway-gold-700 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-railway-blue-900 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12 text-railway-blue-900">
            Our Services
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Book Ticket */}
            <Link href="/tickets/book" className="card hover:shadow-xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-railway-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-railway-red-700 transition-colors">
                  <FaTicketAlt className="text-3xl text-railway-red-700 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Book Tickets</h3>
                <p className="text-gray-600">
                  Reserve your train seat in advance with our easy booking system
                </p>
              </div>
            </Link>

            {/* Send Parcel */}
            <Link href="/parcels/book" className="card hover:shadow-xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-railway-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-railway-blue-900 transition-colors">
                  <FaBox className="text-3xl text-railway-blue-900 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Send Parcels</h3>
                <p className="text-gray-600">
                  Safe and reliable parcel delivery across Sri Lanka
                </p>
              </div>
            </Link>

            {/* Track Services */}
            <Link href="/track" className="card hover:shadow-xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-railway-gold-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-railway-gold-700 transition-colors">
                  <FaSearch className="text-3xl text-railway-gold-700 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track & Trace</h3>
                <p className="text-gray-600">
                  Track your parcels and tickets in real-time
                </p>
              </div>
            </Link>

            {/* Login */}
            <Link href="/login" className="card hover:shadow-xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-railway-blue-900 transition-colors">
                  <FaUserCircle className="text-3xl text-gray-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Account</h3>
                <p className="text-gray-600">
                  Login to manage your bookings and parcels
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gradient-to-r from-railway-blue-900 to-railway-red-700 text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg">Online Booking</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-lg">Destinations Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Safe</div>
              <div className="text-lg">& Secure Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-railway-blue-900 text-white py-8">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaTrain className="text-3xl text-railway-gold-700" />
            <span className="text-2xl font-bold">TrainParcelAdvisor SL</span>
          </div>
          <p className="text-white/80">
            © 2026 Sri Lankan Railway Department. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
