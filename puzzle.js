// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

// Return a random integer between min and max, inclusive.
Level.prototype.rnd = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var x = undefined;
Level.prototype.puzzle = [
  {name: 'Press play',
   section: 'Introduction',
   ui: true,
   intro: '<p>&#9733; <b>Press the play button &play; below</b> to transmit the electrical value from the stimulus pin "A" to the test pin "Z". &#9733;</p>',
   outro: '<p>Click the "Next challenge" button to learn more about the circuit design challenges in Boole\'s Errand.</p>',
   hint: ['<p>You don\'t need a hint for this challenge.  But don\'t be afraid to ask for one when things get more difficult.</p>'],
   truth: [{a: 1,   z: 1}],
   hide: ['truth', 'speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 200,
         y: 0
        }
   }
  }
,
  {name: 'Draw a wire',
   ui: true,
   intro: '<p>If you\'re going to be a circuit designer, you\'ll have to get your hands dirty. <b>Draw a wire to connect A to Z.</b></p><p>Tip to draw a wire: While the mouse is over the stub at the right side of A, press and hold the mouse button, then move the mouse to the stub at the left side of Z before releasing the mouse button.</p><p>Tip: Press play &play; to verify that your circuit is correct.</p>',
   outro: '<p>You can also draw a wire in the other direction. The direction that data flows on the wire is determined by what it\'s connected to.</p>',
   hint: ['<p>Go back to the help menu and select "Show introduction".  It has all the information you need.</p>',
          '<p>Look, if you\'re so bored that you\'re reading every hint, maybe you should use the main menu to skip ahead to a harder challenge.  But don\'t come running to me when you don\'t know how to delete a wire.</p>'],
   soln: '1s2-0,o,1,i',
   truth: [{a: 1,   z: 1}],
   hide: ['truth', 'speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 200,
         y: 0
        }
   }
  }
,
  {name: 'The truth table',
   ui: true,
   intro: '<p>A circuit must typically pass multiple tests to prove that it is correct. <b>The truth table on the left shows what values are required</b> at the test pins for each set of values on the stimulus pins.</p><p>Clicking play &play; causes each row of the truth table to be tested until every row has passed or until some row has failed.</p>',
   outro: '<p>Every row of the truth table must pass with a check mark in order to move on to the next challenge.</p>',
   hint: ['<p>Press play &play; to watch the simulator verify each row of the truth table.</p>'],
   truth: [{a: 0,   z: 0},
           {a: 1,   z: 1}],
   hide: ['speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 200,
         y: 0
        }
   }
  }
,
  {name: 'Wire fanout',
   ui: true,
   intro: '<p>Multiple wires can be connected to the same data source. <b>Add a wire to connect A to Z and another wire to connect A <span>to Y.</span></b></p><p>Tip: The stub on the right side of the stimulus pin is an output port, which can be connected to the input ports on the left side of both test pins.</p><p>Tip: A wire cannot connect from an input port directly to another input port. If you drag from Z to Y, it will move the existing wire (if any), or it will fail.',
   outro: '<p>As many wires as you want can <i>fan out</i> from any output port.</p>',
   hint: ['<p>If a wire is connected to an input or output port, a short crossbar indicates the spot where you can interact with the wire or add another wire.</p>'],
   soln: '1s3-0,o,1,i-0,o,2,i',
   truth: [{a: 0,   z: 0, y: 0},
           {a: 1,   z: 1, y: 1}],
   hide: ['speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 50
        }
     ,
     z: {type: 'output',
         x: 200,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 200,
         y: 100
        }
   }
  }
,
  {name: 'The NOT gate',
   intro: '<p><b>A NOT gate changes a 0 to 1, or changes a 1 to a 0.</b>  In other words, the output of a NOT gate is 1 only if its input is <i>not</i> 1.</p>',
   outro: '<p><b>The NOT gate is typically represented in text with a tilde.  E.g. <span>Z = ~A.</span></b>  (But be warned: most programming languages apply the tilde operation to general integers, so extra steps must be taken to limit the result to just 0 or 1.)</p><p><b>A NOT gate is also called an inverter.</b></p><p>We\'ll practice with the NOT gate for a bit before introducing some more interesting gates.</p>',
   hint: ['<p>Press play &play; to watch the NOT gate do its thing.</p>'],
   truth: [{a: 0,   z: 1},
           {a: 1,   z: 0}],
   hide: ['speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0,
         io: [['o', 'inv', 'i']]
        }
     ,
     inv: {type: 'inv',
           x: 150,
           y: 50,
           io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'Delete a wire',
   ui: true,
   intro: '<p>This circuit is wired incorrectly. <b>Delete the incorrect wire and connect the NOT gate into the circuit.</b></p><p>A wire can be deleted by dragging from one end of the wire to the other end.  Alternatively, double click on one end of the wire.</p>',
   outro: '<p>A wire leading to an input port of a gate can also be deleted by connecting another wire to that same input.  Only one wire at a time can be connected to any gate\'s input port.</p>',
   hint: ['<p>To draw a wire: While the mouse is at the end of a wire stub, press and hold the mouse button, then move the mouse to the end of another stub, then release the mouse button.</p>',
          '<p>If you\'re confused how the completed circuit should look, you can use the help menu to show a sample solution.</p>'],
   soln: '1s3-0,o,1,i-1,o,2,i',
   truth: [{a: 0, z: 1},
           {a: 1, z: 0}],
   hide: ['speed'],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0,
         io: [['o', 'z', 'i', 1]] // this wire is unlocked
        }
     ,
     inv: {type: 'inv',
           x: 150,
           y: 50
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'Create a gate',
   ui: true,
   intro: '<p>Your stock of gates is in the inventory box on the left.  <b>Drag the NOT gate from the inventory box into the drawing area and wire it into the circuit.</b></p><p>Tip to drag the NOT gate: While the mouse is over the NOT gate, press and hold the mouse button, then move the mouse into the drawing area near the stimulus and test pins before releasing the mouse button.</p><p>Tip: Simply touching two wire stubs is not sufficient to transmit a value between them. A wire must be drawn from one to the other.</p>',
   outro: '<p>The stock of gates in the inventory may be limited.  Design efficiently!</p><p>You can delete a gate and return it to the inventory by dragging it off the canvas.  Deleting a gate also deletes all wires connected to the gate.</p>',
   hint: ['<p>This is just like the previous challenge, except that you have to drag the NOT gate from the inventory box on the left.</p>'],
   soln: '1s2-0,o,2,i;150,inv,0+o,1,i',
   truth: [{a: 0, z: 1},
           {a: 1, z: 0}],
   hide: ['speed'],
   avail: ['inv', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'A simple circuit',
   intro: '<p><b>Check the truth table to see how this circuit should be connected.</b></p><p>Tip: The table says that when A is 1, Z must get a 1 value, and Y must get a 0. It also says what values must go to the test pins when A is 0.</p>',
   outro: '<p>It looks like you\'re getting the hang of it!</p>',
   hint: ['<p>Sorry, but there won\'t be any more hints for the easy challenges.  If you\'re still stuck, you can use the main menu to look at the introductory challenges again.  Or you can use the help menu to see a sample solution.  It\'s up to you to decide if that\'s cheating or not.</p>'],
   soln: '1s3-0,o,3,i-0,o,1,i;160,inv,100+o,2,i',
   truth: [{a: 1,   z: 1, y: 0},
           {a: 0,   z: 0, y: 1}],
   hide: ['speed'],
   avail: ['inv', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'Zoom controls',
   ui: true,
   intro: '<p>For large challenges, you can zoom in <svg width="1em" height="1em" viewBox="0 0 100 100"><circle cx="37" cy="37" r="20" stroke="#888" stroke-width="7" fill="none"/><path d="M37,30v14M30,37h14M52,52L83,83" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>, zoom out <svg width="1em" height="1em" viewBox="0 0 100 100"><circle cx="37" cy="37" r="20" stroke="#888" stroke-width="7" fill="none"/><path d="M30,37h14M52,52L83,83" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>, and zoom to fit <svg width="1em" height="1em" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" stroke="#888" stroke-width="3" fill="none"/><path d="M50,42V20M40,30L50,20L60,30M58,50H80M70,40L80,50L70,60M50,58V80M40,70L50,80L60,70M42,50H20M30,40L20,50L30,60" stroke="#888" stroke-width="5" stroke-linecap="round" fill="none"/></svg> using the controls in the lower right.  You can also zoom in and out using the scroll wheel on your mouse or by pinching in the drawing area on a touchscreen.</p><p>You can also pan the drawing area by dragging the background.</p><p>Tip: on a touch screen, you can drag a gate or wire and simultaneously pan or zoom the drawing area to where you want to put it.</p>',
   outro: '<p>If you need more drawing room, <b>you can hide this info panel by clicking the arrow in the corner<svg width="1em" height="1em" viewBox="0 0 100 100"><path d="M30,45H15V15H45V30" stroke="#888" stroke-width="3" fill="none"/><path d="M30,55v-25h25M30,30L80,80" stroke="#888" stroke-width="7" stroke-linecap="round" fill="none"/></svg>.</b></p><p>You can play this game on a small screen such as a smartphone, but you\'ll have to do a lot of zooming and panning.  Depending on the challenge, rotating the screen can help, but you\'ll find the later challenges to be much easier on a larger screen.</p>',
   soln: '1s2-0,o,2,i;500,inv,500+o,1,i',
   truth: [{a: 0,   z: 1},
           {a: 1,   z: 0}],
   hide: ['speed'],
   avail: ['inv'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 1000,
         y: 1000
        }
   }
  }
,
  {name: 'Simulation controls',
   ui: true,
   intro: '<p>Feeling impatient? <b>The "speed" slider to the right of the play button &play; adjusts the speed of data flow to be faster or slower.</b></p><p>You can pause simulation at precise points using the small buttons to the left of the play button <span>&play;.</span>  These controls pause simulation when all propagating values have reached a <span>gate <svg width="1.2857em" height="1em" viewBox="-4 -2 18 14" fill="none"><path d="M0,0v10h5a5,5,0,0,0,0,-10h-5z" stroke="#888" stroke-width="1.5"/><path d="M-2.5,2.5H0M-2.5,7.5H0M12.5,5H10" stroke="#888" stroke-width="1"/></svg>,</span> when one truth table row has passed its <span>tests <svg width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg>,</span> or when all truth table rows have <span>passed <svg width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M0.25,2.5l1.25,2.5l2.5,-5M0.25,7.5l1.25,2.5l2.5,-5M5.5,2.5l1.25,2.5l2.5,-5M5.5,7.5l1.25,2.5l2.5,-5" stroke="#888" stroke-width="1"/></svg>.</span></p>',
   outro: '<p>If simulation is paused immediately after one truth table row has passed, clicking play &play; automatically advances to the next row. <b>You can restart a test or switch to testing a different truth table row by clicking on that row.</b> Double clicking a row selects it and immediately starts simulation (as if you clicked play &play;).</p>',
   hint: ['<p>You can complete this challenge simply by pressing the play button &play;, but understanding the speed slider especially will speed your way through the rest of the challenges.</p>'],
   truth: [{a: 0,   z: 0},
           {a: 1,   z: 1}],
   avail: [],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0,
         io: [['o', 'ia', 'i']]
        }
     ,
     ia: {type: 'inv',
         x: 500,
         y: 0,
         io: [['o', 'i0', 'i']]
        }
     ,
     i0: {type: 'inv',
         x: 0,
         y: 100,
         io: [['o', 'i1', 'i']]
        }
     ,
     i1: {type: 'inv',
         x: 500,
         y: 100,
         io: [['o', 'i2', 'i']]
        }
     ,
     i2: {type: 'inv',
         x: 0,
         y: 200,
         io: [['o', 'i3', 'i']]
        }
     ,
     i3: {type: 'inv',
         x: 500,
         y: 200,
         io: [['o', 'i4', 'i']]
        }
     ,
     i4: {type: 'inv',
         x: 0,
         y: 300,
         io: [['o', 'i5', 'i']]
        }
     ,
     i5: {type: 'inv',
         x: 500,
         y: 300,
         io: [['o', 'i6', 'i']]
        }
     ,
     i6: {type: 'inv',
         x: 0,
         y: 400,
         io: [['o', 'i7', 'i']]
        }
     ,
     i7: {type: 'inv',
         x: 500,
         y: 400,
         io: [['o', 'i8', 'i']]
        }
     ,
     i8: {type: 'inv',
         x: 0,
         y: 500,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 500
        }
   }
  }
