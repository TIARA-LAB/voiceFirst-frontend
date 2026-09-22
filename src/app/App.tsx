import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { FullScreenLoading } from '@/app/guards'

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}