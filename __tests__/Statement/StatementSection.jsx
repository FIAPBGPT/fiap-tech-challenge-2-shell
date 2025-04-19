import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import StatementSection from '../../@core/components/Statement/StatementSection';
 
describe('Page', () => {
  it('renders a level 6 heading', () => {
    render(
        <StatementSection
            month='Abril'
            items={[
              {
                id: 1,
                amount: 51.6,
                date: new Date('2007-04-03T06:03:03.000Z'),
                transactionType: 'deposito'
              },
              {
                id: 2,
                amount: 42.3,
                date: new Date('2007-04-06T06:06:06.000Z'),
                transactionType: 'credito'
              }
            ]}
        />,
    )

    const level6Headings = screen.getAllByRole('heading', { level: 6 })

    expect(level6Headings.length).toEqual(3)
    expect(level6Headings[0]).toHaveTextContent('Abril')
    expect(level6Headings[1]).toHaveTextContent('Depósito')
    expect(level6Headings[2]).toHaveTextContent('Crédito')
  })
})