,
  {name: 'The AND gate',
   section: 'The simple logic gates',
   intro: '<p>George Boole formalized the logic system that is now used by circuit designs everywhere.  You already learned about the NOT gate, but there are six other simple Boolean logic gates that form the fundamental basis of the system.</p><p><b>An AND gate outputs a 1 only if its first input is 1 <i>and</i> its second input is 1.</b> Otherwise the output of the AND gate is 0.</p>',
   outro: '<p><b>The AND gate is typically represented in text with an ampersand.  E.g. <span>Z = A &amp; B.</span></b></p><p><b>Make sure you clearly understand the relationship of the AND gate\'s output with its inputs</b>, as displayed in the truth table. You will soon learn more types of Boolean logic gates which you can use to build more complex designs.</p>',
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,and,50+o,2,i',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:0},
           {a:1, b:0,   z:0},
           {a:1, b:1,   z:1}],
   avail: ['and', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'The NAND gate',
   intro: '<p><b>A NAND gate outputs an inverted value as compared to an AND gate.</b></p><p>Be careful when speaking aloud: "a NAND gate" is not "an AND gate".</p>',
   outro: '<p>As you\'ll soon see, NAND gates can be combined to implement every possible Boolean logic expression.</p>',
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,nand,50+o,2,i',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['nand', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'NAND is NOT-AND',
   intro: '<p><b>A NAND gate can be decomposed into an AND gate followed by a NOT gate.</b> The result is NOT 1 only if the AND gate\'s output is 1. In other words, it performs a NOT-AND function, also known as NAND.</p>',
   outro: '<p>The NAND function is expressed as <span>Z = ~(A & B).</span></p><p>Because a NAND gate combines the functions of an AND gate and an NOT gate, it combines the shape of the AND gate with the bubble from the NOT gate.</p>',
   soln: '1s3-0,o,4,i0-1,o,4,i1;275,inv,50+o,2,i;150,and,50+o,3,i',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['inv', 1, 'and', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 50
        }
   }
  }
,
  {name: 'NOT with NAND',
   intro: '<p>By tying both of its inputs to the same source, <b>a NAND gate can perform the same function as a NOT gate.</b></p>',
   outro: '<p>NAND gates are particularly small and fast in most types of circuits, so it is convenient that they are also so versatile.</p>',
   soln: '1s2-0,o,2,i0-0,o,2,i1;150,nand,0+o,1,i',
   truth: [{a:0,  z:1},
           {a:1,  z:0}],
   avail: ['nand', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'The OR gate',
   intro: '<p><b>An OR gate outputs a 1 if its first input is 1 <i>or</i> its second input is 1</b> (or both are 1). Otherwise the output of the OR gate is 0.</p>',
   outro: '<p><b>The OR gate is typically represented in text with a vertical bar.  E.g. <span>Z = A | B.</span></b></p><p>An OR gate is more precisely described with the legal term "and/or" because its output is 1 if its first input is 1 <i>and/or</i> its second input is 1. The OR operation is also sometimes called <i>inclusive OR</i> because it includes the case that both inputs are 1. You\'ll learn the <i>exclusive OR</i> gate a little later.</p>',
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,or,50+o,2,i',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:1}],
   avail: ['or', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'The NOR gate',
   intro: '<p><b>A NOR gate outputs an inverted value as compared to an OR gate.</b>  I.e. <span>Z = ~(A | B).</span></p><p>In this challenge we introduce the concept of a "don\'t care" value. If A is 1, we know that the output of the NOR gate must always be 0, so we <i>don\'t care</i> what B is. Likewise, we <i>don\'t care</i> what A is when B is 1.</p>',
   outro: '<p>This circuit simulator uses a black color to represent a value that is unknown, which includes "don\'t care" values. If a logic gate has an unknown input, a logic gate may output a known or unknown value depending on its other inputs and its logic function.</p>',
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,nor,50+o,2,i',
   truth: [{a:0, b:0,   z:1},
           {a:x, b:1,   z:0},
           {a:1, b:x,   z:0}],
   avail: ['nor', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'The XOR and XNOR gates',
   intro: '<p>An XOR gate performs an "exclusive or" function. <b>An XOR gate outputs a 1 if its first input is &nbsp;1 <i>or</i> its second input is &nbsp;1 <i>excluding</i> the case that both inputs are 1.</b> I.e. unlike an OR gate, an XOR gate outputs 0 if both of its inputs are 1.</p><p><b>An XNOR gate outputs an inverted value as compared to an XOR gate.</b></p>',
   outro: '<p><b>The XOR gate is typically represented in text with a carat.  E.g. <span>Z = A ^ B.</span></b></p><p>Another perspective on the XOR operation is that it outputs a 1 if its first input is <i>not equal</i> to its second input, i.e. <span>Z = (A != B).</span></p><p>The XNOR gate can be represented as <span>Z = ~(A ^ B)</span> or as <span>Z = (A == B).</span></p>',
   soln: '1s4-0,o,5,i0-0,o,4,i0-1,o,4,i1-1,o,5,i1;160,xnor,90+o,3,i;160,xor,10+o,2,i',
   truth: [{a:0, b:0,   z:0, y:1},
           {a:0, b:1,   z:1, y:0},
           {a:1, b:0,   z:1, y:0},
           {a:1, b:1,   z:0, y:1}],
   avail: ['xor', 1, 'xnor', 1],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'The mux gate',
   intro: '<p>A multiplexer (abbreviated as <i>mux</i>) selects one of its two data inputs as its output. The data input ports are on the left side of the mux, labeled "0" and "1".  The choice of which data value to output is based on the select input port on the bottom of the mux.  <b>Hook up the mux to output the value of A when S=0 and the value of B when S=1.</b></p>',
   outro: '<p>The 2-to-1 mux corresponds to the if-then-else statement or the ?: operation in many programming languages, e.g. <span>Z = S ? B : A.</span></p>',
   soln: '1s4-0,o,4,s-1,o,4,i0-2,o,4,i1;175,mux,150+o,3,i',
   truth: [{s:0, a:0,        z:0},
           {s:0, a:1,        z:1},
           {s:1,      b:0,   z:0},
           {s:1,      b:1,   z:1}],
   avail: ['mux'],
   cells: {
     s: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     a: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 150
        }
   }
  }
,
  {name: 'Build a mux',
   section: 'Easy combinational circuits',
   intro: '<p><b>Build a circuit that performs the function of mux</b>, but without using a mux gate.</p>',
   outro: '<p>Now you\'re building real circuits!</p>',
   hint: ['<p>If one input of an AND gate is 1, then the output of the AND gate equals its other input.</p>',
          '<p>Conversely, if one input of an OR gate is 0, then the output of the OR gate equals its other input.</p>'],
   soln: '1s4-0,o,6,i0-0,o,4,i-1,o,5,i1-2,o,6,i1;130,inv,0+o,5,i0;250,and,50+o,7,i0;250,and,150+o,7,i1;390,or,100+o,3,i',
   truth: [{s:0, a:0,        z:0},
           {s:0, a:1,        z:1},
           {s:1,      b:0,   z:0},
           {s:1,      b:1,   z:1}],
   avail: ['inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     s: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     a: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 100
        }
   }
  }
,
  {name: 'Generate constants',
   intro: '<p>0 and 1 values are easily available in traditional circuit designs, but in this challenge </b>you need to generate your own constants.</b></p>',
   outro: '<p>Did you get the optimal solution of one gate per constant?</p>',
   truth: [{a: 0,   z: 1, y: 0},
           {a: 1,   z: 1, y: 0}],
   avail: ['inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   hint: '<p>How does each gate behave when its inputs are the same value?</p>',
   soln: '1s3-0,o,3,i0-0,o,3,i1-0,o,4,i0-0,o,4,i1;170,xnor,0+o,1,i;170,xor,100+o,2,i',
   cells: {
     a: {type: 'input',
         x: 0,
         y: 50
        }
     ,
     z: {type: 'output',
         x: 300,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 300,
         y: 100
        }
   }
  }
,
  {name: 'Power and ground',
   intro: '<p><b>From now on you can use dedicated connections to constant values.</b></p>',
   outro: '<p>Boolean circuits don\'t literally transmit binary numbers.  In actual operation, a 1 is represented by a high voltage, and a 0 is represented by a low voltage.  The constant supply symbols therefore represent a wire connection to the positive voltage supply or to the ground, respectively.</p>',
   soln: '1s2;-120,gnd,120+o,1,i;-120,vdd,-20+o,0,i',
   truth: [{z: 1, y: 0}],
   avail: ['vdd', 'gnd'],
   cells: {
     z: {type: 'output',
         x: 0,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 0,
         y: 100
        }
   }
  }
,
  {name: 'De Morgan&rsquo;s law (1)',
   intro: '<p>Augustus De Morgan demonstrated that "not (A and B)" is the same as "(not A) or (not B)".  <b>Use De Morgan\'s law to output the desired values for the truth table</b> using only inverters and NAND gates.</p>',
   outro: '<p>Both the OR gate and the NAND gate output a 1 for three out of four combinations of input values.  They differ only in which combination outputs a 0.</p>',
   soln: '1s6-0,o,6,i0-0,o,9,i-0,o,8,i0-1,o,6,i1-1,o,7,i-1,o,11,i1;350,nand,0+o,2,i;200,inv,250+o,10,i1+o,8,i1;350,nand,100+o,3,i;200,inv,150+o,10,i0+o,11,i0;350,nand,300+o,5,i;350,nand,200+o,4,i',
   truth: [{a:0, b:0,   z:1, y:1, x:1, w:0},
           {a:0, b:1,   z:1, y:1, x:0, w:1},
           {a:1, b:0,   z:1, y:0, x:1, w:1},
           {a:1, b:1,   z:0, y:1, x:1, w:1}],
   avail: ['inv', 'nand'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 90
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 210
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 500,
         y: 100
        }
     ,
     x: {type: 'output',
         x: 500,
         y: 200
        }
     ,
     w: {type: 'output',
         x: 500,
         y: 300
        }
   }
  }
,
  {name: 'De Morgan&rsquo;s law (2)',
   intro: '<p>De Morgan also demonstrated that "not (A or B)" is the same as "(not A) and (not B)".  <b>Output the desired values for the truth table</b> using only inverters and NOR gates.</p>',
   outro: '<p>Both the AND gate and the NOR gate output a 1 for one out of four combinations of input values.  They differ only in which combination outputs the 1.</p>',
   soln: '1s6-0,o,7,i-0,o,11,i0-0,o,10,i0-1,o,8,i-1,o,11,i1-1,o,9,i1;350,nor,0+o,2,i;130,inv,90+o,6,i0+o,9,i0;130,inv,210+o,10,i1+o,6,i1;350,nor,100+o,3,i;350,nor,200+o,4,i;350,nor,300+o,5,i',
   truth: [{a:0, b:0,   z:0, y:0, x:0, w:1},
           {a:0, b:1,   z:0, y:0, x:1, w:0},
           {a:1, b:0,   z:0, y:1, x:0, w:0},
           {a:1, b:1,   z:1, y:0, x:0, w:0}],
   avail: ['inv', 'nor'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 90
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 210
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 0
        }
     ,
     y: {type: 'output',
         x: 500,
         y: 100
        }
     ,
     x: {type: 'output',
         x: 500,
         y: 200
        }
     ,
     w: {type: 'output',
         x: 500,
         y: 300
        }
   }
  }
