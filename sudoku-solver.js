const { PerformanceObserver, performance } = require('node:perf_hooks');

/* #region  Library of a few prebuilt sudokos */

const library = {
    medium: () => {
        return [
            [3, 0, 0, 0, 0, 6, 1, 0, 0],
            [0, 5, 0, 3, 0, 9, 0, 0, 0],
            [0, 2, 0, 8, 0, 0, 5, 4, 3],

            [0, 0, 5, 0, 2, 0, 0, 0, 9],
            [0, 4, 0, 0, 0, 0, 7, 0, 0],
            [0, 0, 1, 0, 8, 0, 0, 0, 0],

            [0, 3, 7, 0, 0, 8, 0, 6, 0],
            [0, 8, 6, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 7, 6, 0, 8, 0, 5]
        ]
    },
    hard: () => {
        return [
            [2, 0, 0, 5, 0, 7, 4, 0, 6],
            [0, 0, 0, 0, 3, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 2, 3, 0],

            [0, 0, 0, 0, 2, 0, 0, 0, 0],
            [8, 6, 0, 3, 1, 0, 0, 0, 0],
            [0, 4, 5, 0, 0, 0, 0, 0, 0],

            [0, 0, 9, 0, 0, 0, 7, 0, 0],
            [0, 0, 6, 9, 5, 0, 0, 0, 2],
            [0, 0, 1, 0, 0, 6, 0, 0, 8]
        ]
    },
    quiteHard: () => {
        return [
            [0, 0, 0, 9, 0, 0, 1, 0, 2],
            [7, 0, 0, 3, 0, 0, 6, 0, 0],
            [0, 0, 2, 0, 0, 0, 0, 3, 0],

            [9, 0, 0, 0, 0, 8, 7, 0, 0],
            [3, 0, 0, 0, 1, 0, 0, 0, 9],
            [0, 0, 6, 5, 0, 0, 0, 0, 1],

            [0, 1, 0, 0, 0, 0, 4, 0, 0],
            [0, 0, 4, 0, 0, 9, 0, 0, 6],
            [8, 0, 3, 0, 0, 6, 0, 0, 0]
        ]
    }
}

/* #endregion */
/* #region  Sudoku board and game utilities, constants */

/**
 * Returns a new array of 9 elements, each set to zero
 *
 */
const createArrayOf9Zeroes = () => [0, 0, 0, 0, 0, 0, 0, 0, 0]


const emptyCellValue = 0
const invalidCellIndex = -1
const cellIndices = {
    row: 0,
    col: 1
}

const isInvalidCellIndex = (index) => index === invalidCellIndex

/**
 * Returns a copy of the given board
 *
 * @param {*} board
 * @return {*} 
 */
const copyBoard = (board) => {
    const newBoard = []
    board.forEach(row => {
        newBoard.push([...row])
    })
    return newBoard
}


/**
 * Returns a new empty sudoku board - all cells set to zero
 *
 * @return {*} 
 */
const createEmptyBoard = () => {
    const board = [];
    for (let i = 0; i < 9; i++) {
        board.push(createArrayOf9Zeroes())
    }
    return board;
}
/* #endregion */
/* #region  Interface Definitions, SudokuGameInterface, SudokuSolverInterface */

class SudokuGameInterface {
    getCell(row, col) { throw new Error('getCell - Not implemented') }
    setCell(row, col, num) { throw new Error('setCell - Not implemented') }
    clearCell(row, col) { throw new Error('clearCell - Not implemented') }
    isCellEmpty(row, col) { throw new Error('isCellEmpty - Not implemented') }
    isInRow(row, num) { throw new Error('isInRow - Not implemented') }
    isInCol(col, num) { throw new Error('isInCol - Not implemented') }
    isInBox(row, col, num) { throw new Error('isInBox - Not implemented') }
    findEmptyCell() { throw new Error('findEmptyCell - Not implemented') }
    defaultInvalidLocation() { throw new Error('defaultInvalidLocation - Not implemented') }
    isDefaultInvalidLocation(cell) { throw new Error('isDefaultInvalidLocation - Not implemented') }
}

class SudokuSolverInterface {
    setCell(row, col, num) { throw new Error('setCell - Not implemented') }
    clearCell(row, col) { throw new Error('clearCell - Not implemented') }
    isValid(row, col, num) { throw new Error('isValid - Not implemented') }
    isRowValid(row, num) { throw new Error('isRowValid - Not implemented') }
    isColValid(col, num) { throw new Error('isColValid - Not implemented') }
    isBoxValid(row, col, num) { throw new Error('isBoxValid - Not implemented') }
    findEmptyCell() { throw new Error('findEmptyCell - Not implemented') }
    isDefaultInvalidLocation(cell) { throw new Error('isDefaultInvalidLocation - Not implemented') }
}

