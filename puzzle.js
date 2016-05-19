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
   intro: '<p>A circuit must typically pass multiple tests to prove that it is correct. <b>The truth table on the left shows what values are required</b> at the test pins for each set of values at the supply pins.</p><p>Clicking "play" causes each row of the truth table to be tested until every row has passed or until some row has failed.</p>',
   outro: '<p>Every row of the truth table must pass with a check mark in order to move on to the next puzzle.</p>',
   truth: [{a: [0], z: [0]},
           {a: [1], z: [1]}],
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
  {name: 'NOT gate',
   intro: '<p><b>A NOT gate changes a&nbsp;0 to&nbsp;1, or changes a&nbsp;1 to a&nbsp;0.</b>  In other words, the output of a NOT gate is&nbsp;1 only if the input is <i>NOT</i> 1.</p>',
   outro: '<p>A NOT gate is also often called an inverter.</p>',
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
   intro: '<p>Now you do it! <b>Drag the NOT gate from the box at the left into the drawing area.  Wire it so that data flows from A, through the NOT gate, to Z.</b></p><p>Tip to drag the NOT gate: While the mouse is over the NOT gate, press and hold the mouse button, then move the mouse into the drawing area near the supply and test pins before releasing the mouse button.</p><p>Tip: simply touching two wire stubs is not sufficient to transmit a value between them.  A wire must be drawn from one to the other.</p>',
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
   intro: '<p><b>Add a wire to connect A to Y.</b></p><p>Tip: The stub on the right side of the supply pin is an output port, which can be connected to the input ports on the left sides of both test pins.</p><p>Tip: A wire cannot connect from an input directly to another input.  If you drag from Z to Y, it will move the existing wire instead of drawing a new one.',
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
   intro: '<p><b>Check the truth table</b> to see how this circuit should be connected.</p><p>Tip: The table says that when A is&nbsp;1, Z must get a&nbsp;1 value, and Y must get&nbsp;0.  It also says what values must go to the test pins when A is&nbsp;0.</p>',
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
  {name: 'AND gate',
   intro: '<p><b>An AND gate outputs a&nbsp;1 only if its first input is&nbsp;1 <i>AND</i> its second input is&nbsp;1.</b> Otherwise the output of the AND gate is&nbsp;0.</p>',
   outro: '<p><b>Make sure you clearly understand the relationship of the AND gate\'s output with its inputs</b>, as displayed in the truth table.  You will soon learn five other simple logic gates, each of which perform a different logic function.</p>',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:0},
           {a:1, b:0,   z:0},
           {a:1, b:1,   z:1}],
   avail: ["and", 1],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'NAND gate',
   intro: '<p><b>A NAND gate outputs the opposite value as an AND gate.</b></p><p>Be careful when speaking aloud: "a NAND gate" is not "an AND gate".</p>',
   outro: '<p>As you\'ll soon see, NAND gates can be combined to implement every possible Boolean logic expression.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ["nand", 1],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'NOT-AND',
   intro: '<p><b>A NAND gate can be decomposed into an AND gate followed by an NOT gate.</b> The result is NOT&nbsp;1 only if the AND gate\'s output is&nbsp;1.  In other words, it performs a NOT-AND function, also known as NAND.</p>',
   outro: '<p>Because a NAND gate combines the functions of an AND gate and an NOT gate, it combines the shape of the AND gate with the bubble from the NOT gate.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ["inv", 1, "and", 1],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'NOT as NAND',
   intro: '<p>By tying its inputs to the same source, <b>a NAND gate can perform the same function as a NOT gate.</b></p>',
   outro: '<p>NAND gates are particularly small and fast in modern silicon circuits, so it is convenient that they are also so versatile.</p>',
   truth: [{a:0,  z:1},
           {a:1,  z:0}],
   avail: ["nand", 1],
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
  {name: 'seven segment decode',
   intro: '<p><b>Decode each decimal value&nbsp;(0-9) to drive a seven-segment display.</b></p>',
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
