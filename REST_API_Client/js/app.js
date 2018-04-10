		var app = angular.module("myApp", ['ngRoute', 'ngCookies']);
			app.factory('AuthenticationService',
			['Base64', '$http', '$cookies', '$rootScope', '$timeout',
			function (Base64, $http, $cookies, $rootScope, $timeout) {
				var service = {};
		 
				service.Login = function (username, password, callback) {
		 
					/* Dummy authentication for testing, uses $timeout to simulate api call
					 ----------------------------------------------*/
					$http.post('/REST_API/web/signin', {username: username, password: password})
					.then(function(response) {
						callback(response);
					});
		 
				}
	  
			service.SetCredentials = function (username, password) {
				var authdata = Base64.encode(username + ':' + password);
	  
				$rootScope.globals = {
					currentUser: {
						username: username,
						authdata: authdata
					}
				};
	  
				$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
				$cookies.put('globals', $rootScope.globals);
			};
	  
			service.ClearCredentials = function () {
				$rootScope.globals = {};
				$cookies.remove('globals');
				$http.defaults.headers.common.Authorization = 'Basic ';
			};
  
				return service;
			}]);
			
			app.factory('Base64', function () {
			/* jshint ignore:start */
		  
			var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		  
			return {
				encode: function (input) {
					var output = "";
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
		  
					do {
						chr1 = input.charCodeAt(i++);
						chr2 = input.charCodeAt(i++);
						chr3 = input.charCodeAt(i++);
		  
						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;
		  
						if (isNaN(chr2)) {
							enc3 = enc4 = 64;
						} else if (isNaN(chr3)) {
							enc4 = 64;
						}
		  
						output = output +
							keyStr.charAt(enc1) +
							keyStr.charAt(enc2) +
							keyStr.charAt(enc3) +
							keyStr.charAt(enc4);
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
					} while (i < input.length);
		  
					return output;
				},
		  
				decode: function (input) {
					var output = "";
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
		  
					// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
					var base64test = /[^A-Za-z0-9\+\/\=]/g;
					if (base64test.exec(input)) {
						window.alert("There were invalid base64 characters in the input text.\n" +
							"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
							"Expect errors in decoding.");
					}
					input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		  
					do {
						enc1 = keyStr.indexOf(input.charAt(i++));
						enc2 = keyStr.indexOf(input.charAt(i++));
						enc3 = keyStr.indexOf(input.charAt(i++));
						enc4 = keyStr.indexOf(input.charAt(i++));
		  
						chr1 = (enc1 << 2) | (enc2 >> 4);
						chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
						chr3 = ((enc3 & 3) << 6) | enc4;
		  
						output = output + String.fromCharCode(chr1);
		  
						if (enc3 != 64) {
							output = output + String.fromCharCode(chr2);
						}
						if (enc4 != 64) {
							output = output + String.fromCharCode(chr3);
						}
		  
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
		  
					} while (i < input.length);
		  
					return output;
					}
					};
					  
				});
				
				app.config(['$routeProvider',
				function($routeProvider) { 
					
					// Système de routage
					$routeProvider
					.when('/', {
						templateUrl: 'index.html'
					})
					.when('/login', {
						templateUrl: 'loginV2.html',
						controller: 'login'
					})
					.when('/register', {
						templateUrl: 'registerV2.html',
						controller: 'register'
					})
					.when('/menu', {
						templateUrl: 'menu.html',
						controller : 'logoutcntl'
					})
					.when('/infos', {
						templateUrl: 'infos.html',
						controller : 'infoscntl'
					})
					.when('/setting', {
						templateUrl: 'setting.html',
						controller : 'updatecntl'
					})
					.when('/friends', {
						templateUrl: 'friendsV2.html',
						controller : 'friendcntl'
					})
					.otherwise({ redirectTo: '/' });
				}
			]);
			app.run(['$rootScope', '$location', '$cookies', '$http',
				function ($rootScope, $location, $cookies, $http) {
					// keep user logged in after page refresh
					$rootScope.globals = $cookies.get('globals') || {};
					if ($rootScope.globals.currentUser) {
						$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
						console.log('already connected');
					}
			  
					$rootScope.$on('$locationChangeStart', function (event, next, current) {
						// redirect to login page if not logged in
						if ($location.path() == '/login' && $rootScope.globals.currentUser){
							$location.path('/');
							console.log('redirection to /');
						}
						if ($location.path() !== '/login' && $location.path() !== '/register' && !$rootScope.globals.currentUser) {
							$location.path('/login');
							console.log('redirection to /login');
						}
					});
				}]);
			
			
		app.controller('login', function($scope, $rootScope, $location, AuthenticationService) {
			
			$scope.error = null;
			$scope.error = null;
			$scope.username = null;
			$scope.password = null;
			$scope.login= function(username,password){
				if(username == '' || password == '')
					$scope.error = "you have to fill in all fields";
				else{
				AuthenticationService.Login(username, password, function(response) {
                if(response.data == 'welcome' || response.data == 'there is a user already logged in') {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/menu');
					console.log("logged successfully");
                } else {
					console.log("request doesn't sent");
                    //$scope.error = response.message;
                }
			 
				});
			// $scope.login= function(username,password){
				// $http.post('/REST_API/web/signin', {username: username, password: password})
				// .then(function(response) {
					// if(response.data == 'there is a user already logged in' || response.data == 'Welcome'){
						// $cookies.put('logged',response);
						// $window.location.href='./menu.html';
						// }
					// $scope.feedback = response;
				// }, function(response){
					// $scope.error = response.data;
				// });
				}
			}
		});
		
		app.controller('register', function($scope,$rootScope,$location, $http) {
			
			$scope.myWelcome = "nothing done";
			$scope.username = null;
			$scope.email = null;
			$scope.password = null;
			$scope.password_confirm = null;
			$scope.emailvalidation =false;
			$scope.register = function(username,email,password){
				$scope.erro = null;
				if($scope.registerform.email.$valid && password == $scope.password_confirm){
				$http.post('/REST_API/web/signup', {username: username, email: email, password: password})
				.then(function(response) {
					$scope.myWelcome = response.data;
					$location.path('/login');
				}, function(response){
					$scope.error = response.message;
				});
				}
				if(!$scope.registerform.email.$valid)
					$scope.error = "email invalid";
				if(!$scope.password == $scope.password_confirm)
					$scope.error = "Passwords don't match";
				if(!$scope.registerform.email.$valid && $scope.password != $scope.password_confirm)
					$scope.error = "email invalid & Passwords don't match";
		}
		});
		
		app.controller('logoutcntl', function($scope, $location , $http, AuthenticationService) {
			$scope.logout = function () {
				$http.get('/REST_API/web/logout').then( function(response) {
					AuthenticationService.ClearCredentials();
					//$scope.response = response.data;
					$location.path("/login");
				}, function(response){
					$scope.response = response.message;
				});
			}	
		});
		
		app.controller('updatecntl', function($scope, $rootScope, $http) {
			
			$http.get('/REST_API/web/infos').then( function(response) {
					$scope.response = response.data;
				}, function(response){
					$scope.response = response.message;
				}
			);
			$scope.update = function(username,email,age,race,famille,nourriture){
				$http.post('/REST_API/web/update', {username: username, email: email, age : age, race : race, famille : famille, nourriture : nourriture})
				.then(function(response) {
					$scope.feedback = response.data;
				}, function(response){
					$scope.error = response.message;
				});
			}
		});
		
		app.controller('infoscntl', function($scope,$rootScope, $http) {
			if ($rootScope.logged == false)
				$window.location.href = './index.html';
			$http.get('/REST_API/web/infos').then( function(response) {
					$scope.response = response.data;
				}, function(response){
					$scope.response = response.message;
				}
			);
			
		});
		app.controller('friendcntl', function($scope,$rootScope, $http, $window) {
			
			$scope.getfriends = function () {
				$http.get('/REST_API/web/friends').then( function(response) {
					$scope.friends = response.data;
				}, function(response){
					$scope.response = response.message;
				});
			}
			$scope.getfriends();

			$http.get('/REST_API/web/users').then( function(response) {
					$scope.users = response.data;
				}, function(response){
					$scope.response = response.message;
				}
			);
			
			$scope.remove = function(username){
				$scope.addfeedback = null;
				$scope.adderror = null;
				$http.post('/REST_API/web/deletefriend', { friend : username}).then( function(response) {
					$scope.getfriends();
					$scope.removefeedback = response.data;
				}, function(error){
					$scope.removeerror = error.message;
				});
				
			}
			$scope.add = function(user){
					$scope.removeerror=null;
					$scope.removefeedback=null;
					//$window.alert(user);
					$scope.adderror=null;
					$scope.addfeedback=null;
					$scope.exist=false;
					$scope.added = false;
				angular.forEach($scope.users, function(item){  
					if(item.username == user)  
							$scope.exist = true; 
					});
				angular.forEach($scope.friends, function(item){  
					if(item.username == user) 
							$scope.added = true;
				});
				
				if(user!=undefined && user!="" && $scope.exist==true && !$scope.added){
					$http.post('/REST_API/web/addfriend', { friend : user }).then( function(response) {
					$scope.getfriends();
					$scope.addfeedback = user+' '+response.data;
					$scope.user="";
				}, function(error){
					$scope.adderror = error.message;
				});
				}
				if(!$scope.exist)
					$scope.adderror = user+" doesn't exist";
				
				if($scope.added)
					$scope.adderror = user+" is already friend";
			}
				
			$scope.complete = function(string){  
			$scope.hidethis = false;  
			var output = [];  
			angular.forEach($scope.users, function(user){  
                if(user.username.toLowerCase().indexOf(string.toLowerCase()) >= 0)  
                {  
                     output.push(user);  
                }  
			});  
			$scope.filterUser = output;  
			}  
			$scope.fillTextbox = function(string){  
			$scope.user = string;  
			$scope.hidethis = true;  
			}		  
		});