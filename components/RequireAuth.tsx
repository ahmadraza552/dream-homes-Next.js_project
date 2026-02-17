"use client"
import { useSearchParams,useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function RequireAuth({
    children,
}:{
    children:React.ReactNode
}) {
    const searchParams= useSearchParams()
    const router=useRouter()
    useEffect(()=>{
        const error = searchParams.get("error")
        if(error){
            alert("please sigin to access this page")

             router.replace(window.location.pathname)
        }
       
    },[searchParams])
  return (
    <>
      {children}
    </>
  )
}
