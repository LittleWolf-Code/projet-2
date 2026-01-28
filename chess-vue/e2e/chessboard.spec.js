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

  test('should highlight a piece when clicked', async ({ page }) => {
    // Click on a white pawn (row 6, any column)
    const whitePawnSquare = page.locator('.rank').nth(6).locator('.square').first()
    await whitePawnSquare.click()
    
    await expect(whitePawnSquare).toHaveClass(/selected/)
  })

  test('should deselect when clicking on empty square after selecting a piece', async ({ page }) => {
    // Select a white pawn
    const whitePawnSquare = page.locator('.rank').nth(6).locator('.square').first()
    await whitePawnSquare.click()
    await expect(whitePawnSquare).toHaveClass(/selected/)
    
    // Click on empty square - piece should move there
    const emptySquare = page.locator('.rank').nth(4).locator('.square').first()
    await emptySquare.click()
    
    // Selection should be cleared
    await expect(whitePawnSquare).not.toHaveClass(/selected/)
  })

  test('should move piece when clicking on destination', async ({ page }) => {
    // Select white pawn at e2
    const pawnSquare = page.locator('.rank').nth(6).locator('.square').nth(4)
    await pawnSquare.click()
    
    // Move to e4
    const targetSquare = page.locator('.rank').nth(4).locator('.square').nth(4)
    await targetSquare.click()
    
    // Pawn should now be at e4
    const pieceAtTarget = targetSquare.locator('.piece')
    await expect(pieceAtTarget).toBeVisible()
    
    // Original square should be empty
    const pieceAtOriginal = pawnSquare.locator('.piece')
    await expect(pieceAtOriginal).not.toBeVisible()
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

  test('should allow multiple moves in sequence', async ({ page }) => {
    // Move 1: e2 to e4
    await page.locator('.rank').nth(6).locator('.square').nth(4).click()
    await page.locator('.rank').nth(4).locator('.square').nth(4).click()
    
    // Move 2: e7 to e5
    await page.locator('.rank').nth(1).locator('.square').nth(4).click()
    await page.locator('.rank').nth(3).locator('.square').nth(4).click()
    
    // Move 3: d2 to d4
    await page.locator('.rank').nth(6).locator('.square').nth(3).click()
    await page.locator('.rank').nth(4).locator('.square').nth(3).click()
    
    // Verify 3 moves in history
    const moves = page.locator('.moves li')
    await expect(moves).toHaveCount(3)
  })
})
