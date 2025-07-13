'use client'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Horizontal = () => {
  const navigate = useNavigate()
  const { changeLayoutOrientation } = useLayoutContext()
  useEffect(() => {
    changeLayoutOrientation('horizontal')
    navigate('/menu/dashboard')
  }, [])
  return <></>
}

export default Horizontal
 