,
  {name: 'Build another mux',
   intro: '<p><b>Build another circuit that performs the same function as a mux.</b>  You\'ve done this before, but this time you\'ll need to use De Morgan\'s laws to build the circuit using only NAND gates and NOT gates.</p>',
   outro: '<p>Augustus De Morgan would be proud.</p>',
   hint: ['<p>Remember how you built the mux before.  Can you modify that solution using De Morgan\'s laws?</p>',
          '<p>The second of De Morgan\'s laws can be rearranged as follows: "(A or B)" is the same as "not((not A) and (not B))."</p>'],
   soln: '1s4-0,o,6,i0-0,o,4,i-1,o,5,i1-2,o,6,i1;130,inv,0+o,5,i0;250,nand,50+o,7,i0;250,nand,150+o,7,i1;390,nand,100+o,3,i',
   truth: [{s:0, a:0,        z:0},
           {s:0, a:1,        z:1},
           {s:1,      b:0,   z:0},
           {s:1,      b:1,   z:1}],
   avail: ['inv', 'nand'],
   cells: {
     s: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     a: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 100
        }
   }
  }
,
  {name: 'Distributive property (1)',
   intro: '<p>Someone left some glue on the circuit board, so now you\'re stuck with an OR gate attached to Z when you want to <b>implement (A or B) and C.</b></p>',
   outro: '<p>Boolean logic has a distributive property such that (A or B) and C = (A and C) or (B and C).  This is similar to the distributive property in arithmetic: (A + B) &times; C = (A &times; C) + (B &times; C).</p>',
   hint: ['<p>If you\'re having trouble rearranging the logic expression, you can instead look at the truth table for inspiration.</p>',
          '<p>Every chain of logic that leads to Z must include "and C" somewhere on it.</p>',
          '<p>You don\'t need the XOR or XNOR gate in the inventory box.  Those are <a href="https://en.wikipedia.org/wiki/Red_herring" target="_blank">red herrings</a>.</p>'],
   soln: '1s5-0,o,5,i0-1,o,6,i0-2,o,5,i1-2,o,6,i1;150,and,50+o,3,i0;150,and,150+o,3,i1',
   truth: [{a:0, b:0, c:0,   z:0},
           {a:0, b:1, c:0,   z:0},
           {a:1, b:0, c:0,   z:0},
           {a:1, b:1, c:0,   z:0},
           {a:0, b:0, c:1,   z:0},
           {a:0, b:1, c:1,   z:1},
           {a:1, b:0, c:1,   z:1},
           {a:1, b:1, c:1,   z:1}],
   avail: ['and', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     c: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     or: {type: 'or',
          x: 300,
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
  {name: 'Distributive property (2)',
   intro: '<p>Dang it, they did it again!  You\'re stuck with an AND gate when you want to <b>implement (A and B) or C.</b></p>',
   outro: '<p>Boolean logic has a 2<sup>nd</sup> distributive property such that (A and B) or C = (A or C) and (B or C).  This is similar to the 2<sup>nd</sup> distributive property in arithmetic: (A &times; B) + C = (A + C) &times; (B + C).  Wait, no, arithmetic doesn\'t have that property.  But Boolean logic does.  Well, now we know which system is superior.</p>',
   soln: '1s5-0,o,5,i0-1,o,6,i0-2,o,5,i1-2,o,6,i1;150,or,50+o,3,i0;150,or,150+o,3,i1',
   truth: [{a:0, b:0, c:0,   z:0},
           {a:0, b:1, c:0,   z:0},
           {a:1, b:0, c:0,   z:0},
           {a:1, b:1, c:0,   z:1},
           {a:0, b:0, c:1,   z:1},
           {a:0, b:1, c:1,   z:1},
           {a:1, b:0, c:1,   z:1},
           {a:1, b:1, c:1,   z:1}],
   avail: ['or', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     c: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     and: {type: 'and',
           x: 300,
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
  {name: 'Subset of OR',
   intro: '<p>Would someone please get rid of that glue bottle!</p>',
   outro: '<p>If one input of an OR gate is 1 in a certain set of cases, and the other input is 1 for no additional cases, the output of the OR gate always equals its first input.</p>',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:0},
           {a:1, b:0,   z:0},
           {a:1, b:1,   z:1}],
   soln: ['1s4-0,o,4,i0-1,o,4,i1;140,and,50+o,2,i0+o,2,i1',
          '1s4-0,o,4,i0-1,o,4,i1-1,o,5,i1-1,o,5,i0;150,and,10+o,2,i0;150,xor,90+o,2,i1'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     or: {type: 'or',
           x: 300,
           y: 50,
           io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 50
        }
   }
  }
,
  {name: 'Superset of AND',
   intro: '<p>OK, no more glue fights in the lab!</p>',
   outro: '<p>If one input of an AND gate is 1 in a certain set of cases, and the other input is 1 for at least all of the same cases, the output of the AND gate always equals its first input.</p>',
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   soln: ['1s4-0,o,4,i0-1,o,4,i1;140,nand,50+o,2,i0+o,2,i1',
          '1s4-0,o,4,i0-1,o,4,i1-1,o,5,i1-1,o,5,i0;150,nand,10+o,2,i0;150,xnor,90+o,2,i1'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     and: {type: 'and',
           x: 300,
           y: 50,
           io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 50
        }
   }
  }
,
  {name: 'Hidden truths',
   intro: '<p>Whoops, we\'ve forgotten what circuit you\'re supposed to design here.  Well, <b>complete the case shown on the stimulus and test pins, and then we\'ll probably remember the next case.</b></p>',
   outro: '<p>Did you have to take notes outside of the game?  For some of the later levels, you\'ll probably find that taking notes is essential.</p>',
   hint: ['<p>You can write down the stimulus values and the expected value for each case to build your own truth table.</p>',
          '<p>You can slow down the simulation speed and press pause to get a good look at each case as it simulates.  Or you can use tell the simulator to automatically pause at the end of each case <svg width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg>.</p>'],
   soln: ['1s3-0,o,4,i0-1,o,3,i;125,inv,100+o,4,i1;275,and,50+o,2,i',
          '1s3-0,o,3,i-1,o,4,i1;125,inv,0+o,4,i0;275,nor,50+o,2,i'],
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:0},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   hide: ['truth'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 400,
         y: 50
        }
   }
  }
,
  {name: 'Build an XOR gate',
   intro: '<p><b>Implement the XOR function using only NAND gates.</b></p>',
   outro: '<p>Six NAND gates is good.  Five NAND gates is excellent.</p>',
   hint: ['<p>After all those easy challenges, this one should make you think a bit more.  Take your time to puzzle it out.</p>',
          '<p>When cleverness fails, you can simply AND together all the terms in one row of the truth table (inverting as necessary), then OR together the expressions for each row.</p>',
          '<p>Remember that a NAND gate can be used to implement a NOT gate.  Also remember De Morgan\'s laws.</p>'],
   soln: '1s3-0,o,4,i0-0,o,4,i1-0,o,6,i0-1,o,3,i1-1,o,5,i0-1,o,5,i1;300,nand,10+o,7,i0;180,nand,0+o,3,i0;180,nand,100+o,6,i1;300,nand,90+o,7,i1;450,nand,50+o,2,i',
   truth: [{a:0, b:0,   z:0},
           {a:0, b:1,   z:1},
           {a:1, b:0,   z:1},
           {a:1, b:1,   z:0}],
   avail: ['nand'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 600,
         y: 50
        }
   }
  }
,
  {name: 'Multi-bit values',
   section: 'Introduction to multi-bit values',
   ui: true,
   intro: '<p>A single wire can only carry one <i>bit</i> of information, either a 0 or 1.  <b>Multiple wires can be grouped together as a multi-bit <i>bus</i></b>, which can carry a wider range of values.  In the same way that three decimal (base 10) digits such as 123 represents 3&times;1+2&times;10+1&times;100, three <a href="https://en.wikipedia.org/wiki/Binary_number" target="_blank">binary (base 2)</a> bits such as 101 represents 1&times;1+0&times;2+1&times;4.</p><p>This game displays multi-bit values in their decimal form, but keep in mind the underlying binary representations.</p>',
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
         x: 0,
         y: 0,
         io: [['o', 'z', 'i']]
        }
     ,
     z: {type: 'output',
         width: 3,
         x: 200,
         y: 0
        }
   }
  }
