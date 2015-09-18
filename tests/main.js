var expect = require('chai').expect;

describe('Some example tests using mocha and chai', function() {
  var foo = 'bar',
      beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

  it('should behave as expected', function() {
    expect(foo).to.be.a('string');
    expect(foo).to.equal('bar');
    expect(foo).to.have.length(3);
    expect(beverages).to.have.property('tea').with.length(3);
  });
});
