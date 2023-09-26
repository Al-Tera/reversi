import { useEffect, useState } from "react"
import ResetIcon from '../assets/reset.svg'

function Board() {

    const boardRC = 6
    const boardBy = boardRC * boardRC
    const [turn, setTurn] = useState(false)
    const [placements, setPlacements] = useState<any[]>([])
    const [gameStatus, setGameStatus] = useState<null | string>()
    const [prepareCoords, setPrepareCoords] = useState<any[]>([])
    const [defaultPlacement, setDefaultPlacement] = useState<any[]>([])
    const boardLabels = document.querySelectorAll('#parentLabel')

    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        if (boardRC) {
            const middleBoard = Math.floor(boardBy / 2)
            const boardHalf = Math.floor(boardRC / 2)
            var tp = []
            for (var i = 0; i < 2; i++) {
                for (var j = -1; j < 1; j++) {
                    const value = (middleBoard) + (boardRC * i) - boardHalf
                    tp.push(value + j)
                }
            }
            setDefaultPlacement(tp)
        }
    }, [])


    useEffect(() => {
        if (defaultPlacement.length) {
            handleReset()
        }
    }, [defaultPlacement])

    useEffect(() => {
        if (placements.length) {
            findAvailable(placements)
        }
    }, [placements])

    const findEnd = (value: number, list: string[], find: string) => {
        const otherPlayer = turn ? 'w' : 'b'
        var end = 1
        var values = []
        for (var i = 1; i <= boardRC + 2; i++) {
            var findValue = 0;
            switch (find) {
                case 't':
                    findValue = value + (boardRC * i)
                    break;
                case 'b':
                    findValue = value - (boardRC * i)
                    break;
                case 'r':
                    findValue = value - i
                    break;
                case 'l':
                    findValue = value + i
                    break;
                case 'dtl':
                    findValue = value - (boardRC * i) - i
                    break;
                case 'dbr':
                    findValue = value + (boardRC * i) + i
                    break;
                case 'dbl':
                    findValue = value + (boardRC * i) - i
                    break;
                case 'dtr':
                    findValue = value - (boardRC * i) + i
                    break;
                default:
                    break;

            }

            const matrixFinder = list.indexOf(`${Math.abs(findValue)}.${otherPlayer}`)

            if ((findValue % boardRC === boardRC - 1 && (find.includes('l') || find.includes('r'))))
                break;
            if ((findValue % boardRC === 0 && (find.includes('l') || find.includes('r'))))
                break;
            if (matrixFinder === -1)
                break;
            end++;
            values.push(findValue)
        }
        return [end, values]
    }


    const colorPlacements = (list: (string | false | undefined)[]) => {
        boardLabels.forEach((label, i) => {
            const cls = 'clickable'
            const color = !turn ? 'white' : 'black'
            const oColor = turn ? 'white' : 'black'
            if (list.includes(i.toString())) {

                label.classList.add(cls, color)
                label.classList.remove(oColor)
            }
            else
                label.classList.remove(cls, color, oColor)
        })

    }

    const coalescePlacements = (i: number) => {
        const player = turn ? 'black' : 'white'

        const mergeExisting: any = []
        prepareCoords.forEach(coords => {
            Object.entries(coords).forEach(([key, val]) => {
                if (mergeExisting.hasOwnProperty(key)) {
                    mergeExisting[key] = [...mergeExisting[key].concat(val)]
                }
                else {
                    mergeExisting[key] = val
                }
            })
        })

        const placesToChanges = mergeExisting[`${i}.${player[0]}`]

        const newPlacementsX = [...placements, `${i}.${player[0]}`]
        if (placesToChanges) {
            var newPlacements = newPlacementsX.map(place => {
                const value = parseInt(place.replace(/[wb.]/g, ''))
                if (placesToChanges.includes(value))
                    return `${value}.${player[0]}`
                else return place
            })
            setPlacements(newPlacements)
            boardLabels.forEach((label, i) => {
                if (placesToChanges.includes(i)) {
                    label.classList.remove('selected__black', 'selected__white')
                    label.classList.add(`selected__${player}`)
                }
            })

        }
    }

    const findWin = () => {
        const whiteSum = document.querySelectorAll('.selected__white').length,
        blackSum = document.querySelectorAll('.selected__black').length;
        const end = boardBy - blackSum

        boardLabels.forEach((label, i) => {
            if (i < whiteSum) {
                label.classList.add('selected__white')
                label.classList.remove('selected__black')

            }
            else if (i >= end) {
                label.classList.add('selected__black')
                label.classList.remove('selected__white')
            }
            else
                label.classList.remove('selected__white', 'selected__black')

        })
        setGameStatus(whiteSum > blackSum ? 'white' : blackSum > whiteSum ? 'black' : 'draw')
    }

    const findAvailable = (list: string[]) => {
        const player = turn ? 'b' : 'w'
        const removeColorList = list.map(item => parseInt(item.replace(/[wb.]/g, '')))
        const availableList = list.map(item => {
            const value = parseInt(item.replace(/[wb.]/g, ''))
            const color = item.replace(/[0-9.]/g, '');
            const isRightMost = value % boardRC === (boardRC - 1)
            const isLeftMost = value % boardRC === 0
            const isTopMost = value >= 0 && value < boardRC
            const isBottomMost = value >= (boardBy - boardRC) && value <= boardBy
            const right = value + 1
            const left = value - 1
            const top = value - boardRC
            const bottom = value + boardRC
            const diaTL = value - (boardRC + 1)
            const diaTR = value - (boardRC - 1)
            const diaBL = value + (boardRC - 1)
            const diaBR = value + (boardRC + 1)

            const available = [
                [isLeftMost, left],
                [isLeftMost || isTopMost, diaTL],
                [isTopMost, top],
                [isTopMost || isRightMost, diaTR],
                [isRightMost, right],
                [isRightMost || isBottomMost, diaBR],
                [isBottomMost, bottom],
                [isBottomMost || isLeftMost, diaBL],
            ]
                .map((av: any[]) => {
                    if (!av[0] && !removeColorList.includes(av[1])) {
                        return `${av[1]}.${color === 'w' ? 'b' : 'w'}`
                    }
                })
            return available
        })
        var availablePlacementX = [...new Set(availableList.flatMap(list => list))]
        var availablePlacements = availablePlacementX.map(item =>
            item?.replace(/[0-9.]/g, '') === player && item
        ).filter(item => item !== false)

        var coords: any = []

        const finalPlacements = availablePlacements.map((avPl) => {
            if (avPl) {
                const value = parseInt(avPl.replace(/[wb.]/g, ''))

                const [endFinderVT, prepT]: any = findEnd(value, list, 't')
                const [endFinderVB, prepB]: any = findEnd(value, list, 'b')
                const [endFinderHR, prepR]: any = findEnd(value, list, 'r')
                const [endFinderHL, prepL]: any = findEnd(value, list, 'l')
                const [endFinderDTL, prepTL]: any = findEnd(value, list, 'dtl')
                const [endFinderDBR, prepBR]: any = findEnd(value, list, 'dbr')
                const [endFinderDBL, prepBL]: any = findEnd(value, list, 'dbl')
                const [endFinderDTR, prepTR]: any = findEnd(value, list, 'dtr')

                const verticT = list.indexOf(`${value + (boardRC * endFinderVT)}.${player}`)
                const verticB = list.indexOf(`${value - (boardRC * endFinderVB)}.${player}`)
                const horizonL = list.indexOf(`${value + endFinderHL}.${player}`)
                const horizonR = list.indexOf(`${value - endFinderHR}.${player}`)

                const diagonTL = list.indexOf(`${value - (boardRC * endFinderDTL) - endFinderDTL}.${player}`)
                const diagonBR = list.indexOf(`${value + (boardRC * endFinderDBR) + endFinderDBR}.${player}`)
                const diagonBL = list.indexOf(`${value + (boardRC * endFinderDBL) - endFinderDBL}.${player}`)
                const diagonTR = list.indexOf(`${value - (boardRC * endFinderDTR) + endFinderDTR}.${player}`)

                const fbAvailable = [
                    [endFinderVT, verticT, prepT],
                    [endFinderVB, verticB, prepB],
                    [endFinderHL, horizonL, prepL],
                    [endFinderHR, horizonR, prepR],
                    [endFinderDTL, diagonTL, prepTL],
                    [endFinderDBR, diagonBR, prepBR],
                    [endFinderDBL, diagonBL, prepBL],
                    [endFinderDTR, diagonTR, prepTR],
                ].map(fba => {
                    if (fba[0] > 1 && fba[1] !== -1) {
                        const newDict = { [avPl]: fba[2] }
                        coords.push(newDict)
                        return avPl.replace(/[wb.]/g, '')
                    }
                }
                ).filter(fba => fba)
                return fbAvailable
            }
        })
        setPrepareCoords(coords)
        const flattenFinal = [...new Set(finalPlacements.flatMap(list2 => list2))]
        colorPlacements(flattenFinal)

        if (!flattenFinal.length) {
            findWin()
        }
    }
    useEffect

    const handleClick = (_: null, i: number) => {
        setTurn(!turn)
        const boardLabels = document.querySelectorAll('#parentLabel')[i]
        if (boardLabels) {
            boardLabels.classList.add(turn ? 'selected__black' : 'selected__white')
        }
        coalescePlacements(i)
    }

    const handleReset = () => {
        var pp: string[] = []
        const boardLabels = document.querySelectorAll('#parentLabel')
        var color = 0
        boardLabels.forEach((label, i) => {
            if (!defaultPlacement.includes(i))
                label.classList.remove('selected__black', 'selected__white')
            else {
                label.classList.add(color % 3 === 0 ? 'selected__white' : 'selected__black')
                color++
            }
        })

        defaultPlacement.map((place, i) => {
            pp.push(`${[place]}.${i % 3 === 0 ? 'w' : 'b'}`)
        })
        setGameStatus(null)
        setTurn(false)
        setPlacements(pp)
        findAvailable(pp)
    }

    return (
        <section>
            <div className='board' style={{
                pointerEvents: gameStatus ? 'none' : 'fill',
                gridTemplateColumns: `repeat(${boardRC}, 1fr)`,
                gridTemplateRows: `repeat(${boardRC}, 1fr)`
            }}>
                {
                    new Array(boardBy).fill(0).map((_, i) => {
                        return (
                            <label key={i} id='parentLabel'>
                                <input type='checkbox' className="checkbox" onChange={() => handleClick(null, i)} />
                                {/* @ts-ignore */}
                                <span className='label' style={{ '--color': turn ? 'black' : 'white' }}>
                                    <span id={`label${i}`} className="child"></span>
                                </span>
                                <p>{i}</p>
                            </label>
                        )
                    })
                }
            </div>
            <div className="last-section">
                <button onClick={handleReset}>
                    <img src={ResetIcon} alt="reset-icon" />
                </button>
                <p>
                {
                    gameStatus && (gameStatus !== 'draw' ?
                    `${gameStatus} wins!`: 'draw')
                }
                </p>
            </div>
        </section>
    )
}

export default Board