,
  {name: 'Create a gate cluster',
   ui: true,
   intro: '<p>Hooking a wire to the output port of a cluster of logic cells automatically converts the wire to a multi-bit bus that can carry all of the cell outputs.  Hooking a multi-bit bus to the input port of a logic cell converts the cell into a cell cluster that can make use of all of the input bits.  In this way, the multi-bit width propagates downstream.</p><p><b>Hook up a cluster of NOT gates in order to invert the multi-bit values.</b></p>',
   outro: '<p>Decimal value 0 is binary value 000.  When 000 passes through the NOT cluster, it becomes 111, which is 1&times;1+1&times;2+1&times;4 = 7.  You might want to carefully consider the remaining rows in the truth table to understand the conversion of decimal to binary and binary to decimal.</p>',
   hint: ['<p>Hook up the circuit just like it\'s performing a single-bit NOT operation.  The game will automatically apply the correct bit width.</p>'],
   soln: '1s2-0,o,2,i;150,inv,0+o,1,i',
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
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         width: 3,
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'Mix single-bit and multi-bit values',
   ui: true,
   intro: '<p>A single-bit wire can also be connected to the input of a gate cluster, in which case the wire implicitly fans out to supply all of the gates in the cluster.</p><p><b>Selectively propagate the multi-bit value from A to Z only when S is 1.  Otherwise, clear the Z value to 0.</b></p>',
   outro: '<p>Did you notice that the x2 cluster of AND gates used two AND gates from the gate inventory?</p>',
   hint: ['<p>When a single-bit input is used in a multi-bit gate cluster, the single-bit value implicitly fans out to all bits of the cluster.</p>'],
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,and,50+o,2,i',
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
         x: 0,
         y: 0
        }
     ,
     s: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         width: 2,
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'Single-row mystery',
   intro: '<p><b>What multi-bit function is expressed in the truth table?</b></p><p>Tip: The same function is applied to all bits.</p>',
   outro: '<p>Memorize your powers of 2 and get comfortable with converting between decimal and binary in your head.</p>',
   hint: ['<p>You can\'t think logically about this challenge unless you first convert the decimal values to binary.</p>',
          '<p>This challenge tests four bits in one truth table row, but it is the equivalent of a challenge that tests one bit in four truth table rows.</p>'],
   soln: '1s3-0,o,3,i0-1,o,3,i1;150,xnor,50+o,2,i',
   truth: [{a:12, b:10,   z:9}],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         width: 4,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         width: 4,
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'The condenser',
   ui: true,
   intro: '<p>A condenser bundles single-bit wires into a multi-bit bus.  <b>Use the condenser to convert two 1-bit signals into one 2-bit signal.</b></p>',
   outro: '<p>The multi-bit condenser output gets its 2<sup>0</sup> bit (the <i>little end</i>) from the bottom input of the condenser and its 2<sup>n-1</sup> bit (the <i>big end</i>) from the top.</p>',
   soln: '1s4-0,o,2,i1-1,o,2,i0-2,o,3,i',
   truth: [{a1:0, a0:0,   z:0},
           {a1:0, a0:1,   z:1},
           {a1:1, a0:0,   z:2},
           {a1:1, a0:1,   z:3}],
   avail: [],
   cells: {
     a1: {type: 'input',
         x: 0,
         y: 0
         }
     ,
     a0: {type: 'input',
         x: 0,
         y: 100
         }
     ,
     // The condensor is locked in place to prevent the user from
     // accidentally resizing it, which we haven't taught yet.
     c: {type: 'condenser',
         x: 150,
         y: 50
         }
     ,
     z: {type: 'output',
         width: 2,
         x: 300,
         y: 50
        }
   }
  }
,
  {name: 'Resize a condenser',
   ui: true,
   intro: '<p><b>Resize a condenser to three bits</b> by dragging its top edge upward or its bottom edge downward.  A condenser can resized to any width from 2 to 8 bits.</p>',
   outro: '<p>Individual wires allow for more flexible logic, while a multi-bit bus allows easier interpretation of a larger value.  A condenser allows both forms in the same circuit.</p>',
   soln: '1s4-0,o,4,i2-1,o,4,i1-2,o,4,i0;150,condenser3,100+o,3,i',
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
         x: 0,
         y: 0
         }
     ,
     a1: {type: 'input',
         x: 0,
         y: 100
         }
     ,
     a0: {type: 'input',
         x: 0,
         y: 200
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
  {name: 'The expander',
   ui: true,
   intro: '<p>An expander unbundles a multi-bit bus into its component single-bit wires. <b>Use an expander to convert one 3-bit signal into three 1-bit signals.</b></p>',
   outro: '<p>The condenser and the expander are simple examples of a <i>wire harness</i>.  A general wire harness can take many forms, but the condenser and expander provide the basic building blocks to create any wire harness.</p>',
   soln: '1s4-0,o,4,i;150,expander3,100+o0,3,i+o1,2,i+o2,1,i',
   truth: [{a:0,   z2:0, z1:0, z0:0},
           {a:1,   z2:0, z1:0, z0:1},
           {a:2,   z2:0, z1:1, z0:0},
           {a:3,   z2:0, z1:1, z0:1},
           {a:4,   z2:1, z1:0, z0:0},
           {a:5,   z2:1, z1:0, z0:1},
           {a:6,   z2:1, z1:1, z0:0},
           {a:7,   z2:1, z1:1, z0:1}],
   avail: ['expander'],
   cells: {
     a: {type: 'input',
         width: 3,
         x: 0,
         y: 100
        }
     ,
     z2: {type: 'output',
         x: 300,
         y: 0
         }
     ,
     z1: {type: 'output',
         x: 300,
         y: 100
         }
     ,
     z0: {type: 'output',
         x: 300,
         y: 200
         }
   }
  }
,
  {name: 'Random truths',
   ui: true,
   intro: '<p><b>Design a circuit to test whether A is equal to B.</b></p><p>When there are a lot of potential values to test, we\'ll speed things along by testing only a random subset of combinations.</p>',
   outro: '<p>Don\'t try to game the system.  If you change the circuit, you get to keep the random values in the current row, but all other values are re-randomized.</p>',
   hint: ['<p>You\'ll need an expander somewhere in the circuit in order to produce a one-bit output.  But you won\'t need to draw as many wires if you perform as much logic as you can prior to the expander.</p>'],
   soln: ['1s3-0,o,9,i0-1,o,9,i1;300,and,-10+o,7,i0;300,and,30+o,7,i1;300,and,70+o,8,i0;300,and,110+o,8,i1;400,and,10+o,10,i0;400,and,90+o,10,i1;115,xnor,50+o,11,i;500,and,50+o,2,i;220,expander8,50+o0,6,i1+o1,6,i0+o2,5,i1+o3,5,i0+o4,4,i1+o5,4,i0+o6,3,i1+o7,3,i0',
          '1s3-0,o,9,i0-1,o,9,i1;300,nor,-10+o,7,i0;300,nor,30+o,7,i1;300,nor,70+o,8,i0;300,nor,110+o,8,i1;400,nand,10+o,10,i0;400,nand,90+o,10,i1;115,xor,50+o,11,i;500,nor,50+o,2,i;220,expander8,50+o0,6,i1+o1,6,i0+o2,5,i1+o3,5,i0+o4,4,i1+o5,4,i0+o6,3,i1+o7,3,i0'],
   truth: [{a:0, b:0,   z:1},
           {a:0, b:1,   z:0},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:127, b:255,   z:0},
           {a:255, b:255,   z:1}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 255);
     var type = this.rnd(0, 2);
     if (type == 0) {
       obj.b = obj.a;
     } else if (type == 1) {
       var bit = this.rnd(0, 7);
       obj.b = obj.a ^ (1 << bit);
     } else {
       obj.b = this.rnd(0, 255);
     }
     obj.z = (obj.a == obj.b) ? 1 : 0;
   },
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         width: 8,
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         width: 8,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         width: 1,
         x: 600,
         y: 50
        }
   }
  }
