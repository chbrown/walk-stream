# walk-stream

Recursive filesystem walker for Node.js that implements [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable).

## Install

    npm install walk-stream


## Example

    var WalkStream = require('walk-stream').default;
    var stream = new WalkStream(process.env.HOME + '/Desktop');
    stream.on('data', function(node) {
      console.log(node);
    });
    stream.on('end', function() {
      console.log('-- DONE --');
    });


## Alternatives

* [walk](https://github.com/coolaj86/node-walk): most popular solution; provides synchronous and asynchronous interfaces, based on EventEmitter, lots of options.
* [walk-sync](https://github.com/joliss/node-walk-sync): simple API, synchronous only.


## License

Copyright 2014-2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2014-2015).
