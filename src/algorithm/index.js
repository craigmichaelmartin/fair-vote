const getCounts = (ballots) => {
  return ballots.reduce((accum, ballot) => {
    const name = ballot[0];
    const count = accum[name] || 0;
    return Object.assign({}, accum, {[name]: count + 1});
  }, {});
};

// Input:
//  - counts: obj { [name]: count }
const getLeadersFromCounts = (counts) => {
  return Object.keys(counts).reduce((accum, name) => {
    const count = counts[name];
    if (count > (accum.count || -Infinity)) {
      return { name: [name], count };
    } else if (count === accum.count) {
      return { name: [...accum.name, name], count };
    }
    return accum;
  }, {});
};

// Returns leader object with winner(s) in leader.name array
// If there is more than one name, it was a tie, in the
// strict (literal, traditional) sense
const getLeader = (ballots) => {
  const counts = getCounts(ballots);
  return getLeadersFromCounts(counts);
  // const countsOfWinners = getCountsOfWinners(ballots, leaders);
  // return getLeadersFromCounts(countsOfWinners);
};

const handleWinnersReducer = (accum, w) => {
  if (w.received === accum.received) {
    return Object.assign({}, accum, {
      winner: [...new Set([...accum.winner, ...w.winner])]
    });
  } else if (w.received > accum.received) {
    return w;
  } else {
    return accum;
  }
};

const getTrueWinnersFromWinners = (winners, ballots) => {
  // find "true" winner: who has more higher votes relative to
  // each other (not all))
  const foo = ballots.reduce((accum, ballot) => {
    const name = ballot[0];
    const count = accum[name] || 0;
    if (
      winners.winner.indexOf(name) >= 0
      && ballot.slice(1).some(n => winners.winner.indexOf(n) >= 0)
    ) {
      return Object.assign({}, accum, {[name]: count + 1});
    }
    return accum;
  }, {});
  if (Object.keys(foo).length) {
    const trueWinners = getLeadersFromCounts(foo).name; // we don't care about inner count
    return Object.assign({}, winners, { winner: trueWinners });
  } else {
    return winners;
  }
};

const getWinner = (ballots) => {
  debugger;

  const leader = getLeader(ballots);

  // If no ballots, fail
  if (!ballots.length) {
    return {
      success: false,
      reason: 'no ballets'
    };
  }

  // If winner, return winner object
  // If tie, handled in the else traversal
  else if (
    leader.count > ballots.length / 2 ||
    ballots.filter(b => b.length > 1).length === 0
  ) {
    return {
      success: true,
      winner: leader.name,
      received: leader.count
    };
  }

  // If no winner, recursively traverse to seek one
  else {
    const winner = ballots.map((ballot, index) => {
      const winners = [];
      // If current state has a tie, return it as part of the finding process
      if (leader.count === ballots.length / 2) {
        winners.push({
          success: true,
          winner: leader.name,
          received: leader.count
        });
      }
      if (ballot.length !== 1) {
        // Current leader is not at top of ballot's names
        if (leader.name.indexOf(ballot[0]) === -1) {
          winners.push(getWinner([
            ...ballots.slice(0, index),
            ballot.slice(1),
            ...ballots.slice(index + 1)
          ]));
        // Current leader is at top, but a tied leader is also under it
        } else if (ballot.slice(1).some(n => leader.name.indexOf(n) >= 0)) {
                // new Set([...ballot.slice(1), ...leader.name]).size !== [...ballots.slice(1), ...leader.name].length
                // leader.name.length === ballots.length
          winners.push(getWinner([
            ...ballots.slice(0, index),
            ballot.slice(1).filter(n => leader.name.indexOf(n) >= 0),
            ...ballots.slice(index + 1)
          ]));
        }
      }
      // Don't think I need getTrueWinnersFromWinners since I think all ties
      // will be "strict"/"traditional" at this point.
      return winners.length > 0 && getTrueWinnersFromWinners(
        winners.reduce(handleWinnersReducer),
        ballots
      );
    }).filter(a => !!a);

    if (winner.length > 0) {
      return getTrueWinnersFromWinners(
        winner.reduce(handleWinnersReducer),
        ballots
      );
    } else {
      return {
        success: true,
        winner: leader.name,
        received: leader.count
      };
    }
  }
};

const main = (ballots) => {
  const result = getWinner(ballots);
  result.total = ballots.length;
  if (result.success) {
    result.percentage = +(result.received / result.total * 100).toFixed(2);
  }
  return result;
};

module.exports.getWinner = main;
module.exports.getLeader = getLeader;
