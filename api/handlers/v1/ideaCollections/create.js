/**
* Controller for creating a new IdeaCollection with an initial, existing idea
*
* param boardId
* body content
*/
import Promise from 'bluebird';

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import IdeaCollectionService from '../../../services/IdeaCollectionService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

exports default function create(req) {
  const content = req.content;
  const boardId = req.boardId;
  const socket = req.socket;

  if (isNull(boardId) || isNull(content) || isNull(socket)) {
    stream.emit(INT_EVENTS.BROADCAST,
      {body: 'Not all required parameters were supplied'});
  }
  else {
    IdeaCollectionService.create(boardId, content)
      .then((collectionIndex) => {
        return IdeaCollectionService.getAllIdeas(boardId, collectionIndex);
      })
      .then((ideaStrings) => {
        // Inform all clients a new collection has been added to the board
        stream.emit(INT_EVENTS.BROADCAST,
            {boardId: boardId, event: EXT_EVENTS.ADDED_COLLECTION,
             index: collectionIndex, content: ideaStrings});
      })
      .catch((err) => {
        stream.emit(INT_EVENTS.BROADCAST,
          {code: 500, error: err,
           body: `Problem creating the ideaCollection.`});
      });
  }
}
