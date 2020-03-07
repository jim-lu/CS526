var navigationPoll = $('.navigation-poll');
var navigationState = $('.navigation-state');
var pollList = $('.poll-list');
var stateList = $('.state-list');

navigationPoll.hover(function() {
    pollList.fadeIn();
}, function() {
    pollList.fadeOut();
});
navigationState.hover(function() {
    stateList.fadeIn();
}, function() {
    stateList.fadeOut();
});

$('#map').usmap({
    stateStyles: {fill: 'grey'},
    stateHoverStyles: {fill: 'white'}
});