,
  {name: 'Seven-segment decode',
   section: 'Advanced combinational circuits',
   intro: '<p><b>Decode each decimal value&nbsp;(0-9) to drive a seven-segment display.</b></p>',
   outro: '<p>Were you able to design your circuit using 25 gates or fewer?</p>',
   hint: ['<p>Yes, this is a big challenge.  Take your time.</p>',
          '<p>It doesn\'t matter what the circuit does if A\'s value is greater than 9.</p>',
          '<p>When there are multiple test pins that don\'t have much in common, it is often easier to work on the logic for one test pin at a time.  If you haven\'t finished the logic for the other test pins yet, you can double click each row of the truth table to test the logic you have so far.</p>'],
   soln: '1s8-0,o,8,i;120,expander4,148+o0,22,i+o0,12,i1+o0,15,i1+o0,23,i1+o0,26,i1+o0,29,i0+o1,12,i0+o1,15,i0+o1,23,i0+o1,18,i1+o1,25,i1+o1,27,i1+o1,9,i1+o2,11,i+o2,10,i1+o2,30,i0+o2,24,i0+o3,10,i0+o3,28,i1;403,or,-243+o,14,i0;400,or,-175+o,18,i0+o,14,i1;387,inv,-114+o,13,i0+o,17,i0+o,25,i0+o,27,i0;386,or,-42+o,13,i1+o,16,i0;524,or,-99+o,19,i1;530,or,-215+o,19,i0;338,nand,137+o,30,i1+o,17,i1;661,nand,0+o,28,i0;657,or,94+o,21,i1+o,20,i1;661,or,-77+o,21,i0;659,and,-184+o,1,i+o,20,i0;867,and,261+o,7,i;867,and,110+o,4,i;262,inv,-182+o,9,i0;296,xor,291+o,24,i1;448,nand,302+o,3,i;510,nor,165+o,26,i0;654,nor,200+o,5,i;693,nand,317+o,29,i1;867,or,4+o,2,i;894,or,321+o,6,i;385,nand,18+o,16,i1',
   truth:[{a:0,   t:1, tl:1, tr:1, c:0, bl:1, br:1, b:1},
          {a:1,   t:0, tl:0, tr:1, c:0, bl:0, br:1, b:0},
          {a:2,   t:1, tl:0, tr:1, c:1, bl:1, br:0, b:1},
          {a:3,   t:1, tl:0, tr:1, c:1, bl:0, br:1, b:1},
          {a:4,   t:0, tl:1, tr:1, c:1, bl:0, br:1, b:0},
          {a:5,   t:1, tl:1, tr:0, c:1, bl:0, br:1, b:1},
          {a:6,   t:1, tl:1, tr:0, c:1, bl:1, br:1, b:1},
          {a:7,   t:1, tl:0, tr:1, c:0, bl:0, br:1, b:0},
          {a:8,   t:1, tl:1, tr:1, c:1, bl:1, br:1, b:1},
          {a:9,   t:1, tl:1, tr:1, c:1, bl:0, br:1, b:1}
         ],
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 150,
         width: 4
        }
     ,
     t: {type: 'output',
         x: 1075,
         y: 0
        }
     ,
     tl: {type: 'output',
         x: 1000,
         y: 75
        }
     ,
     tr: {type: 'output',
         x: 1150,
         y: 75
        }
     ,
     c: {type: 'output',
         x: 1075,
         y: 150
        }
     ,
     bl: {type: 'output',
         x: 1000,
         y: 225
        }
     ,
     br: {type: 'output',
         x: 1150,
         y: 225
        }
     ,
     b: {type: 'output',
         x: 1075,
         y: 300
        }
   }
  }
,
  {name: 'Seven-segment encode',
   intro: '<p><b>Recognize the value on a seven-segment display and encode it as a decimal value&nbsp;(0-9).</b></p>',
   outro: '<p>Were you able to design your circuit using 25 gates or fewer?</p>',
   hint: ['<p>There are 128 possible combinations of values on the 7 stimulus pins, but you only care about 10 of those combinations.  This sparse input space allows for a great deal of clever optimization.</p>',
          '<p>The 2<sup>3</sup> bit of Z is 1 only for values 8 and 9.  What segments of the seven-segment display do these values have in common that are distinct from all of the other values.</p>',
          '<p>Don\'t just read through all of the hints at once.  Give the previous hints some thought before giving up.  The next hint will give away part of the solution.</p>',
          '<p>Values 8 and 9 both light all of segments of the upper loop of the display: T, TL, TR, and C.  None of the other values light all of those segments.</p>'],
   soln: '1s8-0,o,8,i-0,o,9,i1-0,o,13,i0-0,o,28,i0-1,o,27,i1-1,o,11,i0-1,o,18,i0-2,o,11,i1-2,o,10,i0-2,o,14,i-2,o,18,i1-3,o,25,i1-3,o,26,i1-3,o,28,i1-4,o,15,i-4,o,10,i1-5,o,16,i0-6,o,12,i-6,o,29,i1;398,inv,-135+o,27,i0+o,26,i0;901,and,199+o,23,i1;346,or,138+o,24,i1;327,xor,-6+o,25,i0;417,inv,188+o,20,i1+o,13,i1;578,and,178+o,21,i1;415,inv,273+o,29,i0;418,inv,378+o,16,i1;580,and,368+o,17,i1;763,and,358+o,23,i0;428,and,-210+o,19,i0;739,and,-200+o,23,i3;785,or,-7+o,9,i0;785,or,90+o,22,i0;900,or,100+o,23,i2;1084,condenser4,150+o,7,i;693,and,-17+o,20,i0;520,and,-27+o,24,i0;500,and,34+o,21,i0;520,nand,-149+o,17,i0;540,and,-88+o,19,i1;581,and,283+o,22,i1',
   truth:[{t:1, tl:1, tr:1, c:0, bl:1, br:1, b:1,   z:0},
          {t:0, tl:0, tr:1, c:0, bl:0, br:1, b:0,   z:1},
          {t:1, tl:0, tr:1, c:1, bl:1, br:0, b:1,   z:2},
          {t:1, tl:0, tr:1, c:1, bl:0, br:1, b:1,   z:3},
          {t:0, tl:1, tr:1, c:1, bl:0, br:1, b:0,   z:4},
          {t:1, tl:1, tr:0, c:1, bl:0, br:1, b:1,   z:5},
          {t:1, tl:1, tr:0, c:1, bl:1, br:1, b:1,   z:6},
          {t:1, tl:0, tr:1, c:0, bl:0, br:1, b:0,   z:7},
          {t:1, tl:1, tr:1, c:1, bl:1, br:1, b:1,   z:8},
          {t:1, tl:1, tr:1, c:1, bl:0, br:1, b:1,   z:9}
         ],
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
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
     z: {type: 'output',
         x: 1200,
         y: 150,
         width: 4
        }
   }
  }
,
  {name: 'Critical path',
   section: 'Arithmetic',
   intro: '<p><b>Detect whether an odd number of bits of A are 1.</b></p><p>No path through the circuit may contain more than 3 logic gates.</p>',
   outro: '<p>The maximum number of gates through which logic must propagate is called the <i>critical path</i> length.  This gives a rough measure of the speed of the circuit.</p>',
   hint: '<p>A cone of logic is faster than a linear chain of logic.</p>',
   soln: '1s2-0,o,2,i;140,expander8,0+o0,6,i1+o1,6,i0+o2,5,i1+o3,5,i0+o4,4,i1+o5,4,i0+o6,3,i1+o7,3,i0;280,xor,-60+o,7,i0;280,xor,-20+o,7,i1;280,xor,20+o,8,i0;280,xor,60+o,8,i1;420,xor,-40+o,9,i0;420,xor,40+o,9,i1;560,xor,0+o,1,i',
   max_path: 3,
   truth: [{a:0,   z:0},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:255,   z:0}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 255);
     obj.z = ((obj.a >> 7) ^ (obj.a >> 6) ^ (obj.a >> 5) ^ (obj.a >> 4) ^
              (obj.a >> 3) ^ (obj.a >> 2) ^ (obj.a >> 1) ^ obj.a) & 1;
   },
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         width: 8,
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 700,
         y: 0
         }
   }
  }
,
  {name: 'Increment',
   intro: '<p><b>Z = A + 1.</b></p><p>No path through the circuit may contain more than 5 logic gates.  For simplicity, the full adder cell is counted as a single gate.</p>',
   outro: '<p>When performing arithmetic on binary values, you must pay attention to the range of potential output values.  This range determines the necessary width of the output bus.</p>',
   hint: ['<p>Boolean arithmetic is just like decimal arithmetic, except that instead of carrying a 1 to the next digit when the result exceeds 9, you carry a 1 to the next bit when the result exceeds 1.</p>',
          '<p>The carry chain is key to incrementing.  Once you know whether to add 1 to a particular bit of A, the actual addition is trivial.</p>'],
   soln: '1s2-0,o,2,i;100,expander4,0+o0,6,i+o0,7,i1+o0,4,i1+o1,7,i0+o1,4,i0+o2,5,i0+o2,8,i0+o3,10,i0+o3,9,i0;600,condenser5,0+o,1,i;280,and,30+o,5,i1+o,8,i1;380,and,-30+o,10,i1+o,9,i1;380,inv,160+o,3,i0;380,xor,100+o,3,i1;450,xor,10+o,3,i2;490,xor,-80+o,3,i3;490,and,-140+o,3,i4',
   max_path: 3,
   truth: [{a:0,   z:1},
           {a:1,   z:2},
           {a:2,   z:3},
           {a:3,   z:4},
           {a:4,   z:5},
           {a:5,   z:6},
           {a:6,   z:7},
           {a:7,   z:8},
           {a:8,   z:9},
           {a:9,   z:10},
           {a:10,  z:11},
           {a:11,  z:12},
           {a:12,  z:13},
           {a:13,  z:14},
           {a:14,  z:15},
           {a:15,  z:16}],
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 700,
         y: 0,
         width: 5
         }
   }
  }
