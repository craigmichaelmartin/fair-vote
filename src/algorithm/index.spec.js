const getWinner = require('./index').getWinner;


describe('Ties:', () => {

  describe('simple tie (backward compatible with standard voting methodology)', () => {
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['cruz'],
      ])).toEqual({
        success: true,
        names: ['cruz', 'rubio'],
        received: 1,
        total: 2,
        percentage: 50.00
      });
    });
    test('2', () => {
      expect(getWinner([
        ['rubio'],
        ['cruz'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'cruz', 'rubio'],
        received: 1,
        total: 3,
        percentage: 33.33
      });
    });
  });

  describe('fallback vote doesn\'t mistakenly get the vote for the tie', () => {
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['cruz'],
        ['clinton', 'bush']
      ])).toEqual({
        success: true,
        names: ['clinton', 'cruz', 'rubio'],
        received: 1,
        total: 3,
        percentage: 33.33
      });
    });
  });

  describe('advanced sequence', () => {
    // THIS TEST AND THE NEXT TOGETHER SHOW LIMITS

    // A fallback vote should not cost your candidate their chance to win (tie)
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['cruz'],
        ['clinton', 'cruz']
      ])).toEqual({
        success: true,
        names: ['clinton', 'cruz', 'rubio'],
        received: 1,
        total: 3,
        percentage: 33.33
      });
    });

    // Geeze.
    // Three way tie??
    // {"percentage": 33.33, "received": 1, "success": true, "total": 3, "winner": ["rubio", "cruz", "clinton"]}
    // or cruz/rubio win??
    // {"percentage": 66.67, "received": 2, "success": true, "total": 3, "winner": ["cruz", "rubio"]}
    // THOUGHT
    // I think rubio / cruz should win
    // Especially look at the next expect testcase
    // OLD THOUGHT
    // -- I think three way tie.
    // -- "A fallback vote shouldn't cost your candidate their chance of winning"
    // -- True, but each ballot must distill to exactly one vote.
    // -- The fallback vote doesn't cost the candidate, still wins (ties).
    // -- This is, though, the closest this methodology comes to reneging on "never splits the vote"
    // -- It doesn't though. Their candidate still wins (via tie) but allows another to also win.
    test('2', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['cruz', 'rubio'],
        received: 2,
        total: 3,
        percentage: 66.67
      });
    });


    test('3', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'cruz', 'rubio'],
        received: 2,
        total: 4,
        percentage: 50.00
      });
    });

    // Not Cruz
    test('4.0', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 3,
        total: 6,
        percentage: 50.00
      });
    });
    // Not Cruz (again)
    test('4.1', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton'],
        ['sanders', 'clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 3,
        total: 6,
        percentage: 50.00
      });
    });
    // Not Cruz (again)
    test('4.2', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton'],
        ['clinton', 'cruz']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 3,
        total: 6,
        percentage: 50.00
      });
    });
    // Not Cruz (again)
    test('4.3', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['rubio', 'cruz'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton'],
        ['clinton', 'rubio']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 3,
        total: 6,
        percentage: 50.00
      });
    });

    test('5', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['cruz', 'clinton'],
        ['clinton', 'rubio'],
      ])).toEqual({
        success: true,
        names: ['clinton', 'cruz', 'rubio'],
        received: 2,
        total: 3,
        percentage: 66.67
      });
    });
  });

  describe('tie showing: not weighted ranks, but true vote', () => {
    // Teachable Example
    // Not weighted ranking. True votes.
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['cruz', 'rubio'],
        ['clinton'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 2,
        total: 4,
        percentage: 50.00
      });
    });
  });

  describe('two way tie handled correctly (not take into account fallback)', () => {
    // Important one. Mistakenly had rubio winning previously.
    // Fallback vote should not cost your candidate their chance to win (tie)
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['rubio'],
        ['cruz', 'rubio'],
        ['cruz'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['cruz', 'rubio'],
        received: 2,
        total: 5,
        percentage: 40.00
      });
    });

    test('2', () => {
      expect(getWinner([
        ['rubio', 'bush'],
        ['rubio', 'bush'],
        ['rubio', 'bush'],
        ['trump', 'bush'],
        ['trump', 'bush'],
        ['trump', 'bush'],
        ['bush'],
      ])).toEqual({
        success: true,
        names: ['rubio', 'trump'],
        received: 3,
        total: 7,
        percentage: 42.86
      });
    });

    test('3', () => {
      expect(getWinner([
        ['rubio', 'bush'],
        ['rubio', 'bush'],
        ['rubio', 'bush'],
        ['trump', 'rubio'],
        ['trump', 'rubio'],
        ['trump', 'rubio'],
        ['bush'],
      ])).toEqual({
        success: true,
        names: ['rubio', 'trump'],
        received: 3,
        total: 7,
        percentage: 42.86
      });
    });
  });

  describe('another', () => {
    // Teachable Example
    // Not weighted ranking (wherein clinton would win). True votes.
    test('1', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['kasich', 'rubio'],
        ['clinton'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['clinton', 'rubio'],
        received: 2,
        total: 4,
        percentage: 50.00
      });
    });
  });
});

