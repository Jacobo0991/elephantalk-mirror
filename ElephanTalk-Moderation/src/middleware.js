// src/middleware.js
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import {
    publicRoutes,
    authRoutes,
    apiAuthPrefix,
    DEFAULT_LOGIN_REDIRECT,
} from '@/constants/routes'

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const isLoggedIn = Boolean(token)
    const { nextUrl } = req

    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)
    const isApiRoute = nextUrl.pathname.startsWith(apiAuthPrefix)

    // En las rutas de autorización de API, no se verifica la autenticación
    if (isApiRoute) return NextResponse.next()

    // En rutas públicas, no se verifica la autenticación
    if (isPublicRoute) return NextResponse.next()

    // En rutas de autenticación, se verifica la autenticación
    if (isAuthRoute) {
        if (!isLoggedIn) return NextResponse.next()

        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }

    // En rutas privadas, se verifica la autenticación
    if (!isPublicRoute) {
        if (isLoggedIn) return NextResponse.next()

        const callbackUrl = nextUrl.pathname + nextUrl.search
        const encodedCallbackUrl = encodeURIComponent(callbackUrl)

        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        )
    }

    return NextResponse.next()
}

// Configuración del matcher
export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