,
  {name: 'Full adder',
   intro: '<p>When performing a bit-by-bit addition of A+B, most bits require also adding the carry from the previous bit.  This can be made easier by creating a <i>full adder</i> module to <b>add a single bit of A+B+C<sub>in</sub> to get a single-bit sum (S) and a carry out (C<sub>out</sub>).</b></p>',
   outro: '<p>Seven gates is good.  Five is excellent.</p>',
   hint: ['<p>Try starting with a circuit that works when C<sub>in</sub> is 0, then add logic to handle the cases when C<sub>in</sub> is 1.</p>',
          '<p>You may feel more comfortable with the AND and OR gates, but sometimes XOR is more appropriate.</p>'],
   soln: ['1s5-0,o,8,i0-0,o,6,i0-0,o,7,i0-1,o,9,i0-1,o,5,i0-1,o,6,i1-2,o,9,i1-2,o,5,i1-2,o,7,i1;130,and,160+o,11,i1;170,and,10+o,10,i0;150,and,85+o,11,i0;410,xor,150+o,4,i;310,xor,160+o,8,i1;400,or,50+o,3,i;300,or,60+o,10,i1',
          '1s5-0,o,7,i0-0,o,9,i0-1,o,5,i0-1,o,6,i0-2,o,5,i1-2,o,6,i1;140,xor,110+o,7,i1+o,9,i1;135,and,190+o,8,i1;390,xor,150+o,4,i;390,or,50+o,3,i;280,and,40+o,8,i0'],
   truth: [{a:0, b:0, Cin:0,   Cout:0, s:0},
           {a:1, b:0, Cin:0,   Cout:0, s:1},
           {a:0, b:1, Cin:0,   Cout:0, s:1},
           {a:1, b:1, Cin:0,   Cout:1, s:0},
           {a:0, b:0, Cin:1,   Cout:0, s:1},
           {a:1, b:0, Cin:1,   Cout:1, s:0},
           {a:0, b:1, Cin:1,   Cout:1, s:0},
           {a:1, b:1, Cin:1,   Cout:1, s:1}],
   cells: {
     a: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     Cin: {type: 'input',
         x: 0,
         y: 200
        }
     ,
     Cout: {type: 'output',
         x: 500,
         y: 50
        }
     ,
     s: {type: 'output',
         x: 500,
         y: 150
        }
   }
  }
,
  {name: 'Add',
   intro: '<p>Now that\'ve built a one-bit full adder, you can use the full adder module to build a multi-bit adder. <b>Z = A + B.</b></p>',
   outro: '<p>If the last carry out were dropped so that Z could be the same width as A and B, then the addition could <i>overflow</i>.  The resulting "sum" would then be less then either A or B!</p>',
   hint: '<p>There is no carry in for the bottommost bit, so you\'ll need to input a 0 to the bottommost full adder module.</p>',
   soln:'1s3-0,o,3,i-1,o,4,i;100,expander4,0+o0,8,a+o1,7,a+o2,6,a+o3,10,a;100,expander4,100+o0,8,b+o1,7,b+o2,6,b+o3,10,b;600,condenser5,50+o,2,i;380,adder,10+cout,10,cin+s,5,i2;380,adder,120+cout,6,cin+s,5,i1;380,adder,230+cout,7,cin+s,5,i0;250,gnd,270+o,8,cin;380,adder,-100+cout,5,i4+s,5,i3',
   truth: [{a:0, b:0,   z:0},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:15, b:15,   z:30}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 15);
     obj.b = this.rnd(0, 15);
     obj.z = obj.a + obj.b;
   },
   avail: ['adder', 'expander', 'condenser', 'inv', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         width: 4,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 700,
         y: 50,
         width: 5
         }
   }
  }
,
  {name: 'Subtract',
   intro: '<p>Can you use what you\'ve learned to build a subtractor? <b>Z = A - B.</b></p>',
   outro: '<p>This game doesn\'t bother with negative binary numbers, but your solution to this challenge gives you a hint as to how they\'re handled in real circuits.</p>',
   hint: ['<p>If you drop the last carry out from a multi-bit adder, overflow can cause the result of the add to be less than either value being added.</p>',
          '<p>What is the mathematical relationship of B vs. ~B (NOT B)?</p>',
          '<p>When B is 4 bits wide, ~B = 15 - B.  (Try some example binary values to prove this for yourself.)</p>',
          '<p>If you drop the upper bits of the result, A - B gets the same result as A + 16 - B.</p>',
          '<p>A - B = A + (15 - B) + 1 = A + ~B + 1.</p>'],
   soln: '1s3-0,o,5,i-1,o,3,i;95,inv,100+o,4,i;200,expander4,100+o0,6,b+o1,7,b+o2,8,b+o3,9,b;200,expander4,0+o0,6,a+o1,7,a+o2,8,a+o3,9,a;430,adder,230+cout,7,cin+s,11,i0;430,adder,120+cout,8,cin+s,11,i1;430,adder,10+cout,9,cin+s,11,i2;430,adder,-100+s,11,i3;310,vdd,230+o,6,cin;600,condenser4,50+o,2,i',
   truth: [{a:0, b:0,   z:0},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:15, b:0,    z:15},
           {a:15, b:15,   z:0}],
   rnd: function(obj) {
     obj.b = this.rnd(0, 15);
     obj.a = this.rnd(obj.b, 15);
     obj.z = obj.a - obj.b;
   },
   avail: ['adder', 'expander', 'condenser', 'inv', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         width: 4,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 700,
         y: 50,
         width: 4
         }
   }
  }
,
  {name: 'Multiply by 2',
   intro: '<p><b>Z = A * 2.</b></p>',
   outro: '<p>Multiplying by a constant power of 2 is incredibly trivial.  Are you ready for something tougher?</p>',
   hint: ['<p>Multiplying a binary value by 2 is much like multiplying a decimal value by 10; you need only shift the value to the left and stick a 0 on the end.</p>',
          '<p>You\'ll need to unbundle the multi-bit input before you can rearrange its bits.</p>',
          '<p>You\'ll have to make your own 0 to stick on the end.</p>'],
   soln: '1s2-0,o,4,i;375,condenser8,0+o,1,i;145,gnd,100+o,2,i0;125,expander7,0+o0,2,i1+o1,2,i2+o2,2,i3+o3,2,i4+o4,2,i5+o5,2,i6+o6,2,i7',
   truth: [{a:0,   z:0},
           {a:1,   z:2},
           {a:2,   z:4},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:127, z:254}],
   rnd: function(obj) {
     obj.a = this.rnd(3, 126);
     obj.z = obj.a * 2;
   },
   avail: ['expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 7,
         x: 0,
         y: 0
        }
     ,
     z: {type: 'output',
         x: 500,
         y: 0,
         width: 8
         }
   }
  }
,
  {name: 'Rotate by N',
   intro: '<p><b>Rotate A to the left by N.</b>  In the C programming language, this function can be written as Z = ((A << N) | (A >> (8 - N)) & 255.</p>',
   outro: '<p>Whew, that\'s a lot of gates.  Thank goodness for gate clusters!</p>',
   hint: ['<p>You don\'t need to fully decode N.  Instead, you can process each bit of N independently of the other bit values.</p>'],
   soln: '1s3-0,o,3,i-0,o,10,i0-1,o,5,i;30,expander8,-150+o0,4,i4+o1,4,i5+o2,4,i6+o3,4,i7+o4,4,i0+o5,4,i1+o6,4,i2+o7,4,i3;160,condenser8,-150+o,10,i1;100,expander3,200+o0,12,s+o1,11,s+o2,10,s;330,expander8,-150+o0,7,i2+o1,7,i3+o2,7,i4+o3,7,i5+o4,7,i6+o5,7,i7+o6,7,i0+o7,7,i1;470,condenser8,-150+o,11,i1;640,expander8,-150+o0,9,i1+o1,9,i2+o2,9,i3+o3,9,i4+o4,9,i5+o5,9,i6+o6,9,i7+o7,9,i0;750,condenser8,-150+o,12,i1;245,mux,20+o,6,i+o,11,i0;555,mux,30+o,12,i0+o,8,i;850,mux,40+o,2,i',
   truth: [{a:3, n:0,   z:3},
           {a:3, n:1,   z:6},
           {a:3, n:7,   z:129},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 255);
     obj.n = this.rnd(0, 7);
     obj.z = ((obj.a << obj.n) | (obj.a >> (8 - obj.n))) & 255;
   },
   avail: ['expander', 'condenser', 'mux', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'],
   cells: {
     a: {type: 'input',
         width: 8,
         x: 0,
         y: 0
        }
     ,
     n: {type: 'input',
         width: 3,
         x: 0,
         y: 200
        }
     ,
     z: {type: 'output',
         x: 1000,
         y: 0,
         width: 8
         }
   }
  }
