function runApp(e,r,s,t){e.globals=t.globals||{},e.globals.currentUser&&(s.defaults.headers.common.Authorization="Basic "+e.globals.currentUser.authData),e.$on("$locationChangeStart",function(){"/login"==r.path()||e.globals.currentUser||r.path("/login")}),e.$on("authFailed",function(){r.path("/login")})}function configApp(e){e.interceptors.push("AuthHttpInterceptor")}angular.module("app",["ngRoute","ngResource","ngFileSaver","toastr","ngStorage"]).run(runApp).config(configApp),runApp.$inject=["$rootScope","$location","$http","$sessionStorage"],configApp.$inject=["$httpProvider"],function(){"use strict";function e(e,r){var s=this;s.logout=function(){e.url("/login")},s.isLoggedIn=function(){return r.isLoggedIn()}}angular.module("app").controller("IndexController",e),e.$inject=["$location","AuthService"]}(),function(){"use strict";function e(e,r,s){function t(t){return"/login"!=r.path()&&401==t.status&&s.$broadcast("authFailed"),e.reject(t)}return{responseError:t}}angular.module("app").factory("AuthHttpInterceptor",e),e.$inject=["$q","$location","$rootScope"]}(),function(){"use strict";function e(e,r,s,t,n,o){function a(r,s){var t=o.encode(r+":"+s),n=e(l,{userId:"@id"},{get:{method:"GET",headers:{Authorization:"Basic "+t}}});return n.get({userId:r})}function i(e,r,a){var i=o.encode(e+":"+r);s.defaults.headers.common.Authorization="Basic "+i,t.globals={currentUser:{username:e,authData:i,isAdmin:a}},n.globals=t.globals}function u(){s.defaults.headers.common.Authorization="Basic ",t.globals={},delete n.globals}function c(){return!!t.globals.currentUser}function d(){return t.globals.currentUser?t.globals.currentUser.isAdmin:!1}var l="//"+r.host()+":"+r.port()+"/api/users/:userId";return{loginUser:a,saveCredentials:i,clearCredentials:u,isLoggedIn:c,isAdmin:d}}angular.module("app").factory("AuthService",e),e.$inject=["$resource","$location","$http","$rootScope","$sessionStorage","Base64"]}(),function(){"use strict";function e(){function e(e){var r,t,n,o,a,i="",u="",c="",d=0;do r=e.charCodeAt(d++),t=e.charCodeAt(d++),u=e.charCodeAt(d++),n=r>>2,o=(3&r)<<4|t>>4,a=(15&t)<<2|u>>6,c=63&u,isNaN(t)?a=c=64:isNaN(u)&&(c=64),i=i+s.charAt(n)+s.charAt(o)+s.charAt(a)+s.charAt(c),r=t=u="",n=o=a=c="";while(d<e.length);return i}function r(e){var r,t,n,o,a,i="",u="",c="",d=0,l=/[^A-Za-z0-9\+\/\=]/g;l.exec(e)&&console.log("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding."),e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");do n=s.indexOf(e.charAt(d++)),o=s.indexOf(e.charAt(d++)),a=s.indexOf(e.charAt(d++)),c=s.indexOf(e.charAt(d++)),r=n<<2|o>>4,t=(15&o)<<4|a>>2,u=(3&a)<<6|c,i+=String.fromCharCode(r),64!=a&&(i+=String.fromCharCode(t)),64!=c&&(i+=String.fromCharCode(u)),r=t=u="",n=o=a=c="";while(d<e.length);return i}var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{encode:e,decode:r}}angular.module("app").factory("Base64",e)}(),function(){"use strict";function e(e,r,s){var t=this;r.clearCredentials(),t.username="",t.password="",t.loading=!1,t.login=function(){t.loading=!0;var n=r.loginUser(t.username,t.password);n.$promise.then(function(){r.saveCredentials(t.username,t.password,n.admin),e.path("/")},function(e){t.loading=!1;var r="Unable to login at this time.";401==e.status&&(r="Incorrect username or password"),s.error(r,"Login Failed")})}}angular.module("app").controller("LoginController",e),e.$inject=["$location","AuthService","toastr"]}(),function(){"use strict";function e(e,r){function s(){var r=e(i);return r.get()}function t(r){var s=e(i,{userId:"@id"});return s.get({userId:r})}function n(r){var s=e(i);return s.save(r)}function o(r,s,t){var n=e(i,{userId:"@id"},{save:{method:"PATCH",headers:{"If-Match":s}}});return n.save({userId:r},t)}function a(r,s){var t=e(i,{userId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":s}}});return t.remove({userId:r})}var i="//"+r.host()+":"+r.port()+"/api/users/:userId";return{getUsers:s,getUser:t,addUser:n,saveUser:o,removeUser:a}}angular.module("app").factory("UserService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,s){function t(){n.loading=!0;var e=r.getUsers();e.$promise.then(function(){n.loading=!1,n.users=e._items},function(){n.loading=!1})}var n=this;n.users=[],t(),n.refresh=function(){t()},n.removeUser=function o(s,n){var o=r.removeUser(s,n);o.$promise.then(function(){e.success("User successfully removed!"),t()},function(r){var s="Unable to remove user at this time.";404==r.status?s="This user no longer exists.":412==r.status&&(s="This user has changed since it was loaded."),e.error(s,"Error Removing User"),t()})},n.isAdmin=function(){return s.isAdmin()}}angular.module("app").controller("UserController",e),e.$inject=["toastr","UserService","AuthService"]}(),function(){"use strict";function e(e,r,s){var t=this;t.username="",t.password="",t.isAdmin=!1,t.adding=!1,t.addUser=function(){t.adding=!0;var n=s.addUser({username:t.username,password:t.password,admin:t.isAdmin});n.$promise.then(function(){r.success("User successfully added!"),e.path("users")},function(e){t.adding=!1;var s="Unable add new user at this time.";if(e.data&&e.data._issues&&e.data._issues.username){var n=e.data._issues.username;-1!=n.indexOf("unique")&&(s="This username already exists. Change the username and try again.")}r.error(s,"Error Adding User")})}}angular.module("app").controller("AddUserController",e),e.$inject=["$location","toastr","UserService"]}(),function(){"use strict";function e(e,r,s,t){function n(){var n=t.getUser(e.userId);n.$promise.then(function(){o.id=n._id,o.etag=n._etag,o.username=n.username,o.oldUsername=n.username,o.isAdmin=n.admin},function(e){var t="Unable to edit user at this time.";404==e.status&&(t="This user no longer exists."),s.error(t,"Error Loading User"),r.path("users")})}var o=this;o.saving=!1,n(),o.saveUser=function(){o.saving=!0;var e={admin:o.isAdmin};o.username!=o.oldUsername&&(e.username=o.username);var a=t.saveUser(o.id,o.etag,e);a.$promise.then(function(){s.success("User saved!"),r.path("users")},function(e){o.saving=!1;var r="Unable to save user at this time.";if(404==e.status)r="This user no longer exists.";else if(412==e.status)r="This user has changed since it was loaded.";else if(e.data&&e.data._issues&&e.data._issues.username){var t=e.data._issues.username;-1!=t.indexOf("unique")&&(r="This username already exists. Change the username and try again.")}s.error(r,"Error Saving User"),n()})}}angular.module("app").controller("EditUserController",e),e.$inject=["$routeParams","$location","toastr","UserService"]}(),function(){"use strict";function e(e,r){function s(){var r=e(i);return r.get()}function t(r){var s=e(i,{resourceId:"@id"});return s.get({resourceId:r})}function n(r){var s=e(i);return s.save(r)}function o(r,s,t){var n=e(i,{resourceId:"@id"},{save:{method:"PATCH",headers:{"If-Match":s}}});return n.save({resourceId:r},t)}function a(r,s){var t=e(i,{resourceId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":s}}});return t.remove({resourceId:r})}var i="//"+r.host()+":"+r.port()+"/api/resources/:resourceId";return{getResources:s,getResource:t,addResource:n,saveResource:o,removeResource:a}}angular.module("app").factory("ResourceService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,s){function t(){n.loading=!0;var e=r.getResources();e.$promise.then(function(){n.loading=!1,n.resources=e._items},function(){n.loading=!1})}var n=this;n.resources=[],t(),n.refresh=function(){t()},n.removeResource=function o(s,n){var o=r.removeResource(s,n);o.$promise.then(function(){e.success("Resource successfully removed!"),t()},function(r){var s="Unable to remove resource at this time.";404==r.status?s="This resource no longer exists.":412==r.status&&(s="This resource has changed since it was loaded."),e.error(s,"Error Removing Resource"),t()})},n.isAdmin=function(){return s.isAdmin()}}angular.module("app").controller("ResourceController",e),e.$inject=["toastr","ResourceService","AuthService"]}(),function(){"use strict";function e(e,r,s,t){function n(){var n=t.getResource(e.resourceId);n.$promise.then(function(){o.id=n._id,o.etag=n._etag,o.name=n.name,o.oldName=n.name},function(e){var t="Unable to edit resource at this time.";404==e.status&&(t="This resource no longer exists."),s.error(t,"Error Loading Resource"),r.path("resources")})}var o=this;o.saving=!1,n(),o.saveResource=function(){o.saving=!0;var e=t.saveResource(o.id,o.etag,{name:o.name});e.$promise.then(function(){s.success("Resource saved!"),r.path("resources")},function(e){o.saving=!1;var r="Unable to save resource at this time.";if(404==e.status)r="This resource no longer exists.";else if(412==e.status)r="This resource has changed since it was loaded.";else if(e.data&&e.data._issues&&e.data._issues.name){var t=e.data._issues.name;-1!=t.indexOf("unique")&&(r="This resource name already exists. Change the name and try again.")}s.error(r,"Error Saving Resource"),n()})}}angular.module("app").controller("EditResourceController",e),e.$inject=["$routeParams","$location","toastr","ResourceService"]}(),function(){"use strict";function e(e,r,s){var t=this;t.name="",t.adding=!1,t.addResource=function(){t.adding=!0;var n=s.addResource({name:t.name});n.$promise.then(function(){r.success("Resource successfully added!"),e.path("resources")},function(e){t.adding=!1;var s="Unable add new resource at this time.";if(e.data&&e.data._issues&&e.data._issues.name){var n=e.data._issues.name;-1!=n.indexOf("unique")&&(s="This resource name already exists. Change the name and try again.")}r.error(s,"Error Adding Resource")})}}angular.module("app").controller("AddResourceController",e),e.$inject=["$location","toastr","ResourceService"]}(),function(){"use strict";function e(e,r,s,t,n){function o(){var n=t.getUser(e.userId);n.$promise.then(function(){a.id=n._id,a.etag=n._etag,a.username=n.username,a.isAdmin=n.admin},function(e){var t="Unable to change password at this time.";404==e.status&&(t="This user no longer exists."),s.error(t,"Error Loading User"),r.path("users")})}var a=this;a.saving=!1,o(),a.changePassword=function(){a.saving=!0;var e={password:a.password},i=t.saveUser(a.id,a.etag,e);i.$promise.then(function(){s.success("Password changed!"),n.saveCredentials(a.username,a.password,a.isAdmin),r.path("users")},function(e){a.saving=!1;var r="Unable to change password at this time.";404==e.status?r="This user no longer exists.":412==e.status&&(r="This user has changed since it was loaded."),s.error(r,"Error Changing Password"),o()})}}angular.module("app").controller("ChangeUserPasswordController",e),e.$inject=["$routeParams","$location","toastr","UserService","AuthService"]}(),function(){"use strict";function e(e,r){function s(){var r=e(a);return r.get()}function t(r){var s=e(a,{cardId:"@id"});return s.get({cardId:r})}function n(r,s,t){var n=e(a,{cardId:"@id"},{save:{method:"PATCH",headers:{"If-Match":s}}});return n.save({cardId:r},t)}function o(r,s){var t=e(a,{cardId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":s}}});return t.remove({cardId:r})}var a="//"+r.host()+":"+r.port()+"/api/cards/:cardId";return{getCards:s,getCard:t,saveCard:n,removeCard:o}}angular.module("app").factory("CardService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,s,t){function n(){var e=r.getCards();e.$promise.then(function(){a.loading=!1;for(var r=e._items,s=0;s<r.length;s++){var t=r[s].resources.split(",");r[s].resources=t}a.cards=r},function(){a.loading=!1})}function o(){a.loading=!0;var e=s.getResources();e.$promise.then(function(){var r=e._items;a.resourceNames=[];for(var s=0;s<r.length;s++)a.resourceNames[r[s]._id]=r[s].name;n()},function(){a.loading=!1})}var a=this;a.cards=[],a.resourceNames={},o(),a.refresh=function(){o()},a.removeCard=function i(s,t){var i=r.removeCard(s,t);i.$promise.then(function(){e.success("Card successfully removed!"),o()},function(r){var s="Unable to remove card at this time.";404==r.status?s="This card no longer exists.":412==r.status&&(s="This card has changed since it was loaded."),e.error(s,"Error Removing Card"),o()})},a.isAdmin=function(){return t.isAdmin()}}angular.module("app").controller("CardController",e),e.$inject=["toastr","CardService","ResourceService","AuthService"]}(),function(){"use strict";function e(e,r,s,t,n){function o(){var n=t.getCard(e.cardId);n.$promise.then(function(){i.id=n._id,i.etag=n._etag,i.uuid=n.uuid,i.member=n.member,a(n.resources)},function(e){var t="Unable to edit card at this time.";404==e.status&&(t="This card no longer exists."),s.error(t,"Error Loading Card"),r.path("cards")})}function a(e){var t=n.getResources();t.$promise.then(function(){i.resources=t._items;for(var r=0;r<i.resources.length;r++)-1!=e.indexOf(i.resources[r]._id)?i.resources[r].isAuthorized=!0:i.resources[r].isAuthorized=!1},function(e){s.error("Unable to edit card at this time.","Error Loading Card"),r.path("cards")})}var i=this;i.saving=!1,o(),i.saveCard=function(){i.saving=!0;for(var e=[],n=0;n<i.resources.length;n++)i.resources[n].isAuthorized&&e.push(i.resources[n]._id);var a={member:i.member,resources:e.join(",")},u=t.saveCard(i.id,i.etag,a);u.$promise.then(function(){s.success("Card Saved!"),r.path("cards")},function(e){i.saving=!1;var r="Unable to save card at this time.";404==e.status?r="This card no longer exists.":412==e.status&&(r="This card has changed since it was loaded."),s.error(r,"Error Saving Card"),o()})}}angular.module("app").controller("EditCardController",e),e.$inject=["$routeParams","$location","toastr","CardService","ResourceService"]}(),function(){"use strict";function e(e,r){function s(){var r=e(n);return r.get()}function t(){var r=e(n);return r.remove()}var n="//"+r.host()+":"+r.port()+"/api/logs/:logId";return{getLogs:s,clearLogs:t}}angular.module("app").factory("LogService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,s,t,n){function o(){i.loading=!0;var e=t.getLogs();e.$promise.then(function(){i.loading=!1,i.logs=e._items;for(var r=0;r<i.logs.length;r++){var s=new Date(i.logs[r]._created);i.logs[r].date=s.toLocaleDateString()+" "+s.toLocaleTimeString()}},function(){i.loading=!1})}function a(){for(var e="Date,UUID,Member,Resource,Status\n",r=0;r<i.logs.length;r++){var s=i.logs[r];e+=s.date+","+s.uuid.substr(5)+","+s.member+","+s.resource+","+(s.granted?"Success":s.reason)+"\n"}return e}var i=this;i.logs=[],o(),i.refresh=function(){o()},i.isAdmin=function(){return n.isAdmin()},i.clearLogs=function u(){var u=t.clearLogs();u.$promise.then(function(){e.success("Logs cleared!"),o()},function(r){e.error("Unable to clear logs at this time."),o()})},i.saveLogs=function(){var e=a(),t=new s([e],{type:"text/csv;charset=utf-8"});r.saveAs(t,"rfid_logs.csv")}}angular.module("app").controller("LogController",e),e.$inject=["toastr","FileSaver","Blob","LogService","AuthService"]}(),angular.module("app").config(["$routeProvider",function(e){e.when("/",{templateUrl:"views/home.html"}).when("/login",{templateUrl:"views/login.html",controller:"LoginController",controllerAs:"vm"}).when("/users",{templateUrl:"views/users.html",controller:"UserController",controllerAs:"vm"}).when("/adduser",{templateUrl:"views/adduser.html",controller:"AddUserController",controllerAs:"vm"}).when("/edituser/:userId",{templateUrl:"views/edituser.html",controller:"EditUserController",controllerAs:"vm"}).when("/changeuserpassword/:userId",{templateUrl:"views/changeuserpassword.html",controller:"ChangeUserPasswordController",controllerAs:"vm"}).when("/resources",{templateUrl:"views/resources.html",controller:"ResourceController",controllerAs:"vm"}).when("/addresource",{templateUrl:"views/addresource.html",controller:"AddResourceController",controllerAs:"vm"}).when("/editresource/:resourceId",{templateUrl:"views/editresource.html",controller:"EditResourceController",controllerAs:"vm"}).when("/cards",{templateUrl:"views/cards.html",controller:"CardController",controllerAs:"vm"}).when("/editcard/:cardId",{templateUrl:"views/editcard.html",controller:"EditCardController",controllerAs:"vm"}).when("/logs",{templateUrl:"views/logs.html",controller:"LogController",controllerAs:"vm"})}]);