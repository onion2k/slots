import "@styles/hud.css";
import { useSlotsStore } from "@game/state/slotsStore";

export const GameHud = () => {
  const {
    config,
    credits,
    reels,
    isSpinning,
    spin,
    toggleHold,
    releaseAllHolds,
    lastResult
  } = useSlotsStore((state) => ({
    config: state.config,
    credits: state.credits,
    reels: state.reels,
    isSpinning: state.isSpinning,
    spin: state.spin,
    toggleHold: state.toggleHold,
    releaseAllHolds: state.releaseAllHolds,
    lastResult: state.lastResult
  }));

  const canSpin = credits >= config.spinCost && !isSpinning;

  return (
    <div className="hud-root">
      <div className="hud-header">
        <div className="hud-credits">
          <span>Credits</span>
          <strong>{credits}</strong>
          <span>Cost per spin: {config.spinCost}</span>
        </div>
        <div className="hud-actions">
          <button
            type="button"
            className="hud-button hud-button-secondary"
            onClick={releaseAllHolds}
            disabled={isSpinning}
          >
            Release Holds
          </button>
          <button
            type="button"
            className="hud-button hud-button-primary"
            onClick={spin}
            disabled={!canSpin}
          >
            {isSpinning ? "Spinning…" : "Spin"}
          </button>
        </div>
      </div>
      <div className="hud-hold-panel">
        {reels.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            className="hud-hold-button"
            data-active={reel.held}
            disabled={isSpinning}
            onClick={() => toggleHold(reel.id)}
          >
            {reel.held ? "Held" : "Hold"} Reel {index + 1}
          </button>
        ))}
      </div>
      <div className="hud-results">
        <h3>Result</h3>
        {!lastResult ? (
          <span>Press spin to play.</span>
        ) : lastResult.totalPayout > 0 ? (
          <>
            <div className="hud-result-line">
              <span>Total Win</span>
              <strong>{lastResult.totalPayout}</strong>
            </div>
            {lastResult.lines.map((line) => (
              <div className="hud-result-line" key={line.line.id}>
                <span>
                  {line.line.id.toUpperCase()} — {line.symbol.toUpperCase()}
                </span>
                <strong>{line.payout}</strong>
              </div>
            ))}
          </>
        ) : (
          <span>No win this time. Try again!</span>
        )}
      </div>
    </div>
  );
};
