import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
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
  });

  it('filters the statemente items by sign', async () => {
    const { baseElement } = render(
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
              transactionType: 'pix'
            }
          ]
        }
      />
    )

    const buttons = screen.getAllByRole('button')

    expect(buttons.length).toEqual(2)
    expect(baseElement).toHaveTextContent('R$ 51,60')
    expect(baseElement).toHaveTextContent('-R$ 42,30')

    await userEvent.click(buttons[0])
    expect(baseElement).toHaveTextContent('R$ 51,60')
    expect(baseElement).not.toHaveTextContent('-R$ 42,30')

    await userEvent.click(buttons[0])
    expect(baseElement).not.toHaveTextContent('R$ 51,60')
    expect(baseElement).toHaveTextContent('-R$ 42,30')
  })

  it('sorts the statemente items by date', async () => {
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

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toEqual(2)

    let level6Headings = screen.getAllByRole('heading', { level: 6 })
    expect(level6Headings[0]).toHaveTextContent('setembro')
    expect(level6Headings[2]).toHaveTextContent('abril')

    await userEvent.click(buttons[1])

    level6Headings = screen.getAllByRole('heading', { level: 6 })
    expect(level6Headings[0]).toHaveTextContent('abril')
    expect(level6Headings[2]).toHaveTextContent('setembro')
  });
})
