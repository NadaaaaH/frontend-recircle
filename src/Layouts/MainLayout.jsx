import React from "react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-secondary font-sans text-gray-800 antialiased selection:bg-primary selection:text-white flex flex-col">
            <Navbar />

            {/* Main Content wrapper with top padding for fixed navbar */}
            <main className="flex-grow pt-20">{children}</main>

            <Footer />
        </div>
    );
}
