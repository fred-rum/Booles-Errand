Level.prototype.puzzle = [
  {name: "press play",
   intro: "<p>&#9733 Press the \"play\" button on the left to transmit the electrical value from the input to the output. &#9733</p>",
   outro: "<p>Congratulations!</p>",
   truth: [{a: [1], z: [1]}],
   cells: {
     a: {type: "input",
         locked: true,
         x: 100,
         y: 100,
         io: [["o", "z", "i"]]
        }
     ,
     z: {type: "output",
         locked: true,
         x: 300,
         y: 100
        }
   }
  }
,
  {name: "fanout",
   intro: "<p>Output ports can be connected to multiple input ports.</p>",
   outro: "<p>Congratulations!</p>",
   truth: [{a: [1], z: [1]}],
   cells: {
     a: {type: "input",
         locked: true,
         x: 100,
         y: 100
        }
     ,
     z: {type: "output",
         locked: true,
         x: 300,
         y: 100
        }
   }
  }
,
  {name: "press play",
   intro: "<p>&#9733 Press the \"play\" button on the left to transmit the electrical value from the input to the output. &#9733</p>",
   outro: "<p>Congratulations!</p>",
   truth: [{a: [1], z: [1], y: [1]}],
   cells: {
     a: {type: "input",
         locked: true,
         x: 100,
         y: 100,
         io: [["o", "z", "i"]]
        }
     ,
     z: {type: "output",
         locked: true,
         x: 300,
         y: 100
        }
     ,
     y: {type: "output",
         locked: true,
         x: 300,
         y: 200
        }
   }
  }
];
