'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

// Dynamically import components that use browser APIs
const IDEWorkspace = dynamic(() => import('@/components/IDEWorkspace'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingScreen />
  }

  return (
    <MainLayout>
      <IDEWorkspace />
    </MainLayout>
  )
}
