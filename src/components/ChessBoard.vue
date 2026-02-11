<template>
  <div class="board-area">
    <div class="board-container">
      <div class="status-bar" :class="statusClass">
        {{ statusText }}
      </div>
      <div class="board">
        <div v-for="(row, rIdx) in board" :key="rIdx" class="rank">
          <div
            v-for="(cell, cIdx) in row"
            :key="cIdx"
            class="square"
            :class="{
              dark: isDarkSquare(rIdx, cIdx),
              selected: isSelected(rIdx, cIdx),
              legal: isLegalTarget(rIdx, cIdx)
            }"
            @click="selectCell(rIdx, cIdx)"
            @dragover.prevent
            @drop="onDrop($event, rIdx, cIdx)"
          >
            <div v-if="isLegalTarget(rIdx, cIdx)" class="legal-dot"></div>
            <img v-if="cell"
                 :src="getPieceImage(cell)"
                 class="piece"
                 draggable="true"
                 @dragstart="onDragStart($event, rIdx, cIdx)"/>
          </div>
        </div>
      </div>
      <div class="controls">
        <button class="btn-new-game" @click="newGame">♔ Nouvelle Partie</button>
      </div>
    </div>

    <aside class="history">
      <div class="history-header">
        <h3>Historique des coups</h3>
        <button @click="clearHistory" title="Effacer">Effacer</button>
      </div>
      <ol class="moves">
        <li v-for="(m, idx) in moves" :key="idx">{{ formatMove(m, idx) }}</li>
      </ol>
    </aside>
  </div>
</template>

<script>
import pieces from '../assets/pieces'
import chessService from '../services/ChessService'

export default {
  data() {
    return {
      chessService,
      dragging: null,
      selected: null,
      legalTargets: [],
      boardVersion: 0
    }
  },
  computed: {
    board() {
      // boardVersion is used to force reactivity when the board changes
      this.boardVersion
      return this.chessService.getBoard()
    },
    moves() {
      this.boardVersion
      return this.chessService.getMoves()
    },
    currentTurn() {
      this.boardVersion
      return this.chessService.getCurrentTurn()
    },
    statusText() {
      this.boardVersion
      if (this.chessService.isCheckmate()) {
        const winner = this.currentTurn === 'w' ? 'Noirs' : 'Blancs'
        return `♚ Échec et mat ! Les ${winner} gagnent !`
      }
      if (this.chessService.isStalemate()) {
        return '½ Pat — Partie nulle'
      }
      if (this.chessService.isDraw()) {
        return '½ Partie nulle'
      }
      if (this.chessService.isCheck()) {
        const turn = this.currentTurn === 'w' ? 'Blancs' : 'Noirs'
        return `⚠ Échec ! Au tour des ${turn}`
      }
      return this.currentTurn === 'w' ? '♙ Au tour des Blancs' : '♟ Au tour des Noirs'
    },
    statusClass() {
      this.boardVersion
      if (this.chessService.isCheckmate()) return 'status-checkmate'
      if (this.chessService.isStalemate() || this.chessService.isDraw()) return 'status-draw'
      if (this.chessService.isCheck()) return 'status-check'
      return this.currentTurn === 'w' ? 'status-white' : 'status-black'
    }
  },
  methods: {
    isDarkSquare(r, c) {
      return this.chessService.isDarkSquare(r, c)
    },
    getPieceImage(code) {
      return pieces[code]
    },
    isSelected(r, c) {
      return this.selected && this.selected.r === r && this.selected.c === c
    },
    isLegalTarget(r, c) {
      const alg = this.chessService.coordToAlg(r, c)
      return this.legalTargets.includes(alg)
    },
    selectCell(r, c) {
      // If game is over, do nothing
      if (this.chessService.isGameOver()) return

      const cell = this.chessService.getPieceAt(r, c)

      if (!this.selected) {
        // Pick up only if there's a piece belonging to the current player
        if (cell && cell[0] === this.chessService.getCurrentTurn()) {
          this.selected = { r, c }
          this.legalTargets = this.chessService.getLegalMoves(r, c)
        }
      } else {
        // Try to move selected piece to this cell
        const result = this.chessService.movePiece(this.selected, { r, c })
        if (result) {
          this.boardVersion++
        } else if (cell && cell[0] === this.chessService.getCurrentTurn()) {
          // Clicked on another own piece — reselect
          this.selected = { r, c }
          this.legalTargets = this.chessService.getLegalMoves(r, c)
          return
        }
        this.selected = null
        this.legalTargets = []
      }
    },
    onDragStart(e, r, c) {
      if (this.chessService.isGameOver()) return
      const cell = this.chessService.getPieceAt(r, c)
      if (!cell || cell[0] !== this.chessService.getCurrentTurn()) return

      this.dragging = { r, c }
      this.selected = { r, c }
      this.legalTargets = this.chessService.getLegalMoves(r, c)
      try {
        e.dataTransfer.setData('text/plain', JSON.stringify({ r, c }))
      } catch (err) {
        // ignore
      }
    },
    onDrop(e, r, c) {
      let source = this.dragging
      if (!source) {
        try {
          source = JSON.parse(e.dataTransfer.getData('text/plain'))
        } catch (err) {
          source = null
        }
      }
      if (!source) return

      const result = this.chessService.movePiece(source, { r, c })
      if (result) {
        this.boardVersion++
      }
      this.dragging = null
      this.selected = null
      this.legalTargets = []
    },
    formatMove(m, idx) {
      return this.chessService.formatMove(m, idx)
    },
    clearHistory() {
      this.chessService.clearHistory()
      this.boardVersion++
    },
    newGame() {
      this.chessService.resetGame()
      this.selected = null
      this.legalTargets = []
      this.boardVersion++
    }
  }
}
</script>