,
  {name: 'Fast add',
   intro: '<p>You previously built a 4-bit adder that used a <i>ripple</i> technique to propagate a carry bit. Now, make it faster.</p><p><b>Z = A + B. No path through the circuit may contain more than 5 logic gates.</b></p>',
   outro: '<p>In complex circuits, there is always a tension between reducing the total number of gates vs. reducing the number of gates on the critical path.</p>',
   hint: ['<p>The uppermost bit of Z is the slowest to calculate.  Figure out how to calculate that within 5 gates, and the rest of the bits will fall into place.</p>',
          '<p>A carry out is 1 at a particular bit position if the A and B bits at that position <i>generate</i> a carry out or if the A or B bits at that position <i>propagate</i> the carry in to the carry out.</p>',
          '<p>Write out the entire equation for each bit, then use the distributive laws to <i>flatten</i> the equation to a form similar to (p&q&r&&hellip;) | (s&t&u&&hellip;) | (v&w&x&&hellip;) | &hellip;</p><p>Then rebalance the equation as a cone of AND and OR gates.</p>'],
   soln: '1s3-0,o,4,i-1,o,3,i;115,expander4,100+o0,6,i1+o0,13,i1+o1,8,i1+o1,7,i1+o2,10,i1+o2,9,i1+o3,12,i1+o3,11,i1;115,expander4,0+o0,6,i0+o0,13,i0+o1,8,i0+o1,7,i0+o2,10,i0+o2,9,i0+o3,12,i0+o3,11,i0;1035,condenser5,50+o,2,i;300,and,240+o,15,i1+o,14,i1;300,xor,180+o,15,i0+o,14,i0;300,and,120+o,16,i1+o,19,i0+o,20,i0;300,xor,50+o,17,i1+o,16,i0+o,26,i0+o,22,i0;300,and,-10+o,18,i1+o,21,i0;300,xor,-70+o,18,i0+o,17,i0+o,27,i0;300,and,-125+o,23,i0;306,xor,384+o,5,i0;473,xor,285+o,5,i1;471,and,213+o,19,i1+o,22,i1+o,20,i1;477,and,85+o,21,i1;470,and,-30+o,25,i0;470,and,-100+o,23,i1;600,or,210+o,26,i1;600,or,140+o,25,i1;600,or,70+o,24,i1;600,and,-10+o,24,i0;600,or,-145+o,28,i0;720,or,-15+o,27,i1;720,and,-95+o,28,i1;870,xor,10+o,5,i2;870,xor,-50+o,5,i3;870,or,-120+o,5,i4',
   max_path: 5,
   truth: [{a:0, b:0,   z:0},
           {rnd:'rnd16'},
           {rnd:'rnd16'},
           {rnd:'rnd16'},
           {rnd:'rnd15'},
           {rnd:'rnd15'},
           {rnd:'rnd15'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:15, b:15,   z:30}],
   rnd16: function(obj) {
     obj.a = this.rnd(0, 15);
     obj.b = 16 - obj.a;
     obj.z = 16;
   },
   rnd15: function(obj) {
     obj.a = this.rnd(0, 15);
     obj.b = 15 - obj.a;
     obj.z = 15;
   },
   rnd: function(obj) {
     obj.b = this.rnd(0, 15);
     obj.a = this.rnd(0, 15);
     obj.z = obj.a + obj.b;
   },
   avail: ['adder', 'expander', 'condenser', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     b: {type: 'input',
         width: 4,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 1150,
         y: 50,
         width: 5
         }
   }
  }
,
  {name: 'Multiply by 0-3',
   intro: '<p><b>Z = A * N, where N is a 2-bit number.</b></p><p>No path through the circuit may contain more than 5 logic gates.</p>',
   outro: '<p>You can perform any positive integer multiplication by simply shifting and adding as needed.</p>',
   hint: ['<p>Multiplication by 0 can be done with an AND gate cluster.</p>',
          '<p>A * 3 = (A * 2) + (A * 1).</p>'],
   soln: '1s3-0,o,5,i0-0,o,3,i0-1,o,4,i;220,and,10+o,6,i;110,expander2,100+o0,5,i1+o1,3,i1;220,and,100+o,7,i;330,expander4,10+o0,8,a+o1,10,a+o2,11,a+o3,12,a;330,expander4,100+o0,14,i0+o1,8,b+o2,10,b+o3,11,b;540,adder,60+cout,10,cin+s,14,i1;440,gnd,190+o,8,cin;540,adder,-50+cout,11,cin+s,14,i2;540,adder,-160+cout,12,cin+s,14,i3;540,adder,-270+cout,14,i5+s,14,i4;410,gnd,-250+o,12,b;770,condenser6,50+o,2,i',
   max_path: 5,
   truth: [{rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:15,n:3,   z:45}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 15);
     obj.n = this.rnd(0, 3);
     obj.z = obj.a * obj.n;
   },
   avail: ['expander', 'condenser', 'adder', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     n: {type: 'input',
         width: 2,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 900,
         y: 50,
         width: 6
         }
   }
  }
,
  {name: 'Multiply by 0-7',
   intro: '<p><b>Z = A * N, where N is a 3-bit number.</b></p><p>No path through the circuit may contain more than 6 logic gates.  For simplicity, the full adder cell is counted as a single gate.</p>',
   outro: '<p>A full adder can be used to turn the addition of three multi-bit numbers into the addition of just two multi-bit numbers.  When it is used this way, the full adder is called a 3:2 compressor.</p>',
   hint: ['<p>When adding two multi-bit numbers, the carry chain becomes a significant component of the critical path.  Try to avoid having two such chains.</p>'],
   soln: '1s3-0,o,4,i0-0,o,5,i0-0,o,6,i0-1,o,3,i;110,expander3,100+o0,4,i1+o1,5,i1+o2,6,i1;220,and,110+o,7,i;220,and,10+o,8,i;220,and,-70+o,9,i;330,expander4,110+o0,20,i0+o1,11,cin+o2,12,cin+o3,13,cin;330,expander4,10+o0,11,b+o1,12,b+o2,13,b+o3,14,b;330,expander4,-320+o0,12,a+o1,13,a+o2,14,a+o3,19,a;330,gnd,-140+o,14,cin+o,11,a;600,adder,80+cout,16,b+s,20,i1;600,adder,-30+cout,17,b+s,16,a;600,adder,-140+cout,18,b+s,17,a;600,adder,-250+cout,19,b+s,18,a;730,gnd,70+o,16,cin;830,adder,0+cout,17,cin+s,20,i2;830,adder,-110+cout,18,cin+s,20,i3;830,adder,-220+cout,19,cin+s,20,i4;830,adder,-330+cout,20,i6+s,20,i5;1090,condenser7,50+o,2,i',
//file:///C:/Users/Chris/Documents/GitHub/Booles-Errand/circuit.html#Multiply%20by%200-7?1s3-0,o,5,i0-0,o,6,i0-0,o,7,i0-1,o,4,i;1061,condenser7,49+o,2,i;120,expander3,100+o0,5,i1+o1,6,i1+o2,7,i1;290,and,110+o,8,i;290,and,25+o,9,i;287,and,-73+o,10,i;411,expander4,106+o0,3,i0+o1,13,cin+o2,14,cin+o3,15,cin;410,expander4,21+o0,13,b+o1,14,b+o2,15,b+o3,16,b;405,expander4,-350+o0,14,a+o1,15,a+o2,16,a+o3,19,a;407,gnd,-145+o,16,cin+o,13,a;732,gnd,35+o,17,cin;607,adder,81+cout,17,b+s,3,i1;605,adder,-64+cout,20,b+s,17,a;606,adder,-175+cout,18,b+s,20,a;608,adder,-286+cout,19,b+s,18,a;829,adder,-35+cout,20,cin+s,3,i2;830,adder,-256+cout,19,cin+s,3,i4;833,adder,-367+cout,3,i6+s,3,i5;829,adder,-145+cout,18,cin+s,3,i3
//file:///C:/Users/Chris/Documents/GitHub/Booles-Errand/circuit.html#Multiply%20by%200-7?1s3-0,o,5,i0-0,o,6,i0-0,o,21,i0-1,o,4,i;1061,condenser7,49+o,2,i;120,expander3,100+o0,5,i1+o1,6,i1+o2,21,i1;290,and,110+o,7,i;290,and,25+o,8,i;411,expander4,106+o0,3,i0+o1,9,b+o2,10,b+o3,12,b;410,expander4,21+o0,9,a+o1,10,a+o2,12,a+o3,15,a;607,adder,81+cout,13,cin+s,3,i1;605,adder,-30+cout,12,cin+s,13,b;506,gnd,182+o,9,cin;605,adder,-144+cout,15,cin+s,14,b;816,adder,-26+cout,14,cin+s,3,i2;815,adder,-137+cout,17,cin+s,3,i3;603,adder,-258+cout,18,b+s,17,b;481,gnd,-236+o,15,b;814,adder,-248+cout,18,cin+s,3,i4;815,adder,-359+cout,3,i6+s,3,i5;529,gnd,37+o,10,cin;610,expander4,-347+o0,13,a+o1,14,a+o2,17,a+o3,18,a;477,and,-345+o,20,i
   max_path: 6,
   truth: [{rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {rnd:'rnd'},
           {a:15,n:7,   z:105}],
   rnd: function(obj) {
     obj.a = this.rnd(0, 15);
     obj.n = this.rnd(0, 7);
     obj.z = obj.a * obj.n;
   },
   avail: ['expander', 'condenser', 'adder', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor', 'vdd', 'gnd'],
   cells: {
     a: {type: 'input',
         width: 4,
         x: 0,
         y: 0
        }
     ,
     n: {type: 'input',
         width: 3,
         x: 0,
         y: 100
        }
     ,
     z: {type: 'output',
         x: 1200,
         y: 50,
         width: 7
         }
   }
  }
,
  {name: 'The D latch',
   section: 'Introduction to latches',
   intro: '<p>A <i>D latch</i> is our first storage element. It passes its D (data) input to its Q output when its E (enable) input is 1, but it holds its Q output constant when E is 0. The latch is described as <i>transparent</i> when data is allowed to pass through it and <i>opaque</i> when its output is held constant.</p><p>In order to test a circuit with storage elements, each boxed section of the truth table contains multiple rows. Each row represents one step of a test sequence. Clicking in the truth table starts a fresh test sequence that includes the selected row.</p>',
   outro: '<p>Simulation can be automatically paused when one row of a test sequence has passed <svg width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M1.25,5l2.5,5l5,-10" stroke="#888" stroke-width="1.5"/></svg> or when all rows of a test sequence have passed <svg width="1em" height="1em" viewBox="-2 -2 14 14" fill="none"><path d="M3,2.5l1.25,2.5l2.5,-5M3,7.5l1.25,2.5l2.5,-5" stroke="#888" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>.</p>',
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
         x: 0,
         y: 0,
         io: [['o', 'latch', 'e']]
        }
     ,
     d: {type: 'input',
         x: 0,
         y: 100,
         io: [['o', 'latch', 'd']]
        }
     ,
     latch: {
       type: 'latch',
       x: 180,
       y: 20,
       io: [['q', 'q', 'i']]
     }
     ,
     q: {type: 'output',
         x: 300,
         y: 0
        }
   }
  }
