import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Statement from '../../@core/components/Statement';

describe('Page', () => {
  it('renders a level 6 heading', () => {
    render(
      <Statement
        loading={false}
        transactions={
          [
            {
              id: 1,
              amount: 51.6,
              date: new Date('2007-04-03T06:03:03.000Z'),
              transactionType: 'deposito'
            },
            {
              id: 2,
              amount: 42.3,
              date: new Date('2007-09-06T06:06:06.000Z'),
              transactionType: 'credito'
            }
          ]
        }
      />
    )

    const level3Headings = screen.getAllByRole('heading', { level: 3 })
    const level6Headings = screen.getAllByRole('heading', { level: 6 })

    expect(level3Headings.length).toEqual(1)
    expect(level6Headings.length).toEqual(4)
    expect(level3Headings[0]).toHaveTextContent('Extrato')
    expect(level6Headings[0]).toHaveTextContent('setembro')
    expect(level6Headings[1]).toHaveTextContent('Crédito')
    expect(level6Headings[2]).toHaveTextContent('abril')
    expect(level6Headings[3]).toHaveTextContent('Depósito')
  })
})
