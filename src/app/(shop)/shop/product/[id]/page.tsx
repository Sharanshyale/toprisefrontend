import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import ProductPage from '@/components/webapp/ViewProduct'
import React from 'react'

export default function page() {
  return (
    <div>
      <Header />  
      <ProductPage />
      <Footer />
    </div>
  )
}
