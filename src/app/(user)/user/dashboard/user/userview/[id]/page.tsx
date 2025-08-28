import Viewuser from '@/components/user-dashboard/user-mangement/module/viewuser'
import React from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserViewPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <div>
        <Viewuser id={id} />
    </div>
  )
}
