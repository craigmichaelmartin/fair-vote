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

// Consolates many winner objects into any array of as few as possible
const handleWinnersReducer = (accum, w) => {
  // if (w.received === accum.received) {
  //   if (w.received.condition === void 0 && accum.received.condition !== void 0) {
  //     return w;
  //   } else if (w.received.condition !== void 0 && accum.received.condition === void 0) {
  //     return accum;
  //   } else if (w.received.condition === void 0 && accum.received.condition === void 0) {
  //     return Object.assign({}, accum, {
  //       winner: [...new Set([...accum.winner, ...w.winner])]
  //     });
  //   } else {
  //     return Object.assign({}, accum, {
  //       winner: [...new Set([...accum.winner, ...w.winner])],
  //       condition: [...accum.condition, ...w.condition]
  //     });
  //   }
  // }

  // OR,
  // if (w.received === accum.received) {
  //   return Object.assign({}, accum, {
  //     winner: [...new Set([...accum.winner, ...w.winner])],
  //     condition: w.condition && w.condition.length
  //       ? [...(accum.condition || []), ...w.condition]
  //       : void 0
  //   });
  // }

  // debugger;
  const leadingNumber = accum.length ? accum[0].received || 0 : 0;
  let newAccum = [];
  if (w.received === leadingNumber) {
    w.winner.forEach(name => {
      const index = accum.findIndex(x => x.winner[0] === name);
      if (index >= 0) {
        const item = accum[index];
        if (w.condition) {
          if (item.condition === false) {
            newAccum.push(item);
          } else {
            newAccum.push(Object.assign({}, item, {
              condition: [...new Set([...(item.condition || []), ...w.condition])]
            }));
          }
        } else {
          newAccum.push(Object.assign({}, item, {
            condition: false
          }));
        }
        newAccum.push(...accum.filter((x, i) => i !== index));
      } else {
        newAccum.push(...accum);
        newAccum.push(Object.assign({}, w, {
          winner: [name],
          condition: w.condition || false
        }));
      }
    });
    return newAccum;
  } else if (w.received > leadingNumber) {
    return w.winner.map(name => {
      return Object.assign({}, w, {
        winner: [name],
        condition: w.condition || false
      });
    });
  } else {
    return accum;
  }
};

// I think I need to return multiple winner objs up above,
// rather than combining conditions.
// I assumed, the simpler handlerWinnersReducer wouldn't
// need any conditions logic so went to break it out,
// but it appears like it does?
// Wait, why did I think that? It's good on its own, i think...
//
// Or up above, if a candidate has no condition, void out the whole
// condition concept (by setting to false or null) and then don't
// add conditions for it if it is so set...
// but what about two winners who tied, one of which has condition?
// This makes me think i can't reduce to one winner obj, but to an array
// (one for each candidate whose condition logic follows what I just
// described.
// Any that have no condition (or a false/null one) could then be
// reduced into one if desired.

const simpleHandleWinnersReducer = (accum, w) => {
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
    const winner = ballot.find(name => winnerObj.winner.indexOf(name) >= 0);
    if (!winner) {
      // If no winner, a losers ballot, continue on
      return accum;
    }
    return Object.assign({}, accum, {[winner]: (accum[winner] || 0) + 1});
  }, {});
  // If anyone has the votes clear and free, they get added
  winners.push(...Object.keys(counts).filter(name => {
    return counts[name] >= winnerObj.received;
  }));

  // After that, whoever has (or is tied with) the most first place votes
  // is added
  const highest = Object.keys(counts).reduce((high, name) => {
    return (high > counts[name] || counts[name] === winnerObj.received)
      ? high
      : counts[name];
  }, 0);
  winners.push(...Object.keys(counts).filter(name => {
    return counts[name] >= highest;
  }));

  return Object.assign({}, winnerObj, {winner: [...new Set(winners)]});
};

// Handles "condition" property
// todo: what about chained dependency? eg, trump on carson, carson on bush
const ensureCanWin = (r, i, arr) => {
  const s = Object.assign({}, r, {
    winner: r.winner.filter(x => {
      return (
        !r.condition || !r.condition.length ||
        r.condition
          // todo: is this still needed? have i shifted to one winner per
          // obj. Is this shift complete?
          .filter(y => y.candidate.indexOf(x) >= 0)
          .some(y => arr.filter(z => z.winner.indexOf(y.onlyIf) >= 0).length)
      );
    })
  });
  if (!s.winner.length) {
    // console.log('WINNER NOT CHOSE:', r);
    return void 0;
    // debugger;
    // throw new Error('i think i need to recurse on this function if the winner couldnt have won, toss him out and go again?');
  }
  delete s.condition;
  return s;
};

const getTrueWinnerObjFromArrayOfWinnerObjs = (arrayOfWinnerObjs, ballots) => {
  const rawWinnerObjs = arrayOfWinnerObjs.reduce(handleWinnersReducer, []);
  const winnerObjs = rawWinnerObjs.map(ensureCanWin).filter(Boolean);
  if (!winnerObjs.length) {
    // console.log('winner objs', arrayOfWinnerObjs.map(x => JSON.stringify(x)));
    // console.log('ballots', ballots);
  }
  return winnerObjs;
};


const getWinner = (ballots) => {

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
    // debugger;
    // console.log('--------------------------------------------------------');
    const winner = ballots.map((ballot, index) => {
    // debugger;
      const winners = [];
      // If current state has a tie, return it as part of the finding process
      // why not `leader.count === ballots.length / leader.name.length` ?
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
        // Allow fallbacks to be considered (but never at cost to the candidate)
        // to protect against splitting the vote
        } else if (ballot.slice(1).some(n => leader.name.indexOf(n) >= 0)) {
                // new Set([...ballot.slice(1), ...leader.name]).size !== [...ballots.slice(1), ...leader.name].length
                // leader.name.length === ballots.length

          const maybeWinner = getWinner([
            ...ballots.slice(0, index),
            ballot.slice(1).filter(n => leader.name.indexOf(n) >= 0),
            ...ballots.slice(index + 1)
          ]);
          maybeWinner.condition = [{
            candidate: maybeWinner.winner,
            onlyIf: ballot[0],
          }];
          winners.push(maybeWinner);
        }
      }

      // Don't think I need getTrueWinnerObjFromArrayOfWinnerObjs since I think all ties
      // will be "strict"/"traditional" at this point and too early for condition
      // return winners.length > 0 && getTrueWinnerObjFromArrayOfWinnerObjs(winners, ballots);
      return winners.length > 0 && winners.reduce(simpleHandleWinnersReducer);
    }).filter(a => !!a);

    if (winner.length > 0) {
      const maybeWinners = getTrueWinnerObjFromArrayOfWinnerObjs(winner, ballots);
      if (maybeWinners.length) {
        return maybeWinners.reduce(simpleHandleWinnersReducer);
      }
      // Should I be recursing on the other winners here
      // before falling back to returning leader stats?
    }
    return {
      success: true,
      winner: leader.name,
      received: leader.count
    };
  }
};

const main = (ballots) => {
  let result = getWinner(ballots);
  console.log('main result', result);
  debugger;
  result = ensureOnlyTrueWinnersGivenTies(result, ballots);
  result.total = ballots.length;
  if (result.success) {
    result.percentage = +(result.received / result.total * 100).toFixed(2);
  }
  return result;
};

module.exports.getWinner = main;
module.exports.getLeader = getLeader;
