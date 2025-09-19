import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-16 max-w-6xl mx-auto px-8">
        <div className="flex-shrink-0">
          <SignUp 
            appearance={{
              elements: {
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "text-2xl font-semibold",
                headerSubtitle: "text-gray-600",
              }
            }}
          />
        </div>
        
        <div className="flex-1 max-w-md">
          <h1 className="text-6xl font-bold text-gray-600 mb-4">
            DevVox AI
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Understanding, traversing and making issues in your codebase made easy.
          </p>
        </div>
      </div>
    </div>
  )
}