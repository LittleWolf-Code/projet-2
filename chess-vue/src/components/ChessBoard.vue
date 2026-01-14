<template>
  <div class="board-area">
    <div class="board">
      <div v-for="(row, rIdx) in board" :key="rIdx" class="rank">
        <div
          v-for="(cell, cIdx) in row"
          :key="cIdx"
          class="square"
          :class="{ dark: isDarkSquare(rIdx, cIdx), selected: isSelected(rIdx,cIdx) }"
          @click="selectCell(rIdx, cIdx)"
          @dragover.prevent
          @drop="onDrop($event, rIdx, cIdx)"
        >
          <img v-if="cell"
               :src="getPieceImage(cell)"
               class="piece"
               draggable="true"
               @dragstart="onDragStart($event, rIdx, cIdx)"/>
        </div>
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

export default {
  data() {
    return {
      board: this.initBoard(),
      dragging: null,
      selected: null,
      moves: []
    }
  },
  methods: {
    initBoard() {
      const empty = Array(8).fill(null)
      const board = []
      board.push(['bR','bN','bB','bQ','bK','bB','bN','bR'])
      board.push(Array(8).fill('bP'))
      for (let i=0;i<4;i++) board.push([...empty])
      board.push(Array(8).fill('wP'))
      board.push(['wR','wN','wB','wQ','wK','wB','wN','wR'])
      return board
    },
    isDarkSquare(r,c){
      return (r+c)%2===1
    },
    getPieceImage(code){
      return pieces[code]
    },
    isSelected(r,c){
      return this.selected && this.selected.r===r && this.selected.c===c
    },
    coordToAlg(r,c){
      const file = String.fromCharCode('a'.charCodeAt(0) + c)
      const rank = 8 - r
      return `${file}${rank}`
    },
    selectCell(r,c){
      const cell = this.board[r][c]
      if (!this.selected) {
        // pick up if there's a piece
        if (cell) this.selected = { r, c }
      } else {
        // move selected piece to this cell
        const src = this.selected
        if (!(src.r===r && src.c===c)) {
          const piece = this.board[src.r][src.c]
          this.board[src.r][src.c] = null
          this.board[r][c] = piece
          // record move
          this.moves.push({ piece, from: { ...src }, to: { r, c } })
        }
        this.selected = null
      }
    },
    onDragStart(e,r,c){
      this.dragging = { r, c }
      try {
        e.dataTransfer.setData('text/plain', JSON.stringify({ r, c }))
      } catch (err) {
        // ignore
      }
    },
    onDrop(e, r, c){
      let source = this.dragging
      if (!source) {
        try {
          source = JSON.parse(e.dataTransfer.getData('text/plain'))
        } catch (err) {
          source = null
        }
      }
      if (!source) return
      if (source.r===r && source.c===c) {
        this.dragging = null
        return
      }
      const piece = this.board[source.r][source.c]
      this.board[source.r][source.c] = null
      this.board[r][c] = piece
      this.dragging = null
      this.selected = null
      // record move
      this.moves.push({ piece, from: { r: source.r, c: source.c }, to: { r, c } })
    },
    formatMove(m, idx){
      const from = this.coordToAlg(m.from.r, m.from.c)
      const to = this.coordToAlg(m.to.r, m.to.c)
      return `${idx+1}. ${m.piece} ${from} → ${to}`
    },
    clearHistory(){
      this.moves = []
    }
  }
}
</script>

<style scoped>
.board-area{display:flex;gap:16px}
.board{
  display:flex;
  flex-direction:column;
  width: 560px;
  border:2px solid #333;
}
.rank{display:flex}
.square{
  width:70px;height:70px;display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.square.dark{background:#769656}
.square:not(.dark){background:#eeeed2}
.square.selected{outline:3px solid #f39c12}
.piece{width:60px;height:60px;user-select:none}

.history{width:220px;border:1px solid #ddd;padding:8px;background:#fafafa}
.history-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.history h3{margin:0;font-size:16px}
.history button{font-size:12px;padding:4px 8px}
.moves{max-height:420px;overflow:auto;padding-left:18px}
.moves li{margin-bottom:6px;font-family:monospace}
</style>
