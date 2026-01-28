/**
 * ChessService - Service regroupant la logique métier du jeu d'échecs
 */
export class ChessService {
  constructor() {
    this.board = this.initBoard()
    this.moves = []
  }

  /**
   * Initialise le plateau avec la position de départ
   * @returns {Array} Le plateau 8x8
   */
  initBoard() {
    const empty = Array(8).fill(null)
    const board = []
    board.push(['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'])
    board.push(Array(8).fill('bP'))
    for (let i = 0; i < 4; i++) board.push([...empty])
    board.push(Array(8).fill('wP'))
    board.push(['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'])
    return board
  }

  /**
   * Réinitialise le plateau et l'historique
   */
  resetGame() {
    this.board = this.initBoard()
    this.moves = []
  }

  /**
   * Récupère la pièce à une position donnée
   * @param {number} r - Ligne
   * @param {number} c - Colonne
   * @returns {string|null} Le code de la pièce ou null
   */
  getPieceAt(r, c) {
    return this.board[r][c]
  }

  /**
   * Déplace une pièce d'une position à une autre
   * @param {Object} from - Position source {r, c}
   * @param {Object} to - Position destination {r, c}
   * @returns {Object|null} Le mouvement effectué ou null si invalide
   */
  movePiece(from, to) {
    if (from.r === to.r && from.c === to.c) {
      return null
    }

    const piece = this.board[from.r][from.c]
    if (!piece) {
      return null
    }

    this.board[from.r][from.c] = null
    this.board[to.r][to.c] = piece

    const move = { piece, from: { ...from }, to: { ...to } }
    this.moves.push(move)

    return move
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
   * Récupère le plateau actuel
   * @returns {Array} Le plateau 8x8
   */
  getBoard() {
    return this.board
  }
}

// Export d'une instance singleton pour utilisation simple
export default new ChessService()
