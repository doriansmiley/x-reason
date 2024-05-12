const { TextDecoder, TextEncoder } = require('text-encoding');

require('dotenv').config({ path: '.env.local' });

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;