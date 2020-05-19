/**
 * [[ NAVIGATION CLASS ]]
 * 
 * @author Blackwater Vivariums
 * @since 2020-05-18
 */
function Navigation() { }

Navigation.prototype.initialize = function () {
    $('.navigation-container .list-group a.list-group-item').on('click', (evt) => {
        if (!evt || !evt.currentTarget) {
            return;
        }
        console.log('Navigation Clicked', evt.currentTarget);

        if ($(evt.currentTarget).hasClass('parent-list-group-item')) {
            // User clicked a parent list item.
            $(evt.currentTarget).toggleClass('expanded');
            $(evt.currentTarget)
                .find('.parent-item-chevron')
                .toggleClass('fa-chevron-right fa-chevron-down');
            
            $('.child-list-group-item').toggleClass('d-none');
        }
    });
};

var nav = new Navigation();
nav.initialize();
