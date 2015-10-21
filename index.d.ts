import { Readable, ReadableOptions } from 'stream';
import { Stats } from 'fs';
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
    _queue: string[];
    constructor(root: string, options?: ReadableOptions);
    /**
    We want to break for the error, but not signal the end of the stream;
    this._readableState.reading is a state variable that represents whether we
    are expecting a value to be .push()'ed from _read() anytime soon.
    On an error, we are not.
  
    This is a function of my own devising, not part of the stream.Readable
    interface or anything
    */
    _halt(error: Error): boolean;
    /**
    From http://nodejs.org/api/stream.html#stream_readable_read_size_1:
    > When data is available, put it into the read queue by calling readable.push(chunk).
    > If push returns false, then you should stop reading.
    > When _read is called again, you should start pushing more data.
  
    There's no protection against a circular file system hierarchy with symlinks,
    but if you're gonna do that you probably want an infinite stream, so this will
    suit you just fine.
    */
    _read(): boolean;
}
