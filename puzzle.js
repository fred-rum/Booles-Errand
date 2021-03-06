// Copyright 2016 Christopher P. Nelson - All rights reserved.

'use strict';

var x = undefined;
Level.prototype.puzzle = [
  {name: 'Press play',
   section: 'Introduction to circuits',
   ui: true,
   intro: '<p>&#9733; <b>Press the "play" button on the left</b> to transmit the electrical value from the stimulus pin "A" to the test pin "Z". &#9733;</p>',
   outro: '<p>Congratulations!</p>',
   truth: [{a: 1,   z: 1}],
   hide: ['truth', 'speed'],
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
  {name: 'Draw a wire',
   ui: true,
   intro: '<p>Now, you do it! <b>Draw a wire to connect A to Z.</b></p><p>Tip to draw a wire: While the mouse is over the stub at the right side of A, press and hold the mouse button, then move the mouse to the stub at the left side of Z before releasing the mouse button.</p><p>Tip: Press "play" to verify that your circuit is correct.</p>',
   outro: '<p>You can also draw a wire in the other direction.  The direction that data flows on the wire is determined by what it\'s connected to.</p>',
   truth: [{a: 1,   z: 1}],
   hide: ['truth', 'speed'],
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
  {name: 'The truth table',
   ui: true,
   intro: '<p>A circuit must typically pass multiple tests to prove that it is correct. <b>The truth table on the left shows what values are required</b> at the test pins for each set of values on the stimulus pins.</p><p>Clicking "play" causes each row of the truth table to be tested until every row has passed or until some row has failed.</p>',
   outro: '<p>Every row of the truth table must pass with a check mark in order to move on to the next puzzle.</p>',
   truth: [{a: 0,   z: 0},
           {a: 1,   z: 1}],
   hide: ['speed'],
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
   intro: '<p><b>A NOT gate changes a 0 to 1, or changes a 1 to a 0.</b>  In other words, the output of a NOT gate is 1 only if the input is <i>not</i> 1.</p>',
   outro: '<p>A NOT gate is also often called an inverter.</p>',
   truth: [{a: 0,   z: 1},
           {a: 1,   z: 0}],
   hide: ['speed'],
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
  {name: 'Create a gate',
   ui: true,
   intro: '<p><b>Drag the NOT gate from the box at the left into the drawing area.  Wire it so that data flows from A, through the NOT gate, to Z.</b></p><p>Tip to drag the NOT gate: While the mouse is over the NOT gate, press and hold the mouse button, then move the mouse into the drawing area near the stimulus and test pins before releasing the mouse button.</p><p>Tip: Simply touching two wire stubs is not sufficient to transmit a value between them.  A wire must be drawn from one to the other.</p>',
   outro: '<p>Whatever is in the drawing area at the start of the puzzle is locked in place.  But you can always freely move or delete any gates that you draw.</p>',
   truth: [{a: 0, z: 1},
           {a: 1, z: 0}],
   hide: ['speed'],
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
  {name: 'The speed slider',
   ui: true,
   intro: '<p><b>Here are some new ways to control the simulation.</b></p><p>The small buttons next to the "play" button tell the simulation to pause when the propagating values have reached a gate <span class="nowrap">(<svg style="vertical-align:middle" width="1.2857em" height="1em" viewBox="-4 -2 18 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M0,0v10h5a5,5,0,0,0,0,-10h-5z" stroke="#888" stroke-width="1.5"/><path d="M-2.5,2.5H0M-2.5,7.5H0M12.5,5H10" stroke="#888" stroke-width="1"/></svg>)</span>, when one truth table row has passed testing <span class="nowrap">(<svg style="vertical-align:middle" width="1.2857em" height="1em" viewBox="-4 -2 18 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg>),</span> or when all truth table rows have passed <span class="nowrap">(<svg style="vertical-align:middle" width="1.2857em" height="1em" viewBox="-4 -2 18 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M0.25,2.5l1.25,2.5l2.5,-5M0.25,7.5l1.25,2.5l2.5,-5M5.5,2.5l1.25,2.5l2.5,-5M5.5,7.5l1.25,2.5l2.5,-5" stroke="#888" stroke-width="1"/></svg>).</span></p><p>You can switch to testing a different truth table row by clicking on that row.  Double clicking a row selects it and immediately starts simulation (as if you clicked "play").  If simulation is paused immediately after one truth table row has passed, clicking "play" automatically advances to the next row.</p><p>The "speed" slider adjusts the speed of data flow from slow to fast.</p>',
   outro: '<p>The small buttons next to the "play" button tell the simulation to pause when the values have reached a gate, when one truth table row has passed testing, or when all truth table rows have passed.</p><p>You can switch to testing a different truth table row by clicking on that row.  Double clicking a row selects it and immediately starts simulation (as if you clicked "play").  If simulation is paused immediately after one truth table row has passed, clicking "play" automatically advances to the next row.</p><p>The "speed" slider adjusts the speed of data flow from slow to fast.</p>',
   truth: [{a: 0,   z: 0},
           {a: 1,   z: 1}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'ia', 'i']]
        }
     ,
     ia: {type: 'inv',
         x: 600,
         y: 100,
         io: [['o', 'i0', 'i']]
        }
     ,
     i0: {type: 'inv',
         x: 100,
         y: 200,
         io: [['o', 'i1', 'i']]
        }
     ,
     i1: {type: 'inv',
         x: 600,
         y: 200,
         io: [['o', 'i2', 'i']]
        }
     ,
     i2: {type: 'inv',
         x: 100,
         y: 300,
         io: [['o', 'i3', 'i']]
        }
     ,
     i3: {type: 'inv',
         x: 600,
         y: 300,
         io: [['o', 'i4', 'i']]
        }
     ,
     i4: {type: 'inv',
         x: 100,
         y: 400,
         io: [['o', 'i5', 'i']]
        }
     ,
     i5: {type: 'inv',
         x: 600,
         y: 400,
         io: [['o', 'i6', 'i']]
        }
     ,
     i6: {type: 'inv',
         x: 100,
         y: 500,
         io: [['o', 'i7', 'i']]
        }
     ,
     i7: {type: 'inv',
         x: 600,
         y: 500,
         io: [['o', 'i8', 'i']]
        }
     ,
     i8: {type: 'inv',
         x: 100,
         y: 600,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 600
        }
   }
  }
,
  {name: 'Wire fanout',
   ui: true,
   intro: '<p><b>Add a wire to connect A to Z and another wire to connect A to Y.</b></p><p>Tip: The stub on the right side of the stimulus pin is an output port, which can be connected to the input ports on the left sides of both test pins.</p><p>Tip: A wire cannot connect from an input directly to another input.  If you drag from Z to Y, it will move the existing wire (if any), or it will fail.',
   outro: '<p>As many wires as you want can "fan out" from any output port.</p>',
   truth: [{a: 0,   z: 0, y: 0},
           {a: 1,   z: 1, y: 1}],
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
     ,
     y: {type: 'output',
         x: 300,
         y: 200
        }
   }
  }
,
  {name: 'A simple circuit',
   intro: '<p><b>Check the truth table</b> to see how this circuit should be connected.</p><p>Tip: The table says that when A is 1, Z must get a 1 value, and Y must get 0.  It also says what values must go to the test pins when A is 0.</p>',
   outro: '<p>It looks like you\'re getting the hang of it!</p>',
   truth: [{a: 1,   z: 1, y: 0},
           {a: 0,   z: 0, y: 1}],
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
     ,
     y: {type: 'output',
         x: 400,
         y: 200
        }
   }
  }
