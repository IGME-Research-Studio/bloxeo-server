import {expect} from 'chai';

import utils from '../../../api/helpers/utils';

describe('UtilsService', () => {
  // Objects with _id prop
  const TEST_OBJ = {_id: 'stuff', key: 'adsf'};
  const TEST_ARR_OF_OBJS = [TEST_OBJ, TEST_OBJ];
  const TEST_OBJ_OF_OBJS = {0: TEST_OBJ, 1: TEST_OBJ};
  const TEST_COLLECTION_OBJ = {_id: 's', ideas: [{'_id': 'b', key: 'asdf'}]};
  const TEST_NESTED_OBJ = {0: TEST_COLLECTION_OBJ, 1: TEST_COLLECTION_OBJ};

  const RES_OBJ = {key: 'adsf'};
  const RES_ARR_OF_OBJS = [RES_OBJ, RES_OBJ];
  const RES_OBJ_OF_OBJS = {0: RES_OBJ, 1: RES_OBJ};
  const RES_COLLECTION_OBJ = {ideas: [{key: 'asdf'}]};
  const RES_NESTED_OBJ = {0: RES_COLLECTION_OBJ, 1: RES_COLLECTION_OBJ};

  describe('#strip(mongooseResult)', () => {

    it('should convert {_id: 1} => {}', () => {
      expect(utils.strip(TEST_OBJ))
        .to.deep.equal(RES_OBJ);
    });
  });

  describe('#stripMap(mongooseResult)', () => {

    it('should convert [{_id: 1}, {_id: 2}] => [{}, {}]', () => {
      expect(utils.stripMap(TEST_ARR_OF_OBJS))
        .to.deep.equal(RES_ARR_OF_OBJS);
    });

    it('should convert {1: {_id: 1}, 2: {_id: 2}} => {1: {}, 2: {}}', () => {
      expect(utils.stripMap(TEST_OBJ_OF_OBJS))
        .to.deep.equal(RES_OBJ_OF_OBJS);
    });
  });

  describe('#stripNestedMap(mongooseResult)', () => {
    it('should return what is passed in without the "_id" prop', () => {

      expect(utils.stripNestedMap(TEST_NESTED_OBJ))
        .to.deep.equal(RES_NESTED_OBJ);
    });
  });
});
