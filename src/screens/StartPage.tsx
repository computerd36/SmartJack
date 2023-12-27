import * as React from 'react';
import { Link } from 'react-router-dom';

export interface IStartPageProps {
}

export function StartPage(props: IStartPageProps) {
    return (
        <div>
            <h1>Blackjack Trainer</h1>
            <h2>Play a few rounds and get real-time statistics on right and wrong decisions according to the basic strategy for blackjack. </h2>
            <Link to="/play" role='button' className='startGameButton'>Start Game</Link>

        </div>
    );
}
