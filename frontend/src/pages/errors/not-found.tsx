import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 flex items-center justify-center overflow-hidden px-6">

            {/* Background blobs */}
            <div className="absolute w-[500px] h-[500px] bg-orange-200 rounded-full blur-3xl opacity-40 -top-40 -left-40 pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] bg-orange-300 rounded-full blur-3xl opacity-30 -bottom-20 -right-20 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">


                <h1 className="text-5xl md:text-6xl font-extrabold text-orange-600 tracking-tight mb-4">
                    Page Not Found
                </h1>

                <p className="text-base md:text-lg text-orange-700 mb-10">
                    Looks like this page went missing from the syllabus.
                    Don't worry — let's get you back on track and find what you're looking for.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => navigate("/")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl text-lg shadow-lg flex items-center gap-2"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/groups")}
                        className="border-orange-500 text-orange-600 px-8 py-6 rounded-xl text-lg hover:bg-orange-50 flex items-center gap-2"
                    >
                        <Search className="h-5 w-5" />
                        Browse Groups
                    </Button>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </button>
            </div>
        </div>
    )
}