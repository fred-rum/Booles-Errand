// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

Level.prototype.puzzle = [
  {name: 'press play',
   intro: '<p>&#9733 <b>Press the "play" button on the left</b> to transmit the electrical value from the supply pin "A" to the test pin "Z". &#9733</p>',
   outro: '<p>Congratulations!</p>',
   truth: [{a: [1], z: [1]}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'first wire',
   intro: '<p>Now, you do it! <b>Draw a wire to connect A to Z.</b></p><p>Tip to draw a wire: While the mouse is over the stub at the right side of A, press and hold the mouse button, then move the mouse to the stub at the left side of Z before releasing the mouse button.</p><p>Tip: Press "play" to verify that your circuit is correct.</p>',
   outro: '<p>You can also draw a wire in the other direction.  The direction that data flows on the wire is determined by what it\'s connected to.</p>',
   truth: [{a: [1], z: [1]}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'truth table',
   intro: '<p>A circuit must typically pass multiple tests to prove that it is correct. <b>The truth table on the left shows what values are required</b> at the test pins for each set of values at the supply pins.</p>',
   outro: '<p>Every row of the truth table must pass with a check mark in order to move on to the next puzzle.</p>',
   truth: [{a: [0], z: [0]},
           {a: [1], z: [1]}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'inverter',
   intro: '<p><b>An inverter gate changes a 0 to 1, or changes a 1 to a 0.</b></p>',
   outro: '<p>The bubble on the side of the inverter gate is what flips the value.  A triangular gate without a bubble would simply transmit the value unchanged, like a wire.</p>',
//   outro: '<p>Check how the circuit is connected.  You\'ll have to do it yourself in the next puzzle!</p>',
   truth: [{a: [0], z: [1]},
           {a: [1], z: [0]}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'inv', 'i']]
        }
     ,
     inv: {type: 'inv',
           x: 250,
           y: 100,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'first gate',
   intro: '<p>Now you do it! <b>Drag the inverter from the box at the left into the drawing area.  Wire it so that data flows from A, through the inverter, to Z.</b></p><p>Tip to drag the inverter: While the mouse is over the inverter, press and hold the mouse button, then move the mouse into the drawing area near the supply and test pins before releasing the mouse button.</p><p>Tip: simply touching two wire stubs is not sufficient to transmit a value between them.  A wire must be drawn from one to the other.</p>',
   outro: '<p>Whatever is in the drawing area at the start of the puzzle is locked in place.  But you can always freely move or delete any gates that you draw.</p>',
   truth: [{a: [0], z: [1]},
           {a: [1], z: [0]}],
   avail: ['inv', 1],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'fanout',
   intro: '<p><b>Add a wire to connect A to Y.</b></p><p>Tip: The stub on the right side of the supply pin is an output port, which can be connected to the input ports on the left sides of the test pins.</p><p>Tip: A wire cannot connect from an input directly to another input.  If you drag from Z to Y, it will move the existing wire instead of drawing a new one.',
   outro: '<p>As many wires as you want can "fan out" from any output port.</p>',
   truth: [{a: [0], z: [0], y: [0]},
           {a: [1], z: [1], y: [1]}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 100
        }
     ,
     y: {type: 'output',
         x: 300,
         y: 200
        }
   }
  }
,
  {name: 'gate+fanout',
   intro: '<p><b>Check the truth table</b> to see how this circuit should be connected.</p><p>Tip: The table says that when A is "1", Z must get a "1" value, and Y must get "0".  It also says what values must go to the test pins when A is "0".</p>',
   outro: '<p>It looks like you\'re getting the hang of it!</p>',
   truth: [{a: [1], z: [1], y: [0]},
           {a: [0], z: [0], y: [1]}],
   avail: ["inv", 1],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
     ,
     y: {type: 'output',
         x: 400,
         y: 200
        }
   }
  }
,
  {name: 'seven segment decode',
   intro: '<p><b>Decode each decimal value 0-9 to drive a seven-segment display.</b></p>',
   outro: '',
   truth:[{a3:0, a2:0, a1:0, a0:0,   t:1, tl:1, tr:1, c:0, bl:1, br:1, b:1},
          {a3:0, a2:0, a1:0, a0:1,   t:0, tl:0, tr:1, c:0, bl:0, br:1, b:0},
          {a3:0, a2:0, a1:1, a0:0,   t:1, tl:0, tr:1, c:1, bl:1, br:0, b:1},
          {a3:0, a2:0, a1:1, a0:1,   t:1, tl:0, tr:1, c:1, bl:0, br:1, b:1},
          {a3:0, a2:1, a1:0, a0:0,   t:0, tl:1, tr:1, c:1, bl:0, br:1, b:0},
          {a3:0, a2:1, a1:0, a0:1,   t:1, tl:1, tr:0, c:1, bl:0, br:1, b:1},
          {a3:0, a2:1, a1:1, a0:0,   t:1, tl:1, tr:0, c:1, bl:1, br:1, b:1},
          {a3:0, a2:1, a1:1, a0:1,   t:1, tl:0, tr:1, c:0, bl:0, br:1, b:0},
          {a3:1, a2:0, a1:0, a0:0,   t:1, tl:1, tr:1, c:1, bl:1, br:1, b:1},
          {a3:1, a2:0, a1:0, a0:1,   t:1, tl:1, tr:1, c:1, bl:0, br:1, b:1}
         ],
   cells: {
     a3: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     a2: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     a1: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     a0: {type: 'input',
         x: 0,
         y: 300
        }
     ,
     t: {type: 'output',
         x: 875,
         y: 0
        }
     ,
     tl: {type: 'output',
         x: 800,
         y: 75
        }
     ,
     tr: {type: 'output',
         x: 950,
         y: 75
        }
     ,
     c: {type: 'output',
         x: 875,
         y: 150
        }
     ,
     bl: {type: 'output',
         x: 800,
         y: 225
        }
     ,
     br: {type: 'output',
         x: 950,
         y: 225
        }
     ,
     b: {type: 'output',
         x: 875,
         y: 300
        }
   }
  }
];
