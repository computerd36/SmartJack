import * as React from 'react';
import { Card } from '../types';
import * as game from '../game';

export interface IPlayingCardProps {
    card: Card;
}

export function PlayingCard(props: IPlayingCardProps) {
    return (
        <div className={props.card.suit === 'diamonds' || props.card.suit === 'hearts' ? 'card red' : 'card'}>
            <div className="card-top">
                <span>{props.card.value}</span>
                <span>{game.getSymbol(props.card.suit)}</span>
            </div>

            <div className="card-middle">
                <span>{game.getSymbol(props.card.suit)}</span>
            </div>

            <div className="card-bottom">
                <span>{props.card.value}</span>
                <span>{game.getSymbol(props.card.suit)}</span>
            </div>
        </div>
    );
}
