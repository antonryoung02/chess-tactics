# chess-tactics

chess-tactics is a tactic detection library that returns verbose tactic descriptions given a position and an engine move continuation.

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
const tactics = new ChessTactics(["fork", "pin", "skewer", "trap"]);
const context = {
    position: "8/4r1k1/8/8/8/2PPN3/1PK5/8 w - - 0 1",
    evaluation: {
        sequence: "e3f5 g7f6 f5e7 f6e6 c2b3 e6d6 b3c4",
    },
};
const tactic = tactics.classify(context); // [{type:"fork", ... }]
```

## API Reference

### `ChessTactics`

#### `constructor(tacticKeys?:` [`TacticKey[]`](#tactickey) `)`

Creates a new instance of the tactics classifier.

-   **`tacticKeys`** (optional): An array of which tactics to include. Defaults to all available tactics
-   **Returns**: An instance of `ChessTactics`.

---

#### `.classify(context:TacticContext, options:TacticOptions?)`

Analyzes a board position and the sequence of moves to determine if a specific tactic has occurred.

-   **`context`** (TacticContext): An object containing the position & evaluation
-   **`options`** (TacticOptions): An object to set class behavior
-   **Returns**: [`Tactic[]`](#tactic).

---

## Type Definitions

### `TacticContext`

The data required for the engine to perform analysis. This is a discriminated union.

| Type                              | Description                                                                             |
| :-------------------------------- | :-------------------------------------------------------------------------------------- |
| `DefaultTacticContext`            | Standard analysis requiring only the current position and evaluation.                   |
| `PositionComparisonTacticContext` | Compares the current state against the previous move. Required for tactic key `hanging` |

#### `DefaultTacticContext`

-   **`position`**: `Fen` (String)
-   **`evaluation`**: [`Evaluation`](#evaluation)

#### `PositionComparisonTacticContext`

Extends `DefaultTacticContext` with:

-   **`prevEvaluation`**: [`Evaluation`](#evaluation)
-   **`prevMove`**: `Move`
-   **`prevPosition`**: `Fen`

---

### `Evaluation`

<a id="evaluation"></a>

The engine evaluation of the position. This is a union type consisting of the following structures:

| Type             | Structure                                                                                          |
| :--------------- | :------------------------------------------------------------------------------------------------- |
| `UciEvaluation`  | `{ sequence: string OR string[] OR Move[] }`                                                       |
| `MoveEvaluation` | `{ move: string OR { from: string; to: string } OR Move, followup: string OR string[] OR Move[] }` |

---

### `TacticOptions`

<a id="tacticoptions"></a>

-   **`trimEndSequence`** (boolean): default: true. Set false only if the context's evaluation sequence/followup is guaranteed to end in a resolved state (ie sequences are provided by a puzzle)

---

### `TacticKey`

<a id="tactickey"></a>
Supported tactical patterns:
`"fork"` | `"pin"` | `"skewer"` | `"sacrifice"` | `"trap"` | `"hanging"`

### `Tactic`

<a id="tactic"></a>
The final object returned by the classification engine. It contains the identified tactical theme along with the board state changes.

| Property         | Type                      | Description                                                               |
| :--------------- | :------------------------ | :------------------------------------------------------------------------ |
| `type`           | [`TacticKey`](#tactickey) | The category of tactic (e.g., fork, pin).                                 |
| `description`    | `string`                  | A human-readable summary of the tactic.                                   |
| `attackingMove`  | `Move`                    | The specific move that initiates the tactic.                              |
| `attackedPieces` | `Array`                   | List of `{ square: Square; piece: Piece }` targeted by the attackingMove. |
| `sequence`       | `string[]`                | The array of moves consisting of the entire tactical sequence.            |
| `startPosition`  | `Fen`                     | The FEN string of the position before the sequence.                       |
| `endPosition`    | `Fen`                     | The FEN string of the position after the sequence.                        |
| `materialChange` | `number`                  | The net material difference (e.g., `3` or `-5`).                          |

---

### External Types (chess.js)

<a id="chessjs-types"></a>
This library accepts and returns types from [chess.js](https://github.com/jhlywa/chess.js) for board representation:

**`Square`**: A string literal representing a square on the board (e.g., `'a1'`, `'h8'`).

**`Piece`**: An object containing `{ type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b' }`.

**`Move`**: A verbose move object containing `from`, `to`, `promotion`, and `san`

### Dependencies

`chess.js: ^1.4.0`
