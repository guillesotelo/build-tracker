import React, { useContext } from 'react'
import { AppContext } from '../../AppContext'

type Props = {
    delay?: string
    style?: React.CSSProperties
}

export const BuildCardPlaceholderBlock = (theme: string, height: string | number, margin?: string) => {
    return (
        <div className="systemcard__placeholder">
            <div
                style={{
                    height,
                    width: '100%',
                    margin: margin || '1rem',
                    backgroundImage: theme ?
                        'linear-gradient(110deg, #262626 8%, #4f4f4f 18%, #262626 33%)' :
                        'linear - gradient(110deg, #ececec 8 %, #f5f5f5 18 %, #ececec 33 %)'
                }}
                className='systemcard__loading-block' />
        </div>
    )
}

export default function BuildCardPlaceholder({ delay, style }: Props) {
    const { theme } = useContext(AppContext)

    return (
        <div
            className={`buildcard__container${theme ? '--dark' : ''}`}
            style={{
                borderColor: theme ? 'gray' : '#d3d3d361',
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
            {BuildCardPlaceholderBlock(theme, '.6rem')}
            {BuildCardPlaceholderBlock(theme, '2rem')}
            {BuildCardPlaceholderBlock(theme, '.2rem')}
        </div>
    )
}