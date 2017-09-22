var myApp = angular.module('MyApp', ['onsen', 'ui.router', 'ngSanitize', 'swipe', 'ngAnimate']);

// 遷移処理
myApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

		$stateProvider
			// リスト画面遷移
			.state('list', {
				url: '/list',
				templateUrl: 'list.html'
			})
			// 詳細画面遷移
			.state('detail', {
				url: '/detail',
				templateUrl: 'detail.html',
				// 引数を受け付ける
				params: {
					"index": null,
					"list": null
				}
			})
			
	}]);

// メイン画面用コントローラ
myApp.controller('JSONController', ['$scope', '$state', '$rootScope', '$timeout', function($scope, $state, $rootScope, $timeout) {
		$scope.readJSON = function() {
	     	console.log("readJSON");
	     	
			// ローディングフラグON
			$rootScope.isLoading = true;
			
			// 1秒待ってから遷移する
			$timeout(function() {
				$state.go('list');
			}, 1000);
		}
	}]);

// リスト画面用コントローラ
myApp.controller('ListController', ['$scope', '$state', '$rootScope', 'JsonFlowerService', function($scope, $state, $rootScope, JsonFlowerService) {
		// Jsonデータ取得
		JsonFlowerService.run().then(
			function(resultList) {
				// 結果リストが取れたら、スコープに設定
				$scope.list = resultList;
			}, function(response) {
				ons.notification.alert({
					title: 'JSON取得失敗',
					message: response
				});
			}
		);
		
		// 名称リンク押下
		$scope.jumpDetail = function(idx) {
			// indexとリストを引数にして、詳細画面を表示する
			$state.go('detail', {'index': idx, 'list': $scope.list});
		}
	}]);

// 詳細画面用コントローラ
myApp.controller('DetailController', ['$scope', '$state', '$stateParams', '$location', '$anchorScroll', function($scope, $state, $stateParams, $location, $anchorScroll) {		
		
		// 引き継がれたリストをスコープに設定
		$scope.list = $stateParams.list;
		// 引き継がれたindexを現在の表示対象に設定
		$scope.currentIndex = $stateParams.index;
		// アニメーション方向
		$scope.direction = 'left';
		
		// 現在の表示対象であるか
		$scope.isCurrent = function (index) {
			return $scope.currentIndex === index;
		};
		
		// 次に遷移する
		$scope.next = function () {
			console.log("next currentIndex: "+ $scope.currentIndex);
			$scope.direction = 'left';
			$scope.currentIndex = $scope.currentIndex < $scope.list.length-1 ? ++$scope.currentIndex : 0;
			console.log("** next currentIndex: "+ $scope.currentIndex);
		};
		
		// 前に遷移する
		$scope.prev = function () {
			console.log("prev currentIndex: "+ $scope.currentIndex);
			$scope.direction = 'right';
			$scope.currentIndex = $scope.currentIndex > 0 ? --$scope.currentIndex : $scope.list.length-1;
			console.log("** prev currentIndex: "+ $scope.currentIndex);
		};
		
		$scope.top = function () {
			// 最上部遷移
			$location.hash('top');
			$anchorScroll();
		}
		
		// ひとつ前の名称
		$scope.prevName = function() {
			var idx = $scope.currentIndex > 0 ? $scope.currentIndex -1 : $scope.list.length-1;
			return $scope.list[idx].name;
		}
		
		// ひとつ次の名称
		$scope.nextName = function() {
			var idx = $scope.currentIndex < $scope.list.length-1 ? $scope.currentIndex + 1 : 0;
			return $scope.list[idx].name;
		}
				
		
	}]);




// ローディングタグ
myApp.directive('myLoader', function() {
		return {
			restrict : 'E',
			replace: true,
			templateUrl: "loader.html"
		};
	});	
	
	
// 画面遷移タイミング処理
myApp.run(['$rootScope', '$transitions', '$state', function($rootScope, $transitions, $state){
	$transitions.onSuccess({to:'*'}, function(trans){
		// ページ読み込み成功
		
		// ローディングフラグOFF
		$rootScope.isLoading = false;
	});
	
}]);
		

// JSON読込サービス
myApp.service('JsonFlowerService', ['$q', '$timeout', '$http', function($q, $timeout, $http){
     this.run = function () {
     	console.log("JsonFlowerService");
     	
		var deferred = $q.defer();
		
		$timeout(function(){
			$http({
				method: 'GET',
				url: 'flower.json'
			}).then(function successCallback(response) {				
				// 成功した場合、リストをまるごと返す
				deferred.resolve(response.data.list);
			}, function errorCallback(response) {
				// 失敗した場合
				var msg = "JsonFlowerService json取得失敗: "+ response.status;
				console.error(msg);
				deferred.reject(msg);
			});
		});
		
		return deferred.promise;
    };

}]);
        		