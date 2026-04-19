import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders storybook intro', () => {
    render(<App />);
    expect(screen.getByText('ДиаДрузья')).toBeInTheDocument();
    expect(screen.getByText('Как дружат сахар и инсулин')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Понятно, идем дальше' })).toBeInTheDocument();
  });

  test('can start story after intro answer', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Понятно, идем дальше' }));
    expect(screen.getByText('Привет, я Глюкоша')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'да' }));
    fireEvent.click(screen.getByRole('button', { name: 'Начнем' }));
    expect(screen.getByText('Собираем завтрак')).toBeInTheDocument();
    expect(screen.getByText('Полка с едой')).toBeInTheDocument();
  });

  test('shows meter info panel', () => {
    render(<App />);
    expect(screen.getByText('Сахар крови')).toBeInTheDocument();
    expect(screen.getByText('5.6 ммоль/л')).toBeInTheDocument();
  });

  test('tap fallback adds breakfast item to the table', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Понятно, идем дальше' }));
    fireEvent.click(screen.getByRole('button', { name: 'да' }));
    fireEvent.click(screen.getByRole('button', { name: 'Начнем' }));
    fireEvent.click(screen.getAllByRole('button', { name: /Овсянка/i })[0]);
    expect(screen.getByText('Всего: 1 хлебная единица')).toBeInTheDocument();
  });
});
