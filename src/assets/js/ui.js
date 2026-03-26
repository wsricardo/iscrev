( function() {
    'use strict';

    // Data
    var uiLeftSideBar = document.getElementById('sidebar');
    
    

    // Functions
    function toggleSideBar() {
        if (uiLeftSideBar.style.display === 'none') {
            uiLeftSideBar.style.display = 'flex';
        } else {
            uiLeftSideBar.style.display = 'none';
        }
    }

    
    
    // Events Button Listener

    document.getElementById('btn-sidebar-toggle').addEventListener('click', toggleSideBar);
    

    
    // Init

    

})();