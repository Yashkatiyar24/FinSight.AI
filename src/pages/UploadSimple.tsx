import React from 'react'

const UploadPageSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Transactions</h1>
        <div className="bg-slate-800 rounded-lg p-8">
          <p className="text-white">Upload page is working!</p>
          <div className="mt-4 p-4 border-2 border-dashed border-slate-600 rounded-lg text-center">
            <p className="text-gray-400">Drag & drop files here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPageSimple
