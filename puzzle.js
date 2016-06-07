// Copyright 2016 Christopher P. Nelson - All rights reserved.

'use strict';

var x = undefined;
Level.prototype.puzzle = [
  {name: 'Press play',
   section: 'Introduction to combinational circuits',
   ui: true,
   intro: '<p>&#9733; <b>Press the play button &play; below</b> to transmit the electrical value from the stimulus pin "A" to the test pin "Z". &#9733;</p>',
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
   intro: '<p>If you\'re going to be a circuit designer, you\'ll have to get your hands dirty. <b>Draw a wire to connect A to Z.</b></p><p>Tip to draw a wire: While the mouse is over the stub at the right side of A, press and hold the mouse button, then move the mouse to the stub at the left side of Z before releasing the mouse button.</p><p>Tip: Press play &play; to verify that your circuit is correct.</p>',
   outro: '<p>You can also draw a wire in the other direction. The direction that data flows on the wire is determined by what it\'s connected to.</p>',
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
   intro: '<p>A circuit must typically pass multiple tests to prove that it is correct. <b>The truth table on the left shows what values are required</b> at the test pins for each set of values on the stimulus pins.</p><p>Clicking play &play; causes each row of the truth table to be tested until every row has passed or until some row has failed.</p>',
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
  {name: 'The NOT gate',
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
           y: 150,
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
  {name: 'Delete a wire',
   ui: true,
   intro: '<p>This circuit is wired incorrectly. <b>Delete the incorrect wire and connect the NOT gate into the circuit.</b></p><p>A wire can be deleted by dragging from one end of the wire to the other end.  Alternatively, double click on one end of the wire.</p>',
   outro: '<p>A wire leading to the input of a gate can also be deleted by connecting another wire to that same input.  Only one wire at a time can be connected to any gate\'s input port.</p>',
   truth: [{a: 0, z: 1},
           {a: 1, z: 0}],
   hide: ['speed'],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'z', 'i', 1]] // this wire is unlocked
        }
     ,
     inv: {type: 'inv',
           x: 250,
           y: 150
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
   intro: '<p><b>Drag the NOT gate from the inventory box at the left into the drawing area. Wire it so that data flows from A, through the NOT gate, to Z.</b></p><p>Tip to drag the NOT gate: While the mouse is over the NOT gate, press and hold the mouse button, then move the mouse into the drawing area near the stimulus and test pins before releasing the mouse button.</p><p>Tip: Simply touching two wire stubs is not sufficient to transmit a value between them. A wire must be drawn from one to the other.</p>',
   outro: '<p>The stock of gates in the inventory may be limited.  Design efficiently!</p>',
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
  {name: 'Zoom controls',
   ui: true,
   intro: '<p>For larger puzzles, you can zoom in <svg style="vertical-align:middle" width="1em" height="1em" viewBox="0 0 100 100"><circle cx="37" cy="37" r="20" stroke="#888" stroke-width="7" fill="none"/><path d="M37,30v14M30,37h14M52,52L83,83" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>, zoom out <svg style="vertical-align:middle" width="1em" height="1em" viewBox="0 0 100 100"><circle cx="37" cy="37" r="20" stroke="#888" stroke-width="7" fill="none"/><path d="M30,37h14M52,52L83,83" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>, and zoom to fit <svg style="vertical-align:middle" width="1em" height="1em" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" stroke="#888" stroke-width="3" fill="none"/><path d="M50,42V20M40,30L50,20L60,30M58,50H80M70,40L80,50L70,60M50,58V80M40,70L50,80L60,70M42,50H20M30,40L20,50L30,60" stroke="#888" stroke-width="5" stroke-linecap="round" fill="none"/></svg> using the controls in the lower right.  You can also zoom in and out using the scroll wheel on your mouse or by pinching in the drawing area on a touchscreen.</p><p>You can also pan the drawing area by dragging the background.</p><p>Tip: on a touch screen, you can drag a gate or wire and simultaneously pan or zoom the drawing area to where you want to put it.</p>',
   outro: '<p>You can play this game on a small screen such as a smartphone, but you\'ll have to do a lot of zooming and panning.  You may find the later puzzles easier on a larger screen.</p><p>If you need more drawing room, you can hide this info panel by clicking the arrow in the corner<svg style="vertical-align:middle" width="1em" height="1em" viewBox="0 0 100 100"><path d="M30,45H15V15H45V30" stroke="#888" stroke-width="3" fill="none"/><path d="M30,55v-25h25M30,30L80,80" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>.</p>',
   truth: [{a: 0,   z: 1},
           {a: 1,   z: 0}],
   hide: ['speed'],
   avail: ['inv'],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 1100,
         y: 1100
        }
   }
  }
