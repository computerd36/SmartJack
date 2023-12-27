import { Deck, Suit, Card, Cards, Value } from "./types";

// Define each suit explicitly as a Suit type
export const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

// get a random card
export function getRandomCard(): Card {
    const randomSuit: Suit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)] as Value;

    return {
        suit: randomSuit,
        value: randomValue
    };
}

// get the value of a hand
export const getHandValue = (hand: Cards): number => {
    let sum = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            sum += 10;
        } else if (card.value === 'A') {
            aceCount++;
            sum += 11;  // Initially consider Ace as 11
        } else {
            sum += card.value;
        }
    });

    // Adjust for Aces if sum is greater than 21
    while (sum > 21 && aceCount > 0) {
        sum -= 10;  // Convert an Ace from 11 to 1
        aceCount--;
    }
    return sum;
};

export function dealCards(amount: number): Cards {
    const cards: Cards = [];

    for (let i = 0; i < amount; i++) {
        cards.push(getRandomCard());
    }

    return cards;
}

export function getSymbol(symbol: string): string {
    switch (symbol) {
        case 'hearts':
            return '♥';
        case 'diamonds':
            return '♦';
        case 'clubs':
            return '♣';
        case 'spades':
            return '♠';
        default:
            return '';
    }
}

export function getCardValue(value: Value): number {
    if (value === 'J' || value === 'Q' || value === 'K') {
        return 10;
    } else if (value === 'A') {
        return 11;
    } else {
        return value;
    }
}