const getCounts = (ballots) => {
  return ballots.reduce((accum, ballot) => {
    const name = ballot[0];
    const count = accum[name] || 0;
    return Object.assign({}, accum, {[name]: count + 1});
  }, {});
};

const getLeader = (ballots) => {
  const counts = getCounts(ballots);
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
        winners.push(getWinner([
          ...ballots.slice(0, index),
          ballot.slice(1),
          ...ballots.slice(index + 1)
        ]));
      }
      return winners.reduce((accum, w) => {
        if (!accum || w.received > (accum.received || -Infinity)) {
          return w;
        } else if (w.received === accum.received) {
          if (accum.received !== w.received) {
            throw new Error('hmm, ties with different counts received. is this possible?');
          }
          return Object.assign({}, accum, {
            winner: [...new Set([...accum.winner, ...w.winner])]
          });
        }
        return accum;
      }, void 0);
    }).filter(a => !!a);

    if (winner.length === 1) {
      return winner[0];
    } else if (winner.length > 1) {
      return winner.reduce((accum, w) => {
        if (accum.received !== w.received) {
          throw new Error('hmm, ties with different counts received. is this possible?');
        }
        return Object.assign({}, accum, {
          winner: [...new Set([...accum.winner, ...w.winner])]
        });
      });
    } else {
      throw new Error('must be a winner so missing backup logic..');
    }
    /*
    ballots.forEach((ballot, index) => {
      if (ballot.length === 1) {
        return getWinner([
          ...ballots.slice(0, index),
          ...ballots.slice(index + 1)
        ]);
      }
    });
    */
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
