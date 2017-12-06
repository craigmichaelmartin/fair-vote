const getWinner = require('./index').getWinner;

describe('Ties:', () => {
  test('simple tie (backward compatible with standard voting methodology)', () => {
    expect(getWinner([
      ['rubio'],
      ['cruz'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['rubio', 'cruz', 'clinton'],
      received: 1,
      total: 3,
      percentage: 33.33
    });
  });

  test('more advanced form of a tie', () => {
    // Teachable Example
    // List others are backups, not point earn.
    // Oppositely, listing backups don't weaken the former.
    // Each ballot distills to one equal vote.
    expect(getWinner([
      ['rubio', 'cruz'],
      ['cruz', 'rubio'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['cruz', 'rubio'],
      received: 2,
      total: 3,
      percentage: 66.67
    });
  });

  test('even more advanced form of a tie', () => {
    // Teachable Example
    // Not weighted ranking. True votes.
    expect(getWinner([
      ['rubio', 'cruz'],
      ['cruz', 'rubio'],
      ['clinton'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['clinton', 'cruz', 'rubio'],
      received: 2,
      total: 4,
      percentage: 50.00
    });
  });

  test('two way tie handled correctly (not take into account fallback)', () => {
    // Important one. Mistakenly had rubio winning previously.
    expect(getWinner([
      ['rubio'],
      ['rubio'],
      ['cruz', 'rubio'],
      ['cruz'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['rubio', 'cruz'],
      received: 2,
      total: 5,
      percentage: 40.00
    });

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
      winner: ['rubio', 'trump'],
      received: 3,
      total: 7,
      percentage: 42.86
    });

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
      winner: ['rubio', 'trump'],
      received: 3,
      total: 7,
      percentage: 42.86
    });
  });

  test('another', () => {
    // Teachable Example
    // Not weighted ranking (wherein clinton would win). True votes.
    expect(getWinner([
      ['rubio', 'cruz'],
      ['kasich', 'rubio'],
      ['clinton'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['clinton', 'rubio'],
      received: 2,
      total: 4,
      percentage: 50.00
    });
  });
});

describe('Winning:', () => {
  test('winning with minority (backward compatible with standard voting metholodogy', () => {
    expect(getWinner([
      ['rubio'],
      ['rubio'],
      ['cruz'],
      ['kasich'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['rubio'],
      received: 2,
      total: 5,
      percentage: 40.00
    });
  });

  test('winning with majority (backward compatible with standard voting metholodogy', () => {
    expect(getWinner([
      ['rubio'],
      ['rubio'],
      ['rubio'],
      ['kasich'],
      ['clinton']
    ])).toEqual({
      success: true,
      winner: ['rubio'],
      received: 3,
      total: 5,
      percentage: 60.00
    });
  });

  test('successful fallback', () => {
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
      winner: ['rubio'],
      received: 5,
      total: 9,
      percentage: 55.56
    });
  });

  test('respects order - fallbacks only used from losing votes; MAJORITY', () => {
    // Respecting the order of votes, fallbacks are only used when the
    // vote would otherwise lose (be wasted).
    expect(getWinner([
      ['rubio', 'cruz'],
      ['cruz'],
      ['kasich'],
      ['kasich'],
      ['kasich', 'cruz']
    ])).toEqual({
      success: true,
      winner: ['kasich'],
      received: 3,
      total: 5,
      percentage: 60.00
    });

    // Notice: Rubio does not win because fallback
    // choices are only evaulated from the losing voter's choices.
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
      winner: ['kasich'],
      received: 6,
      total: 11,
      percentage: 54.55
    });
  });

  test('respects order - fallbacks only used from losing votes; EVEN IN MINORTY', () => {
    // Would early flip instead of win if algorithm wrong
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
      winner: ['kasich'],
      received: 3,
      total: 7,
      percentage: 42.86
    });

    // Would early flip if algorithm wrong
    expect(getWinner([
      ['cruz'],
      ['cruz'],
      ['kasich', 'cruz'],
      ['kasich'],
      ['kasich'],
      ['bush'],
    ])).toEqual({
      success: true,
      winner: ['kasich'],
      received: 3,
      total: 6,
      percentage: 50.00
    });

    // Notice: Rubio does not win because fallback
    // choices are only evaulated from the losing voter's choices.
    // More challenging version of the previous test:
    // Kasich didn't have majority, so it didn't give him the win.
    // For some reason, wants to do {"percentage": 55.56, "received": 5, "success": true, "total": 9, "winner": ["rubio", "bush"]}
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
      winner: ['kasich'],
      received: 4,
      total: 9,
      percentage: 44.44
    });

    // Notice: In the second round, carson was not chosen because fallback
    // choices are only evaluated from the losing voters' choices.
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
      winner: ['trump'],
      received: 6,
      total: 11,
      percentage: 54.55
    });
  });


  test('advanced: flips twice', () => {
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
    */
    // Interestingly, Carson doesn't get the vote from the first person
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
      winner: ['carson'],
      received: 5,
      total: 8,
      percentage: 62.50
    });
  });
});
