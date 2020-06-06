/**
 * [[ NAVIGATION CLASS ]]
 * 
 * @author Blackwater Vivariums
 * @since 2020-05-18
 */
function Navigation() { }

Navigation.prototype.initialize = function () {
    $('.navigation-container a.bwv-nav-item').on('click', (evt) => {
        if (!evt || !evt.currentTarget) {
            return;
        }
        console.log('Navigation Clicked', evt.currentTarget);

        if ($(evt.currentTarget).hasClass('parent')) {
            // User clicked a parent list item.
            $(evt.currentTarget)
                .find('.parent-item-chevron')
                .toggleClass('fa-chevron-right fa-chevron-down');
            if ($('#child-vivarium-list:visible').length > 0) {
                $('.child-vivarium-list').slideUp();
            } else {
                $('.child-vivarium-list').slideDown();
            }
            // TODO: Delay until slide animation is done.
            $(evt.currentTarget).toggleClass('expanded');
        }
    });
};

var nav = new Navigation();
nav.initialize();
