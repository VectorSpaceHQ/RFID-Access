function runApp(e,r,t,n){e.globals=n.globals||{},e.globals.currentUser&&(t.defaults.headers.common.Authorization="Basic "+e.globals.currentUser.authData),e.$on("$locationChangeStart",function(){"/login"==r.path()||e.globals.currentUser||r.path("/login")}),e.$on("authFailed",function(){r.path("/login")})}function configApp(e){e.interceptors.push("AuthHttpInterceptor")}angular.module("app",["ngRoute","ngResource","ngFileSaver","toastr","ngStorage"]).run(runApp).config(configApp),runApp.$inject=["$rootScope","$location","$http","$sessionStorage"],configApp.$inject=["$httpProvider"],function(){"use strict";function e(e,r){var t=this;t.logout=function(){e.url("/login")},t.isLoggedIn=function(){return r.isLoggedIn()}}angular.module("app").controller("IndexController",e),e.$inject=["$location","AuthService"]}(),function(){"use strict";function e(e,r,t){function n(n){return"/login"!=r.path()&&401==n.status&&t.$broadcast("authFailed"),e.reject(n)}return{responseError:n}}angular.module("app").factory("AuthHttpInterceptor",e),e.$inject=["$q","$location","$rootScope"]}(),function(){"use strict";function e(e,r,t,n,s,o){function a(r,t){var n=o.encode(r+":"+t),s=e(g,{userId:"@id"},{get:{method:"GET",headers:{Authorization:"Basic "+n}}});return s.get({userId:r})}function i(e,r,a){var i=o.encode(e+":"+r);t.defaults.headers.common.Authorization="Basic "+i,n.globals={currentUser:{username:e,authData:i,isAdmin:a}},s.globals=n.globals}function u(){t.defaults.headers.common.Authorization="Basic ",n.globals={},delete s.globals}function c(){return!!n.globals.currentUser}function d(){return n.globals.currentUser?n.globals.currentUser.isAdmin:!1}function l(){return n.globals.currentUser?n.globals.currentUser.username:""}var g="//"+r.host()+":"+r.port()+"/api/users/:userId";return{loginUser:a,saveCredentials:i,clearCredentials:u,isLoggedIn:c,isAdmin:d,username:l}}angular.module("app").factory("AuthService",e),e.$inject=["$resource","$location","$http","$rootScope","$sessionStorage","Base64"]}(),function(){"use strict";function e(){function e(e){var r,n,s,o,a,i="",u="",c="",d=0;do r=e.charCodeAt(d++),n=e.charCodeAt(d++),u=e.charCodeAt(d++),s=r>>2,o=(3&r)<<4|n>>4,a=(15&n)<<2|u>>6,c=63&u,isNaN(n)?a=c=64:isNaN(u)&&(c=64),i=i+t.charAt(s)+t.charAt(o)+t.charAt(a)+t.charAt(c),r=n=u="",s=o=a=c="";while(d<e.length);return i}function r(e){var r,n,s,o,a,i="",u="",c="",d=0,l=/[^A-Za-z0-9\+\/\=]/g;l.exec(e)&&console.log("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding."),e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");do s=t.indexOf(e.charAt(d++)),o=t.indexOf(e.charAt(d++)),a=t.indexOf(e.charAt(d++)),c=t.indexOf(e.charAt(d++)),r=s<<2|o>>4,n=(15&o)<<4|a>>2,u=(3&a)<<6|c,i+=String.fromCharCode(r),64!=a&&(i+=String.fromCharCode(n)),64!=c&&(i+=String.fromCharCode(u)),r=n=u="",s=o=a=c="";while(d<e.length);return i}var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{encode:e,decode:r}}angular.module("app").factory("Base64",e)}(),function(){"use strict";function e(e,r,t){var n=this;r.clearCredentials(),n.username="",n.password="",n.loading=!1,n.login=function(){n.loading=!0;var s=r.loginUser(n.username,n.password);s.$promise.then(function(){r.saveCredentials(n.username,n.password,s.admin),e.path("/")},function(e){n.loading=!1;var r="Unable to login at this time.";401==e.status&&(r="Incorrect username or password"),t.error(r,"Login Failed")})}}angular.module("app").controller("LoginController",e),e.$inject=["$location","AuthService","toastr"]}(),function(){"use strict";function e(e,r){function t(){var r=e(i);return r.get()}function n(r){var t=e(i,{userId:"@id"});return t.get({userId:r})}function s(r){var t=e(i);return t.save(r)}function o(r,t,n){var s=e(i,{userId:"@id"},{save:{method:"PATCH",headers:{"If-Match":t}}});return s.save({userId:r},n)}function a(r,t){var n=e(i,{userId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":t}}});return n.remove({userId:r})}var i="//"+r.host()+":"+r.port()+"/api/users/:userId";return{getUsers:t,getUser:n,addUser:s,saveUser:o,removeUser:a}}angular.module("app").factory("UserService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,t){function n(){s.loading=!0,s.errorLoading=!1;var e=r.getUsers();e.$promise.then(function(){s.loading=!1,s.errorLoading=!1,s.users=e._items},function(){s.loading=!1,s.errorLoading=!0})}var s=this;s.users=[],n(),s.refresh=function(){n()},s.removeUser=function o(t){if(!t.removing){t.removing=!0;var o=r.removeUser(t.id,t._etag);o.$promise.then(function(){e.success("User successfully removed!"),n()},function(r){t.removing=!1;var s="Unable to remove user at this time.";404==r.status?s="This user no longer exists.":412==r.status&&(s="This user has changed since it was loaded."),e.error(s,"Error Removing User"),n()})}},s.isAdmin=function(){return t.isAdmin()}}angular.module("app").controller("UserController",e),e.$inject=["toastr","UserService","AuthService"]}(),function(){"use strict";function e(e,r,t){var n=this;n.username="",n.password="",n.isAdmin=!1,n.adding=!1,n.addUser=function(){n.adding=!0;var s=t.addUser({username:n.username,password:n.password,admin:n.isAdmin});s.$promise.then(function(){r.success("User successfully added!"),e.path("users")},function(e){n.adding=!1;var t="Unable add new user at this time.";if(e.data&&e.data._issues&&e.data._issues.username){var s=e.data._issues.username;-1!=s.indexOf("unique")&&(t="This username already exists. Change the username and try again.")}r.error(t,"Error Adding User")})}}angular.module("app").controller("AddUserController",e),e.$inject=["$location","toastr","UserService"]}(),function(){"use strict";function e(e,r,t,n){function s(){var s=n.getUser(e.userId);s.$promise.then(function(){o.id=s._id,o.etag=s._etag,o.username=s.username,o.oldUsername=s.username,o.isAdmin=s.admin},function(e){var n="Unable to edit user at this time.";404==e.status&&(n="This user no longer exists."),t.error(n,"Error Loading User"),r.path("users")})}var o=this;o.saving=!1,s(),o.saveUser=function(){o.saving=!0;var e={admin:o.isAdmin};o.username!=o.oldUsername&&(e.username=o.username);var a=n.saveUser(o.id,o.etag,e);a.$promise.then(function(){t.success("User saved!"),r.path("users")},function(e){o.saving=!1;var r="Unable to save user at this time.";if(404==e.status)r="This user no longer exists.";else if(412==e.status)r="This user has changed since it was loaded.";else if(e.data&&e.data._issues&&e.data._issues.username){var n=e.data._issues.username;-1!=n.indexOf("unique")&&(r="This username already exists. Change the username and try again.")}t.error(r,"Error Saving User"),s()})}}angular.module("app").controller("EditUserController",e),e.$inject=["$routeParams","$location","toastr","UserService"]}(),function(){"use strict";function e(e,r){function t(r){var t=e(i);return t.get({page:r})}function n(r){var t=e(i,{resourceId:"@id"});return t.get({resourceId:r})}function s(r){var t=e(i);return t.save(r)}function o(r,t,n){var s=e(i,{resourceId:"@id"},{save:{method:"PATCH",headers:{"If-Match":t}}});return s.save({resourceId:r},n)}function a(r,t){var n=e(i,{resourceId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":t}}});return n.remove({resourceId:r})}var i="//"+r.host()+":"+r.port()+"/api/resources/:resourceId";return{getResources:t,getResource:n,addResource:s,saveResource:o,removeResource:a}}angular.module("app").factory("ResourceService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,t){function n(){s.loading=!0,s.errorLoading=!1;var e=r.getResources(s.page);e.$promise.then(function(){s.loading=!1,s.errorLoading=!1,s.resources=e._items,s.lastPage=e._meta.max_results*s.page>=e._meta.total},function(){s.loading=!1,s.errorLoading=!0})}var s=this;s.resources=[],s.page=1,n(),s.refresh=function(){s.page=1,n()},s.next=function(){s.lastPage||(s.page++,n())},s.prev=function(){s.page>1&&(s.page--,n())},s.removeResource=function o(t){if(!t.removing){t.removing=!0;var o=r.removeResource(t.id,t._etag);o.$promise.then(function(){e.success("Resource successfully removed!"),n()},function(r){t.removing=!1;var s="Unable to remove resource at this time.";404==r.status?s="This resource no longer exists.":412==r.status&&(s="This resource has changed since it was loaded."),e.error(s,"Error Removing Resource"),n()})}},s.isAdmin=function(){return t.isAdmin()}}angular.module("app").controller("ResourceController",e),e.$inject=["toastr","ResourceService","AuthService"]}(),function(){"use strict";function e(e,r,t,n){function s(){var s=n.getResource(e.resourceId);s.$promise.then(function(){o.id=s._id,o.etag=s._etag,o.name=s.name,o.oldName=s.name},function(e){var n="Unable to edit resource at this time.";404==e.status&&(n="This resource no longer exists."),t.error(n,"Error Loading Resource"),r.path("resources")})}var o=this;o.saving=!1,s(),o.saveResource=function(){o.saving=!0;var e=n.saveResource(o.id,o.etag,{name:o.name});e.$promise.then(function(){t.success("Resource saved!"),r.path("resources")},function(e){o.saving=!1;var r="Unable to save resource at this time.";if(404==e.status)r="This resource no longer exists.";else if(412==e.status)r="This resource has changed since it was loaded.";else if(e.data&&e.data._issues&&e.data._issues.name){var n=e.data._issues.name;-1!=n.indexOf("unique")&&(r="This resource name already exists. Change the name and try again.")}t.error(r,"Error Saving Resource"),s()})}}angular.module("app").controller("EditResourceController",e),e.$inject=["$routeParams","$location","toastr","ResourceService"]}(),function(){"use strict";function e(e,r,t){var n=this;n.name="",n.adding=!1,n.addResource=function(){n.adding=!0;var s=t.addResource({name:n.name});s.$promise.then(function(){r.success("Resource successfully added!"),e.path("resources")},function(e){n.adding=!1;var t="Unable add new resource at this time.";if(e.data&&e.data._issues&&e.data._issues.name){var s=e.data._issues.name;-1!=s.indexOf("unique")&&(t="This resource name already exists. Change the name and try again.")}r.error(t,"Error Adding Resource")})}}angular.module("app").controller("AddResourceController",e),e.$inject=["$location","toastr","ResourceService"]}(),function(){"use strict";function e(e,r,t,n,s){function o(){var s=n.getUser(e.userId);s.$promise.then(function(){a.id=s._id,a.etag=s._etag,a.username=s.username,a.isAdmin=s.admin},function(e){var n="Unable to change password at this time.";404==e.status&&(n="This user no longer exists."),t.error(n,"Error Loading User"),r.path("users")})}var a=this;a.saving=!1,o(),a.changePassword=function(){a.saving=!0;var e={password:a.password},i=n.saveUser(a.id,a.etag,e);i.$promise.then(function(){t.success("Password changed!"),s.username()==a.username&&s.saveCredentials(a.username,a.password,a.isAdmin),r.path("users")},function(e){a.saving=!1;var r="Unable to change password at this time.";404==e.status?r="This user no longer exists.":412==e.status&&(r="This user has changed since it was loaded."),t.error(r,"Error Changing Password"),o()})}}angular.module("app").controller("ChangeUserPasswordController",e),e.$inject=["$routeParams","$location","toastr","UserService","AuthService"]}(),function(){"use strict";function e(e,r){function t(r){var t=e(a);return t.get({page:r})}function n(r){var t=e(a,{cardId:"@id"});return t.get({cardId:r})}function s(r,t,n){var s=e(a,{cardId:"@id"},{save:{method:"PATCH",headers:{"If-Match":t}}});return s.save({cardId:r},n)}function o(r,t){var n=e(a,{cardId:"@id"},{remove:{method:"DELETE",headers:{"If-Match":t}}});return n.remove({cardId:r})}var a="//"+r.host()+":"+r.port()+"/api/cards/:cardId";return{getCards:t,getCard:n,saveCard:s,removeCard:o}}angular.module("app").factory("CardService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,t,n){function s(){var e=r.getCards(a.page);e.$promise.then(function(){a.loading=!1;for(var r=e._items,t=0;t<r.length;t++){var n=r[t].resources.split(",");r[t].resources=n}a.cards=r,a.lastPage=e._meta.max_results*a.page>=e._meta.total},function(){a.loading=!1,a.errorLoading=!0})}function o(){a.loading=!0,a.errorLoading=!1;var e=t.getResources();e.$promise.then(function(){var r=e._items;a.resourceNames=[];for(var t=0;t<r.length;t++)a.resourceNames[r[t]._id]=r[t].name;s()},function(){a.loading=!1,a.errorLoading=!0})}var a=this;a.cards=[],a.resourceNames={},a.page=1,o(),a.refresh=function(){a.page=1,o()},a.next=function(){a.lastPage||(a.page++,o())},a.prev=function(){a.page>1&&(a.page--,o())},a.removeCard=function i(t){if(!t.removing){t.removing=!0;var i=r.removeCard(t.id,t._etag);i.$promise.then(function(){e.success("Card successfully removed!"),o()},function(r){t.removing=!1;var n="Unable to remove card at this time.";404==r.status?n="This card no longer exists.":412==r.status&&(n="This card has changed since it was loaded."),e.error(n,"Error Removing Card"),o()})}},a.isAdmin=function(){return n.isAdmin()}}angular.module("app").controller("CardController",e),e.$inject=["toastr","CardService","ResourceService","AuthService"]}(),function(){"use strict";function e(e,r,t,n,s){function o(){var s=n.getCard(e.cardId);s.$promise.then(function(){i.id=s._id,i.etag=s._etag,i.uuid=s.uuid,i.member=s.member,a(s.resources)},function(e){var n="Unable to edit card at this time.";404==e.status&&(n="This card no longer exists."),t.error(n,"Error Loading Card"),r.path("cards")})}function a(e){var n=s.getResources();n.$promise.then(function(){i.resources=n._items;for(var r=0;r<i.resources.length;r++)-1!=e.indexOf(i.resources[r]._id)?i.resources[r].isAuthorized=!0:i.resources[r].isAuthorized=!1},function(e){t.error("Unable to edit card at this time.","Error Loading Card"),r.path("cards")})}var i=this;i.saving=!1,o(),i.saveCard=function(){i.saving=!0;for(var e=[],s=0;s<i.resources.length;s++)i.resources[s].isAuthorized&&e.push(i.resources[s]._id);var a={member:i.member,resources:e.join(",")},u=n.saveCard(i.id,i.etag,a);u.$promise.then(function(){t.success("Card Saved!"),r.path("cards")},function(e){i.saving=!1;var r="Unable to save card at this time.";404==e.status?r="This card no longer exists.":412==e.status&&(r="This card has changed since it was loaded."),t.error(r,"Error Saving Card"),o()})}}angular.module("app").controller("EditCardController",e),e.$inject=["$routeParams","$location","toastr","CardService","ResourceService"]}(),function(){"use strict";function e(e,r){function t(r){var t=e(s);return t.get({sort:"-_created",page:r})}function n(){var r=e(s);return r.remove()}var s="//"+r.host()+":"+r.port()+"/api/logs/:logId";return{getLogs:t,clearLogs:n}}angular.module("app").factory("LogService",e),e.$inject=["$resource","$location"]}(),function(){"use strict";function e(e,r,t,n,s){function o(){i.loading=!0,i.errorLoading=!1;var e=n.getLogs(i.page);e.$promise.then(function(){i.loading=!1,i.errorLoading=!1,i.logs=e._items;for(var r=0;r<i.logs.length;r++){var t=new Date(i.logs[r]._created);i.logs[r].date=t.toLocaleDateString()+" "+t.toLocaleTimeString()}i.lastPage=e._meta.max_results*i.page>=e._meta.total?!0:!1},function(){i.loading=!1,i.errorLoading=!0})}function a(){for(var e="Date,UUID,Member,Resource,Status\n",r=0;r<i.logs.length;r++){var t=i.logs[r];e+=t.date+","+t.uuid.substr(5)+","+t.member+","+t.resource+","+(t.granted?"Success":t.reason)+"\n"}return e}var i=this;i.logs=[],i.page=1,i.clearing=!1,o(),i.refresh=function(){i.page=1,o()},i.isAdmin=function(){return s.isAdmin()},i.newer=function(){i.page>1&&(i.page--,o())},i.older=function(){i.lastPage||(i.page++,o())},i.clearLogs=function u(){if(!i.clearing){i.clearing=!0;var u=n.clearLogs();u.$promise.then(function(){i.clearing=!1,e.success("Logs cleared!"),o()},function(r){i.clearing=!1,e.error("Unable to clear logs at this time."),o()})}},i.saveLogs=function(){var e=a(),n=new t([e],{type:"text/csv;charset=utf-8"});r.saveAs(n,"rfid_logs.csv")}}angular.module("app").controller("LogController",e),e.$inject=["toastr","FileSaver","Blob","LogService","AuthService"]}(),angular.module("app").config(["$routeProvider",function(e){e.when("/",{templateUrl:"views/home.html"}).when("/login",{templateUrl:"views/login.html",controller:"LoginController",controllerAs:"vm"}).when("/users",{templateUrl:"views/users.html",controller:"UserController",controllerAs:"vm"}).when("/adduser",{templateUrl:"views/adduser.html",controller:"AddUserController",controllerAs:"vm"}).when("/edituser/:userId",{templateUrl:"views/edituser.html",controller:"EditUserController",controllerAs:"vm"}).when("/changeuserpassword/:userId",{templateUrl:"views/changeuserpassword.html",controller:"ChangeUserPasswordController",controllerAs:"vm"}).when("/resources",{templateUrl:"views/resources.html",controller:"ResourceController",controllerAs:"vm"}).when("/addresource",{templateUrl:"views/addresource.html",controller:"AddResourceController",controllerAs:"vm"}).when("/editresource/:resourceId",{templateUrl:"views/editresource.html",controller:"EditResourceController",controllerAs:"vm"}).when("/cards",{templateUrl:"views/cards.html",controller:"CardController",controllerAs:"vm"}).when("/editcard/:cardId",{templateUrl:"views/editcard.html",controller:"EditCardController",controllerAs:"vm"}).when("/logs",{templateUrl:"views/logs.html",controller:"LogController",controllerAs:"vm"})}]);