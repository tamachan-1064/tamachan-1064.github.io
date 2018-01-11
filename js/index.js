mixitup('#mix-wrapper', {
  load: {
  	sort: 'order:asc'
  },
	animation: {
    effects: 'fade rotate(-180deg)',
    duration: 700
  },
  classNames: {
    block: 'programs',
    elementFilter: 'filter-btn',
    elementSort: 'sort-btn'
  },
  selectors: {
    target: '.mix-target'
  }
});
