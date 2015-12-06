import chai from 'chai';

import utils from '../../../api/services/utils';

const expect = chai.expect;

describe('UtilsService', () => {
  // Objects with _id prop
  const TEST_OBJ = {_id: 'stuff', key: 'adsf'};
  const TEST_ARR_OF_OBJS = [TEST_OBJ, TEST_OBJ, TEST_OBJ];
  const TEST_OBJ_OF_OBJS = {0: TEST_OBJ, 1: TEST_OBJ, 2: TEST_OBJ};

  const TEST_COLLECTION_OBJ = {_id: 's', ideas: [{'_id': 'b', key: 'asdf'}]};
  const TEST_NESTED_OBJ = {0: TEST_COLLECTION_OBJ, 1: TEST_COLLECTION_OBJ};

  describe('#strip(mongooseResult)', () => {

    it('should convert {_id: 1} => {}', () => {
      expect(utils.strip(TEST_OBJ))
      .to.not.contain.key('_id');
    });
  });

  describe('#stripArr(mongooseResult)', () => {

    it('should return what is passed in without the "_id" prop', () => {
      expect(utils.stripArr(TEST_ARR_OF_OBJS)[0])
      .to.not.contain.key('_id');
    });
  });

  describe('#stripObjs(mongooseResult)', () => {

    it('should return what is passed in without the "_id" prop', () => {
      expect(utils.stripObjs(TEST_OBJ_OF_OBJS)['0'])
      .to.not.contain.key('_id');
    });
  });

  describe('#stripObjsAndNestedArr(mongooseResult)', () => {
    it('should return what is passed in without the "_id" prop', () => {

      expect(utils.stripObjsAndNestedArr(TEST_NESTED_OBJ)[0])
      .to.not.contain.key('_id');
      .and.to.have.property(
      console.log(JSON.stringify(utils.stripObjsAndNestedArr(TEST_NESTED_OBJ)[0], null, 2));

      expect(utils.stripObjsAndNestedArr(TEST_NESTED_OBJ)[0].content[0])
      .to.not.contain.key('_id');
    });
  });
});
