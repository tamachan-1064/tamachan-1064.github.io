//$(function() {
//    $('.slider').slick();
//    autoplay:true,
//    autoplaySpeed:5000,
//    dots:true,
//    slidesToShow:2,
//    slidesToScroll:2
//});

$(document).on('ready', function() {
  $(".lazy").slick({
    lazyLoad: 'ondemand',
    infinite: true,
    autoplay:true,
    dots:true,
    draggable:true,
    swipe:true,
    pauseOnHover:true,
  });
});
