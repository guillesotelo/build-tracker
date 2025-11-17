import React, { createContext, useEffect, useState } from 'react'
import { verifyToken } from './services'
import { AppContextType } from './types'
import { useHistory } from 'react-router-dom'

export const AppContext = createContext<AppContextType>({
    isMobile: false,
    isLoggedIn: null,
    isSuper: false,
    setIsLoggedIn: () => { },
    setIsSuper: () => { },
    item: '',
    setItem: () => { },
    theme: '--dark',
    setTheme: () => { },
    headerLoading: false,
    setHeaderLoading: () => { },
})

type Props = {
    children?: React.ReactNode
}

export const AppProvider = ({ children }: Props) => {
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [isSuper, setIsSuper] = useState(false)
    const [item, setItem] = useState('/')
    const [theme, setTheme] = useState(localStorage.getItem('preferredMode') || '')
    const [headerLoading, setHeaderLoading] = useState(false)

    useEffect(() => {
        verifyUser()

        const checkWidth = () => setIsMobile(window.innerWidth <= 768)

        window.addEventListener("resize", checkWidth)
        return () => window.removeEventListener("resize", checkWidth)
    }, [])

    useEffect(() => {
        const body = document.querySelector('body')
        if (body) {
            body.classList.remove('--dark')
            if (theme) body.classList.add('--dark')

            document.documentElement.setAttribute(
                "data-color-scheme",
                theme ? "dark" : "light"
            )
        }
    }, [theme])

    const verifyUser = async () => {
        const verified = await verifyToken()
        if (verified) {
            setIsLoggedIn(true)
            setIsSuper(verified.isSuper)
            localStorage.setItem('user', JSON.stringify(verified))
        } else setIsLoggedIn(false)
    }

    const contextValue = React.useMemo(() => ({
        isSuper,
        setIsSuper,
        isMobile,
        setIsLoggedIn,
        isLoggedIn,
        item,
        setItem,
        theme,
        setTheme,
        headerLoading,
        setHeaderLoading
    }), [
        isSuper,
        setIsSuper,
        isMobile,
        setIsLoggedIn,
        isLoggedIn,
        item,
        setItem,
        theme,
        setTheme,
        headerLoading,
        setHeaderLoading
    ])


    return <AppContext.Provider
        value={contextValue}>
        {children}
    </AppContext.Provider>
}
