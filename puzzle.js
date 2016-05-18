Level.prototype.puzzle = [
  {name: 'press play',
   intro: '<p>&nbsp;</p><p>&#9733 Press the "play" button on the left to transmit the electrical value from the supply pin "A" to the test pin "Z". &#9733</p></p>&nbsp;</p>',
   outro: '<p>Congratulations!</p>',
   truth: [{a: [0], z: [0]},
           {a: [1], z: [1]},
           {a: [0], z: [0]},
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
  {name: 'first wire',
   intro: '<p>Connect A to Z by drawing a wire from one to the other.</p><p>While the mouse is over the stub at the right side of A, press and hold the mouse button, then move the mouse to the stub at the left side of Z before releasing the mouse button.</p>',
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
  {name: 'first gate',
   intro: '<p>An inverter changes a 0 to 1, or changes a 1 to a 0.  Drag the inverter from the box at the left into the drawing area.  Wire it so that data flows from A, through the inverter, to Z.</p><p>While the mouse is over the inverter, press and hold the mouse button, then move the mouse to where you want to put the inverter before releasing the mouse button.</p>',
   outro: '<p>The inverter is one of the simplest logic gates.  We\'ll introduce many more logic gates soon, and you can start coding up some complex circuits.</p>',
   truth: [{a: [1], z: [0]}],
   avail: ['inv', 1],
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
  {name: 'fanout',
   intro: '<p>Output ports can be connected to multiple input ports.</p>',
   outro: '<p></p>',
   truth: [{a: [1], z: [1], y: [1]}],
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
];
//   outro: '<p>In many puzzles, the number of available cells is limited to create an extra challenge.</p>',
//   outro: '<p>A buffer doesn't do much, but you can use it as an anchor for custom wire layouts.</p>',
