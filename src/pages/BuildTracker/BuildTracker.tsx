import { useContext, useEffect, useState } from "react"
import BuildCard from "../../components/BuildCard/BuildCard"
import Modal from "../../components/Modal/Modal"
import { Build, dataObj, ModuleInfo, onChangeEventType } from "../../types"
import { AppContext } from "../../AppContext"
import ModulesTable from "../../components/ModulesTable/ModulesTable"
import { moduleHeaders } from "../../constants/tableHeaders"
import { countOccurrences, getBuildName, getDate, getModuleArray, randomColors, whenDateIs } from "../../helpers"
import BuildTrackerHeader from "../../components/BuildTrackerHeader/BuildTrackerHeader"
import ProgressBar from "../../components/ProgressBar/ProgressBar"
import SearchBar from "../../components/SearchBar/SearchBar"
import ChartGraph from "../../components/ChartGraph/ChartGraph"
import TextData from "../../components/TextData/TextData"
import { COLOR_PALETTE, DARK_MODE_COLOR_PALETTE } from "../../constants/app"
import { generateBuildSamples } from "../../helpers/buildSamples"
import DataTable from "../../components/DataTable/DataTable"
import { getAllBuildLogs } from "../../services/buildtracker"
import BuildCardPlaceholder from "../../components/BuildCard/BuildCardPlaceholder"
import { registerables, Chart } from 'chart.js'
import Button from "../../components/Button/Button"
Chart.register(...registerables)

