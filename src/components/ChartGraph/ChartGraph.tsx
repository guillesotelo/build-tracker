import { Doughnut, Line } from 'react-chartjs-2'
import React, { useContext } from 'react'
import { AppContext } from '../../AppContext'
import { RotateSpinner } from "react-spinners-kit";

type Props = {
    label?: string
    chartData?: any
    style?: React.CSSProperties
    chartOptions?: any
    type: string
    loading?: boolean
}

export default function ChartGraph({ chartData, label, style, chartOptions, type, loading }: Props) {
    const { theme } = useContext(AppContext)
    const options = {
        plugins: {
            legend: {
                // display: false,
                labels: {
                    color: theme ? 'lightgray' : 'black'
                }
            }
        },
        ...chartOptions
    }

    const voidData = { datasets: [], labels: [] }

    return (
        <div className="doughnutchart__container" style={style}>
            <p
                className="doughnutchart__label"
                style={{
                    color: theme ? 'lightgray' : '#263d42',
                    marginBottom: chartOptions && chartOptions.plugins.legend.display === false ? '.5rem' : ''
                }}>
                {label}
            </p>
            {type === 'doughnut' ?
                <Doughnut data={chartData} options={options} />
                : type === 'line' ? <Line data={loading ? voidData : chartData} options={options} />
                    : ''}
            {loading ? <div className='doughnutchart__loader'><RotateSpinner size={50} color='#d3d3d3' /></div> : ''}
        </div>
    )
}