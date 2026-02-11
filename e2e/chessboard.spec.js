import { test, expect } from '@playwright/test'

test.describe('ChessBoard Component', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the chess board with 64 squares', async ({ page }) => {
    const squares = page.locator('.square')
    await expect(squares).toHaveCount(64)
  })

  test('should display all 32 pieces at initial position', async ({ page }) => {
    const pieces = page.locator('.piece')
    await expect(pieces).toHaveCount(32)
  })

  test('should have alternating dark and light squares', async ({ page }) => {
    const darkSquares = page.locator('.square.dark')
    await expect(darkSquares).toHaveCount(32)
  })

  test('should display the move history panel', async ({ page }) => {
    await expect(page.locator('.history')).toBeVisible()
    await expect(page.locator('.history h3')).toHaveText('Historique des coups')
  })

  test('should display the status bar showing white to play', async ({ page }) => {
    const statusBar = page.locator('.status-bar')
    await expect(statusBar).toBeVisible()
    await expect(statusBar).toContainText('Blancs')
  })

  test('should highlight a piece when clicked', async ({ page }) => {
    // Click on a white pawn (row 6, any column)
    const whitePawnSquare = page.locator('.rank').nth(6).locator('.square').first()
    await whitePawnSquare.click()
    
    await expect(whitePawnSquare).toHaveClass(/selected/)
  })

  test('should show legal move indicators when a piece is selected', async ({ page }) => {
    // Click on white pawn at e2
    const pawnSquare = page.locator('.rank').nth(6).locator('.square').nth(4)
    await pawnSquare.click()

    // Should see legal-dot indicators (e3 and e4)
    const legalDots = page.locator('.legal-dot')
    await expect(legalDots).toHaveCount(2)
  })

  test('should not allow selecting black pieces on white turn', async ({ page }) => {
    // Try to click on a black pawn (row 1)
    const blackPawnSquare = page.locator('.rank').nth(1).locator('.square').first()
    await blackPawnSquare.click()

    // Should NOT be selected
    await expect(blackPawnSquare).not.toHaveClass(/selected/)
  })

  test('should move piece when clicking on a legal destination', async ({ page }) => {
    // Select white pawn at e2
    const pawnSquare = page.locator('.rank').nth(6).locator('.square').nth(4)
    await pawnSquare.click()
    
    // Move to e4 (legal move)
    const targetSquare = page.locator('.rank').nth(4).locator('.square').nth(4)
    await targetSquare.click()
    
    // Pawn should now be at e4
    const pieceAtTarget = targetSquare.locator('.piece')
    await expect(pieceAtTarget).toBeVisible()
    
    // Original square should be empty
    const pieceAtOriginal = pawnSquare.locator('.piece')
    await expect(pieceAtOriginal).not.toBeVisible()
  })

  test('should not move piece to an illegal square', async ({ page }) => {
    // Select white pawn at e2
    const pawnSquare = page.locator('.rank').nth(6).locator('.square').nth(4)
    await pawnSquare.click()

    // Try to move to e5 (3 squares — illegal)
    const illegalSquare = page.locator('.rank').nth(3).locator('.square').nth(4)
    await illegalSquare.click()

    // Pawn should still be at e2
    await expect(pawnSquare.locator('.piece')).toBeVisible()
  })

  test('should switch turn after a legal move', async ({ page }) => {
    const statusBar = page.locator('.status-bar')

    // White moves e2-e4
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()

    // Status should show black's turn
    await expect(statusBar).toContainText('Noirs')
  })

  test('should record move in history after moving a piece', async ({ page }) => {
    // Move white pawn from e2 to e4
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()
    
    // Check history has one move
    const moves = page.locator('.moves li')
    await expect(moves).toHaveCount(1)
    
    // Verify move notation contains piece and squares
    await expect(moves.first()).toContainText('wP')
    await expect(moves.first()).toContainText('e2')
    await expect(moves.first()).toContainText('e4')
  })

  test('should clear history when clicking clear button', async ({ page }) => {
    // Make a move first
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()
    
    // Verify move is recorded
    await expect(page.locator('.moves li')).toHaveCount(1)
    
    // Click clear button
    await page.locator('.history button').click()
    
    // History should be empty
    await expect(page.locator('.moves li')).toHaveCount(0)
  })

  test('should support drag and drop to move pieces', async ({ page }) => {
    const pawnSquare = page.locator('.rank').nth(6).locator('.square').nth(4)
    const targetSquare = page.locator('.rank').nth(4).locator('.square').nth(4)
    
    const piece = pawnSquare.locator('.piece')
    
    // Drag and drop
    await piece.dragTo(targetSquare)
    
    // Piece should now be at target
    await expect(targetSquare.locator('.piece')).toBeVisible()
    await expect(pawnSquare.locator('.piece')).not.toBeVisible()
  })

  test('should allow multiple legal moves in sequence', async ({ page }) => {
    // Move 1: e2 to e4 (white)
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()
    
    // Move 2: e7 to e5 (black)
    await page.locator('.rank').nth(1).locator('.square').nth(4).click()
    await page.locator('.rank').nth(3).locator('.square').nth(4).click()
    
    // Move 3: d2 to d4 (white)
    await page.locator('.rank').nth(6).locator('.square').nth(3).click()
    await page.locator('.rank').nth(4).locator('.square').nth(3).click()
    
    // Verify 3 moves in history
    const moves = page.locator('.moves li')
    await expect(moves).toHaveCount(3)
  })

  test('should reset the game when clicking new game button', async ({ page }) => {
    // Make a move
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()

    // Click new game
    await page.locator('.btn-new-game').click()

    // All 32 pieces should be back
    const pieces = page.locator('.piece')
    await expect(pieces).toHaveCount(32)

    // Status should show white's turn
    await expect(page.locator('.status-bar')).toContainText('Blancs')
  })
})
