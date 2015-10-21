BIN := node_modules/.bin

all: index.js index.d.ts

$(BIN)/tsc:
	npm install

node_modules/node.d.ts:
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/node/node.d.ts > $@

index.js index.d.ts: index.ts node_modules/node.d.ts $(BIN)/tsc
	$(BIN)/tsc -d