<style scoped>
.board-area{display:flex;gap:16px}
.board-container{display:flex;flex-direction:column;align-items:stretch;width:560px}
.board{
  display:flex;
  flex-direction:column;
  border:2px solid #333;
}
.rank{display:flex}
.square{
  width:70px;height:70px;display:flex;align-items:center;justify-content:center;cursor:pointer;
  position:relative;
}
.square.dark{background:#769656}
.square:not(.dark){background:#eeeed2}
.square.selected{outline:3px solid #f39c12;z-index:1}
.square.legal{cursor:pointer}
.legal-dot{
  position:absolute;
  width:18px;height:18px;
  border-radius:50%;
  background:rgba(0,0,0,0.2);
  pointer-events:none;
  z-index:0;
}
.piece{width:60px;height:60px;user-select:none;position:relative;z-index:1}

.status-bar{
  padding:10px 16px;
  font-size:16px;
  font-weight:bold;
  text-align:center;
  border:2px solid #333;
  border-bottom:none;
  border-radius:6px 6px 0 0;
}
.status-white{background:#f5f5dc;color:#333}
.status-black{background:#333;color:#f5f5dc}
.status-check{background:#e67e22;color:#fff}
.status-checkmate{background:#c0392b;color:#fff}
.status-draw{background:#7f8c8d;color:#fff}

.controls{
  display:flex;justify-content:center;margin-top:10px;
}
.btn-new-game{
  padding:8px 20px;
  font-size:14px;
  font-weight:bold;
  background:#2c3e50;
  color:#fff;
  border:none;
  border-radius:6px;
  cursor:pointer;
  transition:background 0.2s;
}
.btn-new-game:hover{background:#1a252f}

.history{width:220px;border:1px solid #ddd;padding:8px;background:#fafafa}
.history-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.history h3{margin:0;font-size:16px}
.history button{font-size:12px;padding:4px 8px}
.moves{max-height:420px;overflow:auto;padding-left:18px}
.moves li{margin-bottom:6px;font-family:monospace}
</style>
