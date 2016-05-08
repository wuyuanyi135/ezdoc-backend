var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'ezdoc-backend';

// Create a box perfectly centered horizontally and vertically.
var form = blessed.form({
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  content: '',
  border: {
    type: 'line'
  }
});

screen.append(form);

cbDevMode = blessed.checkbox({
    text: "dev mode"
});
form.append(cbDevMode);


btnSwitchState = blessed.button({
    content: "Start Server",
    width: 'shrink',
    height: 'shrink',
    align: 'center',
    valign: 'middle',
    left: "center",
    padding: 1,
    style: {
        bg: '#ff00ff'
    }
});
form.append(btnSwitchState);


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


// Render the screen.
screen.render();
