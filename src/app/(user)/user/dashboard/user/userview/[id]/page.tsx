import Viewuser from '@/components/user-dashboard/user-mangement/module/viewuser'
import React from 'react'

interface PageProps {
  params: { id: string }
}

export default function UserViewPage({ params }: PageProps) {
  return (
    <div>
        <Viewuser id={params.id} />
    </div>
  )
}
