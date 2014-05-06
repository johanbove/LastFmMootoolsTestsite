SET version=0.2
echo Building JavaScript for version "%version%"...
cd c:\Users\Johan\workspace\LastFmMootoolsTestsite\
uglifyjs .\moment.min.js .\mootools-yui-compressed.js .\dz.js .\deezer.js .\lastFm.js --output built-v%version%.min.js --source-map built-v%version%-source.js --comments