,
  {name: 'AND gate',
   intro: '<p><b>An AND gate outputs a 1 only if its first input is 1 <i>and</i> its second input is 1.</b> Otherwise the output of the AND gate is 0.</p>',
   outro: '<p>When one of an AND gate\'s inputs is 1, then the value of the other input is propagated to the output of the gate.  Otherwise, the gate output is 0.</p><p><b>Make sure you clearly understand the relationship of the AND gate\'s output with its inputs</b>, as displayed in the truth table.  You will soon learn five other simple logic gates, each of which perform a different logic function.</p>',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:0},
           {a:1, b:0,   z:0},
           {a:1, b:1,   z:1}],
   avail: ['and', 1],
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
   intro: '<p><b>A NAND gate outputs an inverted value as compared to an AND gate.</b></p><p>Be careful when speaking aloud: "a NAND gate" is not "an AND gate".</p>',
   outro: '<p>As you\'ll soon see, NAND gates can be combined to implement every possible Boolean logic expression.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['nand', 1],
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
  {name: 'NAND is NOT-AND',
   intro: '<p><b>A NAND gate can be decomposed into an AND gate followed by an NOT gate.</b> The result is NOT 1 only if the AND gate\'s output is 1.  In other words, it performs a NOT-AND function, also known as NAND.</p>',
   outro: '<p>Because a NAND gate combines the functions of an AND gate and an NOT gate, it combines the shape of the AND gate with the bubble from the NOT gate.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['inv', 1, 'and', 1],
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
  {name: 'NOT with NAND',
   intro: '<p>By tying its inputs to the same source, <b>a NAND gate can perform the same function as a NOT gate.</b></p>',
   outro: '<p>NAND gates are particularly small and fast in modern silicon circuits, so it is convenient that they are also so versatile.</p>',
   truth: [{a:0,  z:1},
           {a:1,  z:0}],
   avail: ['nand', 1],
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
  {name: 'OR gate',
   intro: '<p><b>An OR gate outputs a 1 if its first input is 1 <i>or</i> its second input is 1</b> (or both are 1). Otherwise the output of the OR gate is 0.</p>',
   outro: '<p>When one of an OR gate\'s inputs is 0, then the value of the other input is propagated to the output of the gate.  Otherwise, the gate output is 1.</p><p>An OR gate is more precisely described with the legal term "and/or" because its output is 1 if its first input is 1 <i>and/or</i> its second input is 1.</p>',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:1}],
   avail: ['or', 1],
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
  {name: 'NOR gate',
   intro: '<p><b>A NOR gate outputs an inverted value as compared to an OR gate.</b></p><p>In this puzzle we introduce the concept of a "don\'t care" value.  If A is 1, we know that the output of the NOR gate must always be 0, so we <i>don\'t care</i> what B is.  Likewise, we <i>don\'t care</i> what A is when B is 1.</p>',
   outro: '<p>This circuit simulator uses a black color to represent a value that is unknown, which includes "don\'t care" values.  If a logic gate has an unknown input, a logic gate may output a known or unknown value depending on its input(s) and its logic function.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:x, b:1,   z:0},
           {a:1, b:x,   z:0}],
   avail: ['nor', 1],
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
  {name: 'XOR and XNOR gates',
   intro: '<p>An XOR gate performs an "exclusive or" function. <b>An XOR gate outputs a 1 if its first input is <i>exclusively</i>&nbsp;1 <i>or</i> its second input is <i>exclusively</i>&nbsp;1.</b> Unlike an OR gate, an XOR gate outputs 0 if both of its inputs are 1.</p><p><b>An XNOR gate outputs an inverted value as compared to an XOR gate.</b></p>',
   outro: '<p>When one of an XOR gate\'s inputs is 0, then the value of the other input is propagated to the output of the gate.  Otherwise, the value of the other input is inverted at the output.</p><p>There are no "don\'t care" cases for the XOR and XNOR gates.</p>',
   truth: [{a:0, b:0,   z:0, y:1},
           {a:0, b:1,   z:1, y:0},
           {a:1, b:0,   z:1, y:0},
           {a:1, b:1,   z:0, y:1}],
   avail: ['xor', 1, 'xnor', 1],
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
     ,
     y: {type: 'output',
         x: 400,
         y: 200
        }
   }
  }
