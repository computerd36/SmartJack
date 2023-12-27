// Assuming Suit and Card are defined in "./types" as follows:
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Value = number | 'J' | 'Q' | 'K' | 'A';
export type Card = {
    value: number | 'J' | 'Q' | 'K' | 'A';
    suit: Suit;
}

export type Cards = Card[];

export type Deck = Card[];