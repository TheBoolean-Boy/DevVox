import {  SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-16 max-w-6xl mx-auto px-8">
        {/* Left side - SignUp component */}
        <div className="flex-shrink-0">
          <SignIn />
        </div>
        
        {/* Right side - Branding */}
        <div className="flex-1 max-w-md">
          <h1 className="text-6xl font-bold text-gray-600 mb-4">
            DevVox AI
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Understanding, traversing and making issues made easy.
          </p>
        </div>
      </div>
    </div>
  )
}