/* #endregion */
/* #region  Sudoku Game */

class SudokuGame extends SudokuGameInterface {
    /**
     * Creates an instance of SudokuGame.
     * @param {*} boardTemplate - 2D array of 9x9 integers in range 0..9 representing the sudoku board to be solved
     * @memberof SudokuGame
     */
    constructor(boardTemplate) {
        super()
        this.board = copyBoard(boardTemplate);
        this.startingBoard = copyBoard(boardTemplate);
    }

    /**
     * Returns the value of the cell at the given row and column
     *
     * @param {Integer} row
     * @param {Integer} col
     * @return {Integer} value of the cell 
     * @memberof SudokuGame
     */
    getCell(row, col) {
        return this.board[row][col]
    }

    /**
     * Sets the value of the cell at the given row and column
     *
     * @param {Integer} row
     * @param {Integer} col
     * @param {Integer} num - value to be set
     * @memberof SudokuGame
     */
    setCell(row, col, num) {
        this.board[row][col] = num
    }

    /**
     * Clears the value of the cell at the given row and column
     *
     * @param {Integer} row
     * @param {Integer} col
     * @memberof SudokuGame
     */
    clearCell(row, col) {
        this.board[row][col] = emptyCellValue
    }

    /**
     * Returns true if the cell at the given row and column is empty
     *
     * @param {Integer} row
     * @param {Integer} col
     * @return {Boolean} true if the cell is empty, false otherwise 
     * @memberof SudokuGame
     */
    isCellEmpty(row, col) {
        return this.board[row][col] === emptyCellValue
    }

    /**
     * Returns true if any of the cells in the row already contain the given number
     *
     * @param {Integer} row
     * @param {Integer} num
     * @return {Boolean} true if the number is already in the row, false otherwise 
     * @memberof SudokuGame
     */
    isInRow(row, num) {
        return this.board[row].includes(num)
    }

    /**
     * Returns true if any of the cells in the column already contain the given number
     *
     * @param {Integer} col
     * @param {Integer} num
     * @return {Boolean} true if the number is already in the column, false otherwise
     * @memberof SudokuGame
     */
    isInColumn(col, num) {
        return this.board.some(row => {
            return row[col] === num
        })
    }

    /**
     * Returns true if any of the cells in the 3x3 box already contain the given number
     *
     * @param {Integer} row
     * @param {Integer} col
     * @param {Integer} num
     * @return {Boolean} true if the number is already in the box, false otherwise
     * @memberof SudokuGame
     */
    isInBox(row, col, num) {
        const start_row = row > 0 ? row - row % 3 : 0
        const start_col = col > 0 ? col - col % 3 : 0

        for (let i = start_row; i < start_row + 3; i++) {
            for (let j = start_col; j < start_col + 3; j++) {
                if (this.board[i][j] === num) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Returns the coordinates of the next empty cell in the board
     * If no empty cell is found then returns a value equivalent to SudokuGame.defaultInvalidLocation()
     *
     * @return {*} 
     * @memberof SudokuGame
     */
    findEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.isCellEmpty(row, col)) {
                    return [row, col];
                }
            }
        }
        return this.defaultInvalidLocation() // [-1, -1];
    }

    /**
     * Returns a cell location, [row, col], that is invalid for a sudoku board
     *
     * @return {[Integer, Integer]} [row, col]
     * @memberof SudokuGame
     */
    defaultInvalidLocation() {
        return [
            invalidCellIndex,
            invalidCellIndex
        ]
    }

    /**
     * Returns true if the given cell location is invalid for a sudoku board
     *
     * @param {[Integer, Integer]} cell - [row, col]
     * @return {Boolean} true if the cell is invalid, false otherwise 
     * @memberof SudokuGame
     */
    isDefaultInvalidLocation(cell) {
        return Array.isArray(cell) &&
            cell.length === 2 &&
            isInvalidCellIndex(cell[cellIndices.row]) &&
            isInvalidCellIndex(cell[cellIndices.col])
    }
}

/* #endregion */
/* #region  Sudoku Solver Stats */

class SodukoSolverStats {
    constructor() {
        this.placementAttempts = 0;
        this.placementRejections = 0;
        this.placementValidationSuccesses = 0;
        this.placementValidationFailures = 0;
        this.rowValidationSuccesses = 0;
        this.rowValidationFailures = 0;
        this.colValidationSuccesses = 0;
        this.colValidationFailures = 0;
        this.boxValidationSuccesses = 0;
        this.boxValidationFailures = 0;
        this.solveTicks = 0.0
    }

    /**
     * Records a single placement attempt
     *
     * @memberof SodukoSolverStats
     */
    placementAttempted() {
        this.placementAttempts++
    }

    /**
     * Records a single placement rejection
     *
     * @memberof SodukoSolverStats
     */
    placementRejected() {
        this.placementRejections++
    }

    /**
     * Records the result of a placement validation
     *
     * @param {*} validationResult
     * @memberof SodukoSolverStats
     */
    placementValidationPerformed(validationResult) {
        if (validationResult) {
            this.placementValidationSuccesses++
            return
        }
        this.placementValidationFailures++
    }

    /**
     * Records the result of a row validation (a subtask of a placement validation)
     *
     * @param {*} validationResult
     * @memberof SodukoSolverStats
     */
    rowValidationPerformed(validationResult) {
        if (validationResult) {
            this.rowValidationSuccesses++
            return
        }
        this.rowValidationFailures++
    }

    /**
     * Records the result of a column validation (a subtask of a placement validation)
     *
     * @param {*} validationResult
     * @memberof SodukoSolverStats
     */
    columnValidationPerformed(validationResult) {
        if (validationResult) {
            this.colValidationSuccesses++
            return
        }
        this.colValidationFailures++
    }

    /**
     * Records the result of a box validation (a subtask of a placement validation)
     *
     * @param {*} validationResult
     * @memberof SodukoSolverStats
     */
    boxValidationPerformed(validationResult) {
        if (validationResult) {
            this.boxValidationSuccesses++
            return
        }
        this.boxValidationFailures++
    }
}

/* #endregion */
/* #region  Solver functions */


/**
 * A Sodoku solver function using simple back tracking
 *
 * @param {*} solver
 * @return {*} 
 */
const solve = (solver) => {
    const emptyCell = solver.findEmptyCell();
    if (solver.isDefaultInvalidLocation(emptyCell)) {
        return solver;
    }

    const row = emptyCell[0];
    const col = emptyCell[1];

    for (let num = 1; num <= 9; num++) {
        // ensure if the number is assigend to empty cell it will be
        // unique per row, column, and box (group). If not, try next number
        if (solver.isValid(row, col, num)) {
            solver.stats.placementAttempted()
            solver.setCell(row, col, num)
            if (solve(solver)) {
                return solver;
            }
            solver.stats.placementRejected()
            solver.clearCell(row, col)
        }
    }
    return false;
}

/* #endregion */
/* #region  Sudoku Solver */

class SudokuSolver extends SudokuSolverInterface {

    /**
     * Creates an instance of SudokuSolver.
     * @param {SudokuGameInterface} game
     * @memberof SudokuSolver
     */
    constructor(game) {
        super()

        this.game = game
        this.stats = new SodukoSolverStats()

        const obs = new PerformanceObserver((items) => {
            performance.clearMarks();
        });
        obs.observe({ type: 'measure' });
        performance.measure('Start to Now');
        performance.mark('Solving');

        solve(this)

        performance.mark('Solved');

        performance.measure('SolvingTicks', 'Solving', 'Solved');
        const ticks = performance.getEntriesByName('SolvingTicks')

        this.stats.solveTicks = ticks[0].duration
    }

    isRowValid(row, num) {
        const hasValue = this.game.isInRow(row, num)
        this.stats.rowValidationPerformed(!hasValue)
        return !hasValue
    }

    isColValid(col, num) {
        const hasValue = this.game.isInColumn(col, num)
        this.stats.columnValidationPerformed(!hasValue)
        return !hasValue
    }

    isBoxValid(row, col, num) {
        const hasValue = this.game.isInBox(row, col, num)
        this.stats.boxValidationPerformed(!hasValue)
        return !hasValue
    }

    isValid(row, col, num) {
        const result = this.isRowValid(row, num) &&
            this.isColValid(col, num) &&
            this.isBoxValid(row, col, num)

        this.stats.placementValidationPerformed(result)
        return result
    }

    /* pass through methods implemented by SudokuGame */

    setCell(row, col, num) {
        this.game.setCell(row, col, num)
    }

    clearCell(row, col) {
        this.game.clearCell(row, col)
    }

    findEmptyCell() {
        return this.game.findEmptyCell()
    }