export default function BuildTracker() {
    const [builds, setBuilds] = useState<null | Build[]>(null)
    const [allBuilds, setAllBuilds] = useState<null | Build[]>(null)
    const [copyBuilds, setCopyBuilds] = useState<null | Build[]>(null)
    const [openModal, setOpenModal] = useState<null | string>(null)
    const [build, setBuild] = useState<null | Build>(null)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [searchModules, setSearchModules] = useState('')
    const [moduleArray, setModuleArray] = useState<ModuleInfo[]>([])
    const [copyModuleArray, setCopyModuleArray] = useState<ModuleInfo[]>([])
    const [selectedModule, setSelectedModule] = useState(-1)
    const [artsChartData, setArtsChartData] = useState({ datasets: [{}] })
    const [historicalData, setHistoricalData] = useState<any>({ datasets: [{}] })
    const [pagination, setPagination] = useState(10)
    const { darkMode } = useContext(AppContext)
    const buildSamples = generateBuildSamples()
    const CSDOX_URL = process.env.REACT_APP_CSDOX_URL

    useEffect(() => {
        getBuilds()
    }, [])

    useEffect(() => {
        if (openModal && builds) {
            const selected = builds.find(b => b._id === openModal) || null
            if (selected) {
                setBuild(selected)
                setModuleArray(selected.modules)
                setCopyModuleArray(selected.modules)
            }
        } else {
            setBuild(null)
            setModuleArray([])
            setCopyModuleArray([])
        }
    }, [openModal, builds])

    useEffect(() => {
        if (search.trim() && copyBuilds) {
            setBuilds(copyBuilds.filter(b =>
                JSON.stringify(Object.values(b)).toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase().trim())
            ))
        } else setBuilds(copyBuilds)
    }, [search, copyBuilds])

    useEffect(() => {
        if (searchModules.trim() && copyModuleArray) {
            setModuleArray(copyModuleArray.filter(b => {
                b.date = ''
                return JSON.stringify(Object.values(b)).toLocaleLowerCase()
                    .includes(searchModules.toLocaleLowerCase().trim())
            }))
        } else setModuleArray(copyModuleArray)

        if (!searchModules) {
            setArtsChartData(getArtsChartData())
            setHistoricalData(getHistoricalData())
        }
    }, [searchModules, copyModuleArray])

    const getBuilds = async () => {
        try {
            setLoading(true)
            const _buildLogs = await getAllBuildLogs()
            let nameRepetitionCount: dataObj = {}
            let exists: dataObj = {}

            let _builds = _buildLogs
                .filter((b: Build) => b.active)
                .map((b: Build, i: number) => {
                    return {
                        ...b,
                        name: getBuildName(b, i),
                        id: getBuildId(b),
                        modules: getModuleArray(JSON.parse(typeof b.modules === 'string' ? b.modules : '{}'))
                    }
                })
            // .map((b: Build, index: number, arr: Build[]) => {
            //     const name = b.name || ''
            //     const nameRepeated = countOccurrences(arr, 'name', b.name)

            //     nameRepetitionCount = {
            //         ...nameRepetitionCount,
            //         [name]: nameRepetitionCount[name] ? nameRepetitionCount[name] - 1 : nameRepeated
            //     }

            //     return {
            //         ...b,
            //         name: nameRepeated > 1 ? `${b.name} #${nameRepetitionCount[name]}` : b.name
            //     }
            // })

            setAllBuilds(_builds)

            const filtered = _builds.filter((b: Build) => {
                const c = b.classifier.split('-master-2025')[0]
                if (exists[c + b.target_branch]) return false
                exists[c + b.target_branch] = true
                return true
            })

            setBuilds(filtered)
            setCopyBuilds(filtered)
            setLoading(false)

            setTimeout(prioritizeTodaysBuilds)
        } catch (error) {
            setLoading(false)
            console.error(error)
        }
    }

    const prioritizeTodaysBuilds = () => {
        const className = darkMode ? 'buildcard__container--dark' : 'buildcard__container'
        const todayBuilds = Array.from(document.getElementsByClassName(className)).filter(card => card.innerHTML.includes('Today'))

        if (todayBuilds.length) {
            const rowDiv = document.createElement('div')
            const buildList = document.querySelector('.buildtracker__list')
            rowDiv.className = 'buildtracker__list-row'

            if (buildList) {
                todayBuilds.forEach(node => {
                    node.classList.add('buildtracker__list-row-item')
                    rowDiv.appendChild(node)
                })
                buildList.prepend(rowDiv)
            }
        }
    }

    const getBuildId = (build: Build) => {
        return `${build.classifier}__${build.target_branch}`
    }

    const onChangeSearch = (e: onChangeEventType) => {
        const { value } = e.target || {}
        setSearch(value)
    }

    const onChangeSearchModules = (e: onChangeEventType) => {
        const { value } = e.target || {}
        setSearchModules(value.trim())
    }

    const chartCalculator = (arrData: dataObj[], key: string, value: any) => {
        let sum = 0
        arrData.forEach(data => {
            if (value === 'failure' && data[key] && data[key] !== 'success') sum += 1
            else if (data[key] && data[key] === value) sum += 1
        })
        return sum
    }

    const getArtsChartData = () => {
        const labels = Array.from(new Set(copyModuleArray.map(data => data.art)))
        return {
            labels,
            datasets: [{
                data: labels.map(item => chartCalculator(copyModuleArray, 'art', item)),
                backgroundColor: randomColors(darkMode ? DARK_MODE_COLOR_PALETTE : COLOR_PALETTE).slice(0, copyModuleArray.length)
            }]
        }
    }

    const getHistoricalData = () => {
        let modulesBuiltArr: number[] = []
        let dates: any[] = []

        allBuilds?.forEach(b => {
            if (b.name === build?.name) {
                const modulesBuilt = countOccurrences(b.modules, 'status', 'success', true)
                modulesBuiltArr.unshift(modulesBuilt)
                dates.unshift(whenDateIs(b.date || b.createdAt, true))
            }
        })

        return {
            labels: dates.slice(-10),
            datasets: [{
                data: modulesBuiltArr.slice(-10),
                borderColor: (ctx: any) => {
                    return ctx.index && ctx.index === modulesBuiltArr.slice(-10).length - 1 ?
                        darkMode ? '#fff' : '#000' : darkMode ? '#037bbca3' : '#005585a3'
                },
                borderWidth: (ctx: any) => {
                    return ctx.index && ctx.index === modulesBuiltArr.slice(-10).length - 1 ?
                        3 : 2
                },
                pointBorderWidth: 1,
                fill: false,
                tension: 0.3
            }]
        }
    }

    const getHistoricalDataOptions = () => {
        return {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (ctx: any) => `${ctx[0].label}`,
                        label: (ctx: any) => ctx.raw + ' modules built',
                    },
                    displayColors: false
                }
            },
            scales: {
                y: {
                    max: build?.modules.length,
                    ticks: {
                        callback: (value: number) => `${value}`
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
        }
    }

    const renderModuleDetails = () => {
        const module = moduleArray[selectedModule] || null
        if (!module) return null

        const {
            name,
            status,
            date,
            art,
            solution,
            version
        } = module

        return (
            <div className="buildtracker__module">
                <button onClick={() => setSelectedModule(-1)} className="buildtracker__module-back">Module list</button>
                <div className={`buildtracker__module-wrapper${darkMode ? '--dark' : ''}`}>
                    <p className={`buildtracker__module-title${darkMode ? '--dark' : ''}`}>{name}</p>
                    <div className="buildtracker__module-row">
                        <div className="buildtracker__module-body">
                            <TextData label="Status" value={status} inline color={status?.toLowerCase() === 'success' ? 'green' : 'red'} />
                            <TextData label="Date" value={getDate(date)} inline />
                            <TextData label="ART" value={art} inline />
                            <TextData label="Solution" value={solution} inline />
                            <TextData label="Version" value={version} inline />
                            <a
                                href={`${CSDOX_URL}/products/spa2_ad_hpb/branches/${build?.target_branch}/modules/${name}`}
                                target="_blank"
                            >View in cs-dox</a>
                        </div>
                        <DataTable
                            title="Presence in other builds"
                            tableData={builds || []}
                            tableHeaders={[{ name: 'Module', value: 'name' }]}
                            max={4}
                            style={{ width: '18rem', margin: '.5rem 1rem 1rem', maxHeight: '15rem', overflow: 'auto' }}
                            setSelected={i => {
                                const selected = (builds || [])[i < 0 ? 0 : i]
                                setBuild(selected)
                                setModuleArray(selected.modules)
                                setCopyModuleArray(selected.modules)
                                setSelectedModule((selected.modules).findIndex(m => m.art === module.art && m.name === module.name))
                                setOpenModal(selected._id || null)
                            }}
                            selected={builds?.findIndex(b => b._id === openModal)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const closeModal = () => {
        setOpenModal(null)
        setSelectedModule(-1)
    }

    const renderBuildModal = () => {
        if (!build) return ''
        return (
            <Modal
                title={build.name}
                subtitle={`${whenDateIs(build.createdAt, true)} ${getDate(build.createdAt)?.split(' ')[1] || ''}`}
                onClose={closeModal}
                style={{ maxHeight: '85vh', width: '50rem' }}
                contentStyle={{ overflow: 'hidden' }}>
                <div className="buildtracker__modal">
                    <div className="buildtracker__modal-row" style={{ alignItems: 'center', justifyContent: 'space-evenly', width: '100%' }}>
                        <div className="buildtracker__modal-col" style={{ width: '25%' }}>
                            <TextData label="Target branch" value={build.target_branch} style={{ marginBottom: '.7rem' }} />
                            <TextData label="Classifier" value={build.classifier} style={{ marginBottom: '.7rem' }} />
                            <TextData label="Total modules" value={copyModuleArray.length} />
                            {/* <ChartGraph
                                label="ARTs involved"
                                chartData={artsChartData}
                                style={{ width: '7rem', textAlign: 'center', marginTop: '1rem' }}
                                type="doughnut"
                                chartOptions={{
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    borderColor: 'transparent',
                                }}
                            /> */}
                        </div>
                        <ChartGraph
                            label="Completion history"
                            chartData={historicalData}
                            style={{ textAlign: 'center', width: '50%' }}
                            type="line"
                            chartOptions={getHistoricalDataOptions()}
                        />
                    </div>

                    {selectedModule !== -1 ?
                        renderModuleDetails()
                        :
                        <>
                            <p className="buildtracker__modal-modules">Modules</p>
                            <div className="buildtracker__modal-row" style={{ margin: '1.5rem 0 0' }}>
                                <div className="buildtracker__modal-col" style={{ width: '45%' }}>
                                    <ProgressBar
                                        label="Success rate"
                                        arrData={copyModuleArray}
                                        colors={{ "success": "#00b500", "failure": "#e70000" }}
                                        objKey="status"
                                        percentageFor='success'
                                    />
                                    <div className="buildtracker__modal-table">
                                        <div className="buildtracker__modal-table-container">
                                            <div className="buildtracker__modal-table-row">
                                                <p className="buildtracker__modal-table-text">Built</p>
                                                <p className="buildtracker__modal-table-value" style={{ color: 'green' }}>
                                                    {copyModuleArray.filter(m => m.status?.toLowerCase() === 'success').length}
                                                </p>
                                            </div>
                                            <div className="buildtracker__modal-table-row">
                                                <p className="buildtracker__modal-table-text">Not built</p>
                                                <p className="buildtracker__modal-table-value" style={{ color: 'red' }}>
                                                    {copyModuleArray.filter(m => m.status?.toLowerCase() !== 'success').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {moduleArray.length ?
                                    <SearchBar
                                        handleChange={onChangeSearchModules}
                                        value={searchModules}
                                        placeholder='Search modules...'
                                        style={{ width: '30%', alignSelf: 'flex-start' }}
                                    /> : ''}
                            </div>

                            <ModulesTable
                                title={`${searchModules ? 'Module search results' : 'Module list'} (${moduleArray.length})`}
                                tableData={moduleArray}
                                setTableData={setModuleArray}
                                tableHeaders={moduleHeaders}
                                orderDataBy={moduleHeaders[4]}
                                style={{ maxHeight: '40vh', marginTop: '2rem', overflow: 'auto' }}
                                selected={selectedModule}
                                setSelected={setSelectedModule}
                                name="modules"
                            />
                        </>
                    }
                </div>
            </Modal>
        )
    }

    return (
        <div className="buildtracker__container">
            <BuildTrackerHeader
                search={search}
                setSearch={setSearch}
                onChangeSearch={onChangeSearch}
                style={{ filter: openModal ? 'blur(7px)' : '' }}
            />
            {openModal && renderBuildModal()}
            <div className="buildtracker__pageview">
                {/* <h1 className="buildtracker__title" style={{ filter: openModal ? 'blur(7px)' : '' }}>Build activity</h1> */}
                <div className="buildtracker__list" style={{ filter: openModal ? 'blur(7px)' : '', width: loading ? '70vw' : '' }}>
                    {loading ?
                        // <div className="buildtracker__loading"><HashLoader size={30} color={darkMode ? '#fff' : undefined} /><p>Loading builds activity...</p></div>
                        Array.from({ length: 6 }).map((_, i) => <BuildCardPlaceholder key={i} />)
                        : builds && builds.length ? builds.slice(0, pagination).map((b, i) =>
                            <BuildCard
                                key={i}
                                build={b}
                                setOpenModal={setOpenModal}
                                delay={String(i ? i / 20 : 0) + 's'}
                            />
                        )
                            : <p style={{ textAlign: 'center', width: '100%' }}>No active build activity found.</p>
                    }
                </div>
                {builds && builds.length && builds.length > 10 &&
                    <Button
                        label={pagination < builds.length ? 'Show older builds' : 'Show less'}
                        handleClick={() => {
                            if (pagination < builds.length) setPagination(prev => prev + 10)
                            else setPagination(10)
                        }}
                        bgColor="#005585a3"
                        textColor="#fff"
                        style={{
                            width: 'fit-content',
                            margin: '2rem auto',
                            animation: 'fade-in-up 2s forwards'
                        }}
                    />}
            </div>
        </div>
    )
}