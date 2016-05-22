var fuzzy = require('fuzzy');

var list = [
    'Wysf yafl',
    'qwpfo afj',
    '132 jij1j'
];

console.log(fuzzy.filter('wfy', list, {
    pre: "<b>",
    post: "</b>"
}));
