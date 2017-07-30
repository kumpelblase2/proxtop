angular.module('proxtop').service('AvatarService', function() {

    const avatarUrlPrefix = "https://cdn.proxer.me/avatar/tn/";
    const defaultAvatarPhotoName = "nophoto.png";

    this.getAvatarForID = function(id = null) {
        if(id == null || id === "") {
            return this.getDefaultAvatar();
        } else if(id.includes(":")) {
            id = id.split(':')[1];
            if(id.length === 0) {
                return this.getDefaultAvatar();
            }
        }

        return avatarUrlPrefix + id;
    };

    this.getDefaultAvatar = function() {
        return avatarUrlPrefix + defaultAvatarPhotoName;
    };
});
