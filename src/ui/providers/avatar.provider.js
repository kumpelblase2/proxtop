angular.module('proxtop').service('AvatarService', function() {
    this.getAvatarForID = function(id = null) {
        if(id == null || id == "") {
            id = "nophoto.png";
        }

        return "https://cdn.proxer.me/avatar/tn/" + id;
    };
});
