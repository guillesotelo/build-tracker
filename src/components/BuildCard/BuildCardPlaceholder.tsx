import React, { useContext } from 'react'
import { AppContext } from '../../AppContext'

type Props = {
    delay?: string
    style?: React.CSSProperties
}

export const BuildCardPlaceholderBlock = (darkMode: boolean, height: string | number, margin?: string) => {
    return (
        <div className="systemcard__placeholder">
            <div
                style={{
                    height,
                    width: '100%',
                    margin: margin || '1rem',
                    backgroundImage: darkMode ?
                        'linear-gradient(110deg, #262626 8%, #4f4f4f 18%, #262626 33%)' :
                        'linear - gradient(110deg, #ececec 8 %, #f5f5f5 18 %, #ececec 33 %)'
                }}
                className='systemcard__loading-block' />
        </div>
    )
}

export default function BuildCardPlaceholder({ delay, style }: Props) {
    const { darkMode } = useContext(AppContext)

    return (
        <div
            className={`buildcard__container${darkMode ? '--dark' : ''}`}
            style={{
                borderColor: darkMode ? 'gray' : '#d3d3d361',
                backgroundImage: '',
                animationDelay: `${delay || '0'}`,
                // height: '9rem',
                // padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'default',
                ...style
            }}>
            {BuildCardPlaceholderBlock(darkMode, '.6rem')}
            {BuildCardPlaceholderBlock(darkMode, '2rem')}
            {BuildCardPlaceholderBlock(darkMode, '.2rem')}
        </div>
    )
}