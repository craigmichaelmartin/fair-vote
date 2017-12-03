const getWinner = require('./index').getWinner;

test('simple tie', () => {
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

test('winning with minority', () => {
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

test('signifance of all vote slots', () => {
  // Rather than being a tie between rubio and cruz, rubio is the winner
  // Really just an example of successful fallback
  expect(getWinner([
    ['rubio'],
    ['rubio'],
    ['cruz', 'rubio'],
    ['cruz'],
    ['clinton']
  ])).toEqual({
    success: true,
    winner: ['rubio'],
    received: 3,
    total: 5,
    percentage: 60.00
  });
});

test('more advanced form of a tie', () => {
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

test('not a tie', () => {
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

/*
test('respects order', () => {
  // Notice: Rubio does not win because fallback
  // choices are only evaulated from the losing voter's choices.
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
  ]).name).toEqual({
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
  ]).name).toEqual({
    success: true,
    winner: ['trump'],
    received: 6,
    total: 11,
    percentage: 54.54
  });
});
*/
