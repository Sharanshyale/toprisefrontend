"use client";
import React from 'react'
import CategorySection from './modules/pages/Home/category/Category';
import Featureproduct from './modules/pages/Home/product-sections/Featureproduct';

export default function Homepage() {
  return (
    <div>
        <CategorySection/>
        <Featureproduct/>
    </div>
  )
}
