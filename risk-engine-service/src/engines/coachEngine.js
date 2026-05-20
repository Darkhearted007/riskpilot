export function generateRiskCoaching({ score, state, alerts, guard }) {
  const coaching = {
    summary: "",
    advice: [],
    warningLevel: "LOW",
  };

  // =========================
  // GLOBAL STATE INTERPRETATION
  // =========================
  if (state === "DANGEROUS") {
    coaching.summary =
      "Your trading behavior is highly unstable. Immediate correction is required.";
    coaching.warningLevel = "CRITICAL";
  } else if (state === "UNSTABLE") {
    coaching.summary =
      "Your trading discipline is weakening. Risk of emotional trading is increasing.";
    coaching.warningLevel = "HIGH";
  } else {
    coaching.summary =
      "Your trading behavior is stable. Keep maintaining discipline.";
    coaching.warningLevel = "LOW";
  }

  // =========================
  // ALERT TRANSLATION
  // =========================
  alerts?.forEach((alert) => {
    switch (alert) {
      case "Overtrading detected (high frequency day)":
        coaching.advice.push(
          "Reduce number of trades. Focus on quality setups instead of frequency."
        );
        break;

      case "Risk too high per trade":
        coaching.advice.push(
          "Lower position size. You are risking too much per trade."
        );
        break;

      case "Dangerous risk exposure":
        coaching.advice.push(
          "You are overexposed. Reduce lot size immediately."
        );
        break;

      case "Revenge trading pattern detected":
        coaching.advice.push(
          "Stop trading after losses. Emotional recovery trading detected."
        );
        break;

      case "Loss chasing behavior detected":
        coaching.advice.push(
          "You are trying to recover losses aggressively. Pause trading."
        );
        break;

      default:
        coaching.advice.push(
          "Maintain discipline and follow your trading plan."
        );
    }
  });

  // =========================
  // GUARD INTEGRATION
  // =========================
  if (guard?.allowTrade === false) {
    coaching.advice.unshift(
      "🚨 TRADING IS BLOCKED — Do not execute any trades right now."
    );
  }

  if (guard?.level === "WARNING") {
    coaching.advice.unshift(
      "⚠ Proceed with caution — market behavior risk detected."
    );
  }

  // =========================
  // FINAL CLEANUP
  // =========================
  coaching.advice = [...new Set(coaching.advice)];

  return coaching;
}