,
  {name: 'An SR latch',
   intro: '<p>A D latch is typically built with an <i>SR latch</i> inside, as shown in the circuit below. It can be <i>set</i> to 1 or <i>reset</i> to 0 by its inputs. If it is currently neither set nor reset, then it holds its last value by recirculating that value infinitely.</p><p><b>Connect the S pin so that it sets the latch to 1 and the R pin so that it resets the latch to 0.</b></p>',
   outro: '<p>If the <i>latch</i> is locked, nothing can get through the <i>gate</i>.  Circuit designers are quite the laugh riot, aren\'t they?</p>',
   soln: '1s5-0,o,4,i1-1,o,5,i;200,inv,100+o,3,i1',
   truth: [[{s:1, r:0,   q:1},
            {s:0, r:0,   q:1},
            {s:0, r:1,   q:0},
            {s:0, r:0,   q:0}]],
   cells: {
     s: {type: 'input',
         x: 0,
         y: 0
        }
     ,
     r: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     q: {type: 'output',
         x: 500,
         y: 0
        }
     ,
     and: {type: 'and',
           x: 380,
           y: 0,
           io: [['o', 'q', 'i'],
                ['o', 'or', 'i0']]
          }
     ,
     or: {type: 'or',
          x: 260,
          y: -10,
          io: [['o', 'and', 'i0']]
          }
   }
  }
,
  {name: 'Build a D latch',
   intro: '<p>The logic that feeds the SR latch can be built up to implement the D latch. Because NAND gates are generally easier to implement using silicon transistors than AND and OR gates, a more common SR latch design uses a pair of NAND gates to recirculate the data. This latch design has the convenient property that the latch output is available in both regular and inverted forms.</p><p><b>Connect the latch so that it is transparent and propagates the D value only when E is 1.</b> Once the latch output is initialized, ~Q must be the inverted value of Q.</p>',
   outro: '<p>The circuit you designed is called a D latch.</p>',
   soln: '1s6-0,o,7,i0-0,o,8,i0-1,o,6,i-1,o,7,i1;152,inv,100+o,8,i1;250,nand,10+o,4,i0;250,nand,90+o,5,i1',
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
         x: 0,
         y: 0
        }
     ,
     d: {type: 'input',
         x: 0,
         y: 100
        }
     ,
     q: {type: 'output',
         x: 500,
         y: 0
        }
     ,
     '~q': {type: 'output',
         x: 500,
         y: 100
        }
     ,
     nand1:{
       type: 'nand',
       x: 380,
       y: 0,
       io: [['o', 'q', 'i'],
            ['o', 'nand2', 'i0']]
     }
     ,
     nand2: {
       type: 'nand',
       x: 380,
       y: 100,
       io: [['o', '~q', 'i'],
            ['o', 'nand1', 'i1']]
     }
   }
  }
,
  {name: 'Metastability',
   intro: '<p>If a latch becomes opaque at the same moment that its data input changes value, the latch may be caught between accepting and rejecting the new data value. To prevent this uncertainty, the logic preceding the latch will typically <i>set up</i> a new data value for at least a minimum amount of time before the latch becomes opaque, and it will also <i>hold</i> the data value for a minimum amount of time after the latch becomes opaque.</p><p>The circuit below does not meet the minimum set-up and hold times. As a result, when D changes value at the same time as E becomes 0, the output of the latch depends on the speed of the wires. <b>Adjust the simulation speed using the speed slider in order to ensure that the latch becomes opaque without capturing the new D value.</b></p><p>Tip: You may need to click in the truth table to restart a test sequence with a new speed.</p>',
   outro: '<p>You may have noticed that at the default speed (the middle tick mark on the speed slider), the latch becomes opaque while two different values are propagating through it. When this occurs, the latch isn\'t stable at a particular value, but instead is <i>metastable</i> while the different values chase each other through the latch\'s recirculating gates.</p>',
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
   outro: '<p><b>Does your solution work for all simulation speeds?</b></p><p>You can retest a sequence of the truth table by double clicking in the truth table.</p>',
   hint: ['<p>When the simulation speed is slow, you can meet the hold time requirement by having at least as much wire on the D path as is on the E path.  You\'ll need to add at least one gate to act as an anchor for this extra wire.</p>',
          '<p>When the simulation speed is fast, you can meet the hold time requirement by having at least as many gates on the D path as are on the E path.</p>'],
   soln: '1s6-1,o,6,i;125,inv,100+o,7,i;225,inv,200+o,4,d',
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
       x: 0,
       y: 100,
       io: [['o', 'inv1', 'i']]
     }
     ,
     d: {
       type: 'input',
       x: 0,
       y: 200
     }
     ,
     inv1: {
       type: 'inv',
       x: 125,
       y: 0,
       io: [['o', 'inv2', 'i']]
     }
     ,
     inv2: {
       type: 'inv',
       x: 225,
       y: 0,
       io: [['o', 'latch', 'e']]
     }
     ,
     latch: {
       type: 'latch',
       x: 350,
       y: 120,
       io: [['q', 'q', 'i']]
     }
     ,
     q: {
       type: 'output',
       x: 500,
       y: 100
     }
   }
  }
,
  {name: 'Meeting set-up requirement',
   intro: '<p>This circuit uses a pre-built D latch cell. <b>Connect the E and D pins in such a way that the new D value is captured if it changes at the same time as E changes to 0.</b></p><p>Tip: Make sure that the D value meets the set-up time requirement.</p>',
   outro: '<p>Does your solution work for all simulation speeds?</p>',
   hint: ['<p>When the simulation speed is slow, you can meet the set-up time requirement by having more wire on the E path than is on the D path.  You\'ll need to add at least one gate to act as an anchor for this extra wire.</p>',
          '<p>When the simulation speed is fast, you can meet the set-up time requirement by having more gates on the E path than are on the D path.</p>'],
   soln: '1s6-0,o,7,i0-0,o,7,i1;168,inv,213+o,8,i;97,and,101+o,6,i;236,inv,62+o,4,e',
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
       x: 0,
       y: 100
     }
     ,
     d: {
       type: 'input',
       x: 0,
       y: 200,
       io: [['o', 'inv1', 'i']]
     }
     ,
     inv1: {
       type: 'inv',
       x: 125,
       y: 300,
       io: [['o', 'inv2', 'i']]
     }
     ,
     inv2: {
       type: 'inv',
       x: 225,
       y: 300,
       io: [['o', 'latch', 'd']]
     }
     ,
     latch: {
       type: 'latch',
       x: 350,
       y: 120,
       io: [['q', 'q', 'i']]
     }
     ,
     q: {
       type: 'output',
       x: 500,
       y: 100
     }
   }
  }
,
  {name: 'Entrance bell',
   section: 'Latch-based circuits',
   intro: '<p>A store owner has a pair of electric eyes at the front of her store that each output a 1 when the light path is uninterrupted and a 0 when the beam is broken. The eyes are arranged so that a person entering the store blocks only the first eye\'s beam, then both beams, then only the second eye\'s beam. <b>Design a circuit that rings a bell when both beams are broken as a person enters, but not as a person leaves.</b></p>',
   outro: '<p>Since only one input changes at a time, you don\'t have to worry about set-up and hold time.</p>',
   hint: ['<p>Knowing that both beams are broken is not enough information to determine the direction of travel. A storage element is needed to remember which beam was previously broken.</p>',
          '<p>A D latch holds its previous input value when its enable goes to 0.</p>'],
   soln: '1s3-0,o,3,d-0,o,5,i0-1,o,3,e-1,o,4,i1;125,latch,50+q,4,i0;250,or,90+o,5,i1;375,nor,10+o,2,i',
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
       x: 0,
       y: 0
     }
     ,
     b2: {
       type: 'input',
       x: 0,
       y: 100
     }
     ,
     z: {
       type: 'output',
       x: 500,
       y: 50
     }
   }
  }
,
  {name: 'Build a D flip-flop',
   intro: '<p>Sequential circuits are typically built around an oscillating clock signal. The clock cannot simply be used as the enable to a D latch because doing so would allow values to propagate all the way through the circuit while the clock is high.</p><p><b>Design a circuit that transmits the D input to the Q output only as the CLK signal transitions from 0 to 1.</b></p>',
   outro: '<p>This circuit is called a D flip-flop. If you used a chained pair of latches, it is a master-slave D flip-flop.</p>',
   hint: ['<p>If you use a D latch as the final storage element, you still need to prevent the output from changing value while the latch is transparent.  That means that the latch\'s D input needs to be held constant while E is 1 to prevent the output from changing value.</p>',
         '<p>Use two latches in series with opposite polarity enables.</p>',
         '<p>Make sure that the first latch meets the hold time requirement of the second.</p>'],
   soln: '1s3-0,o,4,d-1,o,5,i-1,o,3,e;440,latch,100+q,2,i;280,latch,-80+q,3,d;140,inv,40+o,4,e',
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
       x: 0,
       y: 0
     }
     ,
     clk: {
       type: 'input',
       x: 0,
       y: 100
     }
     ,
     q: {
       type: 'output',
       x: 600,
       y: 50
     }
   }
  }
,
  {name: 'Asynchronous reset',
   intro: '<p>A regular D flip-flop does not have a defined value until the first time that its clock signal goes from 0 to 1. To ensure predictable results, a circuit will typically include a reset signal to initialize its flip-flop values.</p><p><b>Build a D flip-flop that includes a reset signal that forces its output to 0 regardless of the state of its clock signal.</b> After the reset signal is cleared, ensure that the 0 value is held on Q until the next rising clock edge.</p>',
   outro: '<p>This type of reset is an asynchronous reset. If the output were only cleared at the rising edge of the clock, it would be a synchronous reset.</p>',
   hint: '<p>You can use a similar latch-based design as you used to build the D flip-flop, but you must manipulate the latch inputs to record a 0 when R is 1, regardless of the value of CLK.</p>',
   soln: '1s4-0,o,7,i0-1,o,4,i-1,o,9,i0-2,o,9,i1-2,o,6,i-2,o,8,i1;150,inv,100+o,8,i0;410,and,80+o,11,d;110,inv,70+o,7,i1+o,5,i0;215,and,10+o,10,d;240,or,110+o,10,e;240,or,190+o,11,e;325,latch,110+q,5,i1;500,latch,120+q,3,i',
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
       x: 0,
       y: 0
     }
     ,
     clk: {
       type: 'input',
       x: 0,
       y: 100
     }
     ,
     r: {
       type: 'input',
       x: 0,
       y: 200
     }
     ,
     q: {
       type: 'output',
       x: 600,
       y: 100
     }
   }
  }
];