,
  {name: 'Simulation controls',
   ui: true,
   intro: '<p><b>Here are some new ways to control the simulation.</b></p><p>The small buttons next to the play button &play; tell the simulation to pause when the propagating values have reached a gate <svg style="vertical-align:middle" width="1.2857em" height="1em" viewBox="-4 -2 18 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M0,0v10h5a5,5,0,0,0,0,-10h-5z" stroke="#888" stroke-width="1.5"/><path d="M-2.5,2.5H0M-2.5,7.5H0M12.5,5H10" stroke="#888" stroke-width="1"/></svg>, when one truth table line has passed testing <svg style="vertical-align:middle" width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg>, or when all truth table rows have passed <svg style="vertical-align:middle" width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><rect x="-4" y="-2" width="18" height="14" stroke-width="0" rx="3" ry="3"/><path d="M0.25,2.5l1.25,2.5l2.5,-5M0.25,7.5l1.25,2.5l2.5,-5M5.5,2.5l1.25,2.5l2.5,-5M5.5,7.5l1.25,2.5l2.5,-5" stroke="#888" stroke-width="1"/></svg>.</p><p>The "speed" slider adjusts the speed of data flow from slow to fast.</p>',
   outro: '<p>You can switch to testing a different truth table row by clicking on that row. Double clicking a row selects it and immediately starts simulation (as if you clicked play &play;). If simulation is paused immediately after one truth table row has passed, clicking play &play; automatically advances to the next row.</p>',
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
   intro: '<p><b>Add a wire to connect A to Z and another wire to connect A to Y.</b></p><p>Tip: The stub on the right side of the stimulus pin is an output port, which can be connected to the input ports on the left sides of both test pins.</p><p>Tip: A wire cannot connect from an input directly to another input. If you drag from Z to Y, it will move the existing wire (if any), or it will fail.',
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
   intro: '<p><b>Check the truth table</b> to see how this circuit should be connected.</p><p>Tip: The table says that when A is 1, Z must get a 1 value, and Y must get 0. It also says what values must go to the test pins when A is 0.</p>',
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
  {name: 'The AND gate',
   intro: '<p><b>An AND gate outputs a 1 only if its first input is 1 <i>and</i> its second input is 1.</b> Otherwise the output of the AND gate is 0.</p>',
   outro: '<p>When one of an AND gate\'s inputs is 1, then the value of the other input is propagated to the output of the gate. Otherwise, the gate output is 0.</p><p><b>Make sure you clearly understand the relationship of the AND gate\'s output with its inputs</b>, as displayed in the truth table. You will soon learn five other simple logic gates, each of which perform a different logic function.</p>',
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
  {name: 'The NAND gate',
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
   intro: '<p><b>A NAND gate can be decomposed into an AND gate followed by an NOT gate.</b> The result is NOT 1 only if the AND gate\'s output is 1. In other words, it performs a NOT-AND function, also known as NAND.</p>',
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
   outro: '<p>NAND gates are particularly small and fast in most types of circuits, so it is convenient that they are also so versatile.</p>',
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
  {name: 'The OR gate',
   intro: '<p><b>An OR gate outputs a 1 if its first input is 1 <i>or</i> its second input is 1</b> (or both are 1). Otherwise the output of the OR gate is 0.</p>',
   outro: '<p>When one of an OR gate\'s inputs is 0, then the value of the other input is propagated to the output of the gate. Otherwise, the gate output is 1.</p><p>An OR gate is more precisely described with the legal term "and/or" because its output is 1 if its first input is 1 <i>and/or</i> its second input is 1.</p>',
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
  {name: 'The NOR gate',
   intro: '<p><b>A NOR gate outputs an inverted value as compared to an OR gate.</b></p><p>In this puzzle we introduce the concept of a "don\'t care" value. If A is 1, we know that the output of the NOR gate must always be 0, so we <i>don\'t care</i> what B is. Likewise, we <i>don\'t care</i> what A is when B is 1.</p>',
   outro: '<p>This circuit simulator uses a black color to represent a value that is unknown, which includes "don\'t care" values. If a logic gate has an unknown input, a logic gate may output a known or unknown value depending on its input(s) and its logic function.</p>',
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
  {name: 'The XOR and XNOR gates',
   intro: '<p>An XOR gate performs an "exclusive or" function. <b>An XOR gate outputs a 1 if its first input is &nbsp;1 <i>or</i> its second input is &nbsp;1 <i>excluding</i> the case that both inputs are 1.</b> I.e. unlike an OR gate, an XOR gate outputs 0 if both of its inputs are 1.</p><p><b>An XNOR gate outputs an inverted value as compared to an XOR gate.</b></p>',
   outro: '<p>When one of an XOR gate\'s inputs is 0, then the value of the other input is propagated to the output of the gate. Otherwise, the value of the other input is inverted at the output.</p><p>There are no "don\'t care" cases for the XOR and XNOR gates.</p>',
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
  {name: 'De Morgan&rsquo;s law (1)',
   intro: '<p>Augustus De Morgan proved that "not (A and B)" is the same as "(not A) or (not B)".  <b>Use De Morgan\'s law to output the desired values for the truth table</b> using only inverters and NAND gates.</p>',
   outro: '<p>Both the OR gate and the NAND gate output a 1 for three out of four combinations of input values.  They differ only in which combination outputs 0.</p>',
   truth: [{a:0, b:0,   z:1, y:1, x:1, w:0},
           {a:0, b:1,   z:1, y:1, x:0, w:1},
           {a:1, b:0,   z:1, y:0, x:1, w:1},
           {a:1, b:1,   z:0, y:1, x:1, w:1}],
   avail: ['inv', 'nand'],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 190
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 310
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 100
        }
     ,
     y: {type: 'output',
         x: 600,
         y: 200
        }
     ,
     x: {type: 'output',
         x: 600,
         y: 300
        }
     ,
     w: {type: 'output',
         x: 600,
         y: 400
        }
   }
  }
,
  {name: 'De Morgan&rsquo;s law (2)',
   intro: '<p>De Morgan also proved that "not (A or B)" is the same as "(not A) and (not B)".  <b>Output the desired values for the truth table</b> using only inverters and NOR gates.</p>',
   outro: '<p>Both the AND gate and the NOR gate output a 1 for one out of four combinations of input values.  They differ only in which combination outputs the 1.</p>',
   truth: [{a:0, b:0,   z:0, y:0, x:0, w:1},
           {a:0, b:1,   z:0, y:0, x:1, w:0},
           {a:1, b:0,   z:0, y:1, x:0, w:0},
           {a:1, b:1,   z:1, y:0, x:0, w:0}],
   avail: ['inv', 'nor'],
   cells: {
     a: {type: 'input',
         x: 100,
         y: 190
        }
     ,
     b: {type: 'input',
         x: 100,
         y: 310
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 100
        }
     ,
     y: {type: 'output',
         x: 600,
         y: 200
        }
     ,
     x: {type: 'output',
         x: 600,
         y: 300
        }
     ,
     w: {type: 'output',
         x: 600,
         y: 400
        }
   }
  }
,
  {name: 'Build another mux',
   intro: '<p><b>Build a circuit that outputs either A or B, depending on the value of S.</b>  You\'ve done this before, but this time you\'ll need to use De Morgan\'s laws to build the circuit using only NAND gates and NOT gates.</p>',
   outro: '<p>Augustus De Morgan would be proud.</p>',
   truth: [{s:0, a:0,        z:0},
           {s:0, a:1,        z:1},
           {s:1,      b:0,   z:0},
           {s:1,      b:1,   z:1}],
   avail: ['inv', 'nand'],
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
  {name: 'Build an XOR gate',
   intro: '<p><b>Implement the XOR function using only NAND gates.</b></p>',
   outro: '<p>Six NAND gates is good.  Five NAND gates is excellent.</p>',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['nand'],
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
         x: 700,
         y: 150
        }
   }
  }
,
  {name: 'Detect odd',
   intro: '<p><b>Determine whether an odd number of stimulus pins have a 1 value.</b></p><p>Tip: Start with a circuit that works when&nbsp;C is 0, then add logic to handle the cases when C is 1.</p>',
   outro: '<p>Notice that it doesn\'t matter what order you put the XOR gates in. The result is always the same.</p>',
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
  {name: 'Detect &gt;= 2',
   intro: '<p><b>Determine whether at least two stimulus pins have a 1 value.</b></p>',
   outro: '<p>The solutions to this puzzle and the previous one together comprise a <i>full adder</i>, which will be explained later.</p>',
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
  {name: 'Multi-bit values',
   section: 'Introduction to multi-bit values',
   ui: true,
   intro: '<p>A single wire can only carry one <i>bit</i> of information, either a 0 or 1.  <b>Multiple wires can be grouped together as a multi-bit <i>bus</i></b>, which can carry a wider range of values.  In the same way that three decimal (base 10) digits such as 123 represents 3&times;1+2&times;10+1&times;100, three <a href="https://en.wikipedia.org/wiki/Binary_number">binary (base 2)</a> bits such as 101 represents 1&times;1+0&times;2+1&times;4.</p><p>This game displays multi-bit values in their decimal form, but keep in mind the underlying binary representations.</p>',
   outro: '<p>A cluster of identical logic cells is displayed as a single cell with a multiplier printed next to it.</p>',
   truth: [{a:0,   z:0},
           {a:1,   z:1},
           {a:2,   z:2},
           {a:3,   z:3},
           {a:4,   z:4},
           {a:5,   z:5},
           {a:6,   z:6},
           {a:7,   z:7}],
   avail: [],
   cells: {
     a: {type: 'input',
         width: 3,
         x: 100,
         y: 100,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         width: 3,
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'Create a gate cluster',
   ui: true,
   intro: '<p>Hooking a wire to the output port of a cluster of logic cells automatically converts the wire to a multi-bit bus that can carry all of the cell outputs.  Hooking a multi-bit bus to the input port of a logic cell converts the cell into a cell cluster that can make use of all of the input bits.  In this way, the multi-bit width propagates downstream.</p><p><b>Hook up a cluster of NOT gates in order to invert the multi-bit values.</b></p>',
   outro: '<p>Decimal value 0 is binary value 000.  When 000 passes through the NOT cluster, it becomes 111, which is 1&times;1+1&times;2+1&times;4 = 7.  You might want to carefully consider the remaining rows in the truth table to understand the conversion of decimal to binary and binary to decimal.</p>',
   truth: [{a:0,   z:7},
           {a:1,   z:6},
           {a:2,   z:5},
           {a:3,   z:4},
           {a:4,   z:3},
           {a:5,   z:2},
           {a:6,   z:1},
           {a:7,   z:0}],
   avail: ['inv'],
   cells: {
     a: {type: 'input',
         width: 3,
         x: 100,
         y: 100
        }
     ,
     z: {type: 'output',
         width: 3,
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'Mix single-bit and multi-bit values',
   ui: true,
   intro: '<p>A single-bit wire can also be connected to the input of a gate cluster, in which case the wire implicitly fans out to supply all of the gates in the cluster.</p><p><b>Selectively propagate the multi-bit value from A to Z only when S is 1.  Otherwise, clear the Z value to 0.</b></p>',
   outro: '<p>Did you notice that the x2 cluster of AND gates used two AND gates from the gate inventory?</p>',
   truth: [{a:0, s:0,   z:0},
           {a:1, s:0,   z:0},
           {a:2, s:0,   z:0},
           {a:3, s:0,   z:0},
           {a:0, s:1,   z:0},
           {a:1, s:1,   z:1},
           {a:2, s:1,   z:2},
           {a:3, s:1,   z:3}],
   avail: ['and', 2],
   cells: {
     a: {type: 'input',
         width: 2,
         x: 100,
         y: 100
        }
     ,
     s: {type: 'input',
         x: 100,
         y: 200
        }
     ,
     z: {type: 'output',
         width: 2,
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'Single-row mystery',
   intro: '<p><b>What multi-bit function is expressed in the truth table?</b></p><p>Tip: The same function is applied to all bits.</p>',
   outro: '<p>Converting between decimal and binary in your head sure is annoying, isn\'t it?  I hope you\'ve memorized your powers of 2.</p>',
   hint: ['<p>You can\'t think logically about this puzzle unless you first convert the decimal values to binary.</p>',
          '<p>This puzzle with four bits being tested by one truth table row is the equivalent of a puzzle with one bit being tested by four truth table rows.</p>'],
   truth: [{a:12, b:10,   z:9}],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 100,
         y: 100
        }
     ,
     b: {type: 'input',
         width: 4,
         x: 100,
         y: 200
        }
     ,
     z: {type: 'output',
         width: 4,
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'The condenser',
   intro: '<p>A condenser bundles single-bit wires into a multi-bit bus.  <b>Use the condenser to convert two 1-bit signals into one 2-bit signal.</b></p>',
   outro: '<p>The multi-bit output gets its 2<sup>0</sup> bit (the <i>little end</i>) from the bottom input of the condenser and its 2<sup>n-1</sup> bit (the <i>big end</i>) from the top.</p>',
   truth: [{a1:0, a0:0,   z:0},
           {a1:0, a0:1,   z:1},
           {a1:1, a0:0,   z:2},
           {a1:1, a0:1,   z:3}],
   avail: [],
   cells: {
     a1: {type: 'input',
         x: 100,
         y: 100
         }
     ,
     a0: {type: 'input',
         x: 100,
         y: 200
         }
     ,
     c: {type: 'condenser',
         x: 250,
         y: 150
         }
     ,
     z: {type: 'output',
         width: 2,
         x: 400,
         y: 150
        }
   }
  }
,
  {name: 'Resize a condenser',
   intro: '<p><b>Resize a condenser to three bits</b> by dragging its top edge upward or its bottom edge downward.  A condenser can resized to any width from 2 to 8 bits.</p>',
   outro: '<p>Individual wires allow for more flexible logic, while a multi-bit bus allows easier interpretation of a larger value.  A condenser allows both forms in the same circuit.</p>',
   truth: [{a2:0, a1:0, a0:0,   z:0},
           {a2:0, a1:0, a0:1,   z:1},
           {a2:0, a1:1, a0:0,   z:2},
           {a2:0, a1:1, a0:1,   z:3},
           {a2:1, a1:0, a0:0,   z:4},
           {a2:1, a1:0, a0:1,   z:5},
           {a2:1, a1:1, a0:0,   z:6},
           {a2:1, a1:1, a0:1,   z:7}],
   avail: ['condenser'],
   cells: {
     a2: {type: 'input',
         x: 100,
         y: 0
         }
     ,
     a1: {type: 'input',
         x: 100,
         y: 100
         }
     ,
     a0: {type: 'input',
         x: 100,
         y: 200
         }
     ,
     z: {type: 'output',
         width: 3,
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'Seven-segment decode',
   section: 'Advanced combinational circuits',
   intro: '<p><b>Decode each decimal value&nbsp;(0-9) to drive a seven-segment display.</b></p>',
   outro: '<p>Were you able to design your circuit using 25 gates or fewer?</p>',
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
   outro: '<p>Were you able to design your circuit using 25 gates or fewer?</p>',
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
  {name: 'The D latch',
   section: 'Introduction to latches',
   intro: '<p>A <i>D latch</i> is our first storage element. It passes its D (data) input to its Q output when its E (enable) input is 1, but it holds its Q output constant when E is 0. The latch is described as <i>transparent</i> when data is allowed to pass through it and <i>opaque</i> when its output is held constant.</p><p>In order to test a circuit with storage elements, each boxed section of the truth table contains multiple lines. Each line represents one step of a test sequence. Clicking in the truth table starts a fresh test sequence for the selected row.</p>',
   outro: '<p>Simulation can be automatically paused when one line of a test sequence has passed <svg style="vertical-align:middle" width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg> or when all lines of a test sequence have passed <svg style="vertical-align:middle" width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M3,2.5l1.25,2.5l2.5,-5M3,7.5l1.25,2.5l2.5,-5" stroke="#888" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>.</p>',
   truth: [[{e:1, d:0,   q:0},
            {e:1, d:1,   q:1},
            {e:0, d:1,   q:1},
            {e:0, d:0,   q:1}],
           [{e:1, d:1,   q:1},
            {e:1, d:0,   q:0},
            {e:0, d:0,   q:0},
            {e:0, d:1,   q:0}]],
   cells: {
     e: {type: 'input',
         x: 100,
         y: 100,
         io: [['o', 'latch', 'e']]
        }
     ,
     d: {type: 'input',
         x: 100,
         y: 200,
         io: [['o', 'latch', 'd']]
        }
     ,
     latch: {
       type: 'latch',
       x: 280,
       y: 120,
       io: [['q', 'q', 'i']]
     }
     ,
     q: {type: 'output',
         x: 400,
         y: 100
        }
   }
  }
,
  {name: 'An SR latch',
   intro: '<p>A D latch is typically built with an <i>SR latch</i> inside, as shown in the circuit below. It can be <i>set</i> to 1 or <i>reset</i> to 0 by its inputs. If it is currently neither set nor reset, then it holds its last value by recirculating that value infinitely.</p><p><b>Connect the S pin so that it sets the latch to 1 and the R pin so that it resets the latch to 0.</b></p>',
   outro: '<p>What happens if S and R are both 1?</p>',
   truth: [[{s:1, r:0,   q:1},
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
  {name: 'Build a D latch',
   intro: '<p>The logic that feeds the SR latch can be built up to implement the D latch. Because NAND gates are generally easier to implement using silicon transistors, a more common SR latch design uses a pair of NAND gates to recirculate the data. This latch design has the convenient property that the latch output is available in both regular and inverted forms.</p><p><b>Connect the latch so that it is transparent and propagates the D value only when E is 1.</b> Once the latch output is initialized, ~Q must be the inverted value of Q.</p>',
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
   intro: '<p>If a latch becomes opaque at the same moment that its data input changes value, the latch may be caught between accepting and rejecting the new data value. To prevent this uncertainty, the logic preceding the latch will typically <i>set up</i> a new data value for at least a minimum amount of time before the latch becomes opaque, and it will also <i>hold</i> the data value for a minimum amount of time after the latch becomes opaque.</p><p>The circuit below does not meet the minimum set-up and hold times. As a result, when D changes value at the same time as E becomes 0, the output of the latch depends on the speed of the wires. <b>Adjust the simulation speed using the speed slider in order to ensure that the latch becomes opaque without capturing the new D value.</b></p><p>Tip: You may need to click in the truth table to restart a test sequence with a new speed.</p>',
   outro: '<p>You may have noticed that at the default speed (the middle tick mark on the speed slider), the latch becomes opaque with two different values inside it. When this occurs, the latch isn\'t stable at a particular value, but instead is <i>metastable</i> while the different values chase each other through the latch\'s recirculating gates.</p>',
   truth: [[{e:1, d:0,   q:0},
            {e:0, d:1,   q:0}],
           [{e:1, d:1,   q:1},
            {e:0, d:0,   q:1}]],
   avail: [],
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
       io: [['o', 'nand1', 'i1']]
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
   intro: '<p>This circuit uses a pre-built D latch cell. <b>Connect the E and D pins in such a way that the new D value is not captured if it changes at the same time as E changes to 0.</b></p><p>Tip: Make sure that the D value meets the hold time requirement.</p>',
   outro: '<p>Does your solution work for all simulation speeds?</p>',
   truth: [[{e:1, d:0,   q:0},
            {e:1, d:1,   q:1},
            {e:0, d:0,   q:1},
            {e:0, d:1,   q:1}],
           [{e:1, d:1,   q:1},
            {e:1, d:0,   q:0},
            {e:0, d:1,   q:0},
            {e:0, d:0,   q:0}]],
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
       io: [['q', 'q', 'i']]
     }
     ,
     q: {
       type: 'output',
       x: 600,
       y: 100
     }
   }
  }
,
  {name: 'Meeting set-up requirement',
   intro: '<p>This circuit uses a pre-built D latch cell. <b>Connect the E and D pins in such a way that the new D value is captured if it changes at the same time as E changes to 0.</b></p><p>Tip: Make sure that the D value meets the set-up time requirement.</p>',
   outro: '<p>Does your solution work for all simulation speeds?</p>',
   truth: [[{e:1, d:0,   q:0},
            {e:1, d:1,   q:1},
            {e:0, d:0,   q:0},
            {e:0, d:1,   q:0}],
           [{e:1, d:1,   q:1},
            {e:1, d:0,   q:0},
            {e:0, d:1,   q:1},
            {e:0, d:0,   q:1}]],
   cells: {
     e: {
       type: 'input',
       x: 100,
       y: 100
     }
     ,
     d: {
       type: 'input',
       x: 100,
       y: 200,
       io: [['o', 'inv1', 'i']]
     }
     ,
     inv1: {
       type: 'inv',
       x: 225,
       y: 300,
       io: [['o', 'inv2', 'i']]
     }
     ,
     inv2: {
       type: 'inv',
       x: 325,
       y: 300,
       io: [['o', 'latch', 'd']]
     }
     ,
     latch: {
       type: 'latch',
       x: 450,
       y: 120,
       io: [['q', 'q', 'i']]
     }
     ,
     q: {
       type: 'output',
       x: 600,
       y: 100
     }
   }
  }
,
  {name: 'Entrance bell',
   section: 'Latch-based circuits',
   intro: '<p>A store owner has a pair of electric eyes at the front of her store that each output a 1 when the light path is uninterrupted and a 0 when the beam is broken. The eyes are arranged so that a person entering the store blocks only the first eye\'s beam, then both beams, then only the second eye\'s beam. <b>Design a circuit that rings a bell when both beams are broken as a person enters, but not as a person leaves.</b></p>',
   outro: '<p>Ding!</p>',
   hint: ['<p>Knowing that both beams are broken is not enough information to determine the direction of travel. A storage element is needed to remember which beam was previously broken.</p>',
          '<p>A D latch holds its previous input value when its enable goes to 0.</p>'],
   soln: '1s3-0,o,3,d-0,o,5,i0-1,o,3,e-1,o,4,i1;250,latch,150+q,4,i0;380,or,190+o,5,i1;480,nor,100+o,2,i',
   truth: [[{b1:1, b2:1,   z:0},
            {b1:0, b2:1,   z:0},
            {b1:0, b2:0,   z:1},
            {b1:1, b2:0,   z:0},
            {b1:1, b2:1,   z:0}],
           [{b1:1, b2:1,   z:0},
            {b1:1, b2:0,   z:0},
            {b1:0, b2:0,   z:0},
            {b1:0, b2:1,   z:0},
            {b1:1, b2:1,   z:0}]],
   avail: ['latch', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     b1: {
       type: 'input',
       x: 100,
       y: 100
     }
     ,
     b2: {
       type: 'input',
       x: 100,
       y: 200
     }
     ,
     z: {
       type: 'output',
       x: 600,
       y: 100
     }
   }
  }
,
  {name: 'Build a D flip-flop',
   intro: '<p>Sequential circuits are typically built around an oscillating clock signal. The clock cannot simply be used as the enable to a D latch because doing so would allow values to propagate all the way through the circuit while the clock is high.</p><p><b>Design a circuit that transmits the D input to the Q output only as the CLK signal transitions from 0 to 1.</b></p>',
   outro: '<p>This circuit is called a D flip-flop. If you used a chained pair of latches, it is a master-slave D flip-flop.</p>',
   hint: ['<p>If you use a latch as the storage element, the input to the latch needs to be held constant while the latch is transparent.</p>',
         '<p>Use two latches in series with opposite polarity enables.</p>',
         '<p>Make sure that the first latch meets the hold time requirement of the second.</p>'],
   soln: '1s3-0,o,4,d-1,o,5,i-1,o,3,e;540,latch,200+q,2,i;380,latch,20+q,3,d;240,inv,140+o,4,e',
   truth: [[{d:0, clk:0,   q:x},
            {d:0, clk:1,   q:0},
            {d:1, clk:1,   q:0},
            {d:1, clk:0,   q:0},
            {d:0, clk:0,   q:0},
            {d:1, clk:0,   q:0},
            {d:1, clk:1,   q:1},
            {d:0, clk:1,   q:1},
            {d:0, clk:0,   q:1},
            {d:1, clk:0,   q:1},
            {d:0, clk:0,   q:1},
            {d:0, clk:1,   q:0}]],
   avail: ['latch', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     d: {
       type: 'input',
       x: 100,
       y: 100
     }
     ,
     clk: {
       type: 'input',
       x: 100,
       y: 200
     }
     ,
     q: {
       type: 'output',
       x: 700,
       y: 100
     }
   }
  }
,
  {name: 'Asynchronous reset',
   intro: '<p>A regular D flip-flop does not have a defined value until the first time that its clock signal goes from 0 to 1. To ensure predictable results, a circuit will typically include a reset signal to initialize its flip-flop values.</p><p><b>Build a D flip-flop that includes a reset signal that forces its output to 0 regardless of the state of its clock signal.</b> After the reset signal is cleared, ensure that the output 0 value is held until the next rising clock edge.</p>',
   outro: '<p>This type of reset is an asynchronous reset. If the output were only cleared at the rising edge of the clock, it would be a synchronous reset.</p>',
   truth: [[{d:0, clk:0, r:1,   q:0},
            {d:0, clk:1, r:1,   q:0},
            {d:1, clk:1, r:1,   q:0},
            {d:1, clk:0, r:1,   q:0},
            {d:1, clk:0, r:0,   q:0},
            {d:1, clk:1, r:0,   q:1},
            {d:0, clk:1, r:0,   q:1}],
           [{d:1, clk:0, r:1,   q:0},
            {d:1, clk:1, r:1,   q:0},
            {d:0, clk:1, r:1,   q:0},
            {d:0, clk:0, r:1,   q:0},
            {d:0, clk:0, r:0,   q:0},
            {d:0, clk:1, r:0,   q:0},
            {d:1, clk:1, r:0,   q:0}],
           [{d:1, clk:0, r:1,   q:0},
            {d:1, clk:1, r:1,   q:0},
            {d:1, clk:1, r:0,   q:0}],
           [{d:0, clk:0, r:1,   q:0},
            {d:0, clk:1, r:1,   q:0},
            {d:0, clk:1, r:0,   q:0}],
           [{d:1, clk:0, r:1,   q:0},
            {d:1, clk:0, r:0,   q:0}],
           [{d:1, clk:1, r:1,   q:0},
            {d:1, clk:1, r:0,   q:0}]],
   avail: ['latch', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     d: {
       type: 'input',
       x: 100,
       y: 100
     }
     ,
     clk: {
       type: 'input',
       x: 100,
       y: 200
     }
     ,
     r: {
       type: 'input',
       x: 100,
       y: 300
     }
     ,
     q: {
       type: 'output',
       x: 700,
       y: 100
     }
   }
  }
];
