import React from 'react'
import WelcomPage from '@/components/WelcomPage'
import { images } from '@/constants/images'

const index = () => {
  return (
    <WelcomPage slide={1} src={images.slide1} subtitle='sasdjf;a fasdjfa fladf asdfasdfas df' title='this is slide 1'/>
  )
}

export default index