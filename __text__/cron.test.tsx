import { render, screen } from '@testing-library/react'
import Handler from '../pages/api/cron'
import '@testing-library/jest-dom'
 
describe('Handler', () => {
  it('renders a heading', () => {
    const { container } = render(<Handler />)
    expect(container.firstChild).toHaveClass('container py-4')
  })
})