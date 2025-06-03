import { Doughnut, Line } from 'react-chartjs-2'
import React, { useContext } from 'react'
import { AppContext } from '../../AppContext'

type Props = {
    label?: string
    chartData?: any
    style?: React.CSSProperties
    chartOptions?: any
    type: string
}

export default function ChartGraph({ chartData, label, style, chartOptions, type }: Props) {
    const { darkMode } = useContext(AppContext)
    const options = {
        plugins: {
            legend: {
                // display: false,
                labels: {
                    color: darkMode ? 'lightgray' : 'black'
                }
            }
        },
        ...chartOptions
    }

    return (
        <div className="doughnutchart__container" style={style}>
            <p
                className="doughnutchart__label"
                style={{
                    color: darkMode ? 'lightgray' : '#263d42',
                    marginBottom: chartOptions && chartOptions.plugins.legend.display === false ? '.5rem' : ''
                }}>
                {label}
            </p>
            {type === 'doughnut' ?
                <Doughnut data={chartData} options={options} />
                : type === 'line' ? <Line data={chartData} options={options} />
                    : ''}
        </div>
    )
}