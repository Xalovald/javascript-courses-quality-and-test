// timer.test.js
import '../public/js/timer';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
});

describe('Timer Functionality', () => {
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    document.body.appendChild(scoreElement);

    const letterInput = document.createElement('input');
    letterInput.id = 'letterInput';
    document.body.appendChild(letterInput);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    document.body.appendChild(submitButton);

    jest.useFakeTimers();

    test('fetches score from the server and updates display', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ score: 10 }));

        await fetchscore();

        expect(scoreElement.textContent).toBe(' Score : 10');
        expect(localStorage.getItem('gamescore')).toBe('10');
    });

    test('decreases score over time', async () => {
        localStorage.setItem('gamescore', '5');
        fetchMock.mockResponseOnce(JSON.stringify({ score: 0 }));

        await fetchscore();

        jest.advanceTimersByTime(1000);
        expect(scoreElement.textContent).toBe(' Score : 4');

        jest.advanceTimersByTime(4000);
        expect(scoreElement.textContent).toBe(' | Temps écoulé ! Vous ne pouvez plus jouer aujourd\'hui.');
        expect(letterInput.disabled).toBe(true);
        expect(submitButton.disabled).toBe(true);
    });

    test('handles error fetching score', async () => {
        fetchMock.mockReject(new Error('API is down'));

        await fetchscore();

        expect(scoreElement.textContent).toBe(' Score : 0');
        expect(localStorage.getItem('gamescore')).toBeNull();
    });

    test('updates server score', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ score: 5 }));

        await fetchscore();

        await updateServerscore(5);

        expect(fetch).toHaveBeenCalledWith('/update-score', expect.any(Object));
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('saves score to localStorage before unloading', () => {
        localStorage.setItem('gamescore', '10');
        window.dispatchEvent(new Event('beforeunload'));

        expect(localStorage.getItem('gamescore')).toBe('10');
    });
});
