import {Readable, ReadableOptions} from 'stream';
import {readdir, stat, Stats} from 'fs';
import {join} from 'path';

export interface FilesystemNode {
  path: string;
  stats: Stats;
}

/**
WalkStream is a Readable stream that defaults to objectMode.

Calling WalkStream#read() gets FilesystemNode objects, one at a time.

Recurses depth-first.

TODO: make breadth-first an option.
*/
export default class WalkStream extends Readable {
  /** _queue is the list of paths we have yet to descend into. */
  public _queue: string[];
  constructor(root: string, options: ReadableOptions = {objectMode: true}) {
    super(options);
    this._queue = [root];
  }

  /**
  We want to break for the error, but not signal the end of the stream;
  this._readableState.reading is a state variable that represents whether we
  are expecting a value to be .push()'ed from _read() anytime soon.
  On an error, we are not.

  This is a function of my own devising, not part of the stream.Readable
  interface or anything
  */
  _halt(error: Error) {
    this['_readableState'].reading = false;
    return this.emit('error', error);
  }

  /**
  From http://nodejs.org/api/stream.html#stream_readable_read_size_1:
  > When data is available, put it into the read queue by calling readable.push(chunk).
  > If push returns false, then you should stop reading.
  > When _read is called again, you should start pushing more data.

  There's no protection against a circular file system hierarchy with symlinks,
  but if you're gonna do that you probably want an infinite stream, so this will
  suit you just fine.
  */
  _read(/*size*/) {
    // if _queue is empty, we're done!
    if (this._queue.length === 0) {
      // we signal the end of the Node.js Stream by pushing the special value, `null`
      return this.push(null);
    }
    var path = this._queue.pop();

    // stat the next path and queue up its children
    stat(path, (error, stats) => {
      if (error) return this._halt(error);

      var node: FilesystemNode = {path, stats};

      // We have to wait to this.push(node) until after we've done the readdir.
      // Otherwise 'readable' is emitted immediately, before `readdir` calls
      // back, leaving us with nothing in the queue, which we detect as empty
      // and end, thinking we're all done.
      if (stats.isDirectory()) {
        readdir(path, (error, children) => {
          if (error) return this._halt(error);

          var paths = children.map(child => join(path, child));
          // everything is push/pop, so it's LIFO (last in-first out)
          this._queue.push(...paths);

          this.push(node);
        });
      }
      else {
        this.push(node);
      }
    });
  }
}
