import { render, screen } from '@testing-library/react'
import Handler from '../pages/api/cron'
import '@testing-library/jest-dom'
 
describe('Handler', () => {
  it('renders a heading', () => {
    render(<Handler />)
 
  })
})