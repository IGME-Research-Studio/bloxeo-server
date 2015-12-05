import chai from 'chai';

import utils from '../../../api/services/utils';

const expect = chai.expect;

describe('UtilsService', () => {
  // Objects with _id prop
  const TEST_OBJ = {_id: 'stuff', key: 'adsf'};
  const TEST_ARR_OF_OBJS = [TEST_OBJ, TEST_OBJ, TEST_OBJ];
  const TEST_OBJ_OF_OBJS = {0: TEST_OBJ, 1: TEST_OBJ, 2: TEST_OBJ};

  describe('#toClientObj(mongooseResult)', () => {

    it('should return what is passed in without the "_id" prop', () => {
      expect(utils.toClientObj(TEST_OBJ))
      .to.not.contain.key('_id');
    });
  });

  describe('#toClientArrOfObjs(mongooseResult)', () => {

    it('should return what is passed in without the "_id" prop', () => {
      expect(utils.toClientArrOfObjs(TEST_ARR_OF_OBJS)[0])
      .to.not.contain.key('_id');
    });
  });

  describe('#toClientObjOfObjs(mongooseResult)', () => {

    it('should return what is passed in without the "_id" prop', () => {
      expect(utils.toClientObjOfObjs(TEST_OBJ_OF_OBJS)['0'])
      .to.not.contain.key('_id');
    });
  });
});
