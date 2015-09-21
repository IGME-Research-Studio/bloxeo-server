const expect = require('chai').expect;

describe('Some example tests using mocha and chai', () => {
  const foo = 'bar';
  const beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

  it('should behave as expected', () => {
    expect(foo).to.be.a('string');
    expect(foo).to.equal('bar');
    expect(foo).to.have.length(3);
    expect(beverages).to.have.property('tea').with.length(3);
  });
});

