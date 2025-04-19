import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import StatementItem from '../../@core/components/Statement/StatementItem';
 
describe('Page', () => {
  it('renders a level 6 heading', () => {
    render(
        <StatementItem
            transactionType='deposito'
            amount={51.6}
            date={new Date('2007-04-03T06:03:03.000Z')}
        />,
    )

    expect(screen.getByText('Depósito')).toBeInTheDocument()
    expect(screen.getByText('R$ 51,60')).toBeInTheDocument()
    expect(screen.getByText('03/04')).toBeInTheDocument()
  })
})
