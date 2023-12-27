import * as React from 'react';
import * as game from '../game'
import { Deck, Card, Cards } from '../types';
import { PlayingCard } from '../components/Card';

//Icons
import { GiPokerHand } from "react-icons/gi";
import * as TbIcons from "react-icons/tb";



export interface IGamePageProps {
}

export function GamePage(props: IGamePageProps) {
    const [ingame, setIngame] = React.useState<boolean>(false);
    const [started, setStarted] = React.useState<boolean>(false);

    const [turn, setTurn] = React.useState<'player' | 'dealer'>('player')

    const [winner, setWinner] = React.useState<'player' | 'dealer' | 'tie' | 'none'>('none');
    const [mainHandWinner, setMainHandWinner] = React.useState<'player' | 'dealer' | 'tie' | 'none'>('none');
    const [splitHandWinner, setSplitHandWinner] = React.useState<'player' | 'dealer' | 'tie' | 'none'>('none');

    const [activeHand, setActiveHand] = React.useState<'main' | 'split'>('main');
    const [isBlackjack, setIsBlackjack] = React.useState<boolean>(false);


    const [playerHand, setPlayerHand] = React.useState<Cards>([])
    const [playerScore, setPlayerScore] = React.useState<number>(0)
    const [playerSplitPossible, setPlayerSplitPossible] = React.useState<boolean>(false)
    const [playerBust, setPlayerBust] = React.useState<boolean>(false)

    const [playerHand2, setPlayerHand2] = React.useState<Cards>([]);
    const [isSplit, setIsSplit] = React.useState<boolean>(false);
    const [playerScore2, setPlayerScore2] = React.useState<number>(0);
    const [playerBust2, setPlayerBust2] = React.useState<boolean>(false);


    const [dealerHand, setDealerHand] = React.useState<Cards>([])
    const [dealerScore, setDealerScore] = React.useState<number>(0)
    const [dealerBust, setDealerBust] = React.useState<boolean>(false)

    //Stats
    const [gamesPlayed, setGamesPlayed] = React.useState<number>(0);
    const [rightDecisions, setRightDecisions] = React.useState<number>(0);
    const [wrongDecisions, setWrongDecisions] = React.useState<number>(0);
    const [wins, setWins] = React.useState<number>(0);
    const [losses, setLosses] = React.useState<number>(0);
    const [pushes, setPushes] = React.useState<number>(0);
    const [blackjacks, setBlackjacks] = React.useState<number>(0);
    const [playerRating, setPlayerRating] = React.useState<number>(0);




    async function startGame() {
        setPlayerHand([])
        setDealerHand([])
        setPlayerHand2([])


        setMainHandWinner('none');
        setSplitHandWinner('none');
        setWinner('none');



        setIngame(true);
        setPlayerBust(false)
        setDealerBust(false)
        setTurn('player')
        setPlayerSplitPossible(false)
        setIsSplit(false)

        setPlayerBust2(false)
        setPlayerScore2(0)
        setActiveHand('main');

        setStarted(true);
        setIsBlackjack(false);




        let newdealerhand = game.dealCards(1);
        setDealerHand(newdealerhand);
        let newplayerhand = game.dealCards(2);
        setPlayerHand(newplayerhand);



        // Check for blackjack
        if (game.getHandValue(newplayerhand) == 21) {
            setWinner('player');
            setIngame(false);
            setGamesPlayed(gamesPlayed + 1);
            setWins(wins + 1);
            setBlackjacks(blackjacks + 1);
            setIsBlackjack(true);
        }

        //check for split
        if (game.getCardValue(newplayerhand[0].value) == game.getCardValue(newplayerhand[1].value)) {
            setPlayerSplitPossible(true);
        }
    }

    async function hit(hand: 'main' | 'split') {
        let newhand: Cards = [];

        if (hand === 'main') {
            newhand = playerHand.concat(game.dealCards(1));
            setPlayerHand(newhand);
            if (game.getHandValue(newhand) > 21) {
                setPlayerBust(true);
                setMainHandWinner('dealer');
                // If there's no split or the split hand is already finished, end the game
                if (!isSplit || (isSplit && activeHand === 'split')) {
                    setIngame(false);
                    setGamesPlayed(gamesPlayed + 1);
                    setLosses(losses + 1);
                } else {
                    // If it's a split and the main hand busts, switch to the split hand
                    setActiveHand('split');
                }
            }
        } else if (hand === 'split') {
            newhand = playerHand2.concat(game.dealCards(1));
            setPlayerHand2(newhand);
            if (game.getHandValue(newhand) > 21) {
                setPlayerBust2(true);
                setSplitHandWinner('dealer');
                // End the game since it's the last action in a split
                setIngame(false);
                setGamesPlayed(gamesPlayed + 1);
                setLosses(losses + 1);
            }
        }

        const playerAction = 'hit';
        const dealerUpCard = dealerHand[0];
        const currentHand = hand === 'main' ? playerHand : playerHand2;
        const strategyResult = checkStrategy(currentHand, dealerUpCard, playerAction);

        if (strategyResult === 'right') {
            setRightDecisions(rightDecisions + 1);
        } else if (strategyResult === 'wrong') {
            setWrongDecisions(wrongDecisions + 1);
        }
    }





    async function stand() {
        const playerAction = 'stand';
        const dealerUpCard = dealerHand[0]; // Assuming the first card is the dealer's up card.
        const currentHand = activeHand === 'main' ? playerHand : playerHand2;
        const strategyResult = checkStrategy(currentHand, dealerUpCard, playerAction);

        if (strategyResult === 'right') {
            setRightDecisions(rightDecisions + 1);
        } else if (strategyResult === 'wrong') {
            setWrongDecisions(wrongDecisions + 1);
        }

        if (activeHand === 'main') {
            if (isSplit) {
                setActiveHand('split'); // Switch to the split hand
            } else {
                await resolveDealerTurn();
            }
        } else {
            // Player has stood on the split hand
            await resolveDealerTurn();
            setTurn('dealer');
        }
    }

    async function resolveDealerTurn() {
        setTurn('dealer');
        let currentDealerHand = [...dealerHand];

        while (game.getHandValue(currentDealerHand) < 17) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentDealerHand = currentDealerHand.concat(game.dealCards(1));
            setDealerHand(currentDealerHand);

            if (game.getHandValue(currentDealerHand) > 21) {
                setDealerBust(true);
                if (!playerBust) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    setMainHandWinner('player');
                    setWins(wins + 1);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    setMainHandWinner('dealer');
                    setLosses(losses + 1);
                }
                // Compare split hand if a split occurred and hand not busted
                if (isSplit && !playerBust2) {
                    if (playerScore2 > dealerScore) {
                        setSplitHandWinner('player');
                    } else if (dealerScore > playerScore2) {
                        setSplitHandWinner('dealer');
                    } else {
                        setSplitHandWinner('tie');
                    }
                }
                setIngame(false);
                return;
            }
        }



        // If dealer did not bust, compare hands to determine winner
        if (!playerBust) {
            if (game.getHandValue(currentDealerHand) > game.getHandValue(playerHand)) {
                setMainHandWinner('dealer');
                setLosses(losses + 1);
            } else if (game.getHandValue(currentDealerHand) < game.getHandValue(playerHand)) {
                setMainHandWinner('player');
                setWins(wins + 1);
            } else {
                setMainHandWinner('tie');
                setPushes(pushes + 1);
            }
        } else {
            setMainHandWinner('dealer');
            setLosses(losses + 1);
        }

        if (isSplit) {
            if (!playerBust2) {
                if (game.getHandValue(currentDealerHand) > game.getHandValue(playerHand2)) {
                    setSplitHandWinner('dealer');
                    setLosses(losses + 1);
                } else if (game.getHandValue(currentDealerHand) < game.getHandValue(playerHand2)) {
                    setSplitHandWinner('player');
                    setWins(wins + 1);
                } else {
                    setSplitHandWinner('tie');
                    setPushes(pushes + 1);
                }
            } else {
                setSplitHandWinner('dealer');
                setLosses(losses + 1);
            }
        }

        setIngame(false);
    }




    async function double() {
        const newhand = playerHand.concat(game.dealCards(1))
        if (!isSplit) {
            setPlayerHand(newhand);
            setTurn('dealer');
        } else {
            if (activeHand === 'main') {
                const newhand = playerHand.concat(game.dealCards(1))
                setPlayerHand(newhand);
                setActiveHand('split');
            } else {
                const newhand = playerHand2.concat(game.dealCards(1))
                setPlayerHand2(newhand);
                setTurn('dealer');
            }
        }



        const playerAction = 'double';
        const dealerUpCard = dealerHand[0]; // Assuming the first card is the dealer's up card.
        const strategyResult = checkStrategy(playerHand, dealerUpCard, playerAction);

        if (strategyResult === 'right') {
            setRightDecisions((prev) => prev + 1);
        } else if (strategyResult === 'wrong') {
            setWrongDecisions((prev) => prev + 1);
        }



        if (game.getHandValue(newhand) > 21) {
            setPlayerBust(true);
            setWinner('dealer');
            setIngame(false);
            setGamesPlayed(gamesPlayed + 1);
            setLosses(losses + 1);
        }

        // Dealer's turn
        stand();
    }

    async function split() {
        setPlayerSplitPossible(false);
        if (playerHand.length === 2 && game.getCardValue(playerHand[0].value) === game.getCardValue(playerHand[1].value)) {
            setIsSplit(true);
            setPlayerHand([playerHand[0], ...game.dealCards(1)]);
            setPlayerHand2([playerHand[1], ...game.dealCards(1)]);
            setActiveHand('main'); // Start with the main hand
        }

    }



    React.useEffect(() => {
        setPlayerScore(game.getHandValue(playerHand));

        if (game.getHandValue(playerHand) > 21) {
            setPlayerBust(true);
            setWinner('dealer');
            setIngame(false);
            setGamesPlayed(gamesPlayed + 1);
            setLosses(losses + 1);
        }
    }, [playerHand])

    React.useEffect(() => {
        setDealerScore(game.getHandValue(dealerHand));
    }, [dealerHand])

    React.useEffect(() => {
        if (isSplit) {
            setPlayerScore(game.getHandValue(playerHand));
            setPlayerScore2(game.getHandValue(playerHand2));
        }
    }, [playerHand, playerHand2, isSplit]);


    React.useEffect(() => {
        if (playerScore == 21 && !isSplit && !isBlackjack) {
            setTurn('dealer');
            stand();
        } else if (playerScore2 == 21 && isSplit && !isBlackjack) {
            setTurn('dealer');
            stand();
        }
    }, [playerScore, isSplit, playerScore2]);



    function checkStrategy(playerHand: Cards, dealerUpCard: Card, playerAction: string): string {
        // Assume the dealerUpCard is already a numeric value. If it's 'A', it should be handled as 11,
        // and for face cards ('J', 'Q', 'K'), it should be 10.
        const dealerValue = game.getCardValue(dealerUpCard.value);
        const playerTotal = game.getHandValue(playerHand);
        const playerHasSoftHand = playerHand.some(card => card.value === 'A') && playerTotal <= 21;
        const playerHasPair = playerHand.length === 2 && game.getCardValue(playerHand[0].value) === game.getCardValue(playerHand[1].value);

        // Handle soft totals
        if (playerHasSoftHand) {
            // Implement soft total strategy check here...
            // E.g., if playerTotal includes an Ace and a 6 (soft 17) and dealerValue is between 3 and 6, best action is 'double' if allowed.
            if (playerTotal === 17 && dealerValue >= 3 && dealerValue <= 6) {
                return playerAction === 'double' ? 'right' : 'wrong';
            }
            // More conditions for soft totals...
        }

        // Handle pair splitting
        if (playerHasPair) {
            // Implement pair splitting strategy check here...
            // E.g., if player has a pair of 8s, splitting is always the best action.
            if (game.getCardValue(playerHand[0].value) === 8) {
                return playerAction === 'split' ? 'right' : 'wrong';
            }
            // More conditions for pair splitting...
        }

        // Handle hard totals
        if (!playerHasSoftHand) {
            // Implement hard total strategy check here...
            // E.g., if playerTotal is 16 and dealerValue is 10, best action is 'stand'.
            if (playerTotal === 16 && dealerValue === 10) {
                return playerAction === 'stand' ? 'right' : 'wrong';
            }
            // More conditions for hard totals...
        }

        // If the situation isn't covered by the strategy chart or we haven't implemented the logic for it yet.
        return 'N/A';
    }

    function calculateHandValues(hand: Cards) {
        const total = game.getHandValue(hand); // Use your existing function
        const hasAce = hand.some(card => card.value === 'A');
        const isSoftHand = hasAce && total <= 21 && hand.length === 2;
    
        if (isSoftHand && total != 21) {
            // Display as "X / Y" only for soft hands (Ace counted as 1 or 11)
            return `${total - 10} / ${total}`;
        } else {
            // Otherwise, display the single total value
            return `${total}`;
        }
    }
    


    return (
        <>
            <div className='gameField'>
                <h1>Blackjack Trainer</h1>
                {isBlackjack && <div className='winnerModal'><span>Blackjack!</span></div>}

                {!isSplit && (mainHandWinner === "player") && !isBlackjack && <div className='winnerModal'><span>You won!</span></div>}
                {!isSplit && (mainHandWinner === 'dealer') && <div className='winnerModal'><span>You lost!</span></div>}
                {!isSplit && (mainHandWinner === 'tie') && <div className='winnerModal'><span>It's a push!</span></div>}
                {isSplit && <>
                    {(mainHandWinner === "player") && (splitHandWinner === "player") && <div className='winnerModal'><span>You have won both hands!</span></div>}
                    {(mainHandWinner === "dealer") && (splitHandWinner === "dealer") && <div className='winnerModal'><span>You have lost both hands!</span></div>}
                    {(mainHandWinner === "tie") && (splitHandWinner === "tie") && <div className='winnerModal'><span>You pushed both hands!</span></div>}

                    {(mainHandWinner === "player") && (splitHandWinner === "dealer") && <div className='winnerModal'><span>Main hand: You won!<br />Split hand: You lost!</span></div>}
                    {(mainHandWinner === "dealer") && (splitHandWinner === "player") && <div className='winnerModal'><span>Main hand: You lost!<br />Split hand: You won!</span></div>}
                    {(mainHandWinner === "tie") && (splitHandWinner === "player") && <div className='winnerModal'><span>Main hand: It's a push!<br />Split hand: You won!</span></div>}
                    {(mainHandWinner === "player") && (splitHandWinner === "tie") && <div className='winnerModal'><span>Main hand: You won!<br />Split hand: It's a push!</span></div>}
                    {(mainHandWinner === "dealer") && (splitHandWinner === "tie") && <div className='winnerModal'><span>Main hand: You lost!<br />Split hand: It's a push!</span></div>}
                    {(mainHandWinner === "tie") && (splitHandWinner === "dealer") && <div className='winnerModal'><span>Main hand: It's a push!<br />Split hand: You lost!</span></div>}
                </>}



                {started && <>
                    <div className="dealer">
                        <h2>Dealer</h2>
                        <div className="dealerCards">
                            {dealerHand.map((card: Card, index: number) => {
                                return <PlayingCard card={card} key={card.suit + card.value + index} />
                            })}
                            {dealerHand.length == 1 && <div className="card upsidedown"></div>}
                        </div>
                        <div className="dealerScore">
                            {dealerBust ? "BUST" : <>Score: {calculateHandValues(dealerHand)}</>}
                        </div>
                    </div>
                    <div className="player">
                        <h2>Your Cards</h2>
                        <div className="playerCards">
                            <div className={activeHand == "main" ? "playerCardsMain active" : "playerCardsMain"}>
                                <div className="playerDeck">
                                    {playerHand.map((card: Card, index: number) => {
                                        return <PlayingCard card={card} key={card.suit + card.value + index} />
                                    })}
                                </div>
                                <div className="playerScore">
                                    {playerBust ? "BUST" : <>Score: {calculateHandValues(playerHand)}</>}
                                </div>
                            </div>
                            {isSplit && <div className={activeHand == "split" ? "playerCardsSplit active" : "playerCardsSplit"}>
                                <div className="playerDeckSplit">
                                    {playerHand2.map((card: Card, index: number) => {
                                        return <PlayingCard card={card} key={card.suit + card.value + index} />
                                    })}
                                </div>
                                <div className="playerScore">
                                    {playerBust2 ? "BUST" : <>Score: {calculateHandValues(playerHand2)}</>}
                                </div>

                            </div>}
                        </div>
                    </div>
                </>
                }


            </div>


            <div className="gameControls">
                {
                    !ingame ? <button onClick={startGame}><GiPokerHand /> Deal Cards</button> :
                        <>
                            {(turn === "player") && <>
                                {/* Render the "Double" button only if the player has exactly two cards in the hand */}
                                {((activeHand === "main" && playerHand.length === 2 && !playerBust) || (activeHand === "split" && playerHand2.length === 2 && !playerBust2)) && <button onClick={double}><TbIcons.TbHandTwoFingers />Double</button>}


                                <button onClick={() => hit(activeHand)}><TbIcons.TbHandFinger />Hit</button>
                                <button onClick={stand}><TbIcons.TbHandFingerOff />Stand</button>
                                {playerSplitPossible && <button onClick={split}><TbIcons.TbHandTwoFingers /><TbIcons.TbHandTwoFingers />Split</button>}
                            </>
                            }
                        </>
                }
            </div>


            <div className="playerStats">
                <h2>Player Stats</h2>

                <span>Games Played: {gamesPlayed}</span>

                <span>Right Decisions: {rightDecisions}</span>
                <span>Wrong Decisions: {wrongDecisions}</span>

                <span>Hands won: {wins}</span>
                <span>Hands lost: {losses}</span>
                <span>Hands pushed: {pushes}</span>
                <span>Blackjacks: {blackjacks}</span>

                <span>Winrate: {(wins || losses) ? Math.round((wins / (wins + losses) * 100)) : 0} %</span>
                <span>Player Rating: {playerRating}</span>


            </div>
        </>
    );
}
