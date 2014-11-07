JSHINT=@jshint
MOCHA=@./node_modules/.bin/mocha
BROWSERIFY=@browserify
MINIFY=uglifyjs -c

lint:
	 $(JSHINT) lib/ test/ bin/ index.js

test: lint
	$(MOCHA)

build-debug:
	@mkdir -p dist/
	$(BROWSERIFY) index.js -d --s jqfy > dist/jqfy.js

build-min:
	@mkdir -p dist/
	$(BROWSERIFY) index.js --s jqfy | $(MINIFY) -o dist/jqfy.min.js 2>/dev/null

build: build-debug build-min