Level.prototype.puzzle = [
  {name: "press play",
   intro: "<p>Welcome to Boole's Errand!</p><p>&#9733 Press the \"play\" button on the left to transmit the electrical value from the input to the output. &#9733</p>",
   outro: "<p>Congratulations!</p>",
   truth: [{a: [1]}, {z: [1]}],
   cells: {
     a: {type: "const",
         locked: true,
         x: 100,
         y: 100,
         io: [["o", "z", "i"]]
        },
     z: {type: "buf",
         locked: true,
         x: 200,
         y: 100
        }
   }
  }
,
  {name: "first wire",
   intro: "<p>Connect the input to the output by drawing a wire from one to the other.</p><p>While the mouse is over the end of the input stub, press and hold the mouse button, then move the mouse to the end of the output stub before releasing the mouse button.</p>",
   outro: "<p>Congratulations!</p><p>You can also draw a wire in the other direction.  The input and output cells have an implied direction, but the wire does not.</p>",
   truth: [{a: [1]}, {z: [1]}],
   cells: {
     a: {type: "const",
         locked: true,
         x: 100,
         y: 100
        },
     z: {type: "buf",
         locked: true,
         x: 200,
         y: 100
        }
   }
  }
];
