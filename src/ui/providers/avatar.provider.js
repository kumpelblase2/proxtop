angular.module('proxtop').service('AvatarService', function() {
    this.getAvatarForID = function(id) {
        if(id == null || id == "") {
            id = "nophoto.png";
        }

        return "https://cdn.proxer.me/avatar/tn/" + id;
    };
});
