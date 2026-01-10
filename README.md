# chess-tactics

chess-tactics is an opinionated tactic detection library that finds a tactic, the pieces involved, and the tactical sequence given a position and its engine evaluation.

Supported Tactics:

-   Fork
-   Pin
-   Skewer
-   Sacrifice
-   Trapped Piece
-   Hanging Piece

## Installation

(npm release in progress)

## Example Usage

```typescript
const chessTactics = new ChessTactics(["fork", "pin", "skewer", "trap"]);
const context = {
    position: "8/4r1k1/8/8/8/2PPN3/1PK5/8 w - - 0 1",
    evaluation: {
        sequence: "e3f5 g7f6 f5e7 f6e6 c2b3 e6d6 b3c4",
    },
};
const tactics = chessTactics.classify(context); // [{type:"fork", ... }]
```

## API Reference

### `ChessTactics`

#### `constructor(tacticKeys?:` [`TacticKey[]`](#tactickey) `)`

Creates a new instance of the tactics classifier.

-   **`tacticKeys`** (optional): An array of which tactics to include. Defaults to all available tactics

---

#### `.classify(context:TacticContext, options:TacticOptions?)`

Analyzes a board position and the sequence of moves to determine if a specific tactic has occurred.

-   **`context`** (TacticContext): An object containing the position & evaluation
-   **`options`** [`TacticOptions`](#tactic-options): An object to modify class behavior
-   **Returns**: [`Tactic[]`](#tactic). An array of tactics found in the position

---

## Type Definitions

### `TacticKey`

<a id="tactickey"></a>
Supported tactical patterns:
`"fork"` | `"pin"` | `"skewer"` | `"sacrifice"` | `"trap"` | `"hanging"`

### `TacticContext`

Context required for the tactic algorithms

| Type                              | Supported Tactic Keys                                   | Description                                                           |
| :-------------------------------- | :------------------------------------------------------ | :-------------------------------------------------------------------- |
| `DefaultTacticContext`            | `fork`, `pin`, `skewer`, `trap`, `sacrifice`            | Standard analysis requiring only the current position and evaluation. |
| `PositionComparisonTacticContext` | `hanging`, `fork`, `pin`, `skewer`, `trap`, `sacrifice` | For tactics that require knowledge of the previous move's state       |

---

#### `DefaultTacticContext`

-   **`position`**: `Fen` (String)
-   **`evaluation`**: [`Evaluation`](#evaluation)

#### `PositionComparisonTacticContext`

-   **`position`**: `Fen` (String)
-   **`evaluation`**: [`Evaluation`](#evaluation)
-   **`prevPosition`**: `Fen`
-   **`prevEvaluation`**: [`Evaluation`](#evaluation)
-   **`prevMove`**: `Move`

---

### `TacticOptions`

Options to modify behavior

<a id="tactic-options"></a>

| Type                | Type                       | Description                                                                                                                                                                                                                                                                                                                  |
| :------------------ | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trimEndSequence`   | `boolean` (default:`True`) | Preprocessing step that if true, trims the end of the evaluation sequence while it contains captures or checks. If you are providing a raw engine string, this should be True to avoid miscalculation of sequence material change. (Ex. Set to false if you provide puzzle evaluations that end at the puzzle's completion). |
| `maxLookaheadMoves` | `number` (default: 5)      | Specifies the maximum number of half-moves (ply) that can contain checks or captures before the tactical move is played. (Ex. If set to zero, a trade preceeding a fork will not be found because the first move is not a forking move)                                                                                      |

### `Evaluation`

<a id="evaluation"></a>

The engine evaluation of a position, separated into a type union for convenience

| Type             | Description                                                                                              |
| :--------------- | :------------------------------------------------------------------------------------------------------- |
| `UciEvaluation`  | Sequence containing the best line in a position                                                          |
| `MoveEvaluation` | Sequence containing the best line in a position where the first move and followup sequence are separated |

---

#### `UciEvaluation`

-   **`sequence`**: `string` | `string[]` | [`Move[]`](#external-types-chessjs)
    -   The evaluation sequence

#### `MoveEvaluation`

-   **`move`**: `string` | `{ from: string; to: string }` | `Move`
    -   The first move in the evaluation sequence.
-   **`followup`**: `string` | `string[]` | [`Move[]`](#external-types-chessjs)
    -   The expected sequence of moves following the initial move.

---

### `Tactic`

<a id="tactic"></a>
The final object returned by the classification engine. It contains the identified tactical theme along with the board state changes.

| Property         | Type                                                        | Description                                                             |
| :--------------- | :---------------------------------------------------------- | :---------------------------------------------------------------------- |
| `type`           | [`TacticKey`](#tactickey)                                   | The category of tactic (e.g., fork, pin).                               |
| `attackedPieces` | [`{piece:Piece, square:Square}[]`](#external-types-chessjs) | The pieces involved on the recieving end of the tactic                  |
| `sequence`       | [`Move[]`](#external-types-chessjs)                         | The array of moves consisting of the entire tactical sequence.          |
| `triggerIndex`   | `number`                                                    | The `sequence` index of the tactical move                               |
| `startPosition`  | `Fen`                                                       | The FEN string of the position before the sequence.                     |
| `endPosition`    | `Fen`                                                       | The FEN string of the position after the sequence.                      |
| `materialChange` | `number`                                                    | The net material gain for the player of the tactic (e.g., `3` or `-5`). |

---

### External Types (chess.js)

<a id="chessjs-types"></a>
This library accepts and returns types from [chess.js](https://github.com/jhlywa/chess.js) for board representation:

**`Square`**: A string representing a square on the board (e.g., `'a1'`, `'h8'`).

**`Piece`**: `{ type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b' }`.

**`Move`**: A move object containing `from`, `to`, `promotion`, and `san`

### Dependencies

`chess.js: ^1.4.0`
