const intersection = (a, b) => a.some(n => b.indexOf(n) >= 0);
// const intersection = (a, b) => new Set([...a, ...b]).size !== [...a, ...b].length;

const getCounts = ballots => {
  return ballots.reduce((accum, ballot) => {
    const name = ballot[0];
    const count = accum[name] || 0;
    return Object.assign({}, accum, { [name]: count + 1 });
  }, {});
};

// Input:
//  - counts: obj { [name]: count }
const getLeadersFromCounts = counts => {
  return Object.keys(counts).reduce((accum, name) => {
    const count = counts[name];
    if (count > (accum.count || -Infinity)) {
      return { names: [name], count };
    } else if (count === accum.count) {
      return { names: [...accum.names, name], count };
    }
    return accum;
  }, {});
};

// Returns leader object with winner(s) in leader.names array
// If there is more than one name, it was a tie, in the
// strict (literal, traditional) sense
const getLeader = ballots => {
  const counts = getCounts(ballots);
  return getLeadersFromCounts(counts);
};

// Consolates many winner objects into any array of as few as possible
const handleWinnersReducer = (accum, w) => {
  const leadingNumber = accum.length ? accum[0].received || 0 : 0;
  let newAccum = [];
  if (w.received === leadingNumber) {
    w.names.forEach(name => {
      const index = accum.findIndex(x => x.names[0] === name);
      if (index >= 0) {
        const item = accum[index];
        if (w.condition) {
          if (item.condition === false) {
            newAccum.push(item);
          } else {
            newAccum.push(
              Object.assign({}, item, {
                condition: [
                  ...new Set([...(item.condition || []), ...w.condition])
                ]
              })
            );
          }
        } else {
          newAccum.push(
            Object.assign({}, item, {
              condition: false
            })
          );
        }
        newAccum.push(...accum.filter((x, i) => i !== index));
      } else {
        newAccum.push(...accum);
        newAccum.push(
          Object.assign({}, w, {
            names: [name],
            condition: w.condition || false
          })
        );
      }
    });
    return newAccum;
  } else if (w.received > leadingNumber) {
    return w.names.map(name => {
      return Object.assign({}, w, {
        names: [name],
        condition: w.condition || false
      });
    });
  } else {
    return accum;
  }
};

const simpleHandleWinnersReducer = (accum, w) => {
  if (w.received === accum.received) {
    return Object.assign({}, accum, {
      names: [...new Set([...accum.names, ...w.names])]
    });
  } else if (w.received > accum.received) {
    return w;
  } else {
    return accum;
  }
};

// Handles "condition" property
// todo: what about chained dependency? eg, trump on carson, carson on bush
const ensureCanWin = (r, i, arr) => {
  const s = Object.assign({}, r, {
    names: r.names.filter(x => {
      return (
        !r.condition ||
        !r.condition.length ||
        r.condition
          // todo: is this still needed? have i shifted to one winner per
          // obj. Is this shift complete?
          .filter(y => y.candidate.indexOf(x) >= 0)
          .some(y => arr.filter(z => z.names.indexOf(y.onlyIf) >= 0).length)
      );
    })
  });
  if (!s.names.length) {
    return void 0;
  }
  delete s.condition;
  return s;
};

const getTrueWinners = winnerObjs => {
  const reducedWinnerObjs = winnerObjs.reduce(handleWinnersReducer, []);
  return reducedWinnerObjs.map(ensureCanWin).filter(Boolean);
};

const getWinner = ballots => {
  const leader = getLeader(ballots);

  // If no ballots, fail
  if (!ballots.length) {
    return {
      success: false,
      reason: 'no ballets'
    };
  } else if (
    leader.count > ballots.length / 2 ||
    ballots.filter(b => b.length > 1).length === 0
  ) {
    // If outright winner, return winner object
    // If tie, handled in the else traversal
    return {
      success: true,
      names: leader.names,
      received: leader.count
    };
  } else {
    // If no outright winner, recursively traverse to seek one
    const winners = ballots
      .map((ballot, index) => {
        const iterationWinners = [];
        // If current state has a tie, return it as part of the finding process
        // why not `leader.count === ballots.length / leader.names.length` ?
        if (leader.count === ballots.length / 2) {
          iterationWinners.push({
            success: true,
            names: leader.names,
            received: leader.count
          });
        }
        if (ballot.length !== 1) {
          // Current leader is not at top of ballot's names
          if (leader.names.indexOf(ballot[0]) === -1) {
            iterationWinners.push(
              getWinner([
                ...ballots.slice(0, index),
                ballot.slice(1),
                ...ballots.slice(index + 1)
              ])
            );
          } else if (intersection(ballot.slice(1), leader.names)) {
            // Current leader is at top, but a tied leader is also under it
            // Allow fallbacks to be considered (but never at cost to the candidate)
            // to protect against splitting the vote
            const maybeWinner = getWinner([
              ...ballots.slice(0, index),
              ballot.slice(1).filter(n => leader.names.indexOf(n) >= 0),
              ...ballots.slice(index + 1)
            ]);
            maybeWinner.condition = [
              {
                candidate: maybeWinner.names,
                onlyIf: ballot[0]
              }
            ];
            iterationWinners.push(maybeWinner);
          }
        }
        return (
          iterationWinners.length > 0 &&
          iterationWinners.reduce(simpleHandleWinnersReducer)
        );
      })
      .filter(Boolean);

    if (winners.length > 0) {
      const validatedWinners = getTrueWinners(winners);
      if (validatedWinners.length) {
        return validatedWinners.reduce(simpleHandleWinnersReducer);
      }
    }
    return {
      success: true,
      names: leader.names,
      received: leader.count
    };
  }
};

// being attentive of ties in which one candidate
// has more votes relative to another candidate.
// Accepts array of winner objects, and ballots.
// Returns single winner object
// a, a, a, a, (b, c), (b, c), (b, c), (c, b), (c, b) ==> b alone
// a, a, (b, c), (c, b) ==> a, b, c
const ensureOnlyTrueWinnersGivenTies = (winnerObj, ballots) => {
  const winners = [];

  // If anyone is not behind another winning candidate at all,
  // they are safe (pass on clear and free to winners list)
  const counts = ballots.reduce((accum, ballot) => {
    // Find first winner on a ballot
    const winner = ballot.find(name => winnerObj.names.indexOf(name) >= 0);
    if (!winner) {
      // If no winner, a losers ballot, continue on
      return accum;
    }
    return Object.assign({}, accum, { [winner]: (accum[winner] || 0) + 1 });
  }, {});
  // If anyone has the votes clear and free, they get added
  winners.push(
    ...Object.keys(counts).filter(name => {
      return counts[name] >= winnerObj.received;
    })
  );

  // After that, whoever has (or is tied with) the most first place votes
  // is added
  const highest = Object.keys(counts).reduce((high, name) => {
    return high > counts[name] || counts[name] === winnerObj.received
      ? high
      : counts[name];
  }, 0);
  winners.push(
    ...Object.keys(counts).filter(name => {
      return counts[name] >= highest;
    })
  );

  return Object.assign({}, winnerObj, { names: [...new Set(winners)] });
};

const main = ballots => {
  let result = getWinner(ballots);
  result = ensureOnlyTrueWinnersGivenTies(result, ballots);
  result.total = ballots.length;
  result.names = result.names.slice().sort();
  if (result.success) {
    result.percentage = +(result.received / result.total * 100).toFixed(2);
  }
  return result;
};

module.exports.getWinner = main;
module.exports.getLeader = getLeader;
