/**
 * ChessService - Service regroupant la logique métier du jeu d'échecs
 * Utilise chess.js pour la validation des règles
 */
import { Chess } from 'chess.js'

export class ChessService {
  constructor() {
    this.game = new Chess()
    this.moves = []
  }

  /**
   * Convertit une pièce chess.js en code interne (ex: {color:'w', type:'p'} → 'wP')
   * @param {Object|null} piece - Pièce chess.js
   * @returns {string|null}
   */
  _toCode(piece) {
    if (!piece) return null
    return piece.color + piece.type.toUpperCase()
  }

  /**
   * Récupère le plateau au format interne (tableau 8x8 de codes 'wP','bK',… ou null)
   * @returns {Array} Le plateau 8x8
   */
  getBoard() {
    const chessBoard = this.game.board()
    return chessBoard.map(row => row.map(cell => this._toCode(cell)))
  }

  /**
   * Récupère la pièce à une position donnée
   * @param {number} r - Ligne (0=rangée 8, 7=rangée 1)
   * @param {number} c - Colonne (0=a, 7=h)
   * @returns {string|null} Le code de la pièce ou null
   */
  getPieceAt(r, c) {
    const square = this.coordToAlg(r, c)
    const piece = this.game.get(square)
    return this._toCode(piece)
  }

  /**
   * Déplace une pièce d'une position à une autre (vérifie la légalité)
   * @param {Object} from - Position source {r, c}
   * @param {Object} to - Position destination {r, c}
   * @returns {Object|null} Le mouvement effectué ou null si illégal
   */
  movePiece(from, to) {
    if (from.r === to.r && from.c === to.c) {
      return null
    }

    const fromAlg = this.coordToAlg(from.r, from.c)
    const toAlg = this.coordToAlg(to.r, to.c)
    const piece = this.getPieceAt(from.r, from.c)

    if (!piece) {
      return null
    }

    try {
      // Tenter le coup — chess.js lève une exception si illégal
      // Toujours promouvoir en reine par défaut
      const result = this.game.move({ from: fromAlg, to: toAlg, promotion: 'q' })
      if (!result) return null

      const move = { piece, from: { ...from }, to: { ...to } }
      this.moves.push(move)
      return move
    } catch (e) {
      // Coup illégal
      return null
    }
  }

  /**
   * Réinitialise le plateau et l'historique
   */
  resetGame() {
    this.game.reset()
    this.moves = []
  }

  /**
   * Vérifie si une case est foncée
   * @param {number} r - Ligne
   * @param {number} c - Colonne
   * @returns {boolean}
   */
  isDarkSquare(r, c) {
    return (r + c) % 2 === 1
  }

  /**
   * Convertit des coordonnées en notation algébrique
   * @param {number} r - Ligne
   * @param {number} c - Colonne
   * @returns {string} La notation algébrique (ex: "e4")
   */
  coordToAlg(r, c) {
    const file = String.fromCharCode('a'.charCodeAt(0) + c)
    const rank = 8 - r
    return `${file}${rank}`
  }

  /**
   * Formate un mouvement pour l'affichage
   * @param {Object} move - Le mouvement
   * @param {number} idx - L'index du mouvement
   * @returns {string} Le mouvement formaté
   */
  formatMove(move, idx) {
    const from = this.coordToAlg(move.from.r, move.from.c)
    const to = this.coordToAlg(move.to.r, move.to.c)
    return `${idx + 1}. ${move.piece} ${from} → ${to}`
  }

  /**
   * Récupère l'historique des mouvements
   * @returns {Array} Liste des mouvements
   */
  getMoves() {
    return this.moves
  }

  /**
   * Efface l'historique des mouvements
   */
  clearHistory() {
    this.moves = []
  }

  /**
   * Retourne le tour actuel ('w' ou 'b')
   * @returns {string}
   */
  getCurrentTurn() {
    return this.game.turn()
  }

  /**
   * Retourne true si le roi du joueur courant est en échec
   * @returns {boolean}
   */
  isCheck() {
    return this.game.isCheck()
  }

  /**
   * Retourne true si c'est échec et mat
   * @returns {boolean}
   */
  isCheckmate() {
    return this.game.isCheckmate()
  }

  /**
   * Retourne true si c'est pat (stalemate)
   * @returns {boolean}
   */
  isStalemate() {
    return this.game.isStalemate()
  }

  /**
   * Retourne true si la partie est nulle
   * @returns {boolean}
   */
  isDraw() {
    return this.game.isDraw()
  }

  /**
   * Retourne true si la partie est terminée
   * @returns {boolean}
   */
  isGameOver() {
    return this.game.isGameOver()
  }

  /**
   * Retourne les cases légales pour une pièce donnée
   * @param {number} r - Ligne
   * @param {number} c - Colonne
   * @returns {Array} Liste de cases en notation algébrique
   */
  getLegalMoves(r, c) {
    const square = this.coordToAlg(r, c)
    const moves = this.game.moves({ square, verbose: true })
    return moves.map(m => m.to)
  }

  /**
   * Convertit une notation algébrique en coordonnées {r, c}
   * @param {string} alg - Notation algébrique (ex: "e4")
   * @returns {Object} {r, c}
   */
  algToCoord(alg) {
    const c = alg.charCodeAt(0) - 'a'.charCodeAt(0)
    const r = 8 - parseInt(alg[1])
    return { r, c }
  }
}

// Export d'une instance singleton pour utilisation simple
export default new ChessService()
