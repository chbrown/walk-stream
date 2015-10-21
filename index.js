var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
var fs_1 = require('fs');
var path_1 = require('path');
/**
WalkStream is a Readable stream that defaults to objectMode.

Calling WalkStream#read() gets FilesystemNode objects, one at a time.

Recurses depth-first.

TODO: make breadth-first an option.
*/
var WalkStream = (function (_super) {
    __extends(WalkStream, _super);
    function WalkStream(root, options) {
        if (options === void 0) { options = { objectMode: true }; }
        _super.call(this, options);
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
    WalkStream.prototype._halt = function (error) {
        this['_readableState'].reading = false;
        return this.emit('error', error);
    };
    /**
    From http://nodejs.org/api/stream.html#stream_readable_read_size_1:
    > When data is available, put it into the read queue by calling readable.push(chunk).
    > If push returns false, then you should stop reading.
    > When _read is called again, you should start pushing more data.
  
    There's no protection against a circular file system hierarchy with symlinks,
    but if you're gonna do that you probably want an infinite stream, so this will
    suit you just fine.
    */
    WalkStream.prototype._read = function () {
        var _this = this;
        // if _queue is empty, we're done!
        if (this._queue.length === 0) {
            // we signal the end of the Node.js Stream by pushing the special value, `null`
            return this.push(null);
        }
        var path = this._queue.pop();
        // stat the next path and queue up its children
        fs_1.stat(path, function (error, stats) {
            if (error)
                return _this._halt(error);
            var node = { path: path, stats: stats };
            // We have to wait to this.push(node) until after we've done the readdir.
            // Otherwise 'readable' is emitted immediately, before `readdir` calls
            // back, leaving us with nothing in the queue, which we detect as empty
            // and end, thinking we're all done.
            if (stats.isDirectory()) {
                fs_1.readdir(path, function (error, children) {
                    if (error)
                        return _this._halt(error);
                    var paths = children.map(function (child) { return path_1.join(path, child); });
                    // everything is push/pop, so it's LIFO (last in-first out)
                    (_a = _this._queue).push.apply(_a, paths);
                    _this.push(node);
                    var _a;
                });
            }
            else {
                _this.push(node);
            }
        });
    };
    return WalkStream;
})(stream_1.Readable);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WalkStream;
