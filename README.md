# chess-tactics

#### Identify chess tactics using a FEN string and a uci engine evaluation

Supported Tactics:

-   Fork
-   Pin
-   Skewer
-   Sacrifice
-   Trapped Piece
-   Hanging Piece

## Example Usage

```typescript
const tactics = new ChessTactics(["fork", "pin", "skewer"]);
const context = {
    position: "8/4r1k1/8/8/8/2PPN3/1PK5/8 w - - 0 1",
    evaluation: {
        move: { from: "e3", to: "f5" },
        followup: "g7f6 f5e7 f6e6 c2b3 e6d6 b3c4 d6e7 c4d5",
    },
};
const tactic = tactics.classify(context); // Fork
```

## API

### Dependencies

`chess.js: ^1.4.0`
