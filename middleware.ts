 import { NextRequest,NextResponse } from 'next/server'
import React from 'react'
const protectedRoutes =["/properties/add"]
 
 export default function middleware(req: NextRequest) {
    const token= req.cookies.get("next-auth.session-token")?.value
    console.log(token)

    const isProtectedRoute= protectedRoutes.includes(req.nextUrl.pathname)
    if(!token && isProtectedRoute){
        const loginUrl= new URL ("/", req.url)
        loginUrl.searchParams.set("error","login_required")
        return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
 }
 
