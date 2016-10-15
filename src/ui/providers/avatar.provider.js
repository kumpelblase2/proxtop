angular.module('proxtop').service('AvatarService', function() {
    this.getAvatarForID = function(id = null) {
        if(id == null || id == "") {
            id = "nophoto.png";
        } else if(id.includes(":")) {
            id = id.split(':')[1];
            if(id.length == 0) {
                id = "nophoto.png";
            }
        }

        return "https://cdn.proxer.me/avatar/tn/" + id;
    };
});
