'use client'

import React from 'react'

export default function RewriteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <img
            src="/images/logo.png"
            alt="Global Travel Report"
            className="h-16 mx-auto"
          />
        </div>
        <main className="relative bg-white rounded-lg shadow-lg">
          {children}
        </main>
      </div>
    </div>
  )
} 