,
  {name: 'Build a mux',
   section: 'Easy combinational circuits',
   intro: '<p><b>Build a circuit that outputs either A or B, depending on the value of S.</b></p><p>Tip: If one input of an AND gate is 1, then the output of the AND gate equals its other input.</p>',
   outro: '<p>Now you\'re building real circuits!</p>',
   truth: [{s:0, a:0,        z:0},
           {s:0, a:1,        z:1},
           {s:1,      b:0,   z:0},
           {s:1,      b:1,   z:1}],
   avail: ['inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     s: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     a: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 300
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 200
        }
   }
  }
,
  {name: 'Detect odd',
   intro: '<p><b>Determine whether an odd number of stimulus pins have a 1 value.</b></p><p>Tip: Start with a circuit that works when&nbsp;C is 0, then add logic to handle the cases when C is 1.</p>',
   outro: '<p>Notice that it doesn\'t matter what order you put the XOR gates in.  The result is always the same.</p>',
   truth: [{a:0, b:0, c:0,   z:0},
           {a:1, b:0, c:0,   z:1},
           {a:0, b:1, c:0,   z:1},
           {a:1, b:1, c:0,   z:0},
           {a:0, b:0, c:1,   z:1},
           {a:1, b:0, c:1,   z:0},
           {a:0, b:1, c:1,   z:0},
           {a:1, b:1, c:1,   z:1}],
   avail: ['xor'],
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
     c: {type: 'input',
         x: 100,
         y: 300
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 200
        }
   }
  }
