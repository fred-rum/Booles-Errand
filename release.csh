#!/usr/bin/csh -f

awk '/DOCTYPE/,/jquery.min/ {print}' < circuit.html > index.html
echo '<script>' >> index.html
uglifyjs raphael-ext.js circuit.js cell.js io.js wire.js drag.js sim.js level.js puzzle.js bdrag.js --compress --mangle toplevel --preamble '// Copyright 2016 Chris Nelson - All rights reserved.' >> index.html
cat circuit_files/jquery.mousewheel.min.js circuit_files/smartquotes.min.js >> index.html
echo '</script>' >> index.html
echo '<style>' >> index.html
uglifycss circuit.css >> index.html
echo '</style>' >> index.html
awk '/<\/head>/,/end-of-file/ {print}' < circuit.html >> index.html