    isDefaultInvalidLocation(cell) {
        // this is a bit of a hack, but it works, then again without Implements Interface and proper Class extensions in JS, what can you do? 
        return this.game.isDefaultInvalidLocation(cell)
    }
}

/* #endregion */
/* #region  Print helpers for sudoko games, boards, and solver stats - AKA Here be Ugly Code */

const displayPercentage = (numerator, denominator) => {
    return `(${Math.round(numerator / denominator * 100)}%)`
}

const printBoard = (board) => {
    let currRow = 0
    board.forEach(row => {
        if (currRow % 3 === 0) {
            console.log(' ')
        }

        let curCol = 0
        let rowStr = ''
        row.forEach(col => {
            const spacer = (curCol % 3 === 0)
                ? '\t\t'
                : '\t'

            rowStr += `${spacer}${col}`

            curCol++
        })
        console.log(rowStr)
        currRow++
    })
}

printSolverStats = (stats) => {
    const preplacementTotals = stats.placementValidationSuccesses + stats.placementValidationFailures
    const placementFailurePercent = displayPercentage(stats.placementRejections, stats.placementAttempts)

    const rowValidationTotal = stats.rowValidationFailures + stats.rowValidationSuccesses
    const rowValidationSuccessPercent = displayPercentage(stats.rowValidationSuccesses, rowValidationTotal)
    const rowValidationFailurePercent = displayPercentage(stats.rowValidationFailures, rowValidationTotal)

    const colValidationTotal = stats.colValidationFailures + stats.colValidationSuccesses
    const colValidationPercent = displayPercentage(colValidationTotal, preplacementTotals)
    const colValidationSuccessPercent = displayPercentage(stats.colValidationSuccesses, colValidationTotal)
    const colValidationFailurePercent = displayPercentage(stats.colValidationFailures, colValidationTotal)

    const boxValidationTotal = stats.boxValidationFailures + stats.boxValidationSuccesses
    const boxValidationPercent = displayPercentage(boxValidationTotal, preplacementTotals)
    const boxValidationSuccessPercent = displayPercentage(stats.boxValidationSuccesses, boxValidationTotal)
    const boxValidationFailurePercent = displayPercentage(stats.boxValidationFailures, boxValidationTotal)

    console.log('Solver Statistics')
    console.log('Time to solve:'.padStart(25, ' ') + `${stats.solveTicks.toFixed(5)} high-res units`)
    console.log(' '.padStart(30, ' ') + 'Total'.padStart(15, ' ') + 'Successes'.padStart(15, ' ') + 'Rejections'.padStart(15, ' '))
    console.log('     PrePlacement Validations'.padEnd(30, ' ') + `${preplacementTotals}`.padStart(15, ' ') + `${stats.placementValidationSuccesses}`.padStart(15, ' ') + `${stats.placementValidationFailures}`.padStart(15, ' '))
    console.log('     ...Row Validations'.padStart(30, ' ') + `${rowValidationTotal}`.padStart(15, ' ') + `${rowValidationSuccessPercent} ${stats.rowValidationSuccesses}`.padStart(15, ' ') + `${rowValidationFailurePercent} ${stats.rowValidationFailures}`.padStart(15, ' '))
    console.log('     ...Column Validations'.padStart(30, ' ') + `${colValidationPercent} ${colValidationTotal}`.padStart(15, ' ') + `${colValidationSuccessPercent} ${stats.colValidationSuccesses}`.padStart(15, ' ') + `${colValidationFailurePercent} ${stats.colValidationFailures}`.padStart(15, ' '))
    console.log('     ...Box Validations'.padStart(30, ' ') + `${boxValidationPercent} ${boxValidationTotal}`.padStart(15, ' ') + `${boxValidationSuccessPercent} ${stats.boxValidationSuccesses}`.padStart(15, ' ') + `${boxValidationFailurePercent} ${stats.boxValidationFailures}`.padStart(15, ' '))
    console.log(' ')
    console.log('     Placement Attempts'.padEnd(30, ' ') + `${stats.placementAttempts}`.padStart(15, ' ') + `${placementFailurePercent} ${stats.placementRejections}`.padStart(30, ' '))
}


const printGame = (game) => {
    console.log('Boards')
    console.log('\tStarting')
    printBoard(game.startingBoard);

    console.log('\tSolved')
    printBoard(game.board);
}

/* #endregion */

const board = library.hard();
const game = new SudokuGame(board);

const solver = new SudokuSolver(game);
printSolverStats(solver.stats)
printGame(solver.game);
