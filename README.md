# rate-limit-mongoose

[![Build Status](https://travis-ci.org/lykmapipo/rate-limit-mongoose.svg?branch=master)](https://travis-ci.org/lykmapipo/rate-limit-mongoose)
[![Dependencies Status](https://david-dm.org/lykmapipo/rate-limit-mongoose/status.svg)](https://david-dm.org/lykmapipo/rate-limit-mongoose)

A rate limiting store for [express-rate-limit](https://github.com/nfriedly/express-rate-limit) with [mongoose](https://github.com/Automattic/mongoose) 

## Requirements

- NodeJS v9.3+

## Install
```sh
$ npm install --save @lykmapipo/rate-limit-mongoose
```

## Usage

```javascript
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const rateLimitStore = require('@lykmapipo/rate-limit-mongoose');

// setup rate limiter
const windowMs = 15 * 60 * 1000;
const store = rateLimitStore({ windowMs });
const limiter = rateLimit({ store, windowMs });

//  apply to all requests
app.use(limiter);

// only apply to requests that begin with /api/
app.use("/api/", limiter);

```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.


## Licence
The MIT License (MIT)

Copyright (c) 2018 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 