describe('Winning:', () => {
  describe('winning with minority (backward compatible with standard voting metholodogy', () => {
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['rubio'],
        ['cruz'],
        ['kasich'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['rubio'],
        received: 2,
        total: 5,
        percentage: 40.00
      });
    });
  });

  describe('winning with majority (backward compatible with standard voting metholodogy', () => {
    test('1', () => {
      expect(getWinner([
        ['rubio'],
        ['rubio'],
        ['rubio'],
        ['kasich'],
        ['clinton']
      ])).toEqual({
        success: true,
        names: ['rubio'],
        received: 3,
        total: 5,
        percentage: 60.00
      });
    });
  });

  describe('successful fallback', () => {
    test('1', () => {
      expect(getWinner([
          ['rubio'],
          ['rubio'],
          ['bush', 'rubio'],
          ['bush', 'rubio'],
          ['bush', 'rubio'],
          ['trump'],
          ['trump'],
          ['trump'],
          ['trump']
      ])).toEqual({
        success: true,
        names: ['rubio'],
        received: 5,
        total: 9,
        percentage: 55.56
      });
    });
  });

  describe('respects order - fallbacks only used from losing votes; MAJORITY', () => {
    // Respecting the order of votes, fallbacks are only used when the
    // vote would otherwise lose (be wasted).
    test('1', () => {
      expect(getWinner([
        ['rubio', 'cruz'],
        ['cruz'],
        ['kasich'],
        ['kasich'],
        ['kasich', 'cruz']
      ])).toEqual({
        success: true,
        names: ['kasich'],
        received: 3,
        total: 5,
        percentage: 60.00
      });
    });

    // Notice: Rubio does not win because fallback
    // choices are only evaulated from the losing voter's choices.
    test('1', () => {
      expect(getWinner([
        ['kasich', 'rubio'],
        ['kasich', 'rubio'],
        ['rubio'],
        ['bush', 'rubio'],
        ['kasich', 'rubio', 'bush'],
        ['trump'],
        ['bush', 'rubio'],
        ['kasich', 'rubio'],
        ['trump'],
        ['kasich', 'rubio', 'bush'],
        ['kasich', 'rubio', 'bush']
      ])).toEqual({
        success: true,
        names: ['kasich'],
        received: 6,
        total: 11,
        percentage: 54.55
      });
    });
  });

  describe('respects order - fallbacks only used from losing votes; EVEN IN MINORITY', () => {
    // Would early flip instead of win if algorithm wrong
    test('1', () => {
      expect(getWinner([
        ['cruz'],
        ['cruz'],
        ['kasich', 'cruz'],
        ['kasich'],
        ['kasich'],
        ['bush'],
        ['bush']
      ])).toEqual({
        success: true,
        names: ['kasich'],
        received: 3,
        total: 7,
        percentage: 42.86
      });
    });

    // Would early flip if algorithm wrong
    test('2', () => {
      expect(getWinner([
        ['cruz'],
        ['cruz'],
        ['kasich', 'cruz'],
        ['kasich'],
        ['kasich'],
        ['bush'],
      ])).toEqual({
        success: true,
        names: ['kasich'],
        received: 3,
        total: 6,
        percentage: 50.00
      });
    });

    // Notice: Rubio does not win because fallback
    // choices are only evaulated from the losing voter's choices.
    // More challenging version of the previous test:
    // Kasich didn't have majority, so it didn't give him the win.
    // For some reason, wants to do {"percentage": 55.56, "received": 5, "success": true, "total": 9, "winner": ["rubio", "bush"]}
    test('3', () => {
      expect(getWinner([
        ['rubio'],
        ['bush', 'rubio'],
        ['kasich', 'rubio', 'bush'],
        ['trump'],
        ['bush', 'rubio'],
        ['kasich', 'rubio'],
        ['trump'],
        ['kasich', 'rubio', 'bush'],
        ['kasich', 'rubio', 'bush']
      ])).toEqual({
        success: true,
        names: ['kasich'],
        received: 4,
        total: 9,
        percentage: 44.44
      });
    });

    // Notice: In the second round, carson was not chosen because fallback
    // choices are only evaluated from the losing voters' choices.
    test('4', () => {
      expect(getWinner([
        ['cruz'],
        ['rubio', 'carson'],
        ['bush', 'cruz'],
        ['bush', 'rubio'],
        ['bush', 'rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'trump'],
        ['carson', 'trump']
      ])).toEqual({
        success: true,
        names: ['trump'],
        received: 6,
        total: 11,
        percentage: 54.55
      });
    });


    // Not a tie
    // This is similiar to the below "Geeze" example's final stage.
    // Unrelated, doesn't end with 100%. Should it? No - losers votes
    // should remain their highest choice? Yes - reconcile the votes
    // to the winner. Show both percentages, I suppose.
    test('5', () => {
      expect(getWinner([
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'trump'],
        ['carson', 'trump']
      ])).toEqual({
        success: true,
        names: ['trump'],
        received: 4,
        total: 6,
        percentage: 66.67
      });
    });
    // Ensures get "trueLeader"
    test('6', () => {
      expect(getWinner([
        ['a'],
        ['a'],
        ['a'],
        ['a'],
        ['a'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'trump'],
        ['carson', 'trump']
      ])).toEqual({
        success: true,
        names: ['trump'],
        received: 6,
        total: 11,
        percentage: 54.55
      });
    });


    // Geeze.
    // Trump is winning in first round with 4.
    // Carson does not beat him because fallbacks only counted from loser.
    // However, Rubio does beat him in the second round (with 5).
    // This could mistakenly "free up" the trump/carson votes to be either
    // order in the quest to try to beat rubio.
    // Trump should win this. Not a Trump/Carson tie.
    //
    // Need logic to figure out who has more higher votes relative to tie
    // candiates (not all)
    test('7', () => {
      expect(getWinner([
        ['rubio'],
        ['rubio', 'carson'],
        ['bush', 'rubio'],
        ['bush', 'rubio'],
        ['bush', 'rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'trump'],
        ['carson', 'trump']
      ])).toEqual({
        success: true,
        names: ['trump'],
        received: 6,
        total: 11,
        percentage: 54.55
      });
    });
  });


  describe('advanced: flips twice', () => {
    // Not a flip twice, just trying to help understand why "1" below is failing
    // Geesh, I suppose "A fallback vote should not cost your candidate their
    // chance to win (tie)". But then it seems like "trump" split "carson"s
    // vote. Or no, because it was successful..
    test('0', () => {
      expect(getWinner([
        ['rubio'],
        ['rubio'],
        ['rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson'],
        ['carson']
      ])).toEqual({
        success: true,
        names: ['rubio', 'trump'],
        received: 3,
        total: 8,
        percentage: 37.50
      });
    });

    // Here, there are not more "carson"s than "trumps", so "carson"
    // is never chosen because "trump" can "win", and so the honor
    // is given to him

    // Thus: below is INCORRECT. Trump can tie rubio and so does.
    // "It's not splitting the vote if you 'win'"
    /*
      rubio    bush    bush    trump   trump   trump   carson    carson
      carson   rubio   rubio   carson  carson  carson  rubio     trump
      -----------------------------------------------------------------

      rubio    bush    bush    TRUMP   TRUMP   TRUMP   carson    carson
      carson   rubio   rubio   carson  carson  carson  rubio     trump

      RUBIO    bush    bush    trump   trump   trump   carson    carson
      carson   RUBIO   RUBIO   carson  carson  carson  RUBIO     trump

      rubio    bush    bush    trump   trump   trump   CARSON    CARSON
      carson   rubio   rubio   CARSON  CARSON  CARSON  rubio     trump

      (Interestingly, Carson doesn't get the vote from the first person,
      since Rubio is the leader at that point)
      Ending ballots would look like:
      [['rubio', 'carson'], ['rubio'], ['rubio'], ['carson'], ['carson'], ['carson'], ['carson', 'rubio'], ['carson', 'trump']]
    */

    // Below is CORRECT:
    /*
      rubio    bush    bush    trump   trump   trump   carson    carson
      carson   rubio   rubio   carson  carson  carson  rubio     trump
      -----------------------------------------------------------------

      rubio    bush    bush    TRUMP   TRUMP   TRUMP   carson    carson
      carson   rubio   rubio   carson  carson  carson  rubio     trump

      RUBIO    bush    bush    trump   trump   trump   carson    carson
      carson   RUBIO   RUBIO   carson  carson  carson  RUBIO     trump

      RUBIO    bush    bush    TRUMP   TRUMP   TRUMP   carson    carson
      carson   RUBIO   RUBIO   carson  carson  carson  RUBIO     TRUMP
    */
    test('1', () => {
      expect(getWinner([
        ['rubio', 'carson'],
        ['bush', 'rubio'],
        ['bush', 'rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'rubio'],
        ['carson', 'trump']
      ])).toEqual({
        success: true,
        names: ['rubio', 'trump'],
        received: 4,
        total: 8,
        percentage: 50.00
        // names: ['carson'],
        // received: 5,
        // total: 8,
        // percentage: 62.50
      });
    });

    test('2', () => {
      expect(getWinner([
        ['rubio', 'carson'],
        ['bush', 'rubio'],
        ['bush', 'rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'rubio'],
        ['carson', 'trump'],
        ['cruz', 'carson']
      ])).toEqual({
        success: true,
        names: ['carson'],
        received: 5, // todo seems like it should be more
        total: 9,
        percentage: 55.56
      });
    });

    test('3', () => {
      expect(getWinner([
        ['rubio', 'carson'],
        ['rubio'],
        ['rubio'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['trump', 'carson'],
        ['carson', 'rubio'],
        ['carson'],
        ['carson'],
      ])).toEqual({
        success: true,
        names: ['carson'],
        received: 5, // todo seems like it should be more
        total: 9,
        percentage: 55.56
      });
    });
  });
});