,
  {name: 'Detect >= 2',
   intro: '<p><b>Determine whether at least two stimulus pins have a 1 value.</b></p>',
   outro: '<p>The solutions to this puzzle and the previous one together comprise a <i>full adder</i>.</p>',
   truth: [{a:0, b:0, c:0,   z:0},
           {a:1, b:0, c:0,   z:0},
           {a:0, b:1, c:0,   z:0},
           {a:1, b:1, c:0,   z:1},
           {a:0, b:0, c:1,   z:0},
           {a:1, b:0, c:1,   z:1},
           {a:0, b:1, c:1,   z:1},
           {a:1, b:1, c:1,   z:1}],
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
     c: {type: 'input',
         x: 100,
         y: 300
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 250
        }
   }
  }
,
  {name: 'Seven-segment decode',
   section: 'Advanced combinational circuits',
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
,
  {name: 'Seven-segment encode',
   intro: '<p><b>Recognize the value on a seven-segment display and encode it as a decimal value&nbsp;(0-9).</b></p>',
   outro: '',
   truth:[{t:1, tl:1, tr:1, c:0, bl:1, br:1, b:1,   z3:0, z2:0, z1:0, z0:0},
          {t:0, tl:0, tr:1, c:0, bl:0, br:1, b:0,   z3:0, z2:0, z1:0, z0:1},
          {t:1, tl:0, tr:1, c:1, bl:1, br:0, b:1,   z3:0, z2:0, z1:1, z0:0},
          {t:1, tl:0, tr:1, c:1, bl:0, br:1, b:1,   z3:0, z2:0, z1:1, z0:1},
          {t:0, tl:1, tr:1, c:1, bl:0, br:1, b:0,   z3:0, z2:1, z1:0, z0:0},
          {t:1, tl:1, tr:0, c:1, bl:0, br:1, b:1,   z3:0, z2:1, z1:0, z0:1},
          {t:1, tl:1, tr:0, c:1, bl:1, br:1, b:1,   z3:0, z2:1, z1:1, z0:0},
          {t:1, tl:0, tr:1, c:0, bl:0, br:1, b:0,   z3:0, z2:1, z1:1, z0:1},
          {t:1, tl:1, tr:1, c:1, bl:1, br:1, b:1,   z3:1, z2:0, z1:0, z0:0},
          {t:1, tl:1, tr:1, c:1, bl:0, br:1, b:1,   z3:1, z2:0, z1:0, z0:1}
         ],
   cells: {
     t: {type: 'input',
         x: 75,
         y: 0
        }
     ,
     tl: {type: 'input',
         x: 0,
         y: 75
        }
     ,
     tr: {type: 'input',
         x: 150,
         y: 75
        }
     ,
     c: {type: 'input',
         x: 75,
         y: 150
        }
     ,
     bl: {type: 'input',
         x: 0,
         y: 225
        }
     ,
     br: {type: 'input',
         x: 150,
         y: 225
        }
     ,
     b: {type: 'input',
         x: 75,
         y: 300
        }
     ,
     z3: {type: 'output',
         x: 1000,
         y: 0
        }
     ,
     z2: {type: 'output',
         x: 1000,
         y: 100
        }
     ,
     z1: {type: 'output',
         x: 1000,
         y: 200
        }
     ,
     z0: {type: 'output',
         x: 1000,
         y: 300
        }
   }
  }
,
  {name: 'SR latch',
   section: 'Introduction to sequential circuits',
   intro: '<p>A <i>latch</i> allows an input data value to pass through to the output in certain conditions, but it holds its output constant by recirculating the last output value in other conditions.  The latch is described as <i>transparent</i> when data is allowed to pass through it and <i>opaque</i> when its output is held constant.</p><p>The below circuit is an </i>SR latch</i>.  It can be <i>set</i> to 1 or <i>reset</i> to 0 by its inputs.  If it is currently neither set nor reset, then it holds its last value.</p><p><b>Connect the S pin so that it sets the latch to 1 and the R pin so that it resets the latch to 0.</b></p>',
   outro: '<p>What happens if S and R are both 1?</p>',
   truth: [[{s:0, r:0,   q:x},
            {s:1, r:0,   q:1},
            {s:0, r:0,   q:1},
            {s:0, r:1,   q:0},
            {s:0, r:0,   q:0}]],
   cells: {
     s: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     r: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     q: {type: 'output',
         x: 600,
         y: 100
        }
     ,
     and: {type: 'and',
           x: 480,
           y: 100,
           io: [['o', 'q', 'i'],
                ['o', 'or', 'i0']]
          }
     ,
     or: {type: 'or',
          x: 360,
          y: 90,
          io: [['o', 'and', 'i0']]
          }
   }
  }
,
  {name: 'D latch',
   intro: '<p>Because NAND gates are generally easier to implement using silicon transistors, a more common SR latch design uses a pair of NAND gates to recirculate the data. This latch design has the convenient property that the latch output is available in both regular and inverted forms.</p><p><b>Connect the latch so that it is transparent and propagates the D value only when E is 1.</b> In other words, when E is 1, the latch is <i>enabled</i> to propagate the the <i>data</i> value D to the output Q.  Once the latch output is initialized, ~Q must be the inverted value of Q.</p>',
   outro: '<p>The circuit you designed is called a D latch.</p>',
   truth: [[{e:0, d:0,   q:x, '~q':x},
            {e:1, d:0,   q:0, '~q':1},
            {e:1, d:1,   q:1, '~q':0},
            {e:0, d:1,   q:1, '~q':0},
            {e:0, d:0,   q:1, '~q':0}],
           [{e:0, d:1,   q:x, '~q':x},
            {e:1, d:1,   q:1, '~q':0},
            {e:1, d:0,   q:0, '~q':1},
            {e:0, d:0,   q:0, '~q':1},
            {e:0, d:1,   q:0, '~q':1}]],
   cells: {
     e: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     d: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     q: {type: 'output',
         x: 600,
         y: 100
        }
     ,
     '~q': {type: 'output',
         x: 600,
         y: 200
        }
     ,
     nand1:{
       type: 'nand',
       x: 480,
       y: 100,
       io: [['o', 'q', 'i'],
            ['o', 'nand2', 'i0']]
     }
     ,
     nand2: {
       type: 'nand',
       x: 480,
       y: 200,
       io: [['o', '~q', 'i'],
            ['o', 'nand1', 'i1']]
     }
   }
  }
,
  {name: 'Metastability',
   intro: '<p>If a latch becomes opaque at the same moment that its data input changes value, the latch may be caught between accepting and rejecting the new data value.  To prevent this uncertainty, the logic preceding the latch will typically <i>set up</i> a new data value for at least a minimum amount of time before the latch becomes opaque, and it will also <i>hold</i> the data value for a minimum amount of time after the latch becomes opaque.</p><p>The circuit below does not meet the minimum set-up and hold times.  As a result, when D changes value at the same time as E becomes 0, the output of the latch depends on the speed of the wires. <b>Adjust the simulation speed using the speed slider in order to ensure that the latch becomes opaque without capturing the new D value.</b></p><p>Tip: You may need to click in the truth table to restart a test sequence with a new speed.</p>',
   outro: '<p>You may have noticed that at the default speed (the middle tick mark on the speed slider), the latch becomes opaque with two different values inside it.  When this occurs, the latch isn\'t stable at a particular value, but instead is <i>metastable</i> while the different values chase each other through the latch\'s recirculating gates.</p>',
   truth: [[{e:1, d:0,   q:0, '~q':1},
            {e:0, d:1,   q:0, '~q':1}],
           [{e:1, d:1,   q:1, '~q':0},
            {e:0, d:0,   q:1, '~q':0}]],
   cells: {
     e: {type: 'input',
         x: -210,
         y: 130,
         io: [['o', 'nand3', 'i0'],
              ['o', 'nand4', 'i0']]
        }
     ,
     d: {type: 'input',
         x: 200,
         y: 145,
         io: [['o', 'nand3', 'i1'],
              ['o', 'inv', 'i']]
        }
     ,
     q: {type: 'output',
         x: 600,
         y: 100
        }
     ,
     '~q': {type: 'output',
         x: 600,
         y: 190
        }
     ,
     nand1:{
       type: 'nand',
       x: 480,
       y: 100,
       io: [['o', 'q', 'i'],
            ['o', 'nand2', 'i0']]
     }
     ,
     nand2: {
       type: 'nand',
       x: 480,
       y: 190,
       io: [['o', '~q', 'i'],
            ['o', 'nand1', 'i1']]
     }
     ,
     nand3: {
       type: 'nand',
       x: 360,
       y: 90,
       io: [['o', 'nand1', 'i0']]
     }
     ,
     nand4: {
       type: 'nand',
       x: 360,
       y: 200,
       io: [['o', 'nand2', 'i1']]
     }
     ,
     inv: {
       type: 'inv',
       x: 285,
       y: 210,
       io: [['o', 'nand4', 'i1']]
     }
   }
  }
,
  {name: 'Meeting hold requirement',
   intro: '<p>This circuit uses a pre-built transparent-high latch cell. <b>Connect the E and D pins in such a way that the new D value is not captured if it changes at the same time as E changes to 0.</b></p><p>Tip: Make sure that the D value meets the hold time requirement.</p>',
   outro: '<p>Does your solution work for all simulation speeds?</p>',
   truth: [[{e:1, d:0,   q:0, '~q':1},
            {e:1, d:1,   q:1, '~q':0},
            {e:0, d:0,   q:1, '~q':0},
            {e:0, d:1,   q:1, '~q':0}],
           [{e:1, d:1,   q:1, '~q':0},
            {e:1, d:0,   q:0, '~q':1},
            {e:0, d:1,   q:0, '~q':1},
            {e:0, d:0,   q:0, '~q':1}]],
   cells: {
     e: {
       type: 'input',
       x: 100,
       y: 100,
       io: [['o', 'inv1', 'i']]
     }
     ,
     d: {
       type: 'input',
       x: 100,
       y: 200
     }
     ,
     inv1: {
       type: 'inv',
       x: 225,
       y: 0,
       io: [['o', 'inv2', 'i']]
     }
     ,
     inv2: {
       type: 'inv',
       x: 325,
       y: 0,
       io: [['o', 'latch', 'e']]
     }
     ,
     latch: {
       type: 'latch',
       x: 450,
       y: 120,
       io: [['q', 'q', 'i'],
            ['~q', '~q', 'i']]
     }
     ,
     q: {
       type: 'output',
       x: 600,
       y: 100
     }
     ,
     '~q': {
       type: 'output',
       x: 600,
       y: 140
     }
   }
  }
//  {name: 'Meeting set-up requirement',
//   intro: '<p>This circuit uses a pre-built transparent-high latch cell. <b>Connect the E and D pins in such a way that the new D value is captured if it changes at the same time as E changes to 0.</b></p>',
];
