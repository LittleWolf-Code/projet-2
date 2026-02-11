import { describe, it, expect, beforeEach } from 'vitest'
import { ChessService } from './ChessService'

describe('ChessService', () => {
  let service

  beforeEach(() => {
    service = new ChessService()
  })

  describe('initBoard', () => {
    it('should create an 8x8 board', () => {
      const board = service.getBoard()
      expect(board.length).toBe(8)
      board.forEach(row => {
        expect(row.length).toBe(8)
      })
    })

    it('should place black pieces on the first row', () => {
      const board = service.getBoard()
      expect(board[0]).toEqual(['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'])
    })

    it('should place black pawns on the second row', () => {
      const board = service.getBoard()
      expect(board[1]).toEqual(Array(8).fill('bP'))
    })

    it('should place white pieces on the last row', () => {
      const board = service.getBoard()
      expect(board[7]).toEqual(['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'])
    })

    it('should place white pawns on the seventh row', () => {
      const board = service.getBoard()
      expect(board[6]).toEqual(Array(8).fill('wP'))
    })

    it('should have empty squares in the middle rows', () => {
      const board = service.getBoard()
      for (let row = 2; row <= 5; row++) {
        board[row].forEach(cell => {
          expect(cell).toBeNull()
        })
      }
    })
  })

  describe('getPieceAt', () => {
    it('should return the piece at the given position', () => {
      expect(service.getPieceAt(0, 0)).toBe('bR')
      expect(service.getPieceAt(0, 4)).toBe('bK')
      expect(service.getPieceAt(7, 4)).toBe('wK')
    })

    it('should return null for empty squares', () => {
      expect(service.getPieceAt(4, 4)).toBeNull()
    })
  })

  describe('movePiece', () => {
    it('should move a piece from source to destination (legal move)', () => {
      // e2 to e4 — legal white pawn double push
      const move = service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })

      expect(move).not.toBeNull()
      expect(move.piece).toBe('wP')
      expect(service.getPieceAt(6, 4)).toBeNull()
      expect(service.getPieceAt(4, 4)).toBe('wP')
    })

    it('should return null when moving to the same position', () => {
      const move = service.movePiece({ r: 6, c: 4 }, { r: 6, c: 4 })
      expect(move).toBeNull()
    })

    it('should return null when moving from an empty square', () => {
      const move = service.movePiece({ r: 4, c: 4 }, { r: 3, c: 4 })
      expect(move).toBeNull()
    })

    it('should return null for an illegal move', () => {
      // Try to move pawn e2 to e5 (3 squares) — illegal
      const move = service.movePiece({ r: 6, c: 4 }, { r: 3, c: 4 })
      expect(move).toBeNull()
      // Pawn should still be at e2
      expect(service.getPieceAt(6, 4)).toBe('wP')
    })

    it('should enforce turn order', () => {
      // Black tries to move first — illegal
      const move = service.movePiece({ r: 1, c: 4 }, { r: 3, c: 4 })
      expect(move).toBeNull()
    })

    it('should record the move in history', () => {
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })

      const moves = service.getMoves()
      expect(moves.length).toBe(1)
      expect(moves[0].piece).toBe('wP')
      expect(moves[0].from).toEqual({ r: 6, c: 4 })
      expect(moves[0].to).toEqual({ r: 4, c: 4 })
    })

    it('should allow capture with legal move', () => {
      // 1. e4
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })
      // 1... d5
      service.movePiece({ r: 1, c: 3 }, { r: 3, c: 3 })
      // 2. exd5 — legal capture
      service.movePiece({ r: 4, c: 4 }, { r: 3, c: 3 })

      expect(service.getPieceAt(3, 3)).toBe('wP')
      expect(service.getPieceAt(4, 4)).toBeNull()
    })
  })

  describe('isDarkSquare', () => {
    it('should return true for dark squares', () => {
      expect(service.isDarkSquare(0, 1)).toBe(true)
      expect(service.isDarkSquare(1, 0)).toBe(true)
      expect(service.isDarkSquare(3, 4)).toBe(true)
    })

    it('should return false for light squares', () => {
      expect(service.isDarkSquare(0, 0)).toBe(false)
      expect(service.isDarkSquare(1, 1)).toBe(false)
      expect(service.isDarkSquare(4, 4)).toBe(false)
    })
  })

  describe('coordToAlg', () => {
    it('should convert coordinates to algebraic notation', () => {
      expect(service.coordToAlg(0, 0)).toBe('a8')
      expect(service.coordToAlg(0, 4)).toBe('e8')
      expect(service.coordToAlg(7, 0)).toBe('a1')
      expect(service.coordToAlg(7, 7)).toBe('h1')
      expect(service.coordToAlg(4, 4)).toBe('e4')
    })
  })

  describe('formatMove', () => {
    it('should format a move correctly', () => {
      const move = {
        piece: 'wP',
        from: { r: 6, c: 4 },
        to: { r: 4, c: 4 }
      }

      expect(service.formatMove(move, 0)).toBe('1. wP e2 → e4')
    })

    it('should include the correct move number', () => {
      const move = {
        piece: 'bN',
        from: { r: 0, c: 1 },
        to: { r: 2, c: 2 }
      }

      expect(service.formatMove(move, 4)).toBe('5. bN b8 → c6')
    })
  })

  describe('getMoves and clearHistory', () => {
    it('should return empty array initially', () => {
      expect(service.getMoves()).toEqual([])
    })

    it('should clear all moves from history', () => {
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })
      service.movePiece({ r: 1, c: 4 }, { r: 3, c: 4 })

      expect(service.getMoves().length).toBe(2)

      service.clearHistory()

      expect(service.getMoves()).toEqual([])
    })
  })

  describe('resetGame', () => {
    it('should reset the board to initial position', () => {
      // Make some moves
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })
      service.movePiece({ r: 1, c: 4 }, { r: 3, c: 4 })

      service.resetGame()

      // Check board is reset
      expect(service.getPieceAt(6, 4)).toBe('wP')
      expect(service.getPieceAt(4, 4)).toBeNull()
      expect(service.getPieceAt(1, 4)).toBe('bP')
      expect(service.getPieceAt(3, 4)).toBeNull()
    })

    it('should clear the move history', () => {
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })

      service.resetGame()

      expect(service.getMoves()).toEqual([])
    })
  })

  describe('getCurrentTurn', () => {
    it('should start with white turn', () => {
      expect(service.getCurrentTurn()).toBe('w')
    })

    it('should alternate turns after a move', () => {
      service.movePiece({ r: 6, c: 4 }, { r: 4, c: 4 })
      expect(service.getCurrentTurn()).toBe('b')

      service.movePiece({ r: 1, c: 4 }, { r: 3, c: 4 })
      expect(service.getCurrentTurn()).toBe('w')
    })
  })

  describe('getLegalMoves', () => {
    it('should return legal moves for a white pawn at start', () => {
      const moves = service.getLegalMoves(6, 4) // e2
      expect(moves).toContain('e3')
      expect(moves).toContain('e4')
      expect(moves.length).toBe(2)
    })

    it('should return empty for an empty square', () => {
      const moves = service.getLegalMoves(4, 4)
      expect(moves).toEqual([])
    })

    it('should return legal moves for a knight', () => {
      const moves = service.getLegalMoves(7, 1) // b1 knight
      expect(moves).toContain('a3')
      expect(moves).toContain('c3')
      expect(moves.length).toBe(2)
    })
  })

  describe('game state detection', () => {
    it('should not be in check at start', () => {
      expect(service.isCheck()).toBe(false)
    })

    it('should not be checkmate at start', () => {
      expect(service.isCheckmate()).toBe(false)
    })

    it('should not be game over at start', () => {
      expect(service.isGameOver()).toBe(false)
    })

    it('should detect checkmate (fool\'s mate)', () => {
      // Fool's mate:  1. f3 e5  2. g4 Qh4#
      service.movePiece({ r: 6, c: 5 }, { r: 5, c: 5 }) // f2-f3
      service.movePiece({ r: 1, c: 4 }, { r: 3, c: 4 }) // e7-e5
      service.movePiece({ r: 6, c: 6 }, { r: 4, c: 6 }) // g2-g4
      service.movePiece({ r: 0, c: 3 }, { r: 4, c: 7 }) // Qd8-h4#

      expect(service.isCheckmate()).toBe(true)
      expect(service.isGameOver()).toBe(true)
    })
  })

  describe('algToCoord', () => {
    it('should convert algebraic notation to coordinates', () => {
      expect(service.algToCoord('a8')).toEqual({ r: 0, c: 0 })
      expect(service.algToCoord('e4')).toEqual({ r: 4, c: 4 })
      expect(service.algToCoord('h1')).toEqual({ r: 7, c: 7 })
    })
  })
})
