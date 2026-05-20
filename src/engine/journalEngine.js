const journal = [];

export function logTrade(trade, context) {
  const entry = {
    ...trade,
    context,
    timestamp: new Date().toISOString()
  };

  journal.push(entry);
  return entry;
}

export function getJournal() {
  return